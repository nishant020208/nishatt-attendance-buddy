import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  schema?: Record<string, unknown> | null;
}

const DEFAULT_TITLE = "Nishatt Attendance Buddy - Smart Student Attendance Tracker";
const DEFAULT_DESC = "Intelligent attendance tracking system for college and university students. Monitor daily lectures, calculate safe leaves to stay above 75%, and manage weekly timetables with analytics.";
const BASE_URL = "https://attendance.nishatt.com";

export const SEO = ({
  title,
  description = DEFAULT_DESC,
  canonical,
  schema = null,
}: SEOProps) => {
  useEffect(() => {
    // Set dynamic page title
    const formattedTitle = title ? `${title} | Nishatt Attendance Buddy` : DEFAULT_TITLE;
    document.title = formattedTitle;

    // Set meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", description);

    // Set canonical link
    const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : `${BASE_URL}/`;
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.setAttribute("rel", "canonical");
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute("href", canonicalUrl);

    // Set OG Title & Description
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", formattedTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", description);

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute("content", formattedTitle);

    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) twitterDesc.setAttribute("content", description);

    // Set dynamic JSON-LD if provided
    let scriptTag: HTMLScriptElement | null = null;
    if (schema) {
      scriptTag = document.createElement("script");
      scriptTag.type = "application/ld+json";
      scriptTag.id = "dynamic-page-schema";
      scriptTag.text = JSON.stringify(schema);
      document.head.appendChild(scriptTag);
    }

    return () => {
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.removeChild(scriptTag);
      }
    };
  }, [title, description, canonical, schema]);

  return null;
};
