import type React from "react";
import { createContext, useContext, useState } from "react";

export type Lang = "en" | "fr" | "es";

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (obj: { en: string; fr: string; es: string } | undefined | null) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: (obj) => obj?.en ?? "",
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const stored = localStorage.getItem("lang") as Lang | null;
  const [lang, setLangState] = useState<Lang>(stored ?? "en");

  function setLang(l: Lang) {
    localStorage.setItem("lang", l);
    setLangState(l);
  }

  function t(
    obj: { en: string; fr: string; es: string } | undefined | null,
  ): string {
    if (!obj) return "";
    return obj[lang] || obj.en || "";
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
