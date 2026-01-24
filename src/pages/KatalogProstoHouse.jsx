import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
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

  return (
    <>
      <Helmet>
        <title>Prosto House - Montované domy | American Living</title>
        <meta name="description" content="Oficiálny distribútor Prosto House na Slovensku. Montované drevostavby s rýchlou realizáciou. Moderné dizajny a cenovo dostupné riešenia pre bývanie." />
        <meta property="og:title" content="Prosto House - Montované domy | American Living" />
        <meta property="og:description" content="Oficiálny distribútor Prosto House. Kvalitné montované domy s rýchlou realizáciou." />
        <link rel="canonical" href={`https://americanliving.sk${createPageUrl("Katalog")}?vyrobca=Prosto House`} />
      </Helmet>
      <Katalog />
    </>
  );
}