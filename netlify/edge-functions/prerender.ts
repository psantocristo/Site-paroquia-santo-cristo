import type { Context } from "https://edge.netlify.com";

const SUPABASE_URL = "https://gjcmtlmyjaizibhbgiqp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqY210bG15amFpemliaGJnaXFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNDgzOTUsImV4cCI6MjA3MDkyNDM5NX0.0seO-i34_9flvvt44G3zGtRUe4MvM93aAYufWyq1H1U";

const BASE_URL = "https://paroquiasantocristo.com.br";
const DEFAULT_IMAGE = `${BASE_URL}/capa.webp`;
const SITE_NAME = "Paróquia Senhor Santo Cristo dos Milagres";
const DEFAULT_ADDRESS = "R. dos Texteis, 653 - Chacara Santa Etelvina, Sao Paulo - SP, 08490-000";

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
  return bots.some(bot => ua.includes(bot));
}

async function fetchData(endpoint: string) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    return response.ok ? await response.json() : null;
  } catch (error) {
    console.error('Error fetching data:', error);
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

interface EventData {
  startDate: string;
  endDate?: string;
  location: {
    name: string;
    address: string;
  };
  eventStatus?: 'EventScheduled' | 'EventCancelled' | 'EventPostponed' | 'EventRescheduled';
}

interface PageData {
  title: string;
  description: string;
  image: string;
  url: string;
  type: string;
  section: string;
  publishedTime?: string;
  modifiedTime?: string;
  eventData?: EventData;
}

function generateJsonLd(data: PageData): string {
  const baseOrg = {
    "@type": "Organization",
    "name": SITE_NAME,
    "url": BASE_URL,
    "logo": `${BASE_URL}/favicon.png`
  };

  let schemaType: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": data.title,
    "description": data.description,
    "url": data.url,
    "image": data.image,
    "publisher": baseOrg
  };

  if (data.type === 'article' || data.type === 'blog') {
    schemaType = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": data.title,
      "description": data.description,
      "image": data.image,
      "url": data.url,
      "publisher": baseOrg,
      "datePublished": data.publishedTime,
      "dateModified": data.modifiedTime
    };
  } else if (data.type === 'album') {
    schemaType = {
      "@context": "https://schema.org",
      "@type": "ImageGallery",
      "name": data.title,
      "description": data.description,
      "image": data.image,
      "url": data.url,
      "publisher": baseOrg
    };
  } else if (data.type === 'event' && data.eventData) {
    // Schema Event completo com todos os campos obrigatórios e recomendados
    schemaType = {
      "@context": "https://schema.org",
      "@type": "Event",
      "name": data.title,
      "description": data.description,
      "image": data.image,
      "url": data.url,
      
      // CAMPOS CRÍTICOS (obrigatórios pelo Google)
      "startDate": data.eventData.startDate,
      "location": {
        "@type": "Place",
        "name": data.eventData.location.name,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": data.eventData.location.address,
          "addressLocality": "Sao Paulo",
          "addressRegion": "SP",
          "addressCountry": "BR"
        }
      },
      
      // CAMPOS RECOMENDADOS
      "endDate": data.eventData.endDate || data.eventData.startDate,
      "eventStatus": `https://schema.org/${data.eventData.eventStatus || 'EventScheduled'}`,
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "organizer": baseOrg,
      
      // Ingresso gratuito (resolve "offers" não encontrado)
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "BRL",
        "availability": "https://schema.org/InStock",
        "url": data.url,
        "validFrom": data.publishedTime || new Date().toISOString()
      },
      
      // Performer (a própria paróquia)
      "performer": {
        "@type": "Organization",
        "name": SITE_NAME
      }
    };
  } else if (data.type === 'event') {
    // Fallback para eventos sem eventData (não deveria acontecer)
    schemaType = {
      "@context": "https://schema.org",
      "@type": "Event",
      "name": data.title,
      "description": data.description,
      "image": data.image,
      "url": data.url,
      "startDate": data.publishedTime || new Date().toISOString(),
      "location": {
        "@type": "Place",
        "name": SITE_NAME,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": DEFAULT_ADDRESS,
          "addressLocality": "Sao Paulo",
          "addressRegion": "SP",
          "addressCountry": "BR"
        }
      },
      "organizer": baseOrg,
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "BRL",
        "availability": "https://schema.org/InStock",
        "url": data.url
      },
      "performer": {
        "@type": "Organization",
        "name": SITE_NAME
      }
    };
  } else if (data.type === 'campaign') {
    schemaType = {
      "@context": "https://schema.org",
      "@type": "DonateAction",
      "name": data.title,
      "description": data.description,
      "image": data.image,
      "url": data.url,
      "recipient": baseOrg
    };
  }

  return JSON.stringify(schemaType);
}

