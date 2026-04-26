"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Hexagon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { loginTenant } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/use-auth-store";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!username.trim()) {
      toast.error("Kullanıcı adı boş bırakılamaz.");
      return;
    }
    if (!password.trim()) {
      toast.error("Şifre boş bırakılamaz.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginTenant({
        username: username.trim(),
        password: password.trim(),
      });

      if (response.success && response.data) {
        const tenant = response.data;
        login(tenant.id, tenant.name, tenant.subscriptionPlan, tenant.city);
        toast.success(`Hoş geldiniz, ${tenant.name}!`);
        router.replace("/");
      } else {
        toast.error(response.message || "Giriş başarısız oldu.");
      }
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu.";
      toast.error(`Giriş hatası: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
            <Hexagon className="size-6 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              TAVIA V2
            </h1>
            <p className="text-sm text-muted-foreground">
              İşletme Girişi
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Giriş Yap</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="login-username">Kullanıcı Adı</Label>
                <Input
                  id="login-username"
                  placeholder="Kayıtlı kullanıcı adınız"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="login-password">Şifre</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Şifreniz"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Submit */}
              <Button
                id="login-submit-btn"
                type="submit"
                className="w-full gap-2"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Giriş yapılıyor...
                  </>
                ) : (
                  "Giriş Yap"
                )}
              </Button>
            </form>

            {/* Link to Register */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Henüz kayıtlı değil misiniz?{" "}
              <Link
                href="/register"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Kayıt Ol
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
