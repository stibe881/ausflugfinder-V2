import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Mountain, Sun, Compass } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/contexts/i18nContext";

type AuthMode = "login" | "register";

export default function Login() {
  const { t } = useI18n();
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { refresh } = useAuth();
  const [location, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault?.();
    if (e) e.stopPropagation?.();

    if (!username || !password) {
      toast.error(t("auth.errorRequired"));
      return;
    }

    if (mode === "register" && !name) {
      toast.error(t("auth.nameRequired"));
      return;
    }

    setLoading(true);
    try {
      console.log("Submitting form with mode:", mode, { username, password, name, email });
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(
          mode === "login"
            ? { username, password }
            : { username, password, name, email: email || undefined }
        ),
      });

      const data = await response.json();
      console.log("Response:", response.status, data);

      if (!response.ok) {
        toast.error(data.error || t("auth.error"));
        return;
      }

      if (mode === "register") {
        toast.success(t("auth.signUpSuccess"));
        setMode("login");
        setPassword("");
      } else {
        toast.success(t("auth.signInSuccess"));
        // Invalidate the auth cache to force a refetch
        await utils.auth.me.invalidate();
        // Refresh the auth state to get the new session
        await refresh();
        // Wait a moment to ensure the session is updated, then redirect
        setTimeout(() => {
          setLocation("/");
        }, 500);
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error(t("auth.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-accent/10 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Mountain className="w-8 h-8 text-primary animate-pulse" />
            <Sun className="w-6 h-6 text-secondary animate-pulse" style={{ animationDelay: '0.5s' }} />
            <Compass className="w-8 h-8 text-accent animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">
            {t("login.title")}
          </h1>
          <p className="text-muted-foreground">
            {mode === "login" ? t("login.signInMode") : t("login.registerMode")}
          </p>
        </div>

        {/* Login/Register Card */}
        <Card className="p-8 border-2 border-border/50 backdrop-blur-sm">
          <div className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium mb-2">{t("login.name")}</label>
                <Input
                  type="text"
                  name="name"
                  placeholder={t("login.namePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required={mode === "register"}
                  className="border-border/50"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">{t("login.username")}</label>
              <Input
                type="text"
                name="username"
                placeholder={t("login.usernamePlaceholder")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
                className="border-border/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t("login.password")}</label>
              <Input
                type="password"
                name="password"
                placeholder={t("login.passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="border-border/50"
              />
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium mb-2">{t("login.email")}</label>
                <Input
                  type="email"
                  name="email"
                  placeholder={t("login.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="border-border/50"
                />
              </div>
            )}

            <Button
              disabled={loading}
              onClick={handleSubmit as any}
              className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
            >
              {loading ? t("login.processing") : (mode === "login" ? t("login.signInBtn") : t("login.registerBtn"))}
            </Button>
          </div>

          {/* Mode Toggle */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                {t("login.noAccount")}{" "}
                <button
                  onClick={() => {
                    setMode("register");
                    setPassword("");
                  }}
                  className="text-primary hover:underline font-semibold"
                >
                  {t("login.registerLink")}
                </button>
              </>
            ) : (
              <>
                {t("login.haveAccount")}{" "}
                <button
                  onClick={() => {
                    setMode("login");
                    setName("");
                    setEmail("");
                  }}
                  className="text-primary hover:underline font-semibold"
                >
                  {t("login.signInLink")}
                </button>
              </>
            )}
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          {t("login.privacyNotice")}
        </p>
      </div>
    </div>
  );
}
