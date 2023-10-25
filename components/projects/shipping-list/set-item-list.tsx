import MoreOption from "@/components/MoreOption";
import { ItemMenu } from "@/components/items";
import { ShippingDetailsContext } from "@/context/shipping-details-context";
import { cn } from "@/lib/utils";
import { formatter } from "@/utils/text";
import { Check, ChevronDown, Pencil, Trash, X } from "lucide-react";
import React, { memo, useContext, useState } from "react";
import ShippingItemSerialNumber from "./ShippingItemSerialNumber";
import { CompleteIncompleteStatus } from "./shipping_id";

const SetItemList = ({ item, onClickAddSN, onDeletedSN, onCompleted, onRemove, num, open: _open }: SetItemListProps) => {
  const [open, setOpen] = useState(_open || false);
  return (
    <ItemList num={num} item={item} onClickOpen={() => setOpen(!open)} open={open} onCompleted={onCompleted} onRemove={onRemove}>
      {item && Number(item.with_serial) === 1 && open && (
        <ShippingItemSerialNumber 
          item={item}
          onClickAddSN={(data: any) => onClickAddSN && onClickAddSN(item, data)}
          onDeleted={onDeletedSN}
        />
      )}
    </ItemList>
  );
};

export default memo(SetItemList);

type SetItemListProps = {
  item?: any
  onClickAddSN?: (item: any, data: any) => void
  onDeletedSN?: any
  onCompleted?: () => void
  onRemove?: () => void
  num?: number
  open?: boolean
}

type ItemListProps = { 
  item?: any, 
  children?: React.ReactNode, 
  open?: boolean, 
  onClickOpen?: () => void, 
  onCompleted?: () => void 
  onRemove?: () => void
  num?: number
}

const ItemList = ({ item, children, open, onClickOpen, onCompleted, onRemove, num }: ItemListProps) => {
  const shippingDetails: any = useContext(ShippingDetailsContext);

  const unitValue = (num: number) => {
    if (shippingDetails) {  
      return formatter(shippingDetails.currency).format(num);
    }
    return num;
  };

  const completed = () => {
    if (Number(item.with_serial) === 1) {
      if (Number(item.total_added) === Number(item.item_set_list_quantity)) {
        return <CompleteIncompleteStatus completed={true} />;
      }
    }
    if (Number(item.with_serial) === 0) {
      if (Number(item.unserialized_total_added) === Number(item.item_set_list_quantity)) {
        return <CompleteIncompleteStatus completed={true} />;
      }
    }
    return <CompleteIncompleteStatus completed={false} />;
  };

  const totalAdded = () => {
    if (Number(item.with_serial) === 1) {
      return Number(item.total_added);
    }
    if (Number(item.with_serial) === 0) {
      return Number(item.unserialized_total_added);
    }
    return 0;
  };

  return (
    <div
      className={cn(
        "overflow-hidden flex flex-col cursor-grab bg-white rounded-xl border border-transparent hover:bg-stone-50",
        open && 'shadow-sm border-stone-100',
      )}
    >
      <div 
        className={cn(
          "flex relative py-2 ps-3 pe-2",
          open && 'border-b border-b-stone-100'
        )}>
        <div className="flex items-start">
          <div className="flex items-start gap-1" style={{ width: '332px' }}>
            <div className="w-[15px] h-[15px] bg-red-300 rounded-full mt-1" />
            <div className="flex flex-col px-2">
              <span className="font-medium" dangerouslySetInnerHTML={{ __html: item.item_set_name || '' }} />
              <span className="text-stone-500">{item.shipping_item_country_of_origin}</span>
            </div>
          </div>
          <div className="w-[155px] p-2 text-right">
            <span className="text-sm">{item.item_set_hs_code}</span>
          </div>
          <div className="w-[135px] p-2 text-right">
            <span className="text-sm">{item.item_set_list_weight}</span>
          </div>
          <div className="w-[100px] p-2 text-right">
            <span className="text-sm p-1">
              <span className="font-bold">{totalAdded()}</span>{totalAdded() !== Number(item.item_set_list_quantity) && '/' + item.item_set_list_quantity}
            </span>
          </div>
          <div className="w-[215px] p-2 text-right">
            <span className="text-sm">{unitValue(item.item_set_unit_value)}</span>
          </div>
        </div>
        <div className="min-w-[150px] p-2 ps-12">
          {completed()}
        </div>
        <div className="absolute right-0 h-full top-0 flex items-start pe-2 py-3">
          {item && Number(item.with_serial) === 1 && (
            <button 
              className={cn(
                "hover:bg-stone-100 p-2 rounded-xl",
              )}
              tabIndex={-1} 
              onClick={onClickOpen}
            >
              <ChevronDown className={cn("h-5 w-5 transition-all duration-300", open && '-rotate-180')} strokeWidth={1} />
            </button>
          )}
          <MoreOption triggerButtonClassName="hover:bg-stone-100">
            {item && Number(item.with_serial) === 0 && (
              <ItemMenu onClick={onCompleted}>
                {Number(item.unserialized_total_added) === Number(item.item_set_list_quantity) ? (
                    <X className={cn("mr-2 h-[18px] w-[18px]")} strokeWidth={1} />
                  ) : (
                    <Check className={cn("mr-2 h-[18px] w-[18px]")} strokeWidth={1} />
                  )}
                <span className="font-medium">
                  Mark as {Number(item.unserialized_total_added) === Number(item.item_set_list_quantity) ? 'Incomplete' : 'Complete'}
                </span>
              </ItemMenu>
            )}
            <ItemMenu onClick={onRemove}>
              <Trash className={cn("mr-2 h-[18px] w-[18px]")} strokeWidth={1} />
              <span className="font-medium">Remove</span>
            </ItemMenu>
          </MoreOption>
        </div>
      </div>
      {children}
    </div>
  )
}