import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Katalog from "./Katalog";

export default function KatalogRodinneDomy() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set("kategoria", "rodinne_domy");
    navigate(`${createPageUrl("Katalog")}?${params.toString()}`, { replace: true });
  }, []);

  return (
    <>
      <Helmet>
        <title>Rodinné modulárne domy | American Living</title>
        <meta name="description" content="Široký výber rodinných modulárnych a montovaných domov. Energeticky úsporné riešenia s certifikátom A0. Od 2 až po 6 izbové domy. Kontaktujte nás pre cenovú ponuku." />
        <meta property="og:title" content="Rodinné modulárne domy | American Living" />
        <meta property="og:description" content="Široký výber rodinných modulárnych a montovaných domov s certifikátom A0." />
        <link rel="canonical" href={`https://americanliving.sk${createPageUrl("Katalog")}?kategoria=rodinne_domy`} />
      </Helmet>
      <Katalog />
    </>
  );
}