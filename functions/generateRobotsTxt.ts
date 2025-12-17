Deno.serve(async (req) => {
  const baseUrl = 'https://www.americanliving.sk';
  
  const robotsTxt = `# robots.txt pre americanliving.sk
User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/api/generateSitemap

# Disallow admin stránky
Disallow: /admin-*

# Crawl-delay
Crawl-delay: 1

# Preferované indexovanie
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 1
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400'
    }
  });
});