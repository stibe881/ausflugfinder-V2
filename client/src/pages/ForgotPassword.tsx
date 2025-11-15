import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Mountain } from "lucide-react";
import { useI18n } from "@/contexts/i18nContext";

export default function ForgotPassword() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || t("auth.error"));
        return;
      }

      toast.success(t("forgotPassword.successMessage"));
      // Optionally redirect to login or show a message
      setLocation("/login");
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(t("auth.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Mountain className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-3xl font-bold mt-4">{t("forgotPassword.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("forgotPassword.description")}</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                {t("auth.email")}
              </label>
              <Input
                type="email"
                id="email"
                placeholder={t("login.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("common.processing") : t("forgotPassword.submitButton")}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <a onClick={() => setLocation("/login")} className="text-primary hover:underline cursor-pointer">
              {t("forgotPassword.backToLogin")}
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
