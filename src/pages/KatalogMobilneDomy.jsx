import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Katalog from "./Katalog";

export default function KatalogMobilneDomy() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set("typ", "mobilny");
    navigate(`${createPageUrl("Katalog")}?${params.toString()}`, { replace: true });
  }, []);

  useEffect(() => {
    document.title = "Mobilné domy a Tiny House | American Living";
    
    const setMetaTag = (selector, attribute, attributeValue, content) => {
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, attributeValue);
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    setMetaTag('meta[name="description"]', 'name', 'description', "Mobilné domy a tiny house riešenia. Kompaktné a cenovo dostupné bývanie. Ideálne ako víkendové chalupy alebo trvalé bývanie. Domki z Gór a ďalší.");
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', "Mobilné domy a Tiny House | American Living");
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', "Kompaktné mobilné domy ideálne ako víkendové chalupy alebo trvalé bývanie.");

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = `https://americanliving.sk${createPageUrl("Katalog")}?typ=mobilny`;
  }, []);

  return <Katalog />;
}