import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function AutoRedirect() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    
    // Mapa starých URL na nové
    const redirects = {
      '/ticab-house': '/katalog?vyrobca=Ticab house',
      '/ticab-house/': '/katalog?vyrobca=Ticab house',
      '/prosto-house': '/katalog?vyrobca=Prosto House',
      '/prosto-house/': '/katalog?vyrobca=Prosto House',
      '/jak-modules': '/katalog?vyrobca=JAK Modules',
      '/jak-modules/': '/katalog?vyrobca=JAK Modules',
      '/domki-z-gor': '/katalog?vyrobca=Domki z Gór',
      '/domki-z-gor/': '/katalog?vyrobca=Domki z Gór',
      '/ticabhouse': '/katalog?vyrobca=Ticab house',
      '/prostohouse': '/katalog?vyrobca=Prosto House',
      '/modularne-domy': '/katalog?typ=modularny',
      '/montovane-domy': '/katalog?typ=montovany',
      '/mobilne-domy': '/katalog?typ=mobilny',
      '/rodinne-domy': '/katalog?kategoria=rodinne_domy',
      '/cennik': '/katalog',
      '/ceny': '/katalog',
      '/ponuka': '/katalog',
      '/o-firme': '/o-nas',
      '/about': '/o-nas',
      '/contact': '/kontakt'
    };
    
    // Presmeruj ak sa našiel redirect
    if (redirects[path]) {
      navigate(redirects[path], { replace: true });
      return;
    }
    
    // Ak URL obsahuje znaky zo starej stránky (napr. zna-p, php), presmeruj na katalóg
    const oldSitePatterns = ['/zna-p/', '/php', '.php', '/old/', '/archive/'];
    const shouldRedirectToCatalog = oldSitePatterns.some(pattern => path.includes(pattern));
    
    if (shouldRedirectToCatalog) {
      navigate('/katalog', { replace: true });
    }
  }, [location.pathname, navigate]);

  return null;
}