import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
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

  return (
    <>
      <Helmet>
        <title>Mobilné domy a Tiny House | American Living</title>
        <meta name="description" content="Mobilné domy a tiny house riešenia. Kompaktné a cenovo dostupné bývanie. Ideálne ako víkendové chalupy alebo trvalé bývanie. Domki z Gór a ďalší." />
        <meta property="og:title" content="Mobilné domy a Tiny House | American Living" />
        <meta property="og:description" content="Kompaktné mobilné domy ideálne ako víkendové chalupy alebo trvalé bývanie." />
        <link rel="canonical" href={`https://americanliving.sk${createPageUrl("Katalog")}?typ=mobilny`} />
      </Helmet>
      <Katalog />
    </>
  );
}