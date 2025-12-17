Deno.serve(async (req) => {
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://americanliving.sk/api/sitemap

# Disallow admin pages
Disallow: /admin-*
Disallow: /*admin*
Disallow: /test-*
Disallow: /regeneruj-*
Disallow: /migracia-*
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400'
    }
  });
});