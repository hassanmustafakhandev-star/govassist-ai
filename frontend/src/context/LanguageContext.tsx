"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type LanguageContextType = {
  lang: "en" | "ar";
  setLang: (lang: "en" | "ar") => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<"en" | "ar">("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("govassist_lang");
    if (savedLang === "ar" || savedLang === "en") {
      setLang(savedLang);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("govassist_lang", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
