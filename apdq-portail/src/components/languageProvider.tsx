// src/components/LanguageProvider.tsx
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const currentLang = params.lang;

  useEffect(() => {
    // If URL language differs from i18n language, update i18n
    if (
      currentLang &&
      ['en', 'fr'].includes(currentLang) &&
      currentLang !== i18n.language
    ) {
      i18n.changeLanguage(currentLang);
    }

    // If no language in URL, redirect to current i18n language
    if (!currentLang) {
      const path = window.location.pathname;
      const newPath = path.replace('/dashboard', `/dashboard/${i18n.language}`);
      navigate(newPath, { replace: true });
    }
  }, [currentLang, i18n, navigate]);

  return <>{children}</>;
};