function generateBreadcrumbs(section: string, title: string, sectionUrl?: string, pageUrl?: string): string {
  const items = [
    { name: 'Inicio', url: BASE_URL },
    { name: section, url: sectionUrl || BASE_URL },
    { name: title, url: pageUrl || BASE_URL }
  ];

  const listItems = items.map((item, i) => `
        <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
          <a itemprop="item" href="${item.url}"><span itemprop="name">${escapeHtml(item.name)}</span></a>
          <meta itemprop="position" content="${i + 1}" />
        </li>`).join('');

  return `
    <nav aria-label="Breadcrumb">
      <ol itemscope itemtype="https://schema.org/BreadcrumbList">${listItems}
      </ol>
    </nav>`;
}

function generateHTML(data: PageData): string {
  const safeTitle = escapeHtml(data.title);
  const safeDescription = escapeHtml(data.description);
  const jsonLd = generateJsonLd(data);
  const sectionUrlMap: Record<string, string> = {
    'Blog': `${BASE_URL}/blog`,
    'Albuns': `${BASE_URL}/galeria`,
    'Avisos': `${BASE_URL}/avisos`,
    'Campanhas': `${BASE_URL}/campanhas`,
    'Programacoes': `${BASE_URL}/programacoes`,
    'Eventos': `${BASE_URL}/festa-padroeiro`,
    'Historia': `${BASE_URL}/nossa-historia`,
    'Documentacoes': `${BASE_URL}/documentacoes`,
    'Galeria': `${BASE_URL}/galeria-dos-padres`,
  };
  const breadcrumbs = generateBreadcrumbs(data.section, data.title, sectionUrlMap[data.section], data.url);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle} | ${SITE_NAME}</title>
  <meta name="description" content="${safeDescription}">
  <link rel="canonical" href="${data.url}">
  
  <!-- Open Graph -->
  <meta property="og:type" content="${data.type === 'blog' ? 'article' : data.type === 'event' ? 'event' : 'website'}">
  <meta property="og:url" content="${data.url}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDescription}">
  <meta property="og:image" content="${data.image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:locale" content="pt_BR">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDescription}">
  <meta name="twitter:image" content="${data.image}">
  
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="${BASE_URL}/favicon.png">
  <link rel="apple-touch-icon" href="${BASE_URL}/apple-touch-icon.png">
  
  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">${jsonLd}</script>
</head>
<body>
  <header>
    <a href="${BASE_URL}">
      <img src="${BASE_URL}/favicon.png" alt="${SITE_NAME}" width="48" height="48">
    </a>
    <h1>${SITE_NAME}</h1>
  </header>
  
  ${breadcrumbs}
  
  <main>
    <article itemscope itemtype="https://schema.org/${data.type === 'event' ? 'Event' : 'Article'}">
      <h1 itemprop="${data.type === 'event' ? 'name' : 'headline'}">${safeTitle}</h1>
      <p itemprop="description">${safeDescription}</p>
      ${data.image ? `<img itemprop="image" src="${data.image}" alt="${safeTitle}" width="1200" height="630">` : ''}
      ${data.eventData ? `
      <div itemprop="location" itemscope itemtype="https://schema.org/Place">
        <span itemprop="name">${escapeHtml(data.eventData.location.name)}</span>
        <span itemprop="address">${escapeHtml(data.eventData.location.address)}</span>
      </div>
      <time itemprop="startDate" datetime="${data.eventData.startDate}">${data.eventData.startDate}</time>
      ` : ''}
      <p><a href="${data.url}">Acessar conteudo completo</a></p>
    </article>
  </main>
  
  <footer>
    <p>&copy; ${new Date().getFullYear()} ${SITE_NAME}. Todos os direitos reservados.</p>
    <p>Cidade Tiradentes, Sao Paulo - SP</p>
  </footer>
