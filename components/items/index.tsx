import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { BadgePlus, ChevronRight, FileDown, FileText, MoreHorizontal, Printer, QrCode, X } from "lucide-react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { truncate } from "@/utils/text";
import { BreakPointContext } from "@/context/layout-context";
import { useRouter } from "next/router";
import Link from "next/link";
import { CheckboxProps } from "@radix-ui/react-checkbox";
import { Checkbox } from "../ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import Image from "next/image"
import SerialNumbers from "./SerialNumbers";
import { faker } from "@faker-js/faker";
import Highlighter from "react-highlight-words";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";

export const certificationActionButton = [
  {
    name: 'Certification',
    icon: <BadgePlus className={cn("mr-2 h-[18px] w-[18px] text-red-400")} strokeWidth={2} />,
    actionType: 'item-certification',
  },
];

export const actionMenu = [
  {
    name: 'Type Plate',
    icon: <QrCode className={cn("mr-2 h-[18px] w-[18px] text-green-400")} strokeWidth={2} />,
    actionType: 'type-plate',
  },
  {
    name: 'QR Code',
    icon: <QrCode className={cn("mr-2 h-[18px] w-[18px] text-blue-400")} strokeWidth={2} />,
    actionType: 'qr-code',
  }, 
];

export const serialNumberAction = [
  {
    name: 'View P/O',
    icon: <Printer className={cn("mr-2 h-[18px] w-[18px] text-violet-400")} strokeWidth={2} />,
    actionType: 'po',
  },
  // {
  //   name: 'Delete',
  //   icon: <Trash2 className={cn("mr-2 h-[18px] w-[18px] text-red-400")} strokeWidth={2} />,
  //   actionType: 'delete',
  // },
];


export const TH = ({ className, children }: { className?: string, children?: React.ReactNode }) => (
  <td className={cn('py-3 px-2 text-sm bg-stone-100 text-stone-600', className)}>{children}</td>
);
export const TD = ({ className, children }: { className?: string, children?: React.ReactNode }) => (
  <td className={cn('py-2 px-2 group-last:border-0', className)}>{children}</td>
);

export const ActionButtonHeader = React.forwardRef((
  { icon, name, onClick, loadingQrCodeButton, actionType, loadingTypeplateButton }: 
  {  icon: any, name: any, onClick?: (e: any) => void, loadingQrCodeButton?: boolean, actionType?: string, loadingTypeplateButton?: boolean }, 
  ref: any
) => {
  return (
    <Button 
      className={cn(
        "h-auto flex items-center py-2 px-2 cursor-pointer hover:bg-stone-200 rounded-xl outline-none",
        "bg-transparent text-stone-600 text-sm font-normal",
        (actionType === 'qr-code' && loadingQrCodeButton) && 'loading',
        (actionType === 'type-plate' && loadingTypeplateButton) && 'loading',
      )}
      ref={ref}
      onClick={onClick}
      disabled={loadingQrCodeButton}
    >
      {icon}
      {name}
    </Button>
  )
});
ActionButtonHeader.displayName = 'ActionButtonHeader';

export const ItemMenu = ({ children, onClick }: { children: React.ReactNode, onClick?: (e: any) => void }) => {
  return (
    <DropdownMenuItem 
      className={cn(
        "flex items-center p-2 cursor-pointer",
        "hover:bg-stone-100 rounded-lg outline-none"
      )}
      onClick={onClick}
    >
      {children}
    </DropdownMenuItem>
  );
}

type TypeItemEquipmentList = {
  item_name: any; 
  item_number: any; 
  item_sub_category_name: any; 
  _item_id: any; 
  item_image: any; 
  item_sub_category_index: any;
  with_serial: any;
  total_serial_numbers: any;
  children: React.ReactNode;
  onClickAction?: (actionType: string) => void,
  onClickSerialButton?: (_item_id: string) => void
  _highlightResult?: any
  item_category_name?: string
}

