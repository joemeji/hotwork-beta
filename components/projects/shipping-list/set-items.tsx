import MoreOption from "@/components/MoreOption";
import { ItemMenu } from "@/components/items";
import { cn } from "@/lib/utils";
import { ChevronDown, MinusCircle, Pencil, Trash } from "lucide-react";
import React, { memo, useContext, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShippingDetailsContext } from "@/context/shipping-details-context";
import { fetcher } from "@/utils/api.config";
import SetItemList from "./set-item-list";
import { Skeleton } from "@/components/ui/skeleton";
import AddSerialNumberModal from "./modals/AddSerialNumberModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CompleteIncompleteStatus } from "./shipping_id";
import useSWR, { useSWRConfig } from "swr";
import { formatter } from "@/utils/text";

const _ItemList = React.forwardRef((props: ItemListProps, ref: any) => {
  const { 
    item, 
    onClickEdit, 
    onClickDelete,
    onClickUncategorized,
  } = props;
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const shippingDetails: any = useContext(ShippingDetailsContext);
  const shipping_id = shippingDetails ? shippingDetails._shipping_id : null;
  const [openSNModal, setOpenSNModal] = useState(false);
  const [serialNumbersForAddSnModal, setSerialNumbersForAddSnModal] = useState<any>([]);
  const [selectedItemForAddSnModal, setSelectedItemForAddSnModal] = useState<any>(null);
  const shippingData: any = useContext(ShippingDetailsContext);
  const [alertMessage, setAlertMessage] = useState<any>({});
  const [openAlertMessage, setOpenAlertMessage] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [openSn, setOpenSn] = useState(false);
  const { mutate: shippingMutate } = useSWRConfig();

  const uri = () => {
    if (!item) return null;
    if (!openSn) return null;
    return `/api/shipping/${shipping_id}/set/item/${item.shipping_item_id}`;
  }
  
  const { data, isLoading, error, isValidating, mutate } = useSWR(
    () => {
      let paramsObj: any = {};
      return uri();
    }, 
    fetcher
  );

  const unitValue = (num: number) => {
    if (shippingDetails) {
      return formatter(shippingDetails.currency).format(num);
    }
    return num;
  };

  const onClickAddSN = (_item: any, data: any) => {
    setSelectedItemForAddSnModal(_item);
    setOpenSNModal(true);
  };

  const updateSetItem = (set_item: any, removed = false) => {
    mutate((data: any) => {
      const _items = data.items || [];
      const _shipping_set_item_index = _items.findIndex((item: any) => item.sisl_id == set_item.sisl_id);
      if (_shipping_set_item_index > -1 && !removed) {
        _items[_shipping_set_item_index] = {...set_item};
        data.items = _items;
      }
      if (_shipping_set_item_index > -1 && removed) {
        _items.splice(_shipping_set_item_index, 1);
      }
      return data;
    });
  };

  const onAddedSN = (params: any) => {
    mutate(data);
  };

  const onDeletedSN = (shipping_item: any) => {
    mutate(data);
    shippingMutate(`/api/shipping/${shipping_id}/items`);
  };

  const onCompleted = async (item: any) => {
    try {
      const options = {
        method: 'POST',
        body: JSON.stringify({ 
          shipping_item_id: item.shipping_item_id,
          sisl_id: item.sisl_id,
        })
      };
      const res = await fetch('/api/shipping/' + shipping_id + '/set/item/complete_unserialized_item', options);
      const json = await res.json();
      if (json.success) {
        mutate(data);
      }
      if (json.success && json.shipping_item) {
        shippingMutate(`/api/shipping/${shipping_id}/items`);
      }
      if (!json.success && json.message) {
        setOpenAlertMessage(true);
        setAlertMessage(json.message);
      }
    }
    catch(err: any) {

    }
  };

  const onRemove = async (_item: any, forceDelete = false) => {
    console.log('sd')
    try {
      const options = {
        method: 'POST',
        body: JSON.stringify({
          sisl_id: _item.sisl_id,
          delete: forceDelete,
        }),
      };
      setDeleteItem(_item);
      const res = await fetch(`/api/shipping/${shipping_id}/set/item/delete`, options);
      const json = await res.json();
      if (json && json.message) {
        setAlertMessage(json.message);
        setOpenAlertMessage(true);
      }
      if (json.success) {
        updateSetItem(_item, true);
        setDeleteItem(null);
        setAlertMessage(null);
        setOpenAlertMessage(false);
        shippingMutate(`/api/shipping/${shipping_id}/items`);

      }
    }
    catch(err: any) {
      
    }
  };

  const completed = (item: any) => {
    if (item && item.set_qty) {
      const total_list_qty = item.set_qty.total_list_qty ? Number(item.set_qty.total_list_qty) : 0;
      const total_details_qty = item.set_qty.total_details_qty ? Number(item.set_qty.total_details_qty) : 0;

      if (total_list_qty === 0 && total_details_qty === 0) {
        return <CompleteIncompleteStatus completed={false} />;
      }
      if (total_list_qty === total_details_qty) {
        return <CompleteIncompleteStatus completed={true} />;
      }
      return <CompleteIncompleteStatus completed={false} />;
    }
    return <CompleteIncompleteStatus completed={false} />;
  };

  return (
    <>
      <AlertDialog open={openAlertMessage} onOpenChange={setOpenAlertMessage}>
        <AlertDialogContent className="max-w-[360px]">
          <AlertDialogHeader>
            <AlertDialogTitle>{alertMessage && alertMessage.title}</AlertDialogTitle>
            <AlertDialogDescription>
            {alertMessage && (
              <span dangerouslySetInnerHTML={{ __html: alertMessage.description }} />
            )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteItem(null);
                setAlertMessage(null);
                setOpenAlertMessage(false);
              }}
            >Close</AlertDialogCancel>
            {deleteItem && (
              <AlertDialogAction 
                onClick={() => onRemove(deleteItem, true)}
              >
                Delete
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddSerialNumberModal 
        open={openSNModal} 
        onOpenChange={(open: any) => {
          setOpenSNModal(open);
          if (!open) {
            setSerialNumbersForAddSnModal([]);
          }
        }} 
        _item_id={selectedItemForAddSnModal && selectedItemForAddSnModal._item_id}
        needed_quantity={
          selectedItemForAddSnModal ? (
            !isNaN(selectedItemForAddSnModal.item_set_list_quantity) ? (
              Number(selectedItemForAddSnModal.item_set_list_quantity)
            ) : 0
          ) : 0
        }
        _shipping_id={shippingData && shippingData._shipping_id}
        shipping_item_id={selectedItemForAddSnModal && selectedItemForAddSnModal.shipping_item_id}
        onAddedSN={onAddedSN}
        addedSerialNumbers={serialNumbersForAddSnModal}
        is_item_in_set={1}
        item={selectedItemForAddSnModal}
      />
      <div ref={ref}
        className={cn(
          "overflow-hidden flex flex-col hover:border-stone-100 rounded-sm",
          // _open && "shadow-sm border-stone-100"
        )}
      >
        <div className={cn(
            "flex relative py-3 ps-3 pe-2",
            "bg-white"
          )}
        >
          <div className="flex items-start">
            <div className="flex items-start gap-1" style={{ width: '335px' }}>
              <div className="w-[15px] h-[15px] bg-purple-300 mt-1 rounded-full" />
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
              <span className="text-sm p-1 font-bold">{item.shipping_item_quantity}</span>
            </div>
            <div className="w-[215px] p-2 text-right">
              <span className="text-sm">
                {unitValue(item.shipping_item_unit_value)}
              </span>
            </div>
          </div>
          <div className="min-w-[150px] p-2 ps-12">
            {completed(item)}
          </div>
          <div className="absolute right-0 h-full top-0 flex items-start pe-2 py-3">
            {item && item.item_set_id && (
              <button 
                className={cn(
                  "hover:bg-stone-100 p-2 rounded-xl",
                )}
                tabIndex={-1} 
                onClick={() => setOpenSn(!openSn)}
              >
                <ChevronDown className={cn("h-5 w-5 transition-all duration-300", openSn && '-rotate-180')} strokeWidth={1} />
              </button>
            )} 
            <MoreOption>
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
        <ScrollArea 
          ref={scrollAreaRef} 
          className={"w-full"}
          style={{ height: openSn ? 'auto' : 0 }}
        >
          <div className="flex flex-col gap-[4px] ps-2 pt-1 ms-[1px] bg-stone-100">
            {data && Array.isArray(data.items) && data.items.map((item: any, key: number) => (
                <SetItemList 
                  key={key} 
                  num={key + 1}
                  item={item} 
                  onClickAddSN={onClickAddSN}
                  onDeletedSN={onDeletedSN}
                  onCompleted={() => onCompleted(item)}
                  onRemove={() => onRemove(item, false)}
                />
            ))}
            {data && Array.isArray(data.items) && data.items.length === 0 && (
              <div className="flex justify-center">
                <span className="font-extrabold text-xl text-stone-400">NO ITEMS FOUND</span>
              </div>
            )}
            {isLoading && (
              <div className="flex flex-col items-center gap-2 pt-4">
                <Skeleton className="w-[200px] h-[15px]" />
                <Skeleton className="w-[50px] h-[15px]" />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
});

_ItemList.displayName = '_ItemList';

export const SetItem = memo(_ItemList);

type ItemListProps = {
  item?: any
  descriptionWidth?: any
  onOpenModal?: (open: any) => void
  onClickEdit?: () => void
  onDeletedSN?: (shipping_item: any) => void
  onClickDelete?: () => void
  onClickUncategorized?: () => void
};