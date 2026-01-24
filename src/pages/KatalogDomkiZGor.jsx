import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Katalog from "./Katalog";

export default function KatalogDomkiZGor() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set("vyrobca", "Domki z Gór");
    navigate(`${createPageUrl("Katalog")}?${params.toString()}`, { replace: true });
  }, []);

  // Set meta tags
  useEffect(() => {
    document.title = "Domki z Gór - Mobilné domy | American Living";
    
    const setMetaTag = (selector, attribute, attributeValue, content) => {
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, attributeValue);
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    setMetaTag('meta[name="description"]', 'name', 'description', "Oficiálny distribútor Domki z Gór na Slovensku. Mobilné domy a tiny house riešenia. Kompaktné bývanie pre víkendové chalupy alebo trvalé bývanie.");
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', "Domki z Gór - Mobilné domy | American Living");
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', "Oficiálny distribútor Domki z Gór. Mobilné domy a tiny house riešenia.");

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = `https://americanliving.sk${createPageUrl("Katalog")}?vyrobca=Domki z Gór`;
  }, []);

  return <Katalog />;
}