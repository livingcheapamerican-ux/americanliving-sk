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
      '/detaildomu', '/srovnanidomu', '/odporucaniemodomov',
      '/adminanalyzasessions', '/adminseoanalyzer', '/adminanalyzadomov',
      '/adminspravadomov', '/adminuploadfotiekdomov', '/adminprekladydomov',
      '/admingenerujobrazkyoblogov', '/adminprekladyblogov', '/adminprekladykonfiguratora',
      '/adminwatermark', '/adminmigracfiafotiek', '/adminblog', '/blogdetail',
      '/admindokumenty', '/admingoogledrive', '/testanalyzakonfiguratora',
      '/regenerujprekladydefrssrhrel'
    ];
    
    // Mapa starých URL na nové (kontroluj lowercase)
    const redirectMap = {
      'ticab-house': '/katalog?vyrobca=Ticab house',
      'ticabhouse': '/katalog?vyrobca=Ticab house',
      'prosto-house': '/katalog?vyrobca=Prosto House',
      'prostohouse': '/katalog?vyrobca=Prosto House',
      'jak-modules': '/katalog?vyrobca=JAK Modules',
      'jakmodules': '/katalog?vyrobca=JAK Modules',
      'domki-z-gor': '/katalog?vyrobca=Domki z Gór',
      'domkizgor': '/katalog?vyrobca=Domki z Gór',
      'modularne-domy': '/katalog?typ=modularny',
      'montovane-domy': '/katalog?typ=montovany',
      'mobilne-domy': '/katalog?typ=mobilny',
      'rodinne-domy': '/katalog?kategoria=rodinne_domy',
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
    
    // Ak nie je platná stránka ani base44 path a nie je root, presmeruj na katalóg
    if (!isValidPage && !isBase44Path && path !== '/' && path !== '') {
      console.log(`🔄 404 -> katalóg: ${path}`);
      // Immediate redirect bez čakania
      window.location.replace('/katalog');
    }
  }, [location.pathname, location.search, navigate]);

  return null;
}