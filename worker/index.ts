export interface Env {
  ASSETS: Fetcher;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  BASE_URL?: string;
}

const DEFAULT_SUPABASE_URL = 'https://esbkvwfogqgcttgzsyqr.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = '';
const DEFAULT_BASE_URL = 'https://paroquiasantocristo.com.br';
const DEFAULT_IMAGE = 'https://paroquiasantocristo.com.br/capa.webp';
const SITE_NAME = 'Paróquia Senhor Santo Cristo dos Milagres';
const DEFAULT_DESCRIPTION = 'Site Oficial da Paróquia Senhor Santo Cristo dos Milagres em Cidade Tiradentes - SP. Celebrações, avisos, pastorais e horários de missas.';

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
  type?: string;
}

function generateHTML(data: PageData): string {
  const safeTitle = escapeHtml(data.title);
  const safeDescription = escapeHtml(data.description);
  const safeImage = escapeHtml(data.image || DEFAULT_IMAGE);
  const safeUrl = escapeHtml(data.url);
  const safeType = data.type === 'article' ? 'article' : 'website';

  return (
    '<!DOCTYPE html>' +
    '<html lang="pt-BR"><head>' +
    '<meta charset="UTF-8" />' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" />' +
    '<title>' + safeTitle + '</title>' +
    '<meta name="description" content="' + safeDescription + '" />' +
    '<link rel="canonical" href="' + safeUrl + '" />' +
    '<!-- OpenGraph Meta Tags -->' +
    '<meta property="og:type" content="' + safeType + '" />' +
    '<meta property="og:url" content="' + safeUrl + '" />' +
    '<meta property="og:title" content="' + safeTitle + '" />' +
    '<meta property="og:description" content="' + safeDescription + '" />' +
    '<meta property="og:image" content="' + safeImage + '" />' +
    '<meta property="og:image:secure_url" content="' + safeImage + '" />' +
    '<meta property="og:site_name" content="' + SITE_NAME + '" />' +
    '<meta property="og:locale" content="pt_BR" />' +
    '<!-- Twitter Card Meta Tags -->' +
    '<meta name="twitter:card" content="summary_large_image" />' +
    '<meta name="twitter:title" content="' + safeTitle + '" />' +
    '<meta name="twitter:description" content="' + safeDescription + '" />' +
    '<meta name="twitter:image" content="' + safeImage + '" />' +
    '</head><body style="font-family: sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; line-height: 1.6;">' +
    '<h1>' + safeTitle + '</h1>' +
    '<p>' + safeDescription + '</p>' +
    '<img src="' + safeImage + '" alt="' + safeTitle + '" style="max-width: 100%; border-radius: 8px;" />' +
    '<p><a href="' + safeUrl + '">Acessar no site da Paróquia</a></p>' +
    '</body></html>'
  );
}

