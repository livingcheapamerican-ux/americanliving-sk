import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Katalog from "./Katalog";

export default function KatalogProstoHouse() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set("vyrobca", "Prosto House");
    navigate(`${createPageUrl("Katalog")}?${params.toString()}`, { replace: true });
  }, []);

  useEffect(() => {
    document.title = "Prosto House - Montované domy | American Living";
    
    const setMetaTag = (selector, attribute, attributeValue, content) => {
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, attributeValue);
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    setMetaTag('meta[name="description"]', 'name', 'description', "Oficiálny distribútor Prosto House na Slovensku. Montované drevostavby s rýchlou realizáciou. Moderné dizajny a cenovo dostupné riešenia pre bývanie.");
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', "Prosto House - Montované domy | American Living");
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', "Oficiálny distribútor Prosto House. Kvalitné montované domy s rýchlou realizáciou.");

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = `https://americanliving.sk${createPageUrl("Katalog")}?vyrobca=Prosto House`;
  }, []);

  return <Katalog />;
}