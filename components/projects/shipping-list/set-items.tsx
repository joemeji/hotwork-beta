import MoreOption from "@/components/MoreOption";
import { ItemMenu } from "@/components/items";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, MinusCircle, Pencil, Trash, X } from "lucide-react";
import React, { memo, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShippingDetailsContext } from "@/context/shipping-details-context";
import { AccessTokenContext } from "@/context/access-token-context";
import useSWRInfinite from "swr/infinite";
import { authHeaders, baseUrl, fetchApi } from "@/utils/api.config";
import SetItemList from "./set-item-list";
import { parsePager } from "@/components/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { formatter } from "@/utils/text";
import AddSerialNumberModal from "./modals/AddSerialNumberModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CompleteIncompleteStatus } from "./shipping_id";

const _ItemList = React.forwardRef((props: ItemListProps, ref: any) => {
  const { 
    item, 
    onClickEdit, 
    onOpenSn, 
    openSn, 
    onClickDelete,
    onClickUncategorized,
    onCompletedSet,
  } = props;
  const _open = openSn;
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollArea = scrollAreaRef.current;
  const shippingDetails: any = useContext(ShippingDetailsContext);
  const access_token: any = useContext(AccessTokenContext);
  const shipping_id = shippingDetails ? shippingDetails._shipping_id : null;
  const [openSNModal, setOpenSNModal] = useState(false);
  const [newlyAddedSerialNumbers, setNewlyAddedSerialNumbers] = useState<any>([]);
  const [serialNumbersForAddSnModal, setSerialNumbersForAddSnModal] = useState<any>([]);
  const [selectedItemForAddSnModal, setSelectedItemForAddSnModal] = useState<any>(null);
  const shippingData: any = useContext(ShippingDetailsContext);
  const [alertMessage, setAlertMessage] = useState<any>({});
  const [openAlertMessage, setOpenAlertMessage] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [currPage, setCurrPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalData, setTotalData] = useState(0);

  const uri = () => {
    if (!item) return null;
    if (!open) return null;
    return `/api/projects/shipping/set/${shipping_id}/items/${item.shipping_item_id}`;
  }
  
  const { data, isLoading, error, size, setSize, isValidating, mutate } = useSWRInfinite(
    (index) => {
      let paramsObj: any = {};
      paramsObj['page'] = index + 1;
      let searchParams = new URLSearchParams(paramsObj);
      return [
        (_open && item) ? `${uri()}?${searchParams.toString()}` : null, 
        access_token
      ];
    }, 
    fetchApi
  );

  const _data: any = useMemo(() => data ? [].concat(...data) : [], [data]);
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");

  const unitValue = (num: number) => {
    if (shippingDetails) {
      return formatter(shippingDetails.currency).format(num);
    }
    return num;
  };

  const onClickAddSN = (_item: any, data: any) => {
    setNewlyAddedSerialNumbers(data);
    setSelectedItemForAddSnModal(_item);
    setOpenSNModal(true);
  };

  const updateSetItem = (set_item: any, removed = false) => {
    mutate((data) => {
      const __data: any = data ? [...data] : [];
      for (let i = 0; i < size; i++) {
        const _items = __data[i].items || [];
        const _shipping_set_item_index = _items.findIndex((item: any) => item.sisl_id == set_item.sisl_id);
        if (_shipping_set_item_index > -1 && !removed) {
          _items[_shipping_set_item_index] = {...set_item};
          __data[i].items = _items;
        }
        if (_shipping_set_item_index > -1 && removed) {
          _items.splice(_shipping_set_item_index, 1);
        }
      }
      return __data;
    });
  };

  const onAddedSN = (params: any) => {
    if (params && !params.shipping_set_item) return;
    const shipping_set_item = {
      ...params.shipping_set_item,
      serial_numbers: params.serial_numbers || [],
    }
    if (params.shipping_set_item) {
      onCompletedSet && onCompletedSet(params.shipping_set_item);
    }
    updateSetItem(shipping_set_item);
  };

  const onDeletedSN = (shipping_item: any) => {
    if (shipping_item && shipping_item.sisl_id) updateSetItem(shipping_item);
    onCompletedSet && onCompletedSet(shipping_item);
  };

  const onCompleted = async (item: any) => {
    try {
      const options = {
        method: 'POST',
        body: JSON.stringify({ 
          shipping_item_id: item.shipping_item_id,
          sisl_id: item.sisl_id,
        }),
        headers: { ...authHeaders(access_token) }
      };
      const res = await fetch(baseUrl + '/api/projects/shipping/items/' + shipping_id + '/items/complete_unserialized_item', options);
      const json = await res.json();
      if (json.success) {
        updateSetItem(json.shipping_set_item);
      }
      if (json.success && json.shipping_item) {
        onCompletedSet && onCompletedSet(json.shipping_item);
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
    try {
      const options = {
        method: 'POST',
        body: JSON.stringify({
          sisl_id: _item.sisl_id,
          delete: forceDelete,
        }),
        headers: { ...authHeaders(access_token) }
      };
      setDeleteItem(_item);
      const res = await fetch(baseUrl + '/api/projects/shipping/set/delete_item', options);
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
        onCompletedSet && onCompletedSet(item, true);

      }
    }
    catch(err: any) {
      
    }
  };

  const completed = (item: any) => {
    if (item && item.set_qty) {
      const total_list_qty = item.set_qty.total_list_qty ? Number(item.set_qty.total_list_qty) : 0;
      const total_details_qty = item.set_qty.total_details_qty ? Number(item.set_qty.total_details_qty) : 0;
      
      if (total_list_qty === total_details_qty) {
        return <CompleteIncompleteStatus completed={true} />;
      }
      return <CompleteIncompleteStatus completed={false} />;
    }
    return <CompleteIncompleteStatus completed={false} />;
  };

  // useEffect(() => {
  //   if (scrollArea) {
  //     const viewPort: any = scrollArea.querySelector('div[data-radix-scroll-area-viewport]');
  //     if (viewPort) {
  //       viewPort.style.maxHeight = '700px';
  //       viewPort.style.minHeight = '150px';
  //     }
  //   }
  // }, [scrollArea]);
  
  useEffect(() => {
    const onScroll = () => {
      if (_data && Array.isArray(_data)) {
        let totalData = 0;
        _data.forEach((__data: any) => {
          totalData += Array.isArray(__data.items) ? __data.items.length : 0;
        });
        setTotalData(totalData);
        if (_data[0] && _data[0].total) setTotalRecords(_data[0].total);
        const lastDataItem: any = _data[_data.length - 1];
        if (!lastDataItem) return;
        const pages = parsePager(lastDataItem.pager);
        const page: any = pages.find((item: any) => item.active);
        if (!page) return;
        const lastPage = pages[pages.length - 1];
        const activePagePage = Number(page.page);
        setCurrPage(activePagePage);
      }
    };
    onScroll();
  }, [_data]);

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
            setNewlyAddedSerialNumbers([]);
            setSerialNumbersForAddSnModal([]);
          }
        }} 
        _item_id={selectedItemForAddSnModal && selectedItemForAddSnModal._item_id}
        access_token={access_token}
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
          "overflow-hidden flex flex-col cursor-grab hover:border-stone-100 bg-white rounded-xl border border-transparent",
          _open && "shadow-sm border-stone-100"
        )}
      >
        <div className={cn(
            "flex relative py-3 ps-3 pe-2",
            "border-b-stone-100"
          )}
        >
          <div className="flex items-start">
            <div className="flex items-start gap-1" style={{ width: '350px' }}>
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
                onClick={onOpenSn}
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
          className={cn(
            "w-full border-t-stone-200",
            _open && "border-t"
          )}
          style={{ height: _open ? 'auto' : 0 }}
        >
          <div className="flex flex-col gap-1 p-[10px]">
            {_data && Array.isArray(_data) && _data.map((data: any) => {
              return data && Array.isArray(data.items) && data.items.map((item: any, key: number) => (
                <SetItemList 
                  key={key} 
                  num={key + 1}
                  item={item} 
                  onClickAddSN={onClickAddSN}
                  onDeletedSN={onDeletedSN}
                  onCompleted={() => onCompleted(item)}
                  onRemove={() => onRemove(item, false)}
                  open={item.open}
                />
              ));
            })}
            {totalRecords > totalData && (
              <Button 
                variant={'ghost'}
                className={cn(
                  "py-2 mt-1 rounded-full bg-stone-100 hover:bg-stone-200",
                  isLoadingMore && 'loading'
                )}
                onClick={() => setSize(currPage + 1)}
              >
                Load More...
              </Button>
            )}
            {isLoadingMore && (
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
  onOpenSn?: () => void
  openSn?: any
  onDeletedSN?: (shipping_item: any) => void
  onClickDelete?: () => void
  onClickUncategorized?: () => void
  onCompletedSet: (updatedItem: any, isDelete?: boolean) => void
};