import React, { memo, useContext, useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Status from "@/components/status/status";
import { cn } from "@/lib/utils";
import { AlertTriangle, CornerDownLeft, Plus, Trash, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShippingDetailsContext } from "@/context/shipping-details-context";
import { deleteSerialNumberApi } from "@/apiUtils/shipping/serialNumber";
import { ACTIVE, RETURNED, SHIPPED } from "@/lib/shipping";

const ShippingItemSerialNumber = React.forwardRef((props: ShippingItemSerialNumberProps, ref: any) => {
  const { item, onClickAddSN, onDeleted } = props;
  const [deleting, setDeleting] = useState(false);
  const shippingDetails: any = useContext(ShippingDetailsContext);
  const [_serial_number, set_serial_number] = useState<any>(item.serial_number);
  const _shipping_id = shippingDetails ? shippingDetails._shipping_id : null;
  const shipping_status = shippingDetails ? shippingDetails.shipping_status : null;

  const _onClickAddSN = () => {
    onClickAddSN && onClickAddSN(_serial_number);
  };

  const onClickDelete = async (item: any) => {
    try {
      setDeleting(true);
      const json = await deleteSerialNumberApi({
        shipping_item_details_id: item.shipping_item_details_id,
        shipping_item_id: item.shipping_item_id,
        _shipping_id: shippingDetails._shipping_id,
      });
      if (json.success) {
        setDeleting(false);
        const _data = [..._serial_number].filter((__: any) => __.shipping_item_details_id !== item.shipping_item_details_id);
        set_serial_number(_data);
        onDeleted && onDeleted(json.shipping_item);
      } else {
        setDeleting(false);
      }
    }
    catch(err: any) {
      setDeleting(false);
    }
  };

  const toggleButton = () => {
    if (!item) return false;
    if (!_serial_number) return false;
    const dataLength = _serial_number.length;
    let totalQty = !isNaN(item.shipping_item_quantity) ? Number(item.shipping_item_quantity) : 0;
    if (item.item_set_id) {
      totalQty = !isNaN(item.item_set_list_quantity) ? Number(item.item_set_list_quantity) : 0;
    }
    return totalQty > dataLength;
  }

  useEffect(() => {
    if (Array.isArray(item.serial_numbers)) {
      set_serial_number(item.serial_numbers);
    }
  }, [item]);

  const shippedButton = (itemSn: any) => (
    <Button 
      variant={'ghost'}
      className={"py-1.5 px-2 flex gap-2 items-center"} 
    >
    <AlertTriangle strokeWidth={1} className="w-[18px] h-[18px] text-red-600" />
    Report
  </Button>
  );

  const returnedButton = (itemSn: any) => (
    <>
      <Button 
        variant={'ghost'}
        className={"py-1.5 px-2 flex gap-2 items-center"} 
      >
        <CornerDownLeft strokeWidth={1} className="w-[18px] h-[18px] text-orange-600" />
        Return
      </Button>
      <Button 
        variant={'ghost'}
        className={"py-1.5 px-2 flex gap-2 items-center"} 
      >
        <Undo2 strokeWidth={1} className="w-[18px] h-[18px] text-purple-600" />
        Reset
      </Button>
    </>
  );

  const activeButton = (itemSn: any) => (
    <Button 
      variant={'ghost'}
      className={"py-1.5 px-2 flex gap-2 items-center"} 
      onClick={() => onClickDelete(itemSn)}
      disabled={deleting}
    >
      <Trash strokeWidth={1} className="text-red-600 w-[18px] h-[18px]" />
      Remove
    </Button>
  );

  return (
    <>
      <div className="flex justify-center">
        <ScrollArea className="w-full">
          {Array.isArray(_serial_number) && _serial_number.length > 0 && (
            <div className="flex flex-col">
              {_serial_number.map((item: any, key: number) => (
                <div key={key} className={cn(
                  "flex items-center py-2 ps-3 pe-1 first:border-t",
                  "border-b border-stone-100"
                )}>
                  <div className="font-medium w-[50px]">
                    <span className="w-7 h-7 bg-stone-200 flex items-center justify-center rounded-full text-sm">
                      {key + 1}
                    </span>
                  </div>
                  <div className="font-medium">
                    {item.serial_number}
                  </div>
                  <div className="ms-auto">
                    <Status 
                      statusName={item.serial_number_status}
                      className={cn(
                        "flex gap-1 py-1 px-2 items-center rounded-md",
                      )}
                      statusClassName="text-sm font-medium"
                      iconProps={{
                        width: 15,
                        height: 15,
                      }}
                    />
                  </div>
                  <div className="ms-auto flex items-center">
                    {shipping_status === SHIPPED && shippedButton(item)}
                    {shipping_status === RETURNED && returnedButton(item)}
                    {shipping_status === ACTIVE && activeButton(item)}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className={cn(
            "flex flex-col gap-3",
            Array.isArray(_serial_number) && _serial_number.length > 0 && 'p-0'
          )}>
            {toggleButton() && (
              <div className="flex justify-center items-center">
                <div className="flex justify-center flex-col items-center sticky bottom-0 py-2 w-full border-t border-t-stone-100">
                  <Button variant={'secondary'} className="flex gap-1 items-center " onClick={_onClickAddSN}>
                    <Plus className="w-5 h-5" /> Serial Number
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
});

ShippingItemSerialNumber.displayName = 'ShippingItemSerialNumber';

export default memo(ShippingItemSerialNumber);

type ShippingItemSerialNumberProps = {
  item?: any 
  onClickAddSN?: any 
  onDeleted?: any 
}