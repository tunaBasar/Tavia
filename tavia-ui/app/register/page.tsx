"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Hexagon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { registerTenant } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/use-auth-store";
import { CITY_VALUES } from "@/types";
import type { SubscriptionPlan, City } from "@/types";

// ─── Zod Schema ──────────────────────────────────────────────────
const registerSchema = z.object({
  name: z.string().min(1, "İşletme adı boş bırakılamaz."),
  city: z.string().min(1, "Geçerli bir şehir seçmelisiniz.")
    .refine((val) => (CITY_VALUES as readonly string[]).includes(val), {
      message: "Geçerli bir şehir seçmelisiniz.",
    }) as unknown as z.ZodType<City>,

  username: z.string().min(1, "Kullanıcı adı boş bırakılamaz."),
  password: z.string().min(1, "Şifre boş bırakılamaz."),

  subscriptionPlan: z.string().min(1, "Bir abonelik planı seçmelisiniz.")
    .refine((val) => ["BASIC", "PRO", "ENTERPRISE"].includes(val), {
      message: "Bir abonelik planı seçmelisiniz.",
    }) as unknown as z.ZodType<SubscriptionPlan>,
});

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [name, setName] = useState("");
  const [city, setCity] = useState<City | "">("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState<SubscriptionPlan | "">("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Zod validation
    const result = registerSchema.safeParse({
      name: name.trim(),
      city: city || undefined,
      username: username.trim(),
      password: password.trim(),
      subscriptionPlan: plan || undefined,
    });

    if (!result.success) {
      const firstError = result.error.issues[0];
      toast.error(firstError.message);
      return;
    }

    setIsLoading(true);

    try {
      const response = await registerTenant({
        name: result.data.name,
        city: result.data.city,
        username: result.data.username,
        password: result.data.password,
        subscriptionPlan: result.data.subscriptionPlan,
      });

      if (response.success && response.data) {
        const tenant = response.data;
        login(tenant.id, tenant.name, tenant.subscriptionPlan, tenant.city);
        toast.success(`Hoş geldiniz, ${tenant.name}!`);
        router.replace("/");
      } else {
        toast.error(response.message || "Kayıt başarısız oldu.");
      }
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu.";
      toast.error(`Kayıt hatası: ${msg}`);
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
              İşletmenizi kaydedin
            </p>
          </div>
        </div>

        {/* Register Form */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Yeni İşletme Kaydı</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="register-name">İşletme Adı</Label>
                <Input
                  id="register-name"
                  placeholder="Örn: Tavia Coffee"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              {/* City Select — replaces old text input */}
              <div className="space-y-2">
                <Label htmlFor="register-city">Şehir</Label>
                <Select
                  value={city}
                  onValueChange={(v) => setCity(v as City)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="register-city" className="w-full">
                    <SelectValue placeholder="Şehir seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITY_VALUES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="register-username">Kullanıcı Adı</Label>
                <Input
                  id="register-username"
                  placeholder="Giriş için kullanıcı adınız"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="register-password">Şifre</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="Güçlü bir şifre belirleyin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Subscription Plan */}
              <div className="space-y-2">
                <Label htmlFor="register-plan">Abonelik Planı</Label>
                <Select
                  value={plan}
                  onValueChange={(v) => setPlan(v as SubscriptionPlan)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="register-plan" className="w-full">
                    <SelectValue placeholder="Plan seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BASIC">Basic</SelectItem>
                    <SelectItem value="PRO">Pro</SelectItem>
                    <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit */}
              <Button
                id="register-submit-btn"
                type="submit"
                className="w-full gap-2"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  "Kayıt Ol"
                )}
              </Button>
            </form>

            {/* Link to Login */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Zaten kayıtlı mısınız?{" "}
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Giriş Yap
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
