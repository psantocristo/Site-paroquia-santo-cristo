export interface Env {
  ASSETS: Fetcher;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  BASE_URL?: string;
}

const DEFAULT_SUPABASE_URL = 'https://esbkvwfogqgcttgzsyqr.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzYmt2d2ZvZ3FnY3R0Z3pzeXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxMTY4MDgsImV4cCI6MjEwMjY5MjgwOH0.HdXZK30MI9sihapoj9GIMYraXYbbFXl_BAHa9Viz5jY';
const DEFAULT_BASE_URL = 'https://paroquiasantocristo.com.br';
const DEFAULT_IMAGE = 'https://paroquiasantocristo.com.br/capa.webp';
const SITE_NAME = 'Paróquia Senhor Santo Cristo dos Milagres';

function isBot(userAgent: string): boolean {
  const bots = [
    'googlebot', 'bingbot', 'yandexbot', 'duckduckbot', 'slurp', 
    'baiduspider', 'facebookexternalhit', 'twitterbot', 'rogerbot', 
    'linkedinbot', 'embedly', 'quora link preview', 'showyoubot', 
    'outbrain', 'pinterest', 'slackbot', 'vkshare', 'w3c_validator',
    'whatsapp', 'telegram', 'applebot', 'petalbot', 'semrushbot',
    'ahrefsbot', 'mj12bot', 'dotbot', 'seznambot', 'discordbot'
  ];
  const ua = userAgent.toLowerCase();
  return bots.some((bot) => ua.includes(bot));
}

async function fetchSupabase(endpoint: string, env: Env) {
  const supabaseUrl = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseKey = env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  try {
    const res = await fetch(supabaseUrl + '/rest/v1/' + endpoint, {
      headers: {
        apikey: supabaseKey,
        Authorization: 'Bearer ' + supabaseKey,
      },
    });
    return res.ok ? await res.json() : null;
  } catch (err) {
    console.error('Error fetching Supabase data:', err);
    return null;
  }
}

function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

interface PageData {
  title: string;
  description: string;
  image: string;
  url: string;
  type: string;
}

function generateHTML(data: PageData): string {
  const safeTitle = escapeHtml(data.title);
  const safeDescription = escapeHtml(data.description);
  return (
    '<!DOCTYPE html>' +
    '<html lang="pt-BR"><head>' +
    '<meta charset="UTF-8" />' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" />' +
    '<title>' + safeTitle + '</title>' +
    '<meta name="description" content="' + safeDescription + '" />' +
    '<link rel="canonical" href="' + data.url + '" />' +
    '<meta property="og:type" content="' + (data.type === 'article' ? 'article' : 'website') + '" />' +
    '<meta property="og:url" content="' + data.url + '" />' +
    '<meta property="og:title" content="' + safeTitle + '" />' +
    '<meta property="og:description" content="' + safeDescription + '" />' +
    '<meta property="og:image" content="' + data.image + '" />' +
    '<meta property="og:site_name" content="' + SITE_NAME + '" />' +
    '<meta name="twitter:card" content="summary_large_image" />' +
    '<meta name="twitter:title" content="' + safeTitle + '" />' +
    '<meta name="twitter:description" content="' + safeDescription + '" />' +
    '<meta name="twitter:image" content="' + data.image + '" />' +
    '</head><body style="font-family: sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; line-height: 1.6;">' +
    '<h1>' + safeTitle + '</h1>' +
    '<p>' + safeDescription + '</p>' +
    '<img src="' + data.image + '" alt="' + safeTitle + '" style="max-width: 100%; border-radius: 8px;" />' +
    '<p><a href="' + data.url + '">Acessar no site da Paróquia</a></p>' +
    '</body></html>'
  );
}

