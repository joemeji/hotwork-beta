import MoreOption from "@/components/MoreOption";
import { ItemMenu } from "@/components/items";
import { Button, ButtonProps } from "@/components/ui/button";
import { ShippingDetailsContext } from "@/context/shipping-details-context";
import { cn } from "@/lib/utils";
import { FileSearch, MoreHorizontal, Pencil } from "lucide-react";
import React, { memo, useContext, useState } from "react";
import { useSWRConfig } from "swr";
import dynamic from "next/dynamic";

const ChangeStatusModal = dynamic(() => import("../../modals/ChangeStatusModal"));

function DetailsActions() {
  const shippingData: any = useContext(ShippingDetailsContext);
  const _shipping_id = shippingData ? shippingData._shipping_id : null;
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const { mutate } = useSWRConfig();

  return (
    <React.Fragment>
      <ChangeStatusModal 
        onOpenChange={(open: any) => setStatusModalOpen(open)} 
        open={statusModalOpen}
      />

      <div className="flex items-center gap-1">
        <DetailAction onClick={() => setStatusModalOpen(true)}>
          <Pencil 
            className="w-4 h-4 mr-2" 
            strokeWidth={1} 
          />
          Change Status
        </DetailAction>
        <DetailAction 
          onClick={() => {
            window.open(
              '/projects/shipping-list/' + _shipping_id + '/preview', 
              '_blank', 
              'noopener,noreferrer'
            );
          }}
        >
          <FileSearch className="w-4 h-4 mr-2" strokeWidth={1} />
          Preview
        </DetailAction>
        <MoreOption
          menuTriggerChildren={(
            <DetailAction>
              <MoreHorizontal 
                className="w-5 h-5" 
                strokeWidth={1} 
              />
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
    </React.Fragment>
  );
}

export default memo(DetailsActions);

const DetailAction = React.forwardRef((props: ButtonProps, ref: any) => {
  const { className, children, ...rest } = props;
  return (
    <Button ref={ref} size={"sm"} variant="secondary" className={cn("py-1.5", className)} {...rest}>
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