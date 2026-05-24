"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import en from "@/messages/en.json";
import tr from "@/messages/tr.json";

type Locale = "en" | "tr";

type Messages = typeof en;

const messages: Record<Locale, Messages> = { en, tr };

interface I18nContextValue {
  locale: Locale;
  t: Messages;
  toggleLocale: () => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("tr");

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === "en" ? "tr" : "en"));
  }, []);

  return (
    <I18nContext.Provider value={{ locale, t: messages[locale], toggleLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
