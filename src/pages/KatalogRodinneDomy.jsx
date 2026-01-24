import React, { useEffect } from "react";
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

  return <Katalog />;
}