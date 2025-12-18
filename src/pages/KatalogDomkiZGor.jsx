import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
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

  return (
    <>
      <Helmet>
        <title>Domki z Gór - Mobilné domy | American Living</title>
        <meta name="description" content="Oficiálny distribútor Domki z Gór na Slovensku. Mobilné domy a tiny house riešenia. Kompaktné bývanie pre víkendové chalupy alebo trvalé bývanie." />
        <meta property="og:title" content="Domki z Gór - Mobilné domy | American Living" />
        <meta property="og:description" content="Oficiálny distribútor Domki z Gór. Mobilné domy a tiny house riešenia." />
        <link rel="canonical" href={`https://americanliving.sk${createPageUrl("Katalog")}?vyrobca=Domki z Gór`} />
      </Helmet>
      <Katalog />
    </>
  );
}