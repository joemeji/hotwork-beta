import React, { memo, useContext, useEffect, useState } from "react";
import { authHeaders, baseUrl } from "@/utils/api.config";
import { ScrollArea } from "@/components/ui/scroll-area";
import Status from "@/components/status/status";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShippingDetailsContext } from "@/context/shipping-details-context";
import { AccessTokenContext } from "@/context/access-token-context";

const ShippingItemSerialNumber = React.forwardRef((props: ShippingItemSerialNumberProps, ref: any) => {
  const { item, onClickAddSN, onDeleted } = props;
  const [deleting, setDeleting] = useState(false);
  const shippingDetails: any = useContext(ShippingDetailsContext);
  const access_token = useContext(AccessTokenContext);
  const [_serial_number, set_serial_number] = useState<any>(item.serial_number);

  const _onClickAddSN = () => {
    onClickAddSN && onClickAddSN(_serial_number);
  };

  const onClickDelete = async (item: any) => {
    try {
      setDeleting(true);
      const options = {
        method: 'POST',
        body: JSON.stringify({ 
          shipping_item_details_id: item.shipping_item_details_id,
          shipping_item_id: item.shipping_item_id,
          _shipping_id: shippingDetails._shipping_id,
        }),
        headers: { ...authHeaders(access_token) }
      };
      const res = await fetch(baseUrl + '/api/projects/shipping/items/delete_shipping_item_details', options);
      const json = await res.json();
      if (json.success) {
        setDeleting(false);
        const _data = [..._serial_number].filter((__: any) => __.shipping_item_details_id !== item.shipping_item_details_id);
        set_serial_number(_data);
        onDeleted && onDeleted(json.shipping_item);
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

  return (
    <>
      <div className="flex justify-center">
        <ScrollArea className="w-full ps-6">
          <div className="flex flex-col">
            {Array.isArray(_serial_number) && _serial_number.map((item: any, key: number) => (
              <div key={key} className={cn(
                "flex hover:bg-stone-100 items-center py-2 ps-3 pe-1",
                "border-b border-b-stone-100 last:border-0 rounded-xl"
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
                <div className="ms-auto">
                  <Button 
                    variant={'ghost'}
                    className={cn(
                      "bg-transparent text-stone-500 hover:bg-red-100 py-1.5 px-2.5 flex gap-1 items-center",
                      deleting && 'pointer-events-none'
                    )} 
                    onClick={() => onClickDelete(item)}
                    disabled={deleting}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className={cn(
            "py-2 flex flex-col gap-3",
            Array.isArray(_serial_number) && _serial_number.length > 0 && 'p-0'
          )}>
            {Array.isArray(_serial_number) && _serial_number.length === 0 && (
              <div className="flex justify-center">
                <span className="font-extrabold text-xl text-stone-400">NO S/N ADDED</span>
              </div>
            )}
            {toggleButton() && (
              <div className="flex justify-center flex-col items-center sticky bottom-0 py-2">
                <Button size={'sm'} variant={'outline'} className="py-2 px-2 flex gap-1 items-center shadow-lg rounded-full" onClick={_onClickAddSN}>
                  <Plus className="w-5 h-5" />
                </Button>
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