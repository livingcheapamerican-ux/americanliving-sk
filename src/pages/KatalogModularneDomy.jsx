import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Katalog from "./Katalog";

export default function KatalogModularneDomy() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set("typ", "modularny");
    navigate(`${createPageUrl("Katalog")}?${params.toString()}`, { replace: true });
  }, []);

  useEffect(() => {
    document.title = "Modulárne domy - Katalóg | American Living";
    
    const setMetaTag = (selector, attribute, attributeValue, content) => {
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, attributeValue);
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    setMetaTag('meta[name="description"]', 'name', 'description', "Komplexný katalóg modulárnych domov. Flexibilné riešenia s možnosťou rozšírenia. Rýchla výstavba a energetická účinnosť. Ticab house a ďalší výrobcovia.");
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', "Modulárne domy - Katalóg | American Living");
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', "Katalóg modulárnych domov s možnosťou flexibilnej konfigurácie a rozšírenia.");

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = `https://americanliving.sk${createPageUrl("Katalog")}?typ=modularny`;
  }, []);

  return <Katalog />;
}