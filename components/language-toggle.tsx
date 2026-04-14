"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import type { Locale } from "@/i18n/config";

export function LanguageToggle() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const nextLocale: Locale = locale === "es" ? "en" : "es";
  const label = nextLocale.toUpperCase();

  const handleSwitch = () => {
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSwitch}
      className="gap-1.5 px-2"
    >
      <Globe className="h-4 w-4" />
      <span className="text-xs font-medium">{label}</span>
    </Button>
  );
}
