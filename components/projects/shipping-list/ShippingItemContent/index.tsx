
import useSWR from 'swr';
import { fetcher } from "@/utils/api.config";
import React, { memo, useCallback, useContext, useEffect, useMemo, useState } from "react";
import uniqid from "@/utils/text";
import { useRouter } from "next/router";
import CategoryItem from "@/components/projects/shipping-list/category-item";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";
import AddButtonPopover from "@/components/projects/shipping-list/ShippingDetails/AddButtonPopover";
import TableHead from "@/components/projects/shipping-list/ShippingDetails/TableHead";
import { SetItem } from "@/components/projects/shipping-list/set-items";
import dynamic from "next/dynamic";
import { ShippingDetailsContext } from '@/context/shipping-details-context';
import { Skeleton } from '@/components/ui/skeleton';
import { ItemList } from '../sortable-item/item-list';
import { useDispatch, useSelector } from "react-redux";
import { setAllItems, shippingItemSlice } from '@/store/reducer/shippingItemReducer';
import { AppState } from '@/store';
import EditShippingItemModal from '../modals/EditShippingItemModal';
import QrCodeScanner from './QrCodeScanner';
import DetailsHeader from '../ShippingDetails/DetailsHeader';

// modals
const AddCustomShippingItemModal = dynamic(() => import('@/components/projects/shipping-list/modals/AddCustomShippingItemModal'));
const AddItemSetModal = dynamic(() => import('@/components/projects/shipping-list/modals/AddItemSetModal'));
const AddSerialNumberModal = dynamic(() => import('@/components/projects/shipping-list/modals/AddSerialNumberModal'));
const AddCategoryModal = dynamic(() => import('@/components/projects/shipping-list/modals/AddCategoryModal'));
const AddEquipmentModal = dynamic(() => import('@/components/projects/shipping-list/modals/AddEquipmentModal'));

