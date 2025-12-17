Deno.serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;
  
  // Mapa starých URL na nové
  const redirects = {
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