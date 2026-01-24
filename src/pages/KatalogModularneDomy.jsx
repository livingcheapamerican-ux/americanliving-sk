import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
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

  return (
    <>
      <Helmet>
        <title>Modulárne domy - Katalóg | American Living</title>
        <meta name="description" content="Komplexný katalóg modulárnych domov. Flexibilné riešenia s možnosťou rozšírenia. Rýchla výstavba a energetická účinnosť. Ticab house a ďalší výrobcovia." />
        <meta property="og:title" content="Modulárne domy - Katalóg | American Living" />
        <meta property="og:description" content="Katalóg modulárnych domov s možnosťou flexibilnej konfigurácie a rozšírenia." />
        <link rel="canonical" href={`https://americanliving.sk${createPageUrl("Katalog")}?typ=modularny`} />
      </Helmet>
      <Katalog />
    </>
  );
}