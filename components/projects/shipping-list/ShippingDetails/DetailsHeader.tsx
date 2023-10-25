import AvatarProfile from "@/components/AvatarProfile";
import MoreOption from "@/components/MoreOption";
import { ItemMenu } from "@/components/items";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { ArrowDownToLine, ChevronDown, FileSearch, History, Pencil, Plus, Trash } from "lucide-react";
import React, { memo } from "react";

const DetailsHeader = () => {
  return (
    <div className="flex justify-between pb-3">
      <div className="flex flex-col gap-1">
        <p className="text-lg font-medium">Manage Contents</p>
        <div className="flex gap-1 items-center">
          <span className="text-stone-500">Last updated by:</span>
          <AvatarProfile 
            firstname="Edwin"
            lastname="Sumalinog"
            photo=""
            avatarFallbackClassName="text-sm font-medium text-white"
            avatarClassName="w-6 h-6"
            avatarColor="red"
          />
          <span className="font-medium">Edwin Sumalinog</span>
          <span className="text-stone-500">@</span>
          <span>
            {dayjs('2023/09/05 09:05:02').format('MMM DD, YYYY HH:DD a')}
          </span>
        </div>
      </div>

      <div className="flex items-start gap-1">
        <DetailAction>
          <Pencil className="w-4 h-4 mr-2" strokeWidth={1} />
          Change Status
        </DetailAction>
        <DetailAction>
          <FileSearch className="w-4 h-4 mr-2" strokeWidth={1} />
          Preview
        </DetailAction>
        <DetailAction>
          <ArrowDownToLine className="w-4 h-4 mr-2" strokeWidth={1} />
          Save as PDF
        </DetailAction>
        <MoreOption
          menuTriggerChildren={(
            <DetailAction>
              More <ChevronDown className="w-4 h-4 ms-1" strokeWidth={1} />
            </DetailAction>
          )}
        >
          <DetailActionDropdownItem 
            label="Add from Loading List"
          />
          <DetailActionDropdownItem 
            label="Add from Sold Item"
          />
          <DetailActionDropdownItem 
            label="History"
          />
          <DetailActionDropdownItem 
            label="Delete"
          />
        </MoreOption>
        
      </div>
    </div>
  )
};

export default memo(DetailsHeader);

const DetailAction = React.forwardRef((props: ButtonProps, ref: any) => {
  const { className, children, ...rest } = props;
  return (
    <Button ref={ref} size={"sm"} variant="outline" className={cn("py-1.5", className)} {...rest}>
      {children}
    </Button>
  )
});

DetailAction.displayName = 'DetailAction';

function DetailActionDropdownItem({ onClick, label }: { onClick?: (e?: any) => void, label?: string }) {
  return (
    <ItemMenu className="px-3 py-2 flex gap-2" onClick={onClick}>
      <span className="font-medium">{label}</span>
    </ItemMenu>
  );
}