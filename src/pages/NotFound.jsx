import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-bold text-gray-200 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Stránka nenájdená
        </h2>
        <p className="text-gray-600 mb-8">
          Stránka ktorú hľadáte neexistuje alebo bola presunutá.
        </p>
        <Button
          onClick={() => navigate('/katalog')}
          size="lg"
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-12 py-6 text-xl"
        >
          <Home className="mr-3 w-6 h-6" />
          Do katalógu domov
        </Button>
      </div>
    </div>
  );
}