export const ItemEquipmentList = React.forwardRef((props: TypeItemEquipmentList, ref: any) => {
  const { 
    item_name, 
    item_number, 
    item_sub_category_name, 
    _item_id, 
    item_image, 
    item_sub_category_index,
    with_serial,
    total_serial_numbers,
    children,
    onClickAction,
    onClickSerialButton,
    _highlightResult,
    item_category_name
  } = props;
  const bp = useContext(BreakPointContext);

  return (
    <>
      <TD>
        <div className="flex items-start gap-3 group w-[500px]">
          <div className="relative">
            <div className="absolute top-[3px] left-[4px]">
              {children}
            </div>
              <Image 
                width={100}
                height={100}
                src={faker.image.urlPicsumPhotos({ width: 100, height: 100 })}
                // src="/images/No data-rafiki.svg"
                className="h-[100] w-[100] rounded-sm max-w-max text-xs"
                alt={item_name}
              />
          </div>
          <div className="flex flex-col h-[100px]">
            <Link className="flex flex-col" href={`/items/equipment/${_item_id}/details`}>
              <span className="mb-1 font-medium group-hover:underline" title={item_name}>
                <Highlighter 
                  searchWords={_highlightResult ? _highlightResult.item_name.matchedWords : []}
                  autoEscape={true}
                  textToHighlight={truncate(item_name, 50)}
                />
              </span>
              <span className="text-stone-400 group-hover:underline">
                <Highlighter 
                  searchWords={_highlightResult ? _highlightResult.item_number.matchedWords : []}
                  autoEscape={true}
                  textToHighlight={item_number}
                />
              </span>
            </Link>
            {(with_serial && total_serial_numbers > 0) && (
              <button 
                type="button"
                className={cn(
                  'mt-auto w-fit pr-3 ps-0 text-sm',
                  'text-stone-900 font-medium',
                  'hover:bg-stone-200',
                  'flex items-center group/serial',
                  'rounded-full',
                )}
                onClick={() => onClickSerialButton && onClickSerialButton(_item_id)}
              >
                  <span className="bg-stone-200 text-xs rounded-full py-1 w-7 h-7 flex items-center justify-center">
                    {total_serial_numbers}
                  </span>
                <span 
                  className="ps-1 py-[3px] group-hover/serial:border-stone-300"
                >
                  SN
                </span>
              </button>
            )}
          </div>
        </div>
      </TD>
      <TD className="align-top">
      <div className="sub-categories">
        <span className="text-stone-400">
          <Highlighter 
            searchWords={_highlightResult ? _highlightResult.item_category_name.matchedWords : []}
            autoEscape={true}
            textToHighlight={item_category_name || ''}
          />
        </span>
      </div>
    </TD>
      <TD className="align-top">
        <div className="sub-categories">
          <span className="text-stone-400">
            <Highlighter 
              searchWords={_highlightResult ? _highlightResult.item_sub_category_name.matchedWords : []}
              autoEscape={true}
              textToHighlight={item_sub_category_name}
            />
          </span>
        </div>
      </TD>
      <TD className="text-right pe-4">
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="p-1 text-stone-400 border-0 bg-transparent h-auto rounded-full">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 border border-stone-50">
              {[...actionMenu, ...certificationActionButton].map((action, key) => (
                <ItemMenu key={key} onClick={() => onClickAction && onClickAction(action.actionType)}>
                  {action.icon}
                  <span className="text-stone-600 text-sm">{action.name}</span>
                </ItemMenu>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
      </TD>
    </>
  );
});
ItemEquipmentList.displayName = 'ItemEquipmentList';

export const Categories = ({ main_categories }: any) => {
  const router = useRouter();
  let indexParams = router.query?.index;
  const categoryId = indexParams ? indexParams[0] : undefined;

  return (
    <div className={cn('w-[400px]')}>
      <span
        className={cn(
          "text-lg h-[60px] flex items-center px-3 sticky top-[var(--header-height)]",
          "bg-white z-10"
        )}
      >
        Categories
      </span>
      <ScrollArea className="py-0 bg-white" style={{ height: 'calc(100vh - 60px - var(--header-height) - 20px)' }}>
        {main_categories && main_categories.map((item: any, key: number) => (
          <React.Fragment key={key}>
            <div className="p-3">
              <span className="text-stone-500 flex mb-2 ms-1">
                {item.item_main_category_name}
              </span>
              <ul className="flex flex-col rounded-md gap-1">
                {item.categories && item.categories.map((catItem: any, key2: number) => (
                  <CategoryList 
                    key={key2}
                    categoryId={categoryId}
                    _item_category_id={catItem._item_category_id}
                    item_category_name={catItem.item_category_name}
                    sub_categories={catItem.sub_categories}
                  />
                ))}
              </ul>
            </div>
            {main_categories.length > key + 1 && (
              <Separator />
            )}
          </React.Fragment>
        ))}
      </ScrollArea>
    </div>
  );
}

const CategoryList = ({ categoryId, _item_category_id, item_category_name, sub_categories: _sub_categories }: any) => {
  const router = useRouter();
  const sub_category_id = router.query.sub_category_id;
  const [sub_categories, set_sub_categories] = useState<any>([]);
  const [openSub, setOpenSub] = useState(false);
  const [ulHeight, setUlHeight] = useState(0);

  const onShowSubCategories = () => {
    let liHeights = 0;
    if (sub_categories && Array.isArray(sub_categories)) {
      sub_categories.forEach((li: any) => {
        const liElem = li.listRef.current;
        if (liElem) {
          const { height } = liElem.getBoundingClientRect();
          liHeights += height;
        }
      });
    }
    setUlHeight(liHeights);
  };

  useEffect(() => {
    const sub_category = Array.isArray(sub_categories) ? sub_categories.find((sub: any) => sub.item_sub_category_id === sub_category_id) : null;
    onShowSubCategories();
    if (categoryId === _item_category_id || sub_category) {
      setOpenSub(true);
    } else {
      setOpenSub(false)
    }
  }, [sub_categories, categoryId, _item_category_id]);

  useEffect(() => {
    if (_sub_categories) {
      const __sub_categories = _sub_categories.map((sub: any) => {
        return {
          ...sub,
          listRef: React.createRef<HTMLLIElement>(),
        };
      });
      set_sub_categories(__sub_categories);
    }
  }, [_sub_categories]);

  return (
    <li className="flex relative flex-col">
      <Link 
        href={'/items/' + _item_category_id}
        className={cn(
          'w-full px-3 py-2.5 font-medium flex justify-between',
          'items-center hover:bg-stone-200 text-stone-600 rounded-xl',
          openSub && "rounded-br-none rounded-bl-none",
          (openSub || categoryId === _item_category_id) && 'bg-stone-100'
        )}
      >
        {item_category_name}
      </Link>
      <button className="hover:bg-stone-300 absolute right-0 top-1.5 rounded-full p-0.5" 
        onClick={() => {
          onShowSubCategories();
          setOpenSub(!openSub)
        }}
      >
        <ChevronRight width={25} height={25} 
          className={cn(
            "text-stone-600 rotate-0 transition-transform duration-300",
            openSub && "rotate-90"
          )}
        />
      </button>
      {Array.isArray(sub_categories) && sub_categories.length > 0 && (
        <ul
          className={cn(
            "overflow-hidden transition-[height] duration-300",
            "bg-stone-100 rounded-b-xl ps-3 pe-2",
          )} 
          style={{ height: openSub ? ulHeight + 'px' : 0 }}
        >
          {sub_categories.map((sub: any, key: number) => (
            <li key={key} ref={sub.listRef}>
              <Link 
                href={'/items/?sub_category_id=' + sub.item_sub_category_id}
                className={cn(
                  'w-full px-3 py-2 flex justify-between',
                  'items-center hover:bg-stone-200 text-stone-600',
                  'rounded-xl',
                  sub.item_sub_category_id === sub_category_id && 'bg-stone-200'
                )}
              >
                {sub.item_sub_category_name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

export const SelectAll = React.forwardRef((props: CheckboxProps, ref: any) => {
  return (
    <label
      className={cn(
        "p-2 h-auto bg-transparent text-stone-600 hover:bg-stone-200 rounded-xl",
        "flex items-center font-normal text-sm cursor-pointer",
      )}
      htmlFor={props.id || 'selectAll'}
    >
      <Checkbox 
        className={cn(
          'me-2 bg-transparent w-[19px] h-[19px] border-2 rounded-full',
          props.className
        )} 
        {...props}
        id={props.id || 'selectAll'}
        ref={ref}
      /> Select All
    </label>
  );
});
SelectAll.displayName = 'SelectAll';

export const QRCodeModal = (
  { open, onOpenChange, onPrint, onDownload, qrcodes }: 
  { onOpenChange: (open: boolean) => void, open: boolean, onPrint?: () => void, onDownload?: () => void, qrcodes?: any[] }
  ) => {

  const title = () => {
    if (qrcodes && qrcodes.length > 1) return 'QR Codes';
    return 'QR Code';
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] p-0 overflow-auto gap-0">
        <DialogHeader className="py-2 px-3 flex justify-between flex-row items-center sticky top-0 bg-white border-b border-b-stone-100">
          <DialogTitle>{title()}</DialogTitle>
          <DialogPrimitive.Close className="w-fit p-1.5 rounded-full bg-stone-100 hover:bg-stone-200">
            <X />
          </DialogPrimitive.Close>
        </DialogHeader>
        <div className="p-4 flex flex-wrap gap-2 justify-center">
          {qrcodes && qrcodes.map((qr: any, key: number) => (
            <div 
              className={cn(
                "flex flex-col rounde overflow-hidden items-center bg-stone-100/100 rounded-md gap-2",
                "w-[49%]"
              )}
              key={key}
            >
              <div className="py-2 px-3 w-full mb-auto text-sm font-medium text-center border-b border-b-stone-200 text-stone-800">
                <p>{qr.text}</p>
              </div>
              <Image 
                src={qr.uri}
                alt="QRCODE"
                width={150}
                height={150}
              />
              <div className="py-2 px-3 w-full mt-auto text-sm font-medium text-center border-t border-t-stone-200 text-stone-800">
                <span>{qr.value}</span>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter className="bg-white sticky bottom-0 border-t border-t-stone-100">
          <div className="flex items-center justify-end p-2 gap-2">
            <Button className="flex gap-2 items-center"
              variant='outline'
              onClick={onPrint}
            >
              <FileText width={18} height={18} className="text-violet-400" /> View As PDF
            </Button>
            <Button className="flex gap-2 items-center"
              onClick={onDownload}
              variant='outline'
            >
              <FileDown width={18} height={18} className="text-red-400" /> Download
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type TypePlateQRCodeModalType = { 
  open: boolean, 
  typePlates?: any[],
  onOpenChange?: (open: boolean) => void, 
  onPrint?: () => void, 
  onDownload?: () => void, 
};

export const TypePlateQRCodeModal = ({ open, onOpenChange, onPrint, onDownload, typePlates }: TypePlateQRCodeModalType) => {

  const title = () => {
    if (typePlates && typePlates.length > 1) return 'TypePlates';
    return 'TypePlate';
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] p-0 overflow-auto gap-0">
        <DialogHeader className="py-2 px-3 flex justify-between flex-row items-center sticky top-0 bg-white border-b border-b-stone-100">
          <DialogTitle>{title()}</DialogTitle>
          <DialogPrimitive.Close className="w-fit p-1.5 rounded-full bg-stone-100 hover:bg-stone-200">
            <X />
          </DialogPrimitive.Close>
        </DialogHeader>
        <div className="p-4 flex flex-wrap gap-2 justify-center">
          {typePlates && typePlates.map((qrcode, key) => (
            <div key={key} className="w-[48%] bg-stone-100 p-3 rounded-md">
              <div className="flex">
                <div className="flex flex-col items-start">
                  <Image 
                    src="/images/tp_header_new.png"
                    alt="Black Hotwork Logo"
                    className="object-contain mb-2"
                    height={50}
                    width={300}
                  />
                  <span className="font-medium text-[12px]">Romanshornerstr 123 | 9322 Egnach | Switzerland</span>
                  <span className="font-medium text-[12px]">+41 (0) 71 649 20 90 | contact@hotwork.ag</span>
                </div>
                <Image 
                  src="/images/tp_ce.png"
                  className="h-[50px] object-contain ms-2"
                  alt="TP CE"
                  height={50}
                  width={70}
                />
              </div>
              <p className="mt-3 font-bold">{qrcode.text}</p>
              <div className="flex mt-3">
                <div className="w-[35%]">
                  <Image 
                    src={qrcode.uri} 
                    className="w-full"
                    height={100}
                    width={100}
                    alt="QR Code"
                  />
                </div>
                <div className="flex flex-col text-[12px] font-medium ms-3">
                  <p>Serial Number: {qrcode.value || ''}</p>
                  <p>Year: {qrcode.item_construction_year || ''}</p>
                  <p>Capacity: {qrcode.item_power || ''}</p>
                  <p>Pressure: {qrcode.item_pressure || ''}</p>
                  <p>Voltage: {qrcode.item_tension || ''}</p>
                  <p>Motor kW: {qrcode.item_kilowatt || ''}</p>
                  <p>Rated Current: {qrcode.item_rated_current || ''}</p>
                  <p>Protection: {qrcode.item_protection_class || ''}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter className="bg-white sticky bottom-0 border-t border-t-stone-100">
          <div className="flex items-center justify-end p-2 gap-2">
            <Button className="flex gap-2 items-center"
              onClick={onPrint}
              variant='outline'
            >
              <FileText width={18} height={18} className="text-violet-400" /> View As PDF
            </Button>
            <Button className="flex gap-2 items-center"
              onClick={onDownload}
              variant='outline'
            >
              <FileDown width={18} height={18} className="text-red-400" /> Download
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

type SerialNumberModalType = { 
  onOpenChange: (open: boolean) => void, 
  open: boolean,
  _item_id?: string, 
  selectedItem?: any,
};

export const SerialNumberModal = (props: SerialNumberModalType) => {
  const { open, onOpenChange, _item_id, selectedItem } = props;

  return (
    <Dialog 
      open={open} 
      onOpenChange={(open) => {
        onOpenChange && onOpenChange(open);
      }}
    >
      <DialogContent className="max-w-[900px] p-0 overflow-auto gap-0 ">
        <DialogHeader className="py-2 px-3 flex justify-between flex-row items-center sticky top-0 bg-white">
          <DialogTitle>
            {selectedItem && selectedItem.item_name}
          </DialogTitle>
          <DialogPrimitive.Close className="w-fit p-1.5 rounded-full bg-stone-100 hover:bg-stone-200">
            <X />
          </DialogPrimitive.Close>
        </DialogHeader>
        <div className="min-h-[650px] flex flex-col">
          <SerialNumbers 
            _item_id={_item_id} 
            selectedItem={selectedItem}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}