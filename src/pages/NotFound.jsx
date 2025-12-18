import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Okamžite presmeruj na katalóg
    console.log(`🔄 404 redirect: ${location.pathname} -> /katalog`);
    navigate('/katalog', { replace: true });
  }, [navigate, location.pathname]);

  // Počas presmerovania ukáž prázdnu stránku
  return null;
}