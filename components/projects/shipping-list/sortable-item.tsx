import MoreOption from "@/components/MoreOption";
import { ItemMenu } from "@/components/items";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import {CSS} from '@dnd-kit/utilities';
import { Check, ChevronDown, MinusCircle, Pencil, Trash, X } from "lucide-react";
import React, { memo, useContext } from "react";
import ShippingItemSerialNumber from "./ShippingItemSerialNumber";
import { ShippingDetailsContext } from "@/context/shipping-details-context";
import { formatter } from "@/utils/text";
import { CompleteIncompleteStatus } from "./shipping_id";

export function SortableItem(props: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: props.id, data: { type: props.type }, disabled: props.disabled });
  
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={props.className}>
      {props.children}
    </div>
  );
}

const _ItemList = React.forwardRef((props: ItemListProps, ref: any) => {
  const shippingDetails: any = useContext(ShippingDetailsContext);
  const shipping_currency = shippingDetails ? shippingDetails.currency : '';
  const { 
    item, 
    descriptionWidth, 
    onClickEdit, 
    onClickAddSN, 
    onOpenSn, 
    openSn, 
    onDeletedSN,
    onClickDelete,
    onClickUncategorized,
    onCompleted,
  } = props;
  const _open = openSn;

  const completed = () => {
    if (Number(item.is_custom) === 1) {
      if (Number(item.custom_total_added) === Number(item.shipping_item_quantity)) {
        return <CompleteIncompleteStatus completed={true} />;
      }
    }

    if (Number(item.with_serial) === 1) {
      if (Number(item.total_added) === Number(item.shipping_item_quantity)) {
        return <CompleteIncompleteStatus completed={true} />;
      }
    }

    if (Number(item.with_serial) === 0) {
      if (Number(item.unserialized_total_added) === Number(item.shipping_item_quantity)) {
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

  const quantityStatus = () => {
    if (item.is_custom == 1) {
      return <>
        <span className="font-bold">
          {item.custom_total_added || 0}
        </span>{Number(item.custom_total_added) !== Number(item.shipping_item_quantity) && '/' +item.shipping_item_quantity}
      </>
    }
    return (
      <>
        <span className="font-bold">{totalAdded()}</span>{totalAdded() !== Number(item.shipping_item_quantity) && '/' +item.shipping_item_quantity}
      </>
    );
  }

  const markCompletedOrIncompleted = () => {
    if (item.is_custom == 1) {
      return item.custom_total_added ? 'Incomplete' : 'Complete';
    }
    return Number(item.unserialized_total_added) === Number(item.shipping_item_quantity) ? 'Incomplete' : 'Complete';
  }

  return (
    <>
      <div ref={ref}
        className={cn(
          "overflow-hidden flex flex-col cursor-grab bg-white rounded-xl border border-transparent",
          _open && 'shadow-sm border-stone-100'
        )}
      >
        <div 
          className={cn(
            "flex relative py-3 ps-3 pe-2",
            _open && 'border-b border-stone-100'
          )}>
          <div className="flex items-start">
            <div className="flex items-start gap-1" style={{ width: ((descriptionWidth || 350)) + 'px' }}>
              <div className="w-[15px] h-[15px] bg-red-300 rounded-full mt-1" />
              <div className="flex flex-col px-2">
                <span className="font-medium" dangerouslySetInnerHTML={{ __html: item.shipping_item_name || '' }} />
                <span className="text-stone-500">{item.shipping_item_country_of_origin}</span>
              </div>
            </div>
            <div className="w-[155px] p-2 text-right">
              <span className="text-sm">{item.shipping_item_hs_code}</span>
            </div>
            <div className="w-[130px] p-2 text-right">
              <span className="text-sm">{item.shipping_item_weight}</span>
            </div>
            <div className="w-[100px] p-2 text-right">
              {quantityStatus()}
            </div>
            <div className="w-[215px] p-2 text-right">
              <span className="text-sm">
                {shippingDetails ? formatter(shipping_currency).format(item.shipping_item_unit_value) : 0}
              </span>
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
                onClick={onOpenSn}
              >
                <ChevronDown className={cn("h-5 w-5 transition-all duration-300", openSn && '-rotate-180')} strokeWidth={1} />
              </button>
            )} 
            <MoreOption>
              {item && Number(item.with_serial) === 0 && (
                <ItemMenu onClick={onCompleted}>
                  {Number(item.unserialized_total_added) === Number(item.shipping_item_quantity) ? (
                    <X className={cn("mr-2 h-[18px] w-[18px]")} strokeWidth={1} />
                  ) : (
                    <Check className={cn("mr-2 h-[18px] w-[18px]")} strokeWidth={1} />
                  )}
                  <span className="font-medium">
                    Mark as {markCompletedOrIncompleted()}
                  </span>
                </ItemMenu>
              )} 
              <ItemMenu onClick={onClickEdit}>
                <Pencil className={cn("mr-2 h-[18px] w-[18px]")} strokeWidth={1} />
                <span className="font-medium">Edit</span>
              </ItemMenu>
              {item.shipping_category_id && (
                <ItemMenu onClick={onClickUncategorized}>
                  <MinusCircle className={cn("mr-2 h-[18px] w-[18px]")} strokeWidth={1} />
                  <span className="font-medium">Uncategorized</span>
                </ItemMenu>
              )}
              <ItemMenu onClick={onClickDelete}>
                <Trash className={cn("mr-2 h-[18px] w-[18px]")} strokeWidth={1} />
                <span className="font-medium">Delete</span>
              </ItemMenu>
            </MoreOption>
          </div>
        </div>
        
        {_open && (
          <ShippingItemSerialNumber 
            item={item}
            onClickAddSN={onClickAddSN}
            onDeleted={onDeletedSN}
          />
        )}
      </div>
    </>
  );
});

_ItemList.displayName = '_ItemList';

export const ItemList = memo(_ItemList);

type ItemListProps = {
  item?: any
  descriptionWidth?: any
  onClickEdit?: () => void
  onClickAddSN?: (serial_numbers: any) => void
  onOpenSn?: () => void
  openSn?: any
  onDeletedSN?: (shipping_item: any) => void
  onClickDelete?: () => void
  onClickUncategorized?: () => void
  onCompleted?: () => void
};