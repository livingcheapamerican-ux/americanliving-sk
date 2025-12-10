import React, { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Check, X } from "lucide-react";
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
      className={`relative p-2 rounded-md cursor-pointer transition-all border ${
        selected 
          ? isA0 
            ? "bg-green-100 border-green-500 shadow-md" 
            : "bg-blue-100 border-blue-500 shadow-md"
          : isA0
            ? "bg-green-50 border-green-300 hover:border-green-400"
            : isIncluded
              ? "bg-gray-50 border-gray-300"
              : "bg-white border-gray-200 hover:border-blue-300"
      }`}
    >
      {isA0 && (
        <Badge className="absolute -top-1 -right-1 bg-green-600 text-white text-[9px] px-1 py-0 z-10">
          ⚡A0
        </Badge>
      )}
      
      {selected && !isEditing && (
        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">✓</span>
        </div>
      )}
      
      <div className="text-center">
        <span className="font-semibold text-gray-800 text-base block leading-tight">{title}</span>
        {subtitle && <span className="text-xs text-gray-500 block mt-0.5">{subtitle}</span>}
        
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
          <div className="flex items-center gap-1 justify-center mt-1">
            <span className={`text-[13px] font-bold ${isPriced ? "text-green-600" : "text-gray-400"}`}>
              {price === "0 €" && !hideIncludedMessage ? (
                <span className="text-[11px] text-gray-500 italic leading-tight">
                  {t?.('itemIncludedInBase') || 'Táto položka je súčasťou základnej konfigurácie domu'}
                </span>
              ) : (
                price
              )}
            </span>
            {isAdmin && isPriced && priceKey && (
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-5 w-5 opacity-50 hover:opacity-100" 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}