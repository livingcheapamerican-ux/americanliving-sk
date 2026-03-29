Deno.serve(async (req) => {
  const baseUrl = 'https://www.americanliving.sk';
  
  const robotsTxt = `# robots.txt pre americanliving.sk
User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/api/generateSitemap

# Disallow admin a interné stránky
Disallow: /Admin
Disallow: /AdminCennik
Disallow: /AdminBlog
Disallow: /AdminSpravaDomov
Disallow: /AdminAnalyz
Disallow: /AdminPreklad
Disallow: /AdminUpload
Disallow: /AdminGoogleDrive
Disallow: /AdminDokumenty
Disallow: /AdminPixel
Disallow: /AdminUser
Disallow: /AdminWatermark
Disallow: /AdminMigraci
Disallow: /AdminDotacia
Disallow: /AdminGeneruj
Disallow: /AdminIntegration
Disallow: /AdminCreditMonitor
Disallow: /AdminTestGemini
Disallow: /AdminSEOAnalyzer
Disallow: /Marketing
Disallow: /AIMarketingInsights
Disallow: /SEODashboard
Disallow: /SEOEditor
Disallow: /SocialMediaDashboard
Disallow: /SrovnaniDomu
Disallow: /GrantovaKampan
Disallow: /AutoSEOTrigger
Disallow: /AutoPreklad
Disallow: /AutoRegeneracia
Disallow: /Regeneruj
Disallow: /MojeKonto
Disallow: /AdminMojeKonto
Disallow: /MojaPonuka
Disallow: /TestAnalyza

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