async function handleSitemap(env: Env, requestUrl: string): Promise<Response> {
  const urlObj = new URL(requestUrl);
  const baseUrl = (env.BASE_URL && !env.BASE_URL.includes('workers.dev')) ? env.BASE_URL : urlObj.origin;
  const today = new Date().toISOString().split('T')[0];

  const [blogPosts, albums, announcements, programs] = await Promise.all([
    fetchSupabase('blog_posts?is_published=eq.true&select=slug,updated_at', env),
    fetchSupabase('photo_albums?is_active=eq.true&select=slug,updated_at', env),
    fetchSupabase('parish_announcements?is_published=eq.true&select=slug,updated_at', env),
    fetchSupabase('programs?is_active=eq.true&select=slug,updated_at', env),
  ]);

  let xml =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    '<url><loc>' + baseUrl + '/</loc><lastmod>' + today + '</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>' +
    '<url><loc>' + baseUrl + '/festa-padroeiro</loc><lastmod>' + today + '</lastmod><priority>0.8</priority></url>' +
    '<url><loc>' + baseUrl + '/programacoes</loc><lastmod>' + today + '</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>' +
    '<url><loc>' + baseUrl + '/avisos</loc><lastmod>' + today + '</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>' +
    '<url><loc>' + baseUrl + '/galeria-dos-padres</loc><lastmod>' + today + '</lastmod><priority>0.7</priority></url>' +
    '<url><loc>' + baseUrl + '/documentacoes</loc><lastmod>' + today + '</lastmod><priority>0.7</priority></url>' +
    '<url><loc>' + baseUrl + '/eventos-informativos</loc><lastmod>' + today + '</lastmod><priority>0.7</priority></url>';

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
  if (Array.isArray(albums)) {
    for (const a of albums) {
      if (a && a.slug) {
        xml += '<url><loc>' + baseUrl + '/album/' + a.slug + '</loc><lastmod>' + (a.updated_at ? a.updated_at.split('T')[0] : today) + '</lastmod><priority>0.7</priority></url>';
      }
    }
  }
  if (Array.isArray(programs)) {
    for (const p of programs) {
      if (p && p.slug) {
        xml += '<url><loc>' + baseUrl + '/programacao/' + p.slug + '</loc><lastmod>' + (p.updated_at ? p.updated_at.split('T')[0] : today) + '</lastmod><priority>0.8</priority></url>';
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
    const baseUrl = (env.BASE_URL && !env.BASE_URL.includes('workers.dev')) ? env.BASE_URL : url.origin;

    if (pathname === '/sitemap.xml') {
      return handleSitemap(env, request.url);
    }

    // Bot Crawler prerendering with full OpenGraph / Twitter Cards
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

      if (pathname.startsWith('/programacao/')) {
        const slug = pathname.replace('/programacao/', '').split('/')[0];
        const data = await fetchSupabase('programs?slug=eq.' + slug + '&is_active=eq.true&select=*', env);
        if (data && data.length > 0) {
          const p = data[0];
          return new Response(
            generateHTML({
              title: p.title + ' | Programações - ' + SITE_NAME,
              description: truncate(stripHtml(p.description || ('Horário: ' + p.time)), 160),
              image: p.featured_image || DEFAULT_IMAGE,
              url: baseUrl + '/programacao/' + slug,
              type: 'article',
            }),
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        }
      }

      if (pathname === '/avisos') {
        return new Response(
          generateHTML({
            title: 'Avisos & Comunicados Paroquiais | ' + SITE_NAME,
            description: 'Confira os avisos, novenas, celebrações e comunicados oficiais da paróquia.',
            image: DEFAULT_IMAGE,
            url: baseUrl + '/avisos',
          }),
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }

      if (pathname === '/programacoes') {
        return new Response(
          generateHTML({
            title: 'Programações & Horários de Missas | ' + SITE_NAME,
            description: 'Horários de missas, terço dos homens, grupo de oração e atividades paroquiais.',
            image: DEFAULT_IMAGE,
            url: baseUrl + '/programacoes',
          }),
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }

      if (pathname === '/documentacoes') {
        return new Response(
          generateHTML({
            title: 'Documentações & Sacramentos | ' + SITE_NAME,
            description: 'Guias e orientações para Batismo, Casamento, Primeira Comunhão e Crisma.',
            image: 'https://paroquiasantocristo.com.br/procedimentos.webp',
            url: baseUrl + '/documentacoes',
          }),
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }

      if (pathname === '/galeria-dos-padres') {
        return new Response(
          generateHTML({
            title: 'Galeria dos Padres | ' + SITE_NAME,
            description: 'Histórico dos sacerdotes e párocos que serviram com dedicação à nossa comunidade.',
            image: DEFAULT_IMAGE,
            url: baseUrl + '/galeria-dos-padres',
          }),
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }

      // Default root fallback for social bots
      if (pathname === '/' || pathname === '') {
        return new Response(
          generateHTML({
            title: SITE_NAME + ' | Cidade Tiradentes - SP',
            description: DEFAULT_DESCRIPTION,
            image: DEFAULT_IMAGE,
            url: baseUrl + '/',
          }),
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
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