</body>
</html>`;
}

function generateGoneHTML(slug: string, section: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Conteudo Removido | ${SITE_NAME}</title>
  <meta name="description" content="Este conteudo nao esta mais disponivel.">
  <link rel="canonical" href="${BASE_URL}/">
</head>
<body>
  <header>
    <a href="${BASE_URL}">
      <img src="${BASE_URL}/favicon.png" alt="${SITE_NAME}" width="48" height="48">
    </a>
    <h1>${SITE_NAME}</h1>
  </header>
  
  <main>
    <h1>Conteudo Removido</h1>
    <p>O ${section} "<strong>${escapeHtml(slug)}</strong>" nao esta mais disponivel.</p>
    <p><a href="${BASE_URL}/">Voltar para a pagina inicial</a></p>
  </main>
  
  <footer>
    <p>&copy; ${new Date().getFullYear()} ${SITE_NAME}</p>
  </footer>
</body>
</html>`;
}

const STATIC_PAGES: Record<string, PageData> = {
  '/': {
    title: 'Inicio',
    description: 'Bem-vindo a Paroquia Senhor Santo Cristo dos Milagres em Cidade Tiradentes, Sao Paulo. Confira horarios de missas, eventos, avisos e muito mais.',
    image: DEFAULT_IMAGE,
    url: BASE_URL,
    type: 'website',
    section: 'Inicio'
  },
  '/festa-padroeiro': {
    title: 'Festa do Padroeiro 2025 - Senhor Santo Cristo dos Milagres',
    description: 'Celebracao anual em honra ao Senhor Santo Cristo dos Milagres. De 13 a 23 de Novembro de 2025, participe das missas solenes, novena e festividades.',
    image: `${BASE_URL}/festa-santo.png`,
    url: `${BASE_URL}/festa-padroeiro`,
    type: 'event',
    section: 'Eventos',
    eventData: {
      startDate: '2025-11-13T00:00:00-03:00',
      endDate: '2025-11-23T23:59:59-03:00',
      location: {
        name: SITE_NAME,
        address: DEFAULT_ADDRESS
      },
      eventStatus: 'EventScheduled'
    }
  },
  '/programacoes': {
    title: 'Programacoes',
    description: 'Confira a programacao completa da Paroquia Santo Cristo dos Milagres. Missas, celebracoes, grupos de oracao e atividades pastorais.',
    image: DEFAULT_IMAGE,
    url: `${BASE_URL}/programacoes`,
    type: 'website',
    section: 'Programacoes'
  },
  '/documentacoes': {
    title: 'Documentacoes e Procedimentos',
    description: 'Guia completo de documentos necessarios para sacramentos: batismo, crisma, matrimonio e outros procedimentos da paroquia.',
    image: `${BASE_URL}/procedimentos.webp`,
    url: `${BASE_URL}/documentacoes`,
    type: 'website',
    section: 'Documentacoes'
  },
  '/nossa-historia': {
    title: 'Nossa Historia',
    description: 'Conheca a historia da Paroquia Senhor Santo Cristo dos Milagres. 40 anos de fe, comunhao e milagres em Cidade Tiradentes.',
    image: DEFAULT_IMAGE,
    url: `${BASE_URL}/nossa-historia`,
    type: 'website',
    section: 'Historia'
  },
  '/galeria-dos-padres': {
    title: 'Galeria dos Padres',
    description: 'Conheca os sacerdotes que serviram e servem a nossa comunidade paroquial ao longo dos anos.',
    image: DEFAULT_IMAGE,
    url: `${BASE_URL}/galeria-dos-padres`,
    type: 'website',
    section: 'Galeria'
  },
  '/campanhas': {
    title: 'Campanhas',
    description: 'Participe das campanhas beneficentes da Paroquia Santo Cristo dos Milagres. Sua doacao transforma vidas.',
    image: DEFAULT_IMAGE,
    url: `${BASE_URL}/campanhas`,
    type: 'website',
    section: 'Campanhas'
  },
  '/pesquisar': {
    title: 'Buscar',
    description: 'Busque por conteudos da Paroquia Senhor Santo Cristo dos Milagres.',
    image: DEFAULT_IMAGE,
    url: `${BASE_URL}/pesquisar`,
    type: 'website',
    section: 'Busca'
  },
  '/privacy': {
    title: 'Politica de Privacidade',
    description: 'Politica de privacidade da Paroquia Senhor Santo Cristo dos Milagres.',
    image: DEFAULT_IMAGE,
    url: `${BASE_URL}/privacy`,
    type: 'website',
    section: 'Legal'
  },
  '/terms': {
    title: 'Termos de Uso',
    description: 'Termos de uso do site da Paroquia Senhor Santo Cristo dos Milagres.',
    image: DEFAULT_IMAGE,
    url: `${BASE_URL}/terms`,
    type: 'website',
    section: 'Legal'
  }
};

