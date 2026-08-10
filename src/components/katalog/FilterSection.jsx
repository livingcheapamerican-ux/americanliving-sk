import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FilterSection({ title, icon: Icon, iconClass = "text-primary", defaultOpen = true, badge, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-border rounded-lg bg-background/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-2.5 py-2 text-left hover:bg-muted/50 transition-colors"
      >
        {Icon && <Icon className={`w-3.5 h-3.5 ${iconClass}`} />}
        <span className="text-xs font-bold text-foreground flex-1">{title}</span>
        {badge > 0 && (
          <span className="text-[10px] font-bold bg-primary text-white rounded-full px-1.5 py-0.5 leading-none">{badge}</span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-2.5 pb-2.5 pt-0.5">{children}</div>}
    </div>
  );
}