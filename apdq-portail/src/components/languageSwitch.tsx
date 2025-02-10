// src/utils/languageUtils.ts
import { NavigateFunction } from 'react-router-dom';
import i18n from '../i18n';

export const switchLanguage = (
  navigate: NavigateFunction,
  currentPath: string
) => {
  const newLang = i18n.language === 'fr' ? 'en' : 'fr';

  // Change the language in i18n
  i18n.changeLanguage(newLang);

  // Update the URL to include language
  const pathSegments = currentPath.split('/').filter(Boolean);

  // If we're on the login page
  if (pathSegments.length === 0) {
    navigate(`/${newLang}`, { replace: true });
    return;
  }

  // For dashboard routes
  if (pathSegments[0] === 'dashboard') {
    const newPath = ['', 'dashboard', newLang, ...pathSegments.slice(2)].join(
      '/'
    );
    navigate(newPath, { replace: true });
    return;
  }
};
