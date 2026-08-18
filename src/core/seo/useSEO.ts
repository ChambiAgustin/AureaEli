import { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  type?: string;
}

const DEFAULT_TITLE = 'Aurea Elizabeth — Alquimia Botánica & Ritualidad';
const DEFAULT_DESCRIPTION =
  'Un espacio dedicado a nutrir tu bienestar. Elementos de primera calidad seleccionados con amor para intencionar tus días.';
const DEFAULT_IMAGE = '/corazon.png';
const DEFAULT_TWITTER_CARD = 'summary_large_image';

/**
 * Hook para gestionar dinámicamente SEO, Open Graph y Twitter Cards en cada vista.
 */
export function useSEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  twitterCard = DEFAULT_TWITTER_CARD,
  type = 'website',
}: SEOProps = {}): void {
  useEffect(() => {
    try {
      // 1. Título de la página
      const formattedTitle = title
        ? title.includes('Aurea Elizabeth')
          ? title
          : `${title} | Aurea Elizabeth`
        : DEFAULT_TITLE;

      document.title = formattedTitle;

      // Función auxiliar para actualizar o crear tags <meta>
      const setMetaTag = (
        attribute: 'name' | 'property',
        attrValue: string,
        content: string
      ) => {
        let element = document.querySelector<HTMLMetaElement>(
          `meta[${attribute}="${attrValue}"]`
        );
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute(attribute, attrValue);
          document.head.appendChild(element);
        }
        element.setAttribute('content', content);
      };

      // URL absoluta
      const resolvedUrl =
        url || (typeof window !== 'undefined' ? window.location.href : 'https://aureaelizabeth.com');

      // Imagen absoluta
      let resolvedImage = image;
      if (typeof window !== 'undefined' && image && !image.startsWith('http')) {
        const origin = window.location.origin;
        resolvedImage = `${origin}${image.startsWith('/') ? '' : '/'}${image}`;
      }

      // 2. Meta estándar
      setMetaTag('name', 'description', description);

      // 3. Open Graph
      setMetaTag('property', 'og:title', formattedTitle);
      setMetaTag('property', 'og:description', description);
      setMetaTag('property', 'og:image', resolvedImage);
      setMetaTag('property', 'og:url', resolvedUrl);
      setMetaTag('property', 'og:type', type);

      // 4. Twitter Cards
      setMetaTag('name', 'twitter:card', twitterCard);
      setMetaTag('name', 'twitter:title', formattedTitle);
      setMetaTag('name', 'twitter:description', description);
      setMetaTag('name', 'twitter:image', resolvedImage);
    } catch (err) {
      console.warn('[useSEO] Error al manipular el DOM para meta tags SEO:', err);
    }
  }, [title, description, image, url, twitterCard, type]);
}

export default useSEO;
