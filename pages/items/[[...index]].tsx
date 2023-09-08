'use client';

import AdminLayout from "@/components/admin-layout";
import { cn } from "@/lib/utils";
import type { GetServerSidePropsContext } from 'next';
import { baseUrl, fetchApi } from "@/utils/api.config";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useSWR from 'swr';
import { useRouter } from "next/router";
import Pagination from "@/components/pagination";
import React, { useEffect, useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ActionButtonHeader, Categories, ItemEquipmentList, QRCodeModal, SelectAll, SerialNumberModal, TH, TypePlateQRCodeModal, actionMenu } from "@/components/items";
import itemQrCodeDraw, { generateQrCode, itemTypePlate } from "@/utils/itemQrCodeDraw";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";

type ItemsDataType = {
  access_token: string
  categories?: any
}

const ItemsData = (props: ItemsDataType) => {
  const { access_token, categories } = props;
  const router = useRouter();
  let indexParams = router.query?.index;
  const categoryId = indexParams ? indexParams[0] : undefined;
  const page = router.query?.page || 1; 
  const search = router.query?.search || ''; 
  const sub_category_id = router.query?.sub_category_id || ''; 
  const [dataToSelect, setDataToSelect] = useState<any[]>([]);
  const [openQrCodesModal, setOpenQrCodesModal] = useState<boolean>(false);
  const [openTypePlateQrCodesModal, setOpenTypePlateQrCodesModal] = useState<boolean>(false);
  const [qrCodeUris, setQrCodeUris] = useState<any[]>([]);
  const [loadingQrCodeButton, setLoadingQrCodeButton] = useState(false);
  const [loadingTypeplateButton, setLoadingTypeplateButton] = useState(false);
  const [selected__item_id, setSelected__item_id] = useState<any>(null);
  const [openSNModal, setOpenSNModal] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const listHeaderRef = useRef<HTMLDivElement>(null);

  let paramsObj: any = { page: String(page), search };
  if (sub_category_id) paramsObj = { sub_category_id };
  let searchParams = new URLSearchParams(paramsObj);

  const { data, isLoading, error } = useSWR(
    [`/api/items/category/${(categoryId || '')}?${searchParams.toString()}`, access_token], 
    fetchApi,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  );

  useEffect(() => {
    fetch(baseUrl + '/api/items/category', {
      headers: {
        Authorization: 'Bearer ' + access_token,
        credentials: 'include'
      },
    })
    .then(res => {
      console.log(res.status)
      return res.json();
    })
    .then(data => console.log({ data }))
  }, [access_token]);

  if (typeof window !== 'undefined') {
    document.title = 'Items | ' + getSingleCategory();
  }

  function onPaginate(page: any) {
    router.query.page = page;
    router.push(router);
  }

  function onClickActionHeader(e: any, actionType: string) {
    if (actionType === 'type-plate') printTypePlateOverview(e);
    if (actionType === 'qr-code') printSelectedItemQRCodeOverview(e);
  }

  async function onClickAction(actionType: string, _item_id: string) {
    if (actionType === 'qr-code') {
      const qrCodeData = await generateItemQrCode(_item_id);
      if (qrCodeData) {
        setQrCodeUris([qrCodeData]);
        setOpenQrCodesModal(true);
      }
    }
    if (actionType === 'type-plate') {
      const qrCodeData = await generateItemQrCode(_item_id);
      if (qrCodeData) {
        setQrCodeUris([qrCodeData]);
        setOpenTypePlateQrCodesModal(true);
      }
    }

    if (actionType === 'item-certification') {
      router.push('/items/item-certification/' + _item_id + '/equipment');
    }
  }

  async function handleSearch(e: any) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const search: any = formData.get('search') || '';
    router.push('/items?search=' + search);
  }

  async function printTypePlateOverview(e: any) {
    const qrCodeValues: any[] = [];
    setLoadingTypeplateButton(true);
    for (let i = 0; i < dataToSelect.filter((item: any) => item.checked).length; i++) {
      const qrCodeData = await generateItemQrCode(dataToSelect[i]._item_id);
      if (qrCodeData) qrCodeValues.push(qrCodeData);
    }
    setQrCodeUris(qrCodeValues);
    setLoadingTypeplateButton(false);
    setOpenTypePlateQrCodesModal(true);
  }

  async function printSelectedItemQRCodeOverview(e: any) {
    const qrCodeValues: any[] = [];
    setLoadingQrCodeButton(true);
    for (let i = 0; i < dataToSelect.filter((item: any) => item.checked).length; i++) {
      const qrCodeData = await generateItemQrCode(dataToSelect[i]._item_id);
      if (qrCodeData) qrCodeValues.push(qrCodeData);
    }
    setLoadingQrCodeButton(false);
    setQrCodeUris(qrCodeValues);
    setOpenQrCodesModal(true);
  }

  function onViewOnPDF(type: string) {
    let doc : any;
    if (Array.isArray(qrCodeUris)) {

      if (type === 'download:qr-code') {
        doc = itemQrCodeDraw(qrCodeUris);
        doc.save('Qr Codes.pdf');
        return;
      }
      if (type === 'download:type-plate') {
        doc = itemTypePlate({ qrCodeDatas: qrCodeUris });
        doc.save('Type Plates.pdf');
        return;
      }

      if (type === 'qr-code') {
        doc = itemQrCodeDraw(qrCodeUris);
      }
      if (type === 'type-plate') {
        doc = itemTypePlate({ qrCodeDatas: qrCodeUris });
      }

      const pdfBlobUri: URL | any = doc.output('bloburl');
      window.open(pdfBlobUri);
    }
  }

  async function generateItemQrCode(_item_id: string, serial_number?: string) {
    const items = data.items;
    const item = items.find((item: any) => item._item_id === _item_id);
    const itemSerialNumber = serial_number || item.item_sub_category_index + item.item_number + '.000';

    const qrcodeUri = await generateQrCode(itemSerialNumber);

    return {
      uri: qrcodeUri,
      value: itemSerialNumber,
      text: item.item_name,
      item_construction_year: item.item_construction_year,
      item_power: item.item_power,
      item_pressure: item.item_pressure,
      item_tension: item.item_tension,
      item_kilowatt: item.item_kilowatt,
      item_rated_current: item.item_rated_current,
      item_protection_class: item.item_protection_class
    };
  }

  function getSingleCategory() {
    if (categories && Array.isArray(categories)) {
      const category = categories.find(item => item._item_category_id === categoryId);
      if (!category) return 'All  Categories';
      return category.item_category_name;
    }
    return 'All Categories';
  }

  function selectedItems(checked = true) {
    if (dataToSelect && dataToSelect.length > 0) {
      return dataToSelect.filter(item => item.checked === checked);
    }
    return [];
  }
  
  function isCheckDataToSelect(_item_id: string) {
    const data_item = dataToSelect.find((data_item: any) => data_item._item_id === _item_id && data_item.checked);
    return data_item ? true : false;
  }

  function onSelectSingleItem(isChecked: boolean, _item_id: string) {
    const _dataToSelect = [...dataToSelect];
    const dataToSelectIndex = _dataToSelect.findIndex((data_item: any) => data_item._item_id === _item_id);
    _dataToSelect[dataToSelectIndex].checked = isChecked;
    setDataToSelect(_dataToSelect);
  }

  function onSelectAllItem(isChecked: boolean) {
    const _dataToSelect = [...dataToSelect].map((item: any) => ({ ...item, checked: isChecked }));
    setDataToSelect(_dataToSelect);
  }

  function getListHeaderHeight() {
    if (listHeaderRef.current) {
      const div = listHeaderRef.current;
      const divRect = div?.getBoundingClientRect();
      return divRect?.height;
    }
    return 0;
  }

  useEffect(() => {
    if (data && data.items && Array.isArray(data.items)) {
      const _dataItems = data.items.map((item: any) => {
        return {
          _item_id: item._item_id,
          checked: false,
        }
      });
      setDataToSelect(_dataItems);
    }
  }, [data]);

  return (
    <>
      {qrCodeUris.length > 0 && (
        <QRCodeModal
          open={openQrCodesModal}
          qrcodes={qrCodeUris}
          onOpenChange={setOpenQrCodesModal}
          onPrint={() => onViewOnPDF('qr-code')}
          onDownload={() => onViewOnPDF('download:qr-code')}
        />
      )}

      {qrCodeUris.length > 0 && (
        <TypePlateQRCodeModal 
          open={openTypePlateQrCodesModal}
          typePlates={qrCodeUris}
          onOpenChange={setOpenTypePlateQrCodesModal}
          onPrint={() => onViewOnPDF('type-plate')}
          onDownload={() => onViewOnPDF('download:type-plate')}
        />
      )}

      {selected__item_id && (
        <SerialNumberModal 
          open={openSNModal}
          _item_id={selected__item_id}
          selectedItem={selectedItem}
          onOpenChange={setOpenSNModal}
        />
      )}

      <div className="w-[calc(100%-400px)] bg-white border-s border-stone-100 h-full shadow-sm">
        <div 
          className={cn(
            "flex w-full flex-col rounded-tl-xl rounded-tr-xl",
            "backdrop-blur-sm bg-white/90 z-10"
          )}
          ref={listHeaderRef}
        >
          <div
            className={cn(
              "p-3 flex justify-between items-center",
              "border-b border-b-stone-100"
            )}
          >
            <span className="text-lg">{getSingleCategory()}</span>
            <div className="flex items-center gap-2">
              <Button>Add Equipment</Button>
            </div>
          </div>

          <div className="px-3 py-2 ps-[8px] flex items-center justify-between">
            <div className="flex gap-1 items-center">
              <SelectAll 
                onCheckedChange={(isChecked: any) => onSelectAllItem(isChecked)} 
                checked={(dataToSelect.filter((item: any) => !item.checked).length === 0)}
                disabled={isLoading && error}
              />
              {selectedItems().length > 0 && actionMenu.map((action, key) => (
                <ActionButtonHeader 
                  key={key}
                  name={action.name}
                  icon={action.icon}
                  loadingQrCodeButton={loadingQrCodeButton}
                  loadingTypeplateButton={loadingTypeplateButton}
                  actionType={action.actionType}
                  onClick={(e: any) => onClickActionHeader(e, action.actionType)}
                />
              ))}
            </div>
            <form id="Search" className="max-w-[400px] w-full" onSubmit={handleSearch}>
              <Input type="search" placeholder="Search" 
                className="rounded-xl placeholder:text-stone-400"
                name="search"
                defaultValue={router.query.search || ''}
              />
            </form>
          </div>
          
        </div>
        
        <ScrollArea className="pb-2 min-h-[400px] flex flex-col"
          style={{ 
            height: `calc(100vh - ${getListHeaderHeight() ? getListHeaderHeight() : 0}px - var(--header-height) - 20px)`
          }}
        >
          <table className="w-full">
            <thead>
              <tr>
                <TH className="ps-4 font-medium">Item Name</TH>
                <TH className="font-medium">Category</TH>
                <TH className="font-medium">Sub-category</TH>
                <TH className="pe-4 text-right font-medium">Actions</TH>
              </tr>
            </thead>
            <tbody>
              {data && data.items && data.items.map((item: any, key: number) => (
                <tr key={key} className="even:bg-stone-50 group/item">
                  <ItemEquipmentList
                    _item_id={item._item_id}
                    item_name={item.item_name}
                    item_number={item.item_number}
                    item_sub_category_name={item.item_sub_category_name}
                    item_sub_category_index={item.item_sub_category_index}
                    with_serial={item.with_serial === '1'}
                    total_serial_numbers={item.total_serial_numbers ? parseInt(item.total_serial_numbers) : 0}
                    item_image={item.item_image}
                    onClickAction={(actionType: string) => onClickAction(actionType, item._item_id)}
                    onClickSerialButton={(_item_id: string) => {
                      setSelected__item_id(_item_id);
                      setOpenSNModal(true);
                      setSelectedItem(item);
                    }}
                    _highlightResult={item._highlightResult}
                    item_category_name={item.item_category_name}
                    >
                    <Checkbox 
                      className={cn(
                        "bg-white/80 w-5 h-5 border-2 rounded-full invisible group-hover/item:visible",
                        "data-[state=checked]:visible"
                      )}
                      onCheckedChange={(isChecked: any) => onSelectSingleItem(isChecked, item._item_id)}
                      checked={isCheckDataToSelect(item._item_id)}
                    />
                  </ItemEquipmentList>
                </tr>
              ))}
              {(data && data.items && data.items.length === 0) && (
                <tr>
                  <td colSpan={4}>
                    <div className="flex justify-center">
                      <Image
                        src="/images/No data-rafiki.svg"
                        width={400}
                        height={400}
                        alt="No Data to Shown"
                      />
                    </div>
                  </td>
                </tr>
              )}
              {isLoading && [1,2,3,4,5,6,7].map((skele, key) => (
                <tr key={key}>
                  <td colSpan={4}>
                    <div className="p-2 w-full">
                      <div className="flex gap-2">
                        <Skeleton className="h-[100px] w-[100px] rounded-md" />
                        <div className="flex flex-col gap-3 w-[400px]">
                          <Skeleton className="h-[20px] w-[300px] rounded-md" />
                          <Skeleton className="h-[20px] w-[200px] rounded-md" />
                          <Skeleton className="h-[15px] w-[80px] rounded-md" />
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data && data.pager && (
            <div className="mt-auto border-t border-t-stone-100">
              <Pagination 
                pager={data.pager}
                onPaginate={onPaginate}
              />
            </div>
          )}

        </ScrollArea>
      </div>
    </>
  );
}

export default function Items({ main_categories, categories, access_token }: any) {
  return (
    <AdminLayout>
      <div className="pt-[20px] px-[20px] w-full max-w-[1600px] mx-auto flex gap">
        <Categories 
          main_categories={main_categories} 
          categories={categories} 
        />
        <ItemsData 
          access_token={access_token} 
          categories={categories}
        />
      </div>
    </AdminLayout>
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

  const headers = { Authorization: 'Bearer ' + token };

  let res = await fetch(baseUrl + '/api/main_categories', { headers });
  // let main_categories = await res.json();

  res = await fetch(baseUrl + '/api/categories/all', { headers });
  let main_categories = await res.json();

  let allCategories: any[] = [];

  if (main_categories && Array.isArray(main_categories)) {
    main_categories.forEach((item: any) => {
      if (item.categories && Array.isArray(item.categories)) {
        item.categories.forEach((item: any) => {
          allCategories.push({
            ...item
          })
        });
      }
    });
  }

  return {
    props: {
      main_categories,
      categories: allCategories,
      access_token: token,
    },
  }
}