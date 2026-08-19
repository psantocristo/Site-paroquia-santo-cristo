import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
}

export const useSEO = ({
  title,
  description,
  image = 'https://paroquiasantocristo.com.br/capa.webp',
  url,
  type = 'website',
  keywords
}: SEOProps) => {
  useEffect(() => {
    const currentUrl = url || window.location.href;
    
    // Update title
    document.title = title;
    
    // Update or create meta tags
    const updateMetaTag = (property: string, content: string, isName = false) => {
      const attr = isName ? 'name' : 'property';
      let element = document.querySelector(`meta[${attr}="${property}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, property);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };
    
    // Basic meta tags
    updateMetaTag('description', description, true);
    if (keywords) {
      updateMetaTag('keywords', keywords, true);
    }
    
    // Open Graph tags
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image);
    updateMetaTag('og:url', currentUrl);
    updateMetaTag('og:type', type);
    
    // Twitter tags
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    updateMetaTag('twitter:url', currentUrl);
    
    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);
  }, [title, description, image, url, type, keywords]);
};
