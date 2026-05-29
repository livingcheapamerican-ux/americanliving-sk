Deno.serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;
  
  // Normalizácia cesty: malé písmená, odstránenie lomítka na konci
  const cleanPath = path.toLowerCase().replace(/\/+$/, '') || '/';
  
  // Mapa starých URL na nové (čisté a indexovateľné)
  const redirects: Record<string, string> = {
    '/zna-p/ticabhouse': '/katalog-ticab-house',
    '/ticab-house': '/katalog-ticab-house',
    '/prosto-house': '/katalog-prosto-house',
    '/jak-modules': '/katalog?vyrobca=JAK+Modules',
    '/domki-z-gor': '/katalog-domki-z-gor',
    '/ticabhouse': '/katalog-ticab-house',
    '/prostohouse': '/katalog-prosto-house',
    '/modularne-domy': '/katalog-modularne-domy',
    '/montovane-domy': '/katalog-montovane-domy',
    '/mobilne-domy': '/katalog-mobilne-domy',
    '/rodinne-domy': '/katalog-rodinne-domy',
    '/cennik': '/katalog',
    '/ceny': '/katalog',
    '/ponuka': '/katalog',
    '/o-firme': '/o-nas',
    '/about': '/o-nas',
    '/contact': '/kontakt'
  };

  // Ak existuje presný redirect, presmeruj
  if (redirects[cleanPath]) {
    return Response.redirect(`https://americanliving.sk${redirects[cleanPath]}`, 301);
  }

  // Ak URL začína na staré cesty, analyzuj parametre a výrobcu
  const legacyPrefixes = ['/vyrobca/', '/zna-p/', '/kat-p/', '/produkty/', '/product/', '/shop/', '/produkty', '/product', '/shop'];
  const isLegacy = legacyPrefixes.some(prefix => path.toLowerCase().startsWith(prefix));

  if (isLegacy) {
    const fullSearchStr = (url.search + ' ' + path).toLowerCase();
    
    // Zistíme všetkých prítomných výrobcov
    const matchedVyrobcovia: string[] = [];
    if (fullSearchStr.includes('prosto-house') || fullSearchStr.includes('prostohouse')) {
      matchedVyrobcovia.push('prosto-house');
    }
    if (fullSearchStr.includes('ticab-house') || fullSearchStr.includes('ticabhouse')) {
      matchedVyrobcovia.push('ticab-house');
    }
    if (fullSearchStr.includes('domki-z-gor') || fullSearchStr.includes('domki-z-gór')) {
      matchedVyrobcovia.push('domki-z-gor');
    }
    if (fullSearchStr.includes('jak-modules')) {
      matchedVyrobcovia.push('jak-modules');
    }

    // Ak bol nájdený presne jeden výrobca, presmerujeme na jeho SEO katalóg
    if (matchedVyrobcovia.length === 1) {
      const targetVyrobca = matchedVyrobcovia[0];
      if (targetVyrobca === 'prosto-house') {
        return Response.redirect('https://americanliving.sk/katalog-prosto-house', 301);
      }
      if (targetVyrobca === 'ticab-house') {
        return Response.redirect('https://americanliving.sk/katalog-ticab-house', 301);
      }
      if (targetVyrobca === 'domki-z-gor') {
        return Response.redirect('https://americanliving.sk/katalog-domki-z-gor', 301);
      }
      if (targetVyrobca === 'jak-modules') {
        return Response.redirect('https://americanliving.sk/katalog?vyrobca=JAK+Modules', 301);
      }
    }

    // Ak výrobca nie je špecifikovaný, ale ide o typ domu
    if (fullSearchStr.includes('modularne-domy') || fullSearchStr.includes('modularny')) {
      return Response.redirect('https://americanliving.sk/katalog-modularne-domy', 301);
    }
    if (fullSearchStr.includes('montovane-domy') || fullSearchStr.includes('montovany')) {
      return Response.redirect('https://americanliving.sk/katalog-montovane-domy', 301);
    }
    if (fullSearchStr.includes('mobilne-domy') || fullSearchStr.includes('mobilny')) {
      return Response.redirect('https://americanliving.sk/katalog-mobilne-domy', 301);
    }
    if (fullSearchStr.includes('rodinne-domy') || fullSearchStr.includes('rodinne_domy')) {
      return Response.redirect('https://americanliving.sk/katalog-rodinne-domy', 301);
    }

    // Fallback presmerovanie pre všetky staré/neznáme cesty na hlavný katalóg
    return Response.redirect('https://americanliving.sk/katalog', 301);
  }

  // Ak URL obsahuje iné vzory zo starej stránky (php atď.), presmeruj na katalóg
  const oldSitePatterns = ['.php', '/php', '/old/', '/archive/'];
  const shouldRedirectToCatalog = oldSitePatterns.some(pattern => path.toLowerCase().includes(pattern));
  
  if (shouldRedirectToCatalog) {
    return Response.redirect('https://americanliving.sk/katalog', 301);
  }
  
  // Ak nie, vráť info o dostupných redirectoch
  return Response.json({
    message: 'No redirect found for this path',
    path: path,
    cleanPath: cleanPath,
    available_redirects: Object.keys(redirects)
  });
});