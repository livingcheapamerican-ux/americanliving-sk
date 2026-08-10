import React from "react";
import { Card } from "@/components/ui/card";

export default function DomCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border flex flex-col">
      <div className="aspect-[4/3] bg-muted animate-pulse" />
      <div className="p-2 sm:p-3 space-y-2">
        <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
        <div className="flex gap-1.5">
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
          <div className="h-4 w-14 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-5 w-24 bg-muted rounded animate-pulse" />
        <div className="h-8 w-full bg-muted rounded animate-pulse" />
      </div>
    </Card>
  );
}