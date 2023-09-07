import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import React from "react";

type ShippingDetails = {
  children?: React.ReactNode
}

export const ShippingDetails = ({ children }: ShippingDetails) => {
  return (
    <div className="p-[20px] w-full max-w-[1600px] mx-auto">
      <div className="flex gap-5">
        <ScrollArea 
          className={cn(
            "w-1/4 bg-white",
            "rounded-xl shadow-sm p-4"
          )}
        >
          <p className="text-2xl font-bold">9 Sets of Dry-Out Equipment(Sea Freight)</p>  
        </ScrollArea>
        <ScrollArea className="w-3/4 h-[calc(100vh-var(--header-height)-40px)] bg-white rounded-xl shadow-sm">
          <div className="flex border-b justify-between py-3 px-3">
            <p className="text-lg font-medium">Manage Contents</p>
            <p className="text-stone-600">Last updated by:  Edwin Sumalinog  |  2023/09/05 09:05:02</p>
          </div>
          {children}
        </ScrollArea>
      </div>
    </div>
  );
};