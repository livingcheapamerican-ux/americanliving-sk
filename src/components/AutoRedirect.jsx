import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function AutoRedirect() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Získaj celú URL vrátane case-sensitive pathname
    const path = location.pathname;
    const pathLower = path.toLowerCase();
    
    // Zoznam platných stránok v aplikácii (case-insensitive)
    const validPages = [
      '/', '/domov', '/katalog', '/o-nas', '/kontakt', '/blog', '/faq',
      '/detail-domu', '/srovnani-domu', '/odporucanie-domov',
      '/adminanalyzasessions', '/adminseoanalyzer', '/adminanalyzadomov',
      '/adminspravadomov', '/adminuploadfotiekdomov', '/adminprekladydomov',
      '/admingenerujobrazkyoblogov', '/adminprekladyblogov', '/adminprekladykonfiguratora',
      '/adminwatermark', '/adminmigracfiafotiek', '/adminblog', '/blogdetail',
      '/admindokumenty', '/admingoogledrive', '/testanalyzakonfiguratora',
      '/regenerujprekladydefrssrhrel', '/katalogticabhouse', '/katalogprostohouse',
      '/katalogdomkizgor', '/katalogmodularnedomy', '/katalogmontovanedomy',
      '/katalogmobilnedomy', '/katalogrodinedomy', '/marketing', '/aimiarketinginsights',
      '/socialmediadashboard', '/adminpixelsettings', '/adminusermanagement'
    ];
    
    // Mapa starých URL na nové SEO-friendly stránky
    const redirectMap = {
      'ticab-house': '/katalogticabhouse',
      'ticabhouse': '/katalogticabhouse',
      'prosto-house': '/katalogprostohouse',
      'prostohouse': '/katalogprostohouse',
      'jak-modules': '/katalog?vyrobca=JAK Modules',
      'jakmodules': '/katalog?vyrobca=JAK Modules',
      'domki-z-gor': '/katalogdomkizgor',
      'domkizgor': '/katalogdomkizgor',
      'modularne-domy': '/katalogmodularnedomy',
      'montovane-domy': '/katalogmontovanedomy',
      'mobilne-domy': '/katalogmobilnedomy',
      'rodinne-domy': '/katalogrodinedomy',
      'cennik': '/katalog',
      'ceny': '/katalog',
      'ponuka': '/katalog',
      'o-firme': '/o-nas',
      'about': '/o-nas',
      'contact': '/kontakt'
    };
    
    // Kontrola či URL obsahuje niektorý zo starých slugov
    for (const [oldSlug, newUrl] of Object.entries(redirectMap)) {
      if (pathLower.includes(oldSlug)) {
        console.log(`🔄 Redirect: ${path} -> ${newUrl}`);
        navigate(newUrl, { replace: true });
        return;
      }
    }
    
    // Ak URL obsahuje znaky zo starej stránky, presmeruj na katalóg
    const oldSitePatterns = [
      '/zna-p/', '/php', '.php', '/old/', '/archive/', 
      '/slovenska/', '/montovane/', '/domy/', '/drevostavby/',
      '/house/', '/dom-', '/model-'
    ];
    
    if (oldSitePatterns.some(pattern => pathLower.includes(pattern))) {
      console.log(`🔄 Stará URL: ${path} -> /katalog`);
      navigate('/katalog', { replace: true });
      return;
    }
    
    // Ak cesta nie je v zozname platných stránok
    const isValidPage = validPages.some(validPath => 
      pathLower === validPath || pathLower.startsWith(validPath + '?')
    );
    const isBase44Path = pathLower.includes('hide_badge') || pathLower.includes('server_url');
    
    // Poznámka: 404 redirect je riešený v NotFound.js komponente
  }, [location.pathname, location.search, navigate]);

  return null;
}