import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Mountain, Sun, Compass } from "lucide-react";
import { trpc } from "@/lib/trpc";

type AuthMode = "login" | "register";

export default function Login() {
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
      toast.error("Benutzername und Passwort sind erforderlich");
      return;
    }

    if (mode === "register" && !name) {
      toast.error("Name ist erforderlich");
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
        toast.error(data.error || "Authentifizierung fehlgeschlagen");
        return;
      }

      if (mode === "register") {
        toast.success("Registrierung erfolgreich! Bitte melden Sie sich an.");
        setMode("login");
        setPassword("");
      } else {
        toast.success("Anmeldung erfolgreich!");
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
      toast.error("Ein Fehler ist aufgetreten");
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
            AusflugFinder
          </h1>
          <p className="text-muted-foreground">
            {mode === "login" ? "Melden Sie sich an" : "Erstellen Sie ein Konto"}
          </p>
        </div>

        {/* Login/Register Card */}
        <Card className="p-8 border-2 border-border/50 backdrop-blur-sm">
          <div className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  type="text"
                  name="name"
                  placeholder="Ihr vollständiger Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required={mode === "register"}
                  className="border-border/50"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Benutzername</label>
              <Input
                type="text"
                name="username"
                placeholder="Benutzername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
                className="border-border/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Passwort</label>
              <Input
                type="password"
                name="password"
                placeholder="Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="border-border/50"
              />
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium mb-2">E-Mail (optional)</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="E-Mail-Adresse"
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
              {loading ? "Wird verarbeitet..." : (mode === "login" ? "Anmelden" : "Registrieren")}
            </Button>
          </div>

          {/* Mode Toggle */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Kein Konto?{" "}
                <button
                  onClick={() => {
                    setMode("register");
                    setPassword("");
                  }}
                  className="text-primary hover:underline font-semibold"
                >
                  Registrieren
                </button>
              </>
            ) : (
              <>
                Haben Sie bereits ein Konto?{" "}
                <button
                  onClick={() => {
                    setMode("login");
                    setName("");
                    setEmail("");
                  }}
                  className="text-primary hover:underline font-semibold"
                >
                  Anmelden
                </button>
              </>
            )}
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Mit der Registrierung akzeptieren Sie unsere Datenschutzrichtlinie
        </p>
      </div>
    </div>
  );
}
