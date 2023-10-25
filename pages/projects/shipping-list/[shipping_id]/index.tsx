import AdminLayout from "@/components/admin-layout";
import { ShippingDetails as ShippingDetailsWrapper } from "@/components/projects/shipping-list/shipping_id";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import useSWR from 'swr';
import { authHeaders, baseUrl, fetchApi } from "@/utils/api.config";
import {  DndContext, closestCenter, KeyboardSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import React, { useCallback, useEffect, useState } from "react";
import uniqid from "@/utils/text";
import { ItemList, SortableItem } from "@/components/projects/shipping-list/sortable-item";
import SmartPointerSensor from "@/utils/SmarkPointerSensor";
import { useRouter } from "next/router";
import CategoryItem from "@/components/projects/shipping-list/category-item";
import AddEquipmentModal from "@/components/projects/shipping-list/modals/AddEquipmentModal";
import AddCategoryModal from "@/components/projects/shipping-list/modals/AddCategoryModal";
import { Item } from "@/components/ItemSelect";
import ShippingDetails from "@/components/projects/shipping-list/ShippingDetails";
import EditShippingItemModal from "@/components/projects/shipping-list/modals/EditShippingItemModal";
import { ShippingDetailsContext } from "@/context/shipping-details-context";
import AddSerialNumberModal from "@/components/projects/shipping-list/modals/AddSerialNumberModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import AddCustomShippingItemModal from "@/components/projects/shipping-list/modals/AddCustomShippingItemModal";
import Image from "next/image";
import { AccessTokenContext } from "@/context/access-token-context";
import AddItemSetModal from "@/components/projects/shipping-list/modals/AddItemSetModal";
import AddButtonPopover from "@/components/projects/shipping-list/ShippingDetails/AddButtonPopover";
import DetailsHeader from "@/components/projects/shipping-list/ShippingDetails/DetailsHeader";
import TableHead from "@/components/projects/shipping-list/ShippingDetails/TableHead";
import { SetItem } from "@/components/projects/shipping-list/set-items";

export default function ShippingId({ access_token, shippingData }: any) {
  const sensors = useSensors(
    useSensor(SmartPointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const router = useRouter();
  const [dataItems, setDataItems] = useState([]);
  const [addEquipmentOpenModal, setAddEquipmentOpenModal] = useState(false);
  const [openAddCategoryModal, setOpenAddCategoryModal] = useState(false);
  const [itemCategory, setItemCategory] = useState(null);
  const [existingEquipmentOnly, setExistingEquipmentOnly] = useState(false);
  const [existingEquipments, setExistingEquipments] = useState(null);
  const [onOpenModal, setonOpenModal] = useState(false);
  const [openEditShippingItemModal, setOpenEditShippingItemModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
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

  const { data, isLoading, error, mutate } = useSWR(
    [`/api/projects/shipping/items/` + router.query.shipping_id, access_token], 
    fetchApi,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  );

  function handleDragEnd(event: DragEndEvent, categoryUuid: any = null) {
    const {active, over} = event;
    let items: any = [...dataItems];
    if (active.id === over?.id) return;
    if (categoryUuid) {
      const categoryIndex = items.findIndex((item: any) => item.uuid === categoryUuid);
      const _category: any = items[categoryIndex];
      if (_category && _category.equipments) {
        const oldIndex = _category.equipments.findIndex((item: any) => item.uuid === active.id);
        const newIndex = _category.equipments.findIndex((item: any) => item.uuid === over?.id);
        items[categoryIndex].equipments = arrayMove(_category.equipments, oldIndex, newIndex);
      }
    } else {
      const oldIndex = items.findIndex((item: any) => item.uuid === active.id);
      const newIndex = items.findIndex((item: any) => item.uuid === over?.id);
      items = arrayMove(items, oldIndex, newIndex);
    }
    setDataItems(items);
  }

  async function onDeleteCategory(category: any, forceDelete = false) {
    const _category = { ...category };
    delete _category.equipments;
    try {
      const options = {
        method: 'POST',
        headers: { ...authHeaders(access_token) },
        body: JSON.stringify({
          shipping_category_id: category.shipping_category_id,
          shipping_id: router.query.shipping_id,
          delete: forceDelete,
        })
      };
      setToDeleteCategory(_category);
      const res = await fetch(baseUrl + '/api/projects/shipping/category/delete', options);
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
        mutate((data: any) => {
          const _data = {...data};
          if (Array.isArray(_data.equipments)) {
            _data.equipments = _data.equipments.filter((item: any) => item.shipping_category_id !== _category.shipping_category_id);
          }
          if (Array.isArray(_data.categories)) {
            _data.categories = _data.categories.filter((category: any) => category.shipping_category_id !== _category.shipping_category_id);
          }
          return _data;
        });
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

  const onAddedCategory = useCallback((category: any) => {
    const _data: any = data ? { ...data } : {};
    const _categories = _data.categories ? _data.categories : [];
    if (Array.isArray(_categories)) {
      const categoryIndex = _categories.findIndex((__: any) => __.shipping_category_id === category.shipping_category_id);
      if (categoryIndex > -1) _categories[categoryIndex] = category;
      else _categories.push(category);
    }
    _data.categories = _categories;
    mutate(_data);
  }, [mutate, data]);

  const onAddedEquipment = useCallback((equipments: Item[]) => {
    const _data: any = data ? { ...data } : {};
    const _equipments = _data.equipments ? _data.equipments : [];
    _equipments.push(equipments);
    _data.equipments = _equipments;
    mutate(_data);
  }, [mutate, data]);

  const onClickAddEquipment = useCallback(() => {
    setAddEquipmentOpenModal(!addEquipmentOpenModal);
  }, [addEquipmentOpenModal]);

  const onClickEditItem = useCallback((item: Item) => {
    setEditItem(item);
    setOpenEditShippingItemModal(true);
  }, []);

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
    console.log(serial_numbers);
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

  const openItem = (shipping_item_id: any) => {
    const _openItem = openedItems.find((__: any) => __.shipping_item_id === shipping_item_id);
    if (!_openItem) return false;
    return _openItem.open || false;
  };

  const onAddedSN = ({ serial_numbers, shipping_item }: any) => {
    const _shipping_item = { ...shipping_item };
     if (Array.isArray(_shipping_item.serial_numbers)) {
      _shipping_item.serial_numbers = serial_numbers;
     }
    onUpdatedShippingItem(_shipping_item);
  }

  const onDeleteShippingItem = async (item: any, forceDelete = false) => {
    try {
      const options = {
        method: 'POST',
        headers: { ...authHeaders(access_token) },
        body: JSON.stringify({
          shipping_item_id: item.shipping_item_id,
          delete: forceDelete,
        })
      };
      setToDeleteItem(item);
      setDeleteItemloading(true);
      const res = await fetch(baseUrl + '/api/projects/shipping/items/delete_shipping_item/' + router.query.shipping_id, options);
      const json = await res.json();
      setDeleteItemloading(false);
      if (json && !json.success && json.message) {
        setOpenAlertMessage(true);
        setAlertMessage(json.message);
      }
      if (json && json.success) {
        setToDeleteItem(null);
        setOpenAlertMessage(false);
        const _data: any = {...data};
        if (Array.isArray(_data.equipments)) {
          const equipmentIndex = _data.equipments.findIndex((equipment: any) => equipment.shipping_item_id === item.shipping_item_id);
          _data.equipments.splice(equipmentIndex, 1);
        }
        mutate(_data);
      }
    }
    catch(err: any) {
      setDeleteItemloading(false);
    }
  };  

  const onClickUncategorized = async (item: any) => {
    try {
      const options = {
        method: 'POST',
        body: JSON.stringify({ 
          items: [{
            _item_id: item._item_id,
            shipping_item_id: item.shipping_item_id,
            shipping_category_id: null
          }] 
        }),
        headers: { ...authHeaders(access_token) }
      };
      const res = await fetch(baseUrl + '/api/projects/shipping/items/update/' + router.query.shipping_id, options);
      const json = await res.json();
      if (json.success && Array.isArray(json.items)) {
        onAddedEquipment(json.items);
      }
    }
    catch(err: any) {}
  };

  const onCompleted = async (item: any) => {
    try {
      const options = {
        method: 'POST',
        body: JSON.stringify({ 
          shipping_item_id: item.shipping_item_id
        }),
        headers: { ...authHeaders(access_token) }
      };
      const res = await fetch(baseUrl + '/api/projects/shipping/items/' + router.query.shipping_id + '/items/complete_unserialized_item', options);
      const json = await res.json();
      if (json.success && json.shipping_item) {
        onUpdatedShippingItem(json.shipping_item);
      }
      if (!json.success && json.message) {
        setOpenAlertMessage(true);
        setAlertMessage(json.message);
      }
    }
    catch(err: any) {

    }
  };

  const onCompletedSet = (set_item: any, isDelete = false) => {
    if (isDelete) onUpdatedShippingItem(set_item);
    if (set_item && set_item.set_qty) {
      const { total_list_qty, total_details_qty } = set_item.set_qty;
      if (Number(total_list_qty) === Number(total_details_qty)) {
        onUpdatedShippingItem(set_item);
      }

      if (Number(total_list_qty) === Number(total_details_qty) + 1) {
        onUpdatedShippingItem(set_item);
      }
    }
  };

  function uncategorizedItemsProps(item: any) {
    return {
      onOpenModal: (open: boolean) => setonOpenModal(open), 
      item: item, 
      access_token: access_token, 
      onClickEdit: () => onClickEditItem(item),
      onClickAddSN: (serial_numbers: any) => onClickAddSN(item, serial_numbers),
      onOpenSn: () => onOpenSn(item),
      openSn: openItem(item.shipping_item_id),
      onDeletedSN: onUpdatedShippingItem,
      onClickDelete: () => onDeleteShippingItem(item),
      onCompleted: () => onCompleted(item),
    };
  }

  function categorizedItemsProps(item: any) {
    return {
      ref: item.listRef, 
      item: item,
      descriptionWidth: 334, 
      access_token: access_token, 
      onOpenModal: (open: boolean) => setOpenSnModal(open),
      onClickEdit: () => onClickEditItem(item),
      onClickAddSN: (serial_number: any) => onClickAddSN(item, serial_number),
      onOpenSn: () => onOpenSn(item),
      openSn: openItem(item.shipping_item_id),
      onDeletedSN: onUpdatedShippingItem,
      onClickDelete: () => onDeleteShippingItem(item),
      onClickUncategorized: () => onClickUncategorized(item),
    }
  }

  function categoryItemProps(item: any) {
    return {
      item: item, 
      sensors: sensors,  
      handleDragEnd: handleDragEnd,
      access_token: access_token,
      onDelete: () => onDeleteCategory(item),
      onAddExistingItem: () => onAddExistingItem(item),
      onAddNewItem: () => onAddNewItem(item),
      openByDefault: true,
      onClickEditItem: (item: any) => onClickEditItem(item),
      onClickAddSN: (_item: any, serial_numbers: any) => onClickAddSN(_item, serial_numbers),
      onRename: () => {
        setOpenAddCategoryModal(true);
        set_category_update(item);
      }
    };
  }

  useEffect(() => {
    let _dataItems: any = [];
    if (data && data.categories && data.categories.length > 0) {
      data.categories.forEach((cateItem: any) => {
        const equipments = data.equipments.filter((item: any) => item.shipping_category_id === cateItem.shipping_category_id);
        _dataItems.push({
          ...cateItem,
          equipments: equipments.map((item: any) => ({ 
            ...item, 
            uuid: uniqid(), 
            listRef: React.createRef<HTMLDivElement>()
          })),
        });
      });
    }
    if (data && data.equipments && data.equipments.length > 0) {
      const equipments = data.equipments.filter((item: any) => item.shipping_category_id === null);
      _dataItems.push(...equipments);
    }
    _dataItems = [..._dataItems].map((item: any) => ({ ...item, uuid: uniqid() }));
    setDataItems(_dataItems);
  }, [data]);
  
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
    <AccessTokenContext.Provider value={access_token}>
      <ShippingDetailsContext.Provider value={shippingData}>
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
            onAddSet={onAddedEquipment}
          />
          <AddEquipmentModal 
            open={addEquipmentOpenModal}
            onOpenChange={(open: any) => setAddEquipmentOpenModal(open)}
            access_token={access_token}
            shipping_id={router.query.shipping_id}
            excludedEquipments={data ? data.equipments : []}
            itemCategory={itemCategory}
            existingEquipmentOnly={existingEquipmentOnly}
            existingEquipments={existingEquipments}
            onAddedEquipment={onAddedEquipment}
          />
          <AddCategoryModal 
            open={openAddCategoryModal} 
            onOpenChange={(open: any) => {
              setOpenAddCategoryModal(open);
              if (!open) set_category_update(null);
            }}
            access_token={access_token}
            shipping_id={router.query.shipping_id}
            onAddedCategory={onAddedCategory}
            category_update={category_update}
          />
          <EditShippingItemModal 
            access_token={access_token}
            item={editItem}
            _shipping_id={router.query.shipping_id}
            onOpenChange={(open: boolean) => {
              setOpenEditShippingItemModal(open);
              setSelectedItemForAddSnModal(null);
            }}
            open={openEditShippingItemModal}
            onUpdated={onUpdatedShippingItem}
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
            access_token={access_token}
            needed_quantity={
              selectedItemForAddSnModal ? (
                !isNaN(selectedItemForAddSnModal.shipping_item_quantity) ? (
                  Number(selectedItemForAddSnModal.shipping_item_quantity)
                ) : 0
              ) : 0
            }
            _shipping_id={shippingData && shippingData._shipping_id}
            shipping_item_id={selectedItemForAddSnModal && selectedItemForAddSnModal.shipping_item_id}
            onAddedSN={onAddedSN}
            addedSerialNumbers={addedSerialNumbers}
          />
          <AddCustomShippingItemModal 
            onOpenChange={setOpenCustomAddShippingItemModal}
            open={openCustomAddShippingItemModal}
            _shipping_id={router.query.shipping_id}
            access_token={access_token}
            onAdded={(addedItem: any) => onAddedEquipment([addedItem])}
          />
        {/* End Popover Modal */}
        
        <AdminLayout>
          <ShippingDetailsWrapper>
            <div className="w-3/4">
              <div className="relative min-h-[calc(100vh-var(--header-height)-40px)] ">
                <DetailsHeader />
                <TableHead />
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={dataItems.map((item: any) => item.uuid)}
                    strategy={verticalListSortingStrategy}
                  >
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

                      {Array.isArray(dataItems) && dataItems.map((item: any, key: number) => (
                        <React.Fragment key={key}>
                          {typeof item.shipping_category_name !== 'undefined' && (
                            <CategoryItem {...categoryItemProps(item)}>
                              <SortableContext 
                                items={item && item.equipments.map((item: any) => item.uuid)}
                                strategy={verticalListSortingStrategy}
                              >
                                {item.equipments && item.equipments.map((item: any) => (
                                  <SortableItem key={item.uuid} id={item.uuid} type="nested-item" disabled={onOpenModal}>
                                    {!item.item_set_id ? (
                                      <ItemList {...categorizedItemsProps(item)} />
                                    ) : (
                                      <SetItem 
                                        {...categorizedItemsProps(item)} 
                                        onCompletedSet={onCompletedSet}
                                      />
                                    )}
                                  </SortableItem>
                                ))}
                              </SortableContext>
                            </CategoryItem>
                          )}
                          {typeof item.shipping_category_name == 'undefined' && (
                            <SortableItem 
                              key={item.uuid} 
                              id={item.uuid} 
                              type="item" 
                              disabled={onOpenModal}
                            >
                              {!item.item_set_id ? (
                                <ItemList {...uncategorizedItemsProps(item)} />
                              ) : (
                                <SetItem 
                                  {...uncategorizedItemsProps(item)}
                                  onCompletedSet={onCompletedSet} 
                                />
                              )}
                            </SortableItem>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
                {!isLoading && (
                  <div className="flex flex-col items-center sticky bottom-0 p-2">
                    <AddButtonPopover 
                      onClickAddCategoryButton={() => setOpenAddCategoryModal(true)}
                      onClickAddCustomEquipment={() => setOpenCustomAddShippingItemModal(true)}
                      onClickAddEquipmentButton={onClickAddEquipment}
                      onClickAddSetButton={() => setOpenItemSetModal(true)}
                    />
                  </div>
                )}
              </div>
            </div>
            <ShippingDetails 
              access_token={access_token}
              details={{
                data: shippingData,
              }}
            />
          </ShippingDetailsWrapper>
        </AdminLayout>
      </ShippingDetailsContext.Provider>
    </AccessTokenContext.Provider>
  ); 
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession( context.req, context.res, authOptions );
  let token  = null;

  if (session && session.user) {
    token = session.user.access_token;
  } else {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    }
  }

  let res = await fetch(`${baseUrl}/api/projects/shipping/details/${context.params?.shipping_id}`, {
    headers: {...authHeaders(token)},
  });
  let shippingData = await res.json();

  return {
    props: {
      access_token: token,
      shippingData,
    },
  }
}