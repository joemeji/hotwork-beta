import { PER_PAGE, client } from "@/utils/algoliaConfig";
import { baseUrl, fetchApi, fetcher } from "@/utils/api.config";
import itemQrCodeDraw, { generateQrCode, itemTypePlate } from "@/utils/itemQrCodeDraw";
import { useRouter } from "next/router";
import { memo, useEffect, useRef, useState } from "react";
import useSWR from "swr";
//import { SelectAll, TH, actionMenu } from "..";
import { SelectAll, TH, ItemMenu } from "../items";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import MoreOption from "@/components/MoreOption";
import { Modal } from "../items/itemId/PriceTab";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import Pagination from "@/components/pagination";
//import ActionButtonHeader from "../ActionButtonHeader";
// import ItemEquipmentList from "../ItemEquipmentList";
import dynamic from "next/dynamic";
import { log } from "console";

const AddressManager = () => {
    const [isEdit, setIsEdit] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    
    const companies = [
      {
        id: 1,
        name: "Alsachimie BASF",
        contact: "123456789",
        website: "Fax",
        category: "clients",
      },
      {
        id: 2,
        name: "Alsachimie BASF",
        contact: "123456789",
        website: "Fax",
        category: "clients",
      },
      {
        id: 3,
        name: "Alsachimie BASF",
        contact: "123456789",
        website: "Fax",
        category: "clients",
      },
      {
        id: 4,
        name: "Alsachimie BASF",
        contact: "123456789",
        website: "Fax",
        category: "clients",
      },
      {
        id: 5,
        name: "Alsachimie BASF",
        contact: "123456789",
        website: "Fax",
        category: "clients",
      },
      {
        id: 6,
        name: "Alsachimie BASF",
        contact: "123456789",
        website: "Fax",
        category: "clients",
      },
      {
        id: 7,
        name: "Alsachimie BASF",
        contact: "123456789",
        website: "Fax",
        category: "clients",
      },
      {
        id: 8,
        name: "Alsachimie BASF",
        contact: "123456789",
        website: "Fax",
        category: "clients",
      },
      {
        id: 9,
        name: "Alsachimie BASF",
        contact: "123456789",
        website: "Fax",
        category: "clients",
      },
      {
        id: 10,
        name: "Alsachimie BASF",
        contact: "123456789",
        website: "Fax",
        category: "clients",
      },
      {
        id: 1,
        name: "Alsachimie BASF",
        contact: "123456789",
        website: "Fax",
        category: "clients",
      },
      {
        id: 2,
        name: "Alsachimie BASF",
        contact: "123456789",
        website: "Fax",
        category: "clients",
      },
      {
        id: 3,
        name: "Alsachimie BASF",
        contact: "123456789",
        website: "Fax",
        category: "clients",
      },
      {
        id: 4,
        name: "Alsachimie BASF",
        contact: "123456789",
        website: "Fax",
        category: "clients",
      },
      {
        id: 5,
        name: "Alsachimie BASF",
        contact: "123456789",
        website: "Fax",
        category: "clients",
      },
      {
        id: 6,
        name: "Alsachimie BASF",
        contact: "123456789",
        website: "Fax",
        category: "clients",
      },
      {
        id: 7,
        name: "Alsachimie BASF",
        contact: "123456789",
        website: "Fax",
        category: "clients",
      },
      {
        id: 8,
        name: "Alsachimie BASF",
        contact: "123456789",
        website: "Fax",
        category: "clients",
      },
      {
        id: 9,
        name: "Alsachimie BASF",
        contact: "123456789",
        website: "Fax",
        category: "clients",
      },
      {
        id: 10,
        name: "Alsachimie BASF",
        contact: "123456789",
        website: "Fax",
        category: "clients",
      },
      {
        id: 1,
        name: "Alsachimie BASF",
        contact: "123456789",
        website: "Fax",
        category: "clients",
      },
      {
        id: 2,
        name: "Alsachimie BASF",
        contact: "123456789",
        website: "Fax",
        category: "clients",
      },
      {
        id: 3,
        name: "Alsachimie BASF",
        contact: "123456789",
        website: "Fax",
        category: "clients",
      },
      {
        id: 4,
        name: "Alsachimie BASF",
        contact: "123456789",
        website: "Fax",
        category: "clients",
      },
      {
        id: 5,
        name: "Alsachimie BASF",
        contact: "123456789",
        website: "Fax",
        category: "clients",
      },
      {
        id: 6,
        name: "Alsachimie BASF",
        contact: "123456789",
        website: "Fax",
        category: "clients",
      },
      {
        id: 7,
        name: "Alsachimie BASF",
        contact: "123456789",
        website: "Fax",
        category: "clients",
      },
      {
        id: 8,
        name: "Alsachimie BASF",
        contact: "123456789",
        website: "Fax",
        category: "clients",
      },
      {
        id: 9,
        name: "Alsachimie BASF",
        contact: "123456789",
        website: "Fax",
        category: "clients",
      },
      {
        id: 10,
        name: "Alsachimie BASF",
        contact: "123456789",
        website: "Fax",
        category: "clients",
      },
    ];
    
    const onClickAddContact = () => {
      setOpenEditModal(true);
      setIsEdit(false);
    };
    
    return(
        <>
          <Modal
            title={isEdit ? "Edit Contact" : "Add New Contact"}
            open={openEditModal}
            onOpenChange={setOpenEditModal}
          >
            <form className="p-5 border-t border-t-stone-200">
              <div className="mb-4">
                <label className="mb-2 flex font-medium">Select Group</label>
                <Select>
                  <SelectTrigger className="border h-11 w-full rounded-xl">
                    <SelectValue placeholder="Select Group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Clients"/>
                    <SelectItem value="Suppliers"/>
                  </SelectContent>
                </Select>
              </div>
              <div className="mb-4">
                <label className="mb-2 flex font-medium">Name</label>
                <Input className="h-11" placeholder="Name" />
              </div>

              <div className="text-right">
                <Button>Save</Button>
              </div>
            </form>
          </Modal>
          <div className="w-full h-full">
            <ScrollArea className="flex flex-col"
              viewPortClassName="min-h-[400px] rounded-app bg-white"
              viewPortStyle={{ 
                height: `calc(100vh - var(--header-height) - 40px)`
              }}
            >
              <div 
                className={cn(
                  "flex w-full flex-col",
                  "backdrop-blur-sm bg-white/90 z-10 sticky top-0 rounded-t-app" 
                )}
              >
                <div
                  className={cn(
                    "p-3 flex justify-between items-center",
                    "border-b border-b-stone-100"
                  )}
                >
                  <span className="text-lg">Companies</span>
                  <div className="flex items-center gap-2">
                    <Button variant="red" onClick={onClickAddContact}>Add New Contact</Button>
                    <Button>Export Contact</Button>
                  </div>
                </div>

                <div className="px-3 py-2 ps-[8px] flex items-center justify-between">
                  <div className="flex gap-1 items-center">
                    <SelectAll />
                      <Button variant="ghost">Client</Button>
                      <Button variant="ghost">Remove</Button>
                      {/* <ActionButtonHeader
                      /> */}
                  </div>
                  <form id="Search" className="max-w-[400px] w-full">
                    <Input type="search" placeholder="Search" 
                      className="rounded-xl placeholder:text-stone-400"
                      name="search"
                    />
                  </form>
                </div>
                
              </div>
              <table className="w-full">
                <thead className="sticky top-0">
                  <tr style={{textAlign:"center"}}>
                    <TH className="ps-4 font-medium">No.</TH>
                    <TH className="font-medium">Name</TH>
                    <TH className="font-medium">Contact</TH>
                    <TH className="pe-4 font-medium">Website</TH>
                    <TH className="pe-4 font-medium">Category</TH>
                    <TH className="pe-4 font-medium">Actions</TH>
                  </tr>
                </thead>
                <tbody>
                    {
                      companies.map((el) => {
                        return(
                          <>
                            <tr key={el.id} style={{textAlign:'center', lineHeight: "40px"}}>
                              <td>{el.id}</td>
                              <td>{el.name}</td>
                              <td>{el.contact}</td>
                              <td>{el.website}</td>
                              <td>{el.category}</td>
                              <td>
                                <MoreOption>
                                  <ItemMenu>
                                    Update
                                  </ItemMenu>
                                  <ItemMenu>
                                    Delete
                                  </ItemMenu>
                                </MoreOption>
                              </td>
                            </tr>
                          </>
                        )
                      })
                    }
                </tbody>
              </table>
                {/* <div className="mt-auto border-t border-t-stone-100">
                  <Pagination />
                </div> */}
            </ScrollArea>
          </div>
        </>
    )
}

export default memo(AddressManager);