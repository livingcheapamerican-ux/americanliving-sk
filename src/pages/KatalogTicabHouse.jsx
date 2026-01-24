import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Katalog from "./Katalog";

export default function KatalogTicabHouse() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Presmerovať na hlavný katalóg s filtrom pre Ticab house
    const params = new URLSearchParams(location.search);
    params.set("vyrobca", "Ticab house");
    navigate(`${createPageUrl("Katalog")}?${params.toString()}`, { replace: true });
  }, []);

  useEffect(() => {
    document.title = "Ticab house - Modulárne domy | American Living";
    
    const setMetaTag = (selector, attribute, attributeValue, content) => {
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, attributeValue);
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    setMetaTag('meta[name="description"]', 'name', 'description', "Oficiálny distribútor Ticab house na Slovensku. Modulárne domy s flexibilnou konfiguráciou a možnosťou rozšírenia. Energeticky úsporné riešenia s certifikátom A0.");
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', "Ticab house - Modulárne domy | American Living");
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', "Oficiálny distribútor Ticab house. Kvalitné modulárne domy s možnosťou konfigurácie.");

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = `https://americanliving.sk${createPageUrl("Katalog")}?vyrobca=Ticab house`;
  }, []);

  return <Katalog />;
}