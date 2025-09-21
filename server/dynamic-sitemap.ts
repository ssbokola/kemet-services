import { Request, Response } from 'express';

const SITE_URL = process.env.VITE_SITE_URL || 'https://kemetservices.com';

// Configuration des pages avec priorités et fréquences
interface SitemapEntry {
  url: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  lastmod?: string;
}

// Fonction pour générer le sitemap XML
export function generateSitemap(): string {
  const now = new Date();
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Pages principales avec configuration SEO optimisée
  const sitemapEntries: SitemapEntry[] = [
    {
      url: SITE_URL,
      changefreq: 'weekly',
      priority: 1.0,
      lastmod: now.toISOString().split('T')[0]
    },
    {
      url: `${SITE_URL}/formations`,
      changefreq: 'weekly', 
      priority: 0.9,
      lastmod: now.toISOString().split('T')[0]
    },
    {
      url: `${SITE_URL}/consulting`,
      changefreq: 'weekly',
      priority: 0.9,
      lastmod: now.toISOString().split('T')[0]
    },
    {
      url: `${SITE_URL}/a-propos`,
      changefreq: 'monthly',
      priority: 0.7,
      lastmod: lastMonth.toISOString().split('T')[0]
    },
    {
      url: `${SITE_URL}/contact`,
      changefreq: 'monthly',
      priority: 0.8,
      lastmod: lastWeek.toISOString().split('T')[0]
    },
    {
      url: `${SITE_URL}/diagnostic`,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: now.toISOString().split('T')[0]
    },
    {
      url: `${SITE_URL}/inscription-formation`,
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: now.toISOString().split('T')[0]
    },
    // Pages légales
    {
      url: `${SITE_URL}/mentions-legales`,
      changefreq: 'yearly',
      priority: 0.3,
      lastmod: '2024-09-01'
    },
    {
      url: `${SITE_URL}/confidentialite`,
      changefreq: 'yearly', 
      priority: 0.3,
      lastmod: '2024-09-01'
    },
    // Note: Pages formations individuelles supprimées du sitemap car non encore implémentées
    // Elles seront ajoutées dynamiquement quand les routes seront créées
  ];

  // Génération du XML
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${sitemapEntries.map(entry => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemapXml;
}

// Middleware pour servir le sitemap dynamique
export function serveDynamicSitemap(req: Request, res: Response) {
  try {
    const sitemap = generateSitemap();
    
    res.set({
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600', // Cache 1 heure
      'X-Robots-Tag': 'noindex'
    });
    
    res.status(200).send(sitemap);
  } catch (error) {
    console.error('Erreur génération sitemap:', error);
    res.status(500).send('Erreur interne du serveur');
  }
}

// Génération du robots.txt dynamique optimisé
export function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /

# Principales pages - Priorité haute pour crawl
Allow: /
Allow: /formations
Allow: /consulting
Allow: /a-propos
Allow: /contact
Allow: /diagnostic

# Informations légales autorisées
Allow: /mentions-legales
Allow: /confidentialite

# Directives de cache pour assets
Allow: /images/
Allow: /css/
Allow: /js/

# Pages administratives - Blocage
Disallow: /admin/
Disallow: /api/

# Fichiers système
Disallow: /src/
Disallow: /node_modules/
Disallow: /tmp/
Disallow: /*.log$

# Moteurs spécifiques
User-agent: googlebot
Crawl-delay: 1

User-agent: bingbot
Crawl-delay: 2

# Sitemap
Sitemap: ${SITE_URL}/sitemap.xml`;
}

// Middleware pour servir robots.txt dynamique
export function serveDynamicRobots(req: Request, res: Response) {
  try {
    const robotsTxt = generateRobotsTxt();
    
    res.set({
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400' // Cache 24 heures
    });
    
    res.status(200).send(robotsTxt);
  } catch (error) {
    console.error('Erreur génération robots.txt:', error);
    res.status(500).send('Erreur interne du serveur');
  }
}