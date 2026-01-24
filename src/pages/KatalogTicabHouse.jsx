import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
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

  return (
    <>
      <Helmet>
        <title>Ticab house - Modulárne domy | American Living</title>
        <meta name="description" content="Oficiálny distribútor Ticab house na Slovensku. Modulárne domy s flexibilnou konfiguráciou a možnosťou rozšírenia. Energeticky úsporné riešenia s certifikátom A0." />
        <meta property="og:title" content="Ticab house - Modulárne domy | American Living" />
        <meta property="og:description" content="Oficiálny distribútor Ticab house. Kvalitné modulárne domy s možnosťou konfigurácie." />
        <link rel="canonical" href={`https://americanliving.sk${createPageUrl("Katalog")}?vyrobca=Ticab house`} />
      </Helmet>
      <Katalog />
    </>
  );
}