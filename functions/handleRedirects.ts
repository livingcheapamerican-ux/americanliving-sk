Deno.serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;
  
  // Mapa starých URL na nové
  const redirects = {
    // Staré /zna-p/ URL
    '/zna-p/ticabhouse': '/katalog?vyrobca=Ticab+house',
    '/zna-p/ticabhouse/': '/katalog?vyrobca=Ticab+house',
    '/zna-p/prosto-house': '/katalog?vyrobca=Prosto+House',
    '/zna-p/prosto-house/': '/katalog?vyrobca=Prosto+House',
    '/zna-p/prosto': '/katalog?vyrobca=Prosto+House',
    '/zna-p/prosto/': '/katalog?vyrobca=Prosto+House',
    '/zna-p/jak': '/katalog?vyrobca=JAK+Modules',
    '/zna-p/jak/': '/katalog?vyrobca=JAK+Modules',
    '/zna-p/jak-modules': '/katalog?vyrobca=JAK+Modules',
    '/zna-p/jak-modules/': '/katalog?vyrobca=JAK+Modules',
    '/zna-p/sydney': '/katalog',
    '/zna-p/sydney/': '/katalog',
    '/zna-p/lyon': '/katalog',
    '/zna-p/lyon/': '/katalog',
    '/zna-p/bonn': '/katalog',
    '/zna-p/bonn/': '/katalog',
    '/zna-p/domdublin': '/katalog',
    '/zna-p/domdublin/': '/katalog',
    '/zna-p/domvancouver': '/katalog',
    '/zna-p/domvancouver/': '/katalog',
    '/zna-p/alessandria': '/katalog',
    '/zna-p/alessandria/': '/katalog',
    '/zna-p/jaktest': '/katalog?vyrobca=JAK+Modules',
    '/zna-p/jaktest/': '/katalog?vyrobca=JAK+Modules',
    '/zna-p/modulove-domy': '/katalog?typ=modularny',
    '/zna-p/modulove-domy/': '/katalog?typ=modularny',
    
    // Staré /kat-p/ URL
    '/kat-p/katalog-domov': '/katalog',
    '/kat-p/katalog-domov/': '/katalog',
    
    // Staré /p/ URL (jednotlivé modely)
    '/p/nord': '/katalog',
    '/p/nord/': '/katalog',
    
    // Staré URL výrobcov
    '/ticab-house': '/katalog?vyrobca=Ticab+house',
    '/ticab-house/': '/katalog?vyrobca=Ticab+house',
    '/prosto-house': '/katalog?vyrobca=Prosto+House',
    '/prosto-house/': '/katalog?vyrobca=Prosto+House',
    '/jak-modules': '/katalog?vyrobca=JAK+Modules',
    '/jak-modules/': '/katalog?vyrobca=JAK+Modules',
    '/domki-z-gor': '/katalog?vyrobca=Domki+z+Gór',
    '/domki-z-gor/': '/katalog?vyrobca=Domki+z+Gór',
    '/ticabhouse': '/katalog?vyrobca=Ticab+house',
    '/prostohouse': '/katalog?vyrobca=Prosto+House',
    
    // Staré URL kategórií
    '/modularne-domy': '/katalog?typ=modularny',
    '/montovane-domy': '/katalog?typ=montovany',
    '/mobilne-domy': '/katalog?typ=mobilny',
    '/rodinne-domy': '/katalog?kategoria=rodinne_domy',
    '/cennik': '/katalog',
    '/ceny': '/katalog',
    '/ponuka': '/katalog',
    
    // Staré o nás a kontakt
    '/o-firme': '/o-nas',
    '/about': '/o-nas',
    '/contact': '/kontakt'
  };
  
  // Ak existuje redirect, presmeruj
  if (redirects[path]) {
    return Response.redirect(`https://www.americanliving.sk${redirects[path]}`, 301);
  }
  
  // Ak nie, vráť info o dostupných redirectoch
  return Response.json({
    message: 'No redirect found for this path',
    path: path,
    available_redirects: Object.keys(redirects)
  });
});