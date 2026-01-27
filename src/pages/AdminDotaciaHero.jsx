import React from "react";
import DotaciaHeroManager from "../components/admin/DotaciaHeroManager";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";

export default function AdminDotaciaHero() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Domov")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-gray-900">
              Dotácia Americana - Hero Sekcia
            </h1>
            <p className="text-gray-600 mt-1">
              Nastavenie fotiek a slideshow pre split-screen hero sekciu
            </p>
          </div>
        </div>

        <DotaciaHeroManager />
      </div>
    </div>
  );
}