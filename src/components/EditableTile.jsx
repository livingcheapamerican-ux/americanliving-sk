import React, { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Check, X, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EditableTile({ 
  selected, 
  onClick, 
  title, 
  subtitle, 
  price, 
  isPriced, 
  isA0, 
  isIncluded, 
  hideIncludedMessage, 
  t,
  onPriceChange,
  priceKey,
  isAdmin
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrice, setEditedPrice] = useState(price?.replace(/[^\d.-]/g, '') || '0');

  const handleSave = () => {
    if (onPriceChange && priceKey) {
      const numericPrice = parseFloat(editedPrice);
      if (!isNaN(numericPrice)) {
        onPriceChange(priceKey, numericPrice);
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedPrice(price?.replace(/[^\d.-]/g, '') || '0');
    setIsEditing(false);
  };

  const formatPrice = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? '0 €' : `${num.toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={!isEditing ? onClick : undefined}
      className={`relative p-2 sm:p-2.5 md:p-3 rounded-md cursor-pointer transition-all min-w-0 ${
        selected 
          ? isA0 
            ? "bg-gradient-to-br from-green-500 to-emerald-600 border-4 border-green-600 shadow-xl ring-4 ring-green-200" 
            : "bg-gradient-to-br from-blue-500 to-indigo-600 border-4 border-blue-600 shadow-xl ring-4 ring-blue-200"
          : isA0
            ? "bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 hover:border-green-600 hover:shadow-lg"
            : isIncluded
              ? "bg-white border-2 border-gray-300 hover:border-gray-400"
              : "bg-white border-2 border-gray-200 hover:border-blue-400 hover:shadow-md"
      }`}
    >
      {isA0 && (
        <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] px-2 py-0.5 z-10 shadow-lg font-black border-2 border-white animate-pulse">
          ⚡A0
        </Badge>
      )}
      
      {selected && !isEditing && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-current z-10">
          <span className={`text-[14px] font-black ${isA0 ? 'text-green-600' : 'text-blue-600'}`}>✓</span>
        </div>
      )}
      
      <div className="text-center px-1">
        <span className={`font-bold text-[13px] sm:text-sm md:text-base block leading-tight ${
          selected ? 'text-white drop-shadow-md' : 'text-gray-900'
        }`}>{title}</span>
        {subtitle && <span className={`text-[10px] sm:text-xs block mt-0.5 ${
          selected ? 'text-white/90 font-medium' : 'text-gray-600'
        }`}>{subtitle}</span>}
        
        {isEditing ? (
          <div className="flex items-center gap-1 mt-2 justify-center" onClick={(e) => e.stopPropagation()}>
            <Input
              type="number"
              step="0.01"
              value={editedPrice}
              onChange={(e) => setEditedPrice(e.target.value)}
              className="h-7 text-xs w-24 text-center"
              autoFocus
            />
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSave}>
              <Check className="h-3 w-3 text-green-600" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleCancel}>
              <X className="h-3 w-3 text-red-600" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1 justify-center mt-1 flex-wrap">
            <span className={`text-[11px] sm:text-xs md:text-[13px] font-bold ${
              selected 
                ? 'text-white drop-shadow-md' 
                : isPriced 
                  ? "text-green-700" 
                  : "text-gray-500"
            }`}>
              {price === "0 €" && !hideIncludedMessage ? (
                <span className={`text-[9px] sm:text-[10px] md:text-[11px] italic leading-tight font-medium ${
                  selected ? 'text-white/90' : 'text-gray-600'
                }`}>
                  {t?.('included') || t?.('itemIncludedInBase') || 'Zahrnuté'}
                </span>
              ) : (
                price
              )}
            </span>
            {isAdmin && isPriced && priceKey && (
              <button 
                className="ml-1 p-1 hover:bg-amber-200 rounded transition-all hover:scale-110" 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                title="Edituj cenu"
              >
                <Pencil className="w-4 h-4 text-amber-700" />
              </button>
            )}
            {isAdmin && isPriced && priceKey && selected && (
              <span className="text-[9px] text-gray-500">({title})</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}