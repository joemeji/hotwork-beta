import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { fetchApi } from "@/utils/api.config";
import { avatarFallback } from "@/utils/avatar";
import dayjs from "dayjs";
import { Check, X } from "lucide-react";
import { Pencil } from "lucide-react";
import { useRouter } from "next/router";
import React, { memo } from "react";
import useSWR from 'swr';

const _ShippingDetails = (props: ShippingDetails) => {
  const { children } = props;

  return (
    <div className="p-[20px] w-full max-w-[1600px] mx-auto">
      <div className="flex gap-5">
        {children}
      </div>
    </div>
  );
};

export const ShippingDetails = memo(_ShippingDetails);

type ShippingDetails = {
  children?: React.ReactNode
}

export const CompleteIncompleteStatus = ({ completed = false }: { completed: boolean }) => {
  if (completed) {
    return (
      <div className="bg-green-400 p-[3px] w-fit rounded-full">
        <Check width={16} height={16} strokeWidth={4} className="text-white" />
      </div> 
    );
  }
  return (
    <div className="bg-red-400 p-[3px] w-fit rounded-full">
      <X width={16} height={16} strokeWidth={4} className="text-white" />
    </div>
  );
}