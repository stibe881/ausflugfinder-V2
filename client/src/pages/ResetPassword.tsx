import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useLocation, useSearch } from "wouter";
import { Mountain } from "lucide-react";
import { useI18n } from "@/contexts/i18nContext";

export default function ResetPassword() {
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const search = useSearch();

  const queryParams = new URLSearchParams(search);
  const token = queryParams.get("token");

  useEffect(() => {
    if (!token) {
      toast.error(t("resetPassword.invalidToken"));
      setLocation("/login");
    }
  }, [token, setLocation, t]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      toast.error(t("resetPassword.invalidToken"));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t("resetPassword.passwordMismatch"));
      return;
    }

    if (password.length < 6) {
      toast.error(t("resetPassword.passwordTooShort"));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || t("auth.error"));
        return;
      }

      toast.success(t("resetPassword.successMessage"));
      setLocation("/login");
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error(t("auth.error"));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return null; // Or a loading spinner/redirect message
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Mountain className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-3xl font-bold mt-4">{t("resetPassword.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("resetPassword.description")}</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                {t("resetPassword.newPassword")}
              </label>
              <Input
                type="password"
                id="password"
                placeholder={t("resetPassword.newPasswordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                {t("resetPassword.confirmPassword")}
              </label>
              <Input
                type="password"
                id="confirmPassword"
                placeholder={t("resetPassword.confirmPasswordPlaceholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("common.processing") : t("resetPassword.submitButton")}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <a onClick={() => setLocation("/login")} className="text-primary hover:underline cursor-pointer">
              {t("resetPassword.backToLogin")}
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
