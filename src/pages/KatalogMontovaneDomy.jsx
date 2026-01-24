import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Katalog from "./Katalog";

export default function KatalogMontovaneDomy() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set("typ", "montovany");
    navigate(`${createPageUrl("Katalog")}?${params.toString()}`, { replace: true });
  }, []);

  useEffect(() => {
    document.title = "Montované domy - Katalóg | American Living";
    
    const setMetaTag = (selector, attribute, attributeValue, content) => {
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, attributeValue);
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    setMetaTag('meta[name="description"]', 'name', 'description', "Montované domy a drevostavby. Rýchla montáž a presnosť výroby. Energeticky úsporné riešenia s certifikátom A0. Prosto House a ďalší výrobcovia.");
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', "Montované domy - Katalóg | American Living");
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', "Rýchla montáž a energetická účinnosť montovaných domov a drevostavieb.");

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = `https://americanliving.sk${createPageUrl("Katalog")}?typ=montovany`;
  }, []);

  return <Katalog />;
}