function ShippingItemContent({ access_token }: any) {
  const router = useRouter();
  const [addEquipmentOpenModal, setAddEquipmentOpenModal] = useState(false);
  const [openAddCategoryModal, setOpenAddCategoryModal] = useState(false);
  const [itemCategory, setItemCategory] = useState(null);
  const [existingEquipmentOnly, setExistingEquipmentOnly] = useState(false);
  const [existingEquipments, setExistingEquipments] = useState(null);
  const [onOpenModal, setonOpenModal] = useState(false);
  const [openSNModal, setOpenSnModal] = useState(false);
  const [selectedItemForAddSnModal, setSelectedItemForAddSnModal] = useState<any>(null);
  const [openedItems, setOpenedItems] = useState<any>([]);
  const [alertMessage, setAlertMessage] = useState<any>({});
  const [openAlertMessage, setOpenAlertMessage] = useState(false);
  const [toDeleteItem, setToDeleteItem] = useState<any>(null);
  const [toDeleteCategory, setToDeleteCategory] = useState<any>(null);
  const [openCustomAddShippingItemModal, setOpenCustomAddShippingItemModal] = useState(false);
  const [category_update, set_category_update] = useState(null);
  const [openItemSetModal, setOpenItemSetModal] = useState(false);
  const [deleteItemLoading, setDeleteItemloading] = useState(false);
  const [addedSerialNumbers, setAddedSerialNumbers] = useState([]);
  const shippingData: any = useContext(ShippingDetailsContext);
  const dispatch = useDispatch();
  const shippingItems: any = useSelector((state: AppState) => state[shippingItemSlice.name]);
  const [editItem, setEditItem] = useState<any>(null);
  const [isEditItem, setIsEditItem] = useState(false);

  const swrOptions = {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  };

  const { data, isLoading, error, mutate } = useSWR(`/api/shipping/${router.query.shipping_id}/items`, fetcher, swrOptions);

  async function onDeleteCategory(category: any, forceDelete = false) {
    const _category = { ...category };
    delete _category.equipments;
    try {
      const options = {
        method: 'POST',
        body: JSON.stringify({
          shipping_category_id: category.shipping_category_id,
          shipping_id: router.query.shipping_id,
          delete: forceDelete,
        })
      };
      setToDeleteCategory(_category);
      const res = await fetch(`/api/shipping/${router.query.shipping_id}/category/delete`, options);
      const json = await res.json();

      if (json && !json.success && json.message) {
        setOpenAlertMessage(true);
        setAlertMessage(json.message);
      }

      if (json.success) {
        toast({
          title: "Successfully deleted.",
          variant: 'success',
          duration: 2000
        });
        mutate(data);
      }
    }
    catch(err: any) {
      toast({
        title: "Error: " + err.message,
        variant: 'destructive',
        duration: 2000
      });
    }
  }

  function onAddNewItem(category: any) {
    const _category = { ...category };
    const payload: any = {
      shipping_category_id: _category.shipping_category_id,
      shipping_category_name: _category.shipping_category_name,
      shipping_category_position: _category.shipping_category_position,
      shipping_id: _category.shipping_id,
    };
    setAddEquipmentOpenModal(true);
    setItemCategory(payload);
  }

  function onAddExistingItem(category: any) {
    const _dataItems = [...dataItems];
    const _category = { ...category };
    const filteredDataItems: any = _dataItems.filter((item: any) => !item.shipping_category_id) || [];
    const payload: any = {
      shipping_category_id: _category.shipping_category_id,
      shipping_category_name: _category.shipping_category_name,
      shipping_category_position: _category.shipping_category_position,
      shipping_id: _category.shipping_id,
    };
    setItemCategory(payload);
    setExistingEquipmentOnly(true);
    setAddEquipmentOpenModal(true);
    setExistingEquipments(
      filteredDataItems.map((item: any) => {
        const _item = {...item};
        if (!item._item_id) {
          _item._item_id = uniqid();
          _item.is_custom = true;
        }
        return _item;
      })
    );
  }

  const onClickAddEquipment = useCallback(() => {
    setAddEquipmentOpenModal(!addEquipmentOpenModal);
  }, [addEquipmentOpenModal]);

  const onUpdatedShippingItem = (item: any) => {
    if (!item) return;
    mutate((data: any) => {
      const _data: any = {...data};
      if (Array.isArray(_data.equipments)) {
        const equipmentIndex = _data.equipments.findIndex((equipment: any) => equipment.shipping_item_id === item.shipping_item_id);
        if (equipmentIndex > -1) {
          _data.equipments[equipmentIndex] = item;
        }
      }
      return _data;
    });
  };

  const onClickAddSN = (item: any, serial_numbers: any) => {
    setOpenSnModal(true);
    setSelectedItemForAddSnModal(item);
    setAddedSerialNumbers(serial_numbers);
  };

  const onOpenSn = (item: any) => {
    const _openedItems = Array.isArray(openedItems) ? [...openedItems] : [];
    const _item = { ...item };
    const _openItemIndex = _openedItems.findIndex((__: any) => __.shipping_item_id === _item.shipping_item_id);
    const _openItem = _openedItems[_openItemIndex];
    if (_openItemIndex > -1) {
      _openItem.open = !(_openItem.open ? true : false);
      _openedItems[_openItemIndex] = _openItem;
    }
    if (_openItemIndex === -1) {
      if (Number(_item.shipping_item_is_set) === 1) {
        _item.open = true;
      } else {
        _item.open = !(_item.open ? true : false);
      }
      _openedItems.push(_item);
    }
    setOpenedItems(_openedItems);
  };

  const onDeleteShippingItem = async (item: any, forceDelete = false) => {
    try {
      const options = {
        method: 'POST',
        body: JSON.stringify({
          shipping_item_id: item.shipping_item_id,
          delete: forceDelete,
        })
      };
      setToDeleteItem(item);
      setDeleteItemloading(true);
      const res = await fetch(`/api/shipping/${router.query.shipping_id}/item/delete`, options);
      const json = await res.json();
      setDeleteItemloading(false);
      if (json && !json.success && json.message) {
        setOpenAlertMessage(true);
        setAlertMessage(json.message);
      }
      if (json && json.success) {
        setToDeleteItem(null);
        setOpenAlertMessage(false);
        mutate(data);
      }
    }
    catch(err: any) {
      setDeleteItemloading(false);
    }
  };

  function uncategorizedItemsProps(item: any) {
    return {
      onOpenModal: (open: boolean) => setonOpenModal(open), 
      item: item, 
      access_token: access_token, 
      onClickAddSN: (serial_numbers: any) => onClickAddSN(item, serial_numbers),
      onOpenSn: () => onOpenSn(item),
      onDeletedSN: onUpdatedShippingItem,
      onClickDelete: () => onDeleteShippingItem(item),
      onClickEdit: () => {
        setEditItem(item);
        setIsEditItem(true);
      }
    };
  }

  function categorizedItemsProps(item: any) {
    return {
      ref: item.listRef, 
      item: item,
      descriptionWidth: 334, 
      access_token: access_token, 
      onOpenModal: (open: boolean) => setOpenSnModal(open),
      onClickAddSN: (serial_number: any) => onClickAddSN(item, serial_number),
      onOpenSn: () => onOpenSn(item),
      onDeletedSN: onUpdatedShippingItem,
      onClickDelete: () => onDeleteShippingItem(item),
      onClickEdit: () => {
        setEditItem(item);
        setIsEditItem(true);
      }
    }
  }

  function categoryItemProps(item: any) {
    return {
      item: item, 
      // sensors: sensors,  
      // handleDragEnd: handleDragEnd,
      access_token: access_token,
      onDelete: () => onDeleteCategory(item),
      onAddExistingItem: () => onAddExistingItem(item),
      onAddNewItem: () => onAddNewItem(item),
      openByDefault: true,
      onClickAddSN: (_item: any, serial_numbers: any) => onClickAddSN(_item, serial_numbers),
      onRename: () => {
        setOpenAddCategoryModal(true);
        set_category_update(item);
      }
    };
  }

  const dataItems = useMemo(() => {
    let _dataItems: any = [];
    if (shippingItems && shippingItems.categories && shippingItems.categories.length > 0) {
      shippingItems.categories.forEach((cateItem: any) => {
        const equipments = shippingItems.equipments.filter((item: any) => item.shipping_category_id === cateItem.shipping_category_id);
        _dataItems.push({
          ...cateItem,
          equipments: equipments.map((item: any) => ({ 
            ...item, 
          })),
        });
      });
    }
    if (data && shippingItems.equipments && shippingItems.equipments.length > 0) {
      const equipments = shippingItems.equipments.filter((item: any) => item.shipping_category_id === null);
      _dataItems.push(...equipments);
    }
    _dataItems = [..._dataItems].map((item: any) => ({ ...item }));
    return _dataItems;
  }, [shippingItems]);

  useEffect(() => {
    if (data) {
      dispatch(
        setAllItems({ 
          equipments: (
            data.equipments?.map((item: any) => ({
              ...item,
              open: false
            }))
          ),
          categories: data.categories,
        })
      );
    }
  }, [data, dispatch]);
  
  useEffect(() => {
    if (!addEquipmentOpenModal) {
      setItemCategory(null);
      setExistingEquipments(null);
      setTimeout(() => {
        setExistingEquipmentOnly(false);
      }, 300);
    }
  }, [addEquipmentOpenModal]);

  return (
    <>
      {/* Popover Modal */}
      <AlertDialog open={openAlertMessage} 
        onOpenChange={(open) => {
          setOpenAlertMessage(open);
          if (!open) {
            setToDeleteCategory(null);
            setToDeleteItem(null);
          }
        }}
      >
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteItemLoading} 
              onClick={() => {
                toDeleteCategory && onDeleteCategory(toDeleteCategory, true);
                toDeleteItem && onDeleteShippingItem(toDeleteItem, true);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddItemSetModal 
        onOpenChange={setOpenItemSetModal} 
        open={openItemSetModal}
      />
      <AddEquipmentModal 
        open={addEquipmentOpenModal}
        onOpenChange={(open: any) => setAddEquipmentOpenModal(open)}
        shipping_id={router.query.shipping_id}
        excludedEquipments={data ? data.equipments : []}
        itemCategory={itemCategory}
        existingEquipmentOnly={existingEquipmentOnly}
        existingEquipments={existingEquipments}
      />
      <AddCategoryModal 
        open={openAddCategoryModal} 
        onOpenChange={(open: any) => {
          setOpenAddCategoryModal(open);
          if (!open) set_category_update(null);
        }}
        access_token={access_token}
        shipping_id={router.query.shipping_id}
        category_update={category_update}
      />
      <AddSerialNumberModal 
        open={openSNModal} 
        onOpenChange={(open: any) => {
          setOpenSnModal(open);
          if (!open) {
            setSelectedItemForAddSnModal(null);
          }
        }} 
        _item_id={selectedItemForAddSnModal && selectedItemForAddSnModal._item_id}
        needed_quantity={
          selectedItemForAddSnModal ? (
            !isNaN(selectedItemForAddSnModal.shipping_item_quantity) ? (
              Number(selectedItemForAddSnModal.shipping_item_quantity)
            ) : 0
          ) : 0
        }
        _shipping_id={shippingData && shippingData._shipping_id}
        shipping_item_id={selectedItemForAddSnModal && selectedItemForAddSnModal.shipping_item_id}
        addedSerialNumbers={addedSerialNumbers}
        onAddedSN={(serial_number) => mutate(data)}
      />
      <AddCustomShippingItemModal 
        onOpenChange={setOpenCustomAddShippingItemModal}
        open={openCustomAddShippingItemModal}
        _shipping_id={router.query.shipping_id}
      />
      <EditShippingItemModal 
        item={editItem}
        _shipping_id={router.query.shipping_id}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditItem(false);
            setEditItem(null);
          }
        }}
        open={isEditItem}
      />
    {/* End Popover Modal */}
    
    <div className="w-3/4 flex flex-col">
      <div className="relative min-h-[calc(100vh-var(--header-height)-40px)]">
        <DetailsHeader />
        <TableHead />
        <div className="flex flex-col py-2 gap-[5px]">
          {!isLoading && Array.isArray(dataItems) && dataItems.length === 0 && (
            <div className="flex justify-center">
              <Image
                src="/images/No data-rafiki.svg"
                width={300}
                height={300}
                alt="No Data to Shown"
              />
            </div>
          )}

          {isLoading && (
            [1,2,3].map((item, key) => (
              <div key={key} className='py-2 flex items-start gap-2 bg-background rounded-app px-2'>
                <Skeleton className='h-[60px] w-[60px]' />
                <div className='flex flex-col gap-2'>
                  <Skeleton className='h-4 w-[300px]' />
                  <Skeleton className='h-4 w-[200px]' />
                </div>
              </div>
            ))
          )}

          {Array.isArray(dataItems) && dataItems.map((item: any, key: number) => (
            <React.Fragment key={key}>
              {typeof item.shipping_category_name !== 'undefined' && (
                <CategoryItem {...categoryItemProps(item)}>
                  {item.equipments && item.equipments.map((item: any, key: number) => (
                    <div key={key}>
                      {!item.item_set_id ? (
                        <ItemList {...categorizedItemsProps(item)} />
                      ) : (
                        <SetItem 
                          {...categorizedItemsProps(item)} 
                        />
                      )}
                    </div>
                  ))}
                </CategoryItem>
              )}
              {typeof item.shipping_category_name == 'undefined' && (
                <div>
                  {!item.item_set_id ? (
                    <ItemList {...uncategorizedItemsProps(item)} />
                  ) : (
                    <SetItem 
                      {...uncategorizedItemsProps(item)}
                    />
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      {!isLoading && (
        <div className="flex justify-center gap-2 items-center mt-auto sticky bottom-0 p-2">
          <QrCodeScanner 
            onClickEditItem={shipping_item_id => {
              if (data && data.equipments) {
                const equipments: any = data.equipments;
                const item = equipments.find((item: any) => item.shipping_item_id == shipping_item_id);
                if (item) {
                  setEditItem(item);
                  setIsEditItem(true);
                }
              }
            }}
          />
          <AddButtonPopover 
            onClickAddCategoryButton={() => setOpenAddCategoryModal(true)}
            onClickAddCustomEquipment={() => setOpenCustomAddShippingItemModal(true)}
            onClickAddEquipmentButton={onClickAddEquipment}
            onClickAddSetButton={() => setOpenItemSetModal(true)}
          />
        </div>
      )}
    </div>
    </>
  ); 
}

export default memo(ShippingItemContent);