import type { Context } from "https://edge.netlify.com";

const SUPABASE_URL = "https://gjcmtlmyjaizibhbgiqp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqY210bG15amFpemliaGJnaXFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNDgzOTUsImV4cCI6MjA3MDkyNDM5NX0.0seO-i34_9flvvt44G3zGtRUe4MvM93aAYufWyq1H1U";

const BASE_URL = "https://paroquiasantocristo.com.br";

async function fetchData(endpoint: string) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    return response.ok ? await response.json() : [];
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

function formatDate(dateString: string | null): string {
  if (!dateString) return new Date().toISOString().split('T')[0];
  return new Date(dateString).toISOString().split('T')[0];
}

function escapeXml(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text) return '';
  const clean = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return clean.length > maxLength ? clean.substring(0, maxLength - 3) + '...' : clean;
}

export default async (request: Request, context: Context) => {
  // Buscar todos os conteúdos dinâmicos em paralelo com campos de descrição
  const [blogPosts, albums, announcements, campaigns, programs] = await Promise.all([
    fetchData('blog_posts?is_published=eq.true&select=slug,updated_at,featured_image,title,excerpt'),
    fetchData('photo_albums?is_active=eq.true&select=slug,updated_at,cover_image_url,name,description'),
    fetchData('parish_announcements?is_published=eq.true&select=slug,updated_at,flyer_url,title,content'),
    fetchData('campaigns?is_published=eq.true&select=slug,updated_at,featured_image,title,description'),
    fetchData('programs?is_active=eq.true&select=slug,updated_at,featured_image,title,description'),
  ]);

  const today = new Date().toISOString().split('T')[0];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Páginas Estáticas -->
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${BASE_URL}/capa.webp</image:loc>
      <image:title>Paróquia Senhor Santo Cristo dos Milagres</image:title>
      <image:caption>Igreja matriz da Paróquia Senhor Santo Cristo dos Milagres em Cidade Tiradentes, São Paulo</image:caption>
    </image:image>
  </url>
  
  <url>
    <loc>${BASE_URL}/festa-padroeiro</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <image:image>
      <image:loc>${BASE_URL}/festa-santo.png</image:loc>
      <image:title>Festa do Padroeiro 2025</image:title>
      <image:caption>Celebração anual em honra ao Senhor Santo Cristo dos Milagres com missas, procissão e festividades</image:caption>
    </image:image>
  </url>
  
  <url>
    <loc>${BASE_URL}/programacoes</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${BASE_URL}/documentacoes</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <image:image>
      <image:loc>${BASE_URL}/procedimentos.webp</image:loc>
      <image:title>Documentações e Procedimentos</image:title>
      <image:caption>Guia completo de documentos e procedimentos para sacramentos na Paróquia Santo Cristo</image:caption>
    </image:image>
  </url>
  
  <url>
    <loc>${BASE_URL}/nossa-historia</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${BASE_URL}/galeria-dos-padres</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${BASE_URL}/campanhas</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${BASE_URL}/pesquisar</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <url>
    <loc>${BASE_URL}/privacy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <url>
    <loc>${BASE_URL}/terms</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
`;

  // Blog Posts com excerpt
  for (const post of blogPosts) {
    const caption = truncateText(post.excerpt, 160);
    sitemap += `
  <url>
    <loc>${BASE_URL}/blog/${escapeXml(post.slug)}</loc>
    <lastmod>${formatDate(post.updated_at)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>${post.featured_image ? `
    <image:image>
      <image:loc>${escapeXml(post.featured_image)}</image:loc>
      <image:title>${escapeXml(post.title || 'Post do Blog')}</image:title>${caption ? `
      <image:caption>${escapeXml(caption)}</image:caption>` : ''}
    </image:image>` : ''}
  </url>`;
  }

  // Álbuns de Fotos com descrição
  for (const album of albums) {
    const caption = truncateText(album.description, 160);
    sitemap += `
  <url>
    <loc>${BASE_URL}/album/${escapeXml(album.slug)}</loc>
    <lastmod>${formatDate(album.updated_at)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>${album.cover_image_url ? `
    <image:image>
      <image:loc>${escapeXml(album.cover_image_url)}</image:loc>
      <image:title>${escapeXml(album.name || 'Álbum de Fotos')}</image:title>${caption ? `
      <image:caption>${escapeXml(caption)}</image:caption>` : ''}
    </image:image>` : ''}
  </url>`;
  }

  // Avisos/Eventos com conteúdo
  for (const announcement of announcements) {
    const caption = truncateText(announcement.content, 160);
    sitemap += `
  <url>
    <loc>${BASE_URL}/aviso/${escapeXml(announcement.slug)}</loc>
    <lastmod>${formatDate(announcement.updated_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>${announcement.flyer_url ? `
    <image:image>
      <image:loc>${escapeXml(announcement.flyer_url)}</image:loc>
      <image:title>${escapeXml(announcement.title || 'Aviso Paroquial')}</image:title>${caption ? `
      <image:caption>${escapeXml(caption)}</image:caption>` : ''}
    </image:image>` : ''}
  </url>`;
  }

  // Campanhas com descrição
  for (const campaign of campaigns) {
    const caption = truncateText(campaign.description, 160);
    sitemap += `
  <url>
    <loc>${BASE_URL}/campanha/${escapeXml(campaign.slug)}</loc>
    <lastmod>${formatDate(campaign.updated_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>${campaign.featured_image ? `
    <image:image>
      <image:loc>${escapeXml(campaign.featured_image)}</image:loc>
      <image:title>${escapeXml(campaign.title || 'Campanha')}</image:title>${caption ? `
      <image:caption>${escapeXml(caption)}</image:caption>` : ''}
    </image:image>` : ''}
  </url>`;
  }

  // Programações
  for (const program of programs) {
    const caption = truncateText(program.description, 160);
    sitemap += `
  <url>
    <loc>${BASE_URL}/programacao/${escapeXml(program.slug)}</loc>
    <lastmod>${formatDate(program.updated_at)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>${program.featured_image ? `
    <image:image>
      <image:loc>${escapeXml(program.featured_image)}</image:loc>
      <image:title>${escapeXml(program.title || 'Programação')}</image:title>${caption ? `
      <image:caption>${escapeXml(caption)}</image:caption>` : ''}
    </image:image>` : ''}
  </url>`;
  }

  sitemap += `
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  });
};

export const config = {
  path: "/sitemap.xml",
};