export default async (request: Request, context: Context) => {
  const userAgent = request.headers.get('user-agent') || '';
  
  if (!isBot(userAgent)) {
    return context.next();
  }

  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname.startsWith('/api/') || 
      pathname.includes('.') || 
      pathname === '/sitemap.xml' || 
      pathname === '/robots.txt') {
    return context.next();
  }

  // Static pages
  if (STATIC_PAGES[pathname]) {
    const pageData = STATIC_PAGES[pathname];
    return new Response(generateHTML(pageData), {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=3600, s-maxage=86400',
        'x-robots-tag': 'index, follow'
      }
    });
  }

  // Blog post
  const blogMatch = pathname.match(/^\/blog\/(.+)$/);
  if (blogMatch) {
    const slug = blogMatch[1];
    const posts = await fetchData(`blog_posts?slug=eq.${encodeURIComponent(slug)}&is_published=eq.true&select=title,excerpt,content,featured_image,created_at,updated_at`);
    
    if (!posts || posts.length === 0) {
      return new Response(generateGoneHTML(slug, 'post'), {
        status: 410,
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'x-robots-tag': 'noindex'
        }
      });
    }

    const post = posts[0];
    const description = post.excerpt || truncate(stripHtml(post.content), 160);
    
    return new Response(generateHTML({
      title: post.title,
      description,
      image: post.featured_image || DEFAULT_IMAGE,
      url: `${BASE_URL}/blog/${slug}`,
      type: 'blog',
      section: 'Blog',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at
    }), {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=3600, s-maxage=86400',
        'x-robots-tag': 'index, follow'
      }
    });
  }

  // Album
  const albumMatch = pathname.match(/^\/album\/(.+)$/);
  if (albumMatch) {
    const slug = albumMatch[1];
    const albums = await fetchData(`photo_albums?slug=eq.${encodeURIComponent(slug)}&is_active=eq.true&select=name,description,cover_image_url,created_at,updated_at`);
    
    if (!albums || albums.length === 0) {
      return new Response(generateGoneHTML(slug, 'album'), {
        status: 410,
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'x-robots-tag': 'noindex'
        }
      });
    }

    const album = albums[0];
    const description = album.description || `Galeria de fotos: ${album.name}`;
    
    return new Response(generateHTML({
      title: album.name,
      description: truncate(description, 160),
      image: album.cover_image_url || DEFAULT_IMAGE,
      url: `${BASE_URL}/album/${slug}`,
      type: 'album',
      section: 'Albuns',
      publishedTime: album.created_at,
      modifiedTime: album.updated_at
    }), {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=3600, s-maxage=86400',
        'x-robots-tag': 'index, follow'
      }
    });
  }

  // Announcement - busca dados da paróquia para o endereço
  const announcementMatch = pathname.match(/^\/aviso\/(.+)$/);
  if (announcementMatch) {
    const slug = announcementMatch[1];
    
    // Buscar aviso E dados da paróquia em paralelo
    const [announcements, parishes] = await Promise.all([
      fetchData(`parish_announcements?slug=eq.${encodeURIComponent(slug)}&is_published=eq.true&select=title,content,flyer_url,event_date,created_at,updated_at,type`),
      fetchData(`parishes?select=name,address&limit=1`)
    ]);
    
    if (!announcements || announcements.length === 0) {
      return new Response(generateGoneHTML(slug, 'aviso'), {
        status: 410,
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'x-robots-tag': 'noindex'
        }
      });
    }

    const announcement = announcements[0];
    const parish = parishes?.[0] || { name: SITE_NAME, address: DEFAULT_ADDRESS };
    const description = truncate(stripHtml(announcement.content), 160);
    
    // Determinar se é evento (tem event_date ou tipo é 'event')
    const isEvent = announcement.type === 'event' || announcement.event_date;
    
    // Construir dados do evento se aplicável
    const eventData: EventData | undefined = isEvent ? {
      startDate: announcement.event_date || announcement.created_at,
      endDate: announcement.event_date || announcement.created_at, // Mesmo dia se não houver data fim específica
      location: {
        name: parish.name || SITE_NAME,
        address: parish.address || DEFAULT_ADDRESS
      },
      eventStatus: 'EventScheduled'
    } : undefined;
    
    return new Response(generateHTML({
      title: announcement.title,
      description,
      image: announcement.flyer_url || DEFAULT_IMAGE,
      url: `${BASE_URL}/aviso/${slug}`,
      type: isEvent ? 'event' : 'article',
      section: 'Avisos',
      publishedTime: announcement.created_at,
      modifiedTime: announcement.updated_at,
      eventData
    }), {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=3600, s-maxage=86400',
        'x-robots-tag': 'index, follow'
      }
    });
  }

  // Program
  const programMatch = pathname.match(/^\/programacao\/(.+)$/);
  if (programMatch) {
    const slug = programMatch[1];
    const programs = await fetchData(`programs?slug=eq.${encodeURIComponent(slug)}&is_active=eq.true&select=title,description,featured_image,time,days_of_week,created_at,updated_at`);
    
    if (!programs || programs.length === 0) {
      return new Response(generateGoneHTML(slug, 'programacao'), {
        status: 410,
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'x-robots-tag': 'noindex'
        }
      });
    }

    const program = programs[0];
    const days = Array.isArray(program.days_of_week) ? program.days_of_week.join(', ') : '';
    const description = truncate(stripHtml(program.description), 160);
    
    return new Response(generateHTML({
      title: program.title,
      description: days ? `${days} às ${program.time}. ${description}` : description,
      image: program.featured_image || DEFAULT_IMAGE,
      url: `${BASE_URL}/programacao/${slug}`,
      type: 'article',
      section: 'Programacoes',
      publishedTime: program.created_at,
      modifiedTime: program.updated_at
    }), {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=3600, s-maxage=86400',
        'x-robots-tag': 'index, follow'
      }
    });
  }

  // Campaign
  const campaignMatch = pathname.match(/^\/campanha\/(.+)$/);
  if (campaignMatch) {
    const slug = campaignMatch[1];
    const campaigns = await fetchData(`campaigns?slug=eq.${encodeURIComponent(slug)}&is_published=eq.true&select=title,description,featured_image,goal_amount,current_amount,created_at,updated_at`);
    
    if (!campaigns || campaigns.length === 0) {
      return new Response(generateGoneHTML(slug, 'campanha'), {
        status: 410,
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'x-robots-tag': 'noindex'
        }
      });
    }

    const campaign = campaigns[0];
    const description = truncate(stripHtml(campaign.description), 160);
    
    return new Response(generateHTML({
      title: campaign.title,
      description,
      image: campaign.featured_image || DEFAULT_IMAGE,
      url: `${BASE_URL}/campanha/${slug}`,
      type: 'campaign',
      section: 'Campanhas',
      publishedTime: campaign.created_at,
      modifiedTime: campaign.updated_at
    }), {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=3600, s-maxage=86400',
        'x-robots-tag': 'index, follow'
      }
    });
  }

  // Default: homepage
  return new Response(generateHTML(STATIC_PAGES['/']), {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
      'x-robots-tag': 'index, follow'
    }
  });
};

export const config = {
  path: "/*",
  excludedPath: ["/api/*", "/assets/*", "/*.js", "/*.css", "/*.png", "/*.jpg", "/*.webp", "/*.svg", "/*.ico", "/sitemap.xml", "/robots.txt"]
};