async function handleSitemap(env: Env): Promise<Response> {
  const baseUrl = env.BASE_URL || DEFAULT_BASE_URL;
  const today = new Date().toISOString().split('T')[0];
  const [blogPosts, albums, announcements, campaigns] = await Promise.all([
    fetchSupabase('blog_posts?is_published=eq.true&select=slug,updated_at', env),
    fetchSupabase('photo_albums?is_active=eq.true&select=slug,updated_at', env),
    fetchSupabase('parish_announcements?is_published=eq.true&select=slug,updated_at', env),
    fetchSupabase('campaigns?is_published=eq.true&select=slug,updated_at', env),
  ]);

  let xml =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    '<url><loc>' + baseUrl + '</loc><lastmod>' + today + '</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>' +
    '<url><loc>' + baseUrl + '/festa-padroeiro</loc><lastmod>' + today + '</lastmod><priority>0.8</priority></url>' +
    '<url><loc>' + baseUrl + '/programacoes</loc><lastmod>' + today + '</lastmod><priority>0.8</priority></url>' +
    '<url><loc>' + baseUrl + '/galeria-dos-padres</loc><lastmod>' + today + '</lastmod><priority>0.7</priority></url>' +
    '<url><loc>' + baseUrl + '/documentacoes</loc><lastmod>' + today + '</lastmod><priority>0.7</priority></url>' +
    '<url><loc>' + baseUrl + '/campanhas</loc><lastmod>' + today + '</lastmod><priority>0.8</priority></url>';

  if (Array.isArray(blogPosts)) {
    for (const post of blogPosts) {
      if (post && post.slug) {
        xml += '<url><loc>' + baseUrl + '/blog/' + post.slug + '</loc><lastmod>' + (post.updated_at ? post.updated_at.split('T')[0] : today) + '</lastmod><priority>0.8</priority></url>';
      }
    }
  }
  if (Array.isArray(announcements)) {
    for (const item of announcements) {
      if (item && item.slug) {
        xml += '<url><loc>' + baseUrl + '/aviso/' + item.slug + '</loc><lastmod>' + (item.updated_at ? item.updated_at.split('T')[0] : today) + '</lastmod><priority>0.9</priority></url>';
      }
    }
  }
  if (Array.isArray(campaigns)) {
    for (const c of campaigns) {
      if (c && c.slug) {
        xml += '<url><loc>' + baseUrl + '/campanha/' + c.slug + '</loc><lastmod>' + (c.updated_at ? c.updated_at.split('T')[0] : today) + '</lastmod><priority>0.9</priority></url>';
      }
    }
  }
  if (Array.isArray(albums)) {
    for (const a of albums) {
      if (a && a.slug) {
        xml += '<url><loc>' + baseUrl + '/album/' + a.slug + '</loc><lastmod>' + (a.updated_at ? a.updated_at.split('T')[0] : today) + '</lastmod><priority>0.7</priority></url>';
      }
    }
  }
  xml += '</urlset>';

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const userAgent = request.headers.get('user-agent') || '';
    const baseUrl = env.BASE_URL || DEFAULT_BASE_URL;

    if (pathname === '/sitemap.xml') {
      return handleSitemap(env);
    }

    if (isBot(userAgent)) {
      if (pathname.startsWith('/blog/')) {
        const slug = pathname.replace('/blog/', '').split('/')[0];
        const data = await fetchSupabase('blog_posts?slug=eq.' + slug + '&is_published=eq.true&select=*', env);
        if (data && data.length > 0) {
          const post = data[0];
          return new Response(
            generateHTML({
              title: post.title + ' | ' + SITE_NAME,
              description: truncate(post.excerpt || stripHtml(post.content), 160),
              image: post.featured_image || DEFAULT_IMAGE,
              url: baseUrl + '/blog/' + slug,
              type: 'article',
            }),
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        }
      }

      if (pathname.startsWith('/aviso/') || pathname.startsWith('/avisos/')) {
        const slug = pathname.replace(/^\/aviso(s)?\//, '').split('/')[0];
        const data = await fetchSupabase('parish_announcements?slug=eq.' + slug + '&is_published=eq.true&select=*', env);
        if (data && data.length > 0) {
          const item = data[0];
          return new Response(
            generateHTML({
              title: item.title + ' | ' + SITE_NAME,
              description: truncate(stripHtml(item.content), 160),
              image: item.flyer_url || DEFAULT_IMAGE,
              url: baseUrl + '/aviso/' + slug,
              type: 'article',
            }),
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        }
      }

      if (pathname.startsWith('/campanha/')) {
        const slug = pathname.replace('/campanha/', '').split('/')[0];
        const data = await fetchSupabase('campaigns?slug=eq.' + slug + '&is_published=eq.true&select=*', env);
        if (data && data.length > 0) {
          const c = data[0];
          return new Response(
            generateHTML({
              title: c.title + ' | Doações - ' + SITE_NAME,
              description: truncate(stripHtml(c.description), 160),
              image: c.featured_image || DEFAULT_IMAGE,
              url: baseUrl + '/campanha/' + slug,
              type: 'campaign',
            }),
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        }
      }

      if (pathname.startsWith('/album/') || pathname.startsWith('/albuns/')) {
        const slug = pathname.replace(/^\/albu(m|ns)\//, '').split('/')[0];
        const data = await fetchSupabase('photo_albums?slug=eq.' + slug + '&is_active=eq.true&select=*', env);
        if (data && data.length > 0) {
          const a = data[0];
          return new Response(
            generateHTML({
              title: a.name + ' | Fotos - ' + SITE_NAME,
              description: truncate(stripHtml(a.description || 'Confira as fotos deste álbum.'), 160),
              image: a.cover_image_url || DEFAULT_IMAGE,
              url: baseUrl + '/album/' + slug,
              type: 'album',
            }),
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        }
      }
    }

    try {
      if (env.ASSETS) {
        let response = await env.ASSETS.fetch(request);
        if (response.status === 404 && !pathname.includes('.')) {
          const indexRequest = new Request(new URL('/index.html', request.url), request);
          response = await env.ASSETS.fetch(indexRequest);
        }
        return response;
      }
    } catch (e) {}

    return fetch(request);
  },
};
