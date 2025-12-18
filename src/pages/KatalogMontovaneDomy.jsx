import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
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

  return (
    <>
      <Helmet>
        <title>Montované domy - Katalóg | American Living</title>
        <meta name="description" content="Montované domy a drevostavby. Rýchla montáž a presnosť výroby. Energeticky úsporné riešenia s certifikátom A0. Prosto House a ďalší výrobcovia." />
        <meta property="og:title" content="Montované domy - Katalóg | American Living" />
        <meta property="og:description" content="Rýchla montáž a energetická účinnosť montovaných domov a drevostavieb." />
        <link rel="canonical" href={`https://americanliving.sk${createPageUrl("Katalog")}?typ=montovany`} />
      </Helmet>
      <Katalog />
    </>
  );
}