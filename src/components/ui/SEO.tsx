import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
  };
}

export const SEO = ({
  title,
  description,
  image = 'https://paroquiasantocristo.com.br/capa.webp',
  url,
  type = 'website',
  keywords,
  article
}: SEOProps) => {
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const siteName = 'Paróquia Senhor Santo Cristo dos Milagres';
  const absoluteImage = image?.startsWith('http') ? image : `https://paroquiasantocristo.com.br${image}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:image:secure_url" content={absoluteImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:site_name" content={siteName} />

      {/* Article specific tags */}
      {article && type === 'article' && (
        <>
          {article.publishedTime && (
            <meta property="article:published_time" content={article.publishedTime} />
          )}
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          {article.author && (
            <meta property="article:author" content={article.author} />
          )}
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />

      {/* WhatsApp (uses Open Graph) */}
      <meta property="og:image:alt" content={title} />
      
      {/* Additional meta tags for better indexing */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
    </Helmet>
  );
};
