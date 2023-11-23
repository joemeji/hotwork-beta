import AvatarProfile from "@/components/AvatarProfile";
import MoreOption from "@/components/MoreOption";
import AdminLayout from "@/components/admin-layout";
import { ItemMenu } from "@/components/items";
import AddButtonPopover from "@/components/projects/shipping-list/ShippingDetails/AddButtonPopover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { baseUrl, fetchApi } from "@/utils/api.config";

export default function LoadingList() {
  return (
    <AdminLayout>
      <div className="p-[20px] w-full max-w-[1600px] mx-auto flex gap-3">
        <div className="bg-white w-[20%] rounded-app shadow-sm">
          <ScrollArea viewPortClassName="h-[calc(100vh-var(--header-height)-40px)]">
            <div className="rounded-app bg-white w-full sticky top-0 p-3 backdrop-blur-sm bg-white/40 z-[1]">
              <Input type="search" placeholder="Search Loading List" 
              className="rounded-app placeholder:text-stone-400 w-full mb-2">
              </Input>
            </div>
            <div className="p-2 flex flex-col gap-2">
              {[0,0,0,0,0,0,0,0,0,0].map((loading: any, index: number) => (
                <div key={index} className="w-full bg-stone-100 rounded-app p-3 flex justify-between justify-items-center">
                  <div className="flex flex-col justify-self-start">
                    <span className="text-base font-semibold">Loading Name</span>
                    <span>Loading Work</span>
                    
                    <div className="w-full flex flex-row justify-center items-center">
                      <div className="m-1">
                        <TooltipProvider delayDuration={400}>
                          <Tooltip>
                            <TooltipTrigger>
                              <AvatarProfile 
                                firstname='Jade'
                                lastname='Paypa'
                                photo={baseUrl + '/users/thumbnail/'}
                                avatarClassName="w-7 h-7"
                                avatarColor='gray'
                                avatarFallbackClassName="font-medium text-white text-xs"
                              />
                              <TooltipContent>
                              <p>Creator Name</p>
                              </TooltipContent>
                            </TooltipTrigger>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <span className="font-light">Jade Paypa</span>
                    </div>
                  </div>
                  <div className="">
                    <MoreOption>
                      {['Edit', 'Delete', 'New Copy', 'Preview', 'Save PDF'].map((option: any, key: number) => (
                        <ItemMenu key={key}>
                          <span className="text-stone-600 text-sm">{option}</span>
                        </ItemMenu>
                      ))}
                    </MoreOption>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-2 sticky bottom-0">
              <Button className="w-full">New Loading List</Button>
            </div>
          </ScrollArea>
        </div>
        <div className="bg-white w-[60%] rounded-app shadow-sm flex flex-between flex-col gap-3">
          <div className="p-4 flex justify-between">
            <p className="font-medium text-lg">Items</p>
            <div className="flex gap-2">
            <Button>Add Item</Button>
            <Button>Preview PDF</Button>
            <MoreOption>
              {['Add Items from Template', 'Update', 'Delete', 'New Copy', 'Save as PDF'].map((option: any, key: number) => (
                <ItemMenu key={key}>
                  <span className="text-stone-600 text-sm">{option}</span>
                </ItemMenu>
              ))}
            </MoreOption>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <th className="bg-stone-300 py-3 px-2 align-top round-app">#</th>
                <th className="bg-stone-300 py-3 px-2 align-top">Unit</th>
                <th className="bg-stone-300 py-3 px-2 align-top">Pieces</th>
                <th className="bg-stone-300 py-3 px-2 align-top">L / M</th>
                <th className="bg-stone-300 py-3 px-2 align-top">Weight Per Piece(kg)</th>
                <th className="bg-stone-300 py-3 px-2 align-top">Total Weight(kg)</th>
                <th className="bg-stone-300 py-3 px-2 align-top">Type</th>
                <th className="bg-stone-300 py-3 px-2 align-top round-app"></th>
              </tr>
            </thead>
            <tbody>
              {[1,2,3,4,5,6].map((item: any, key: number) => (
                <tr key={key}>
                  <td className="text-center py-5 px-3 align-top">{item}</td>
                  <td className="text-center py-5 px-3 align-top">Valve PN16</td>
                  <td className="text-center py-5 px-3 align-top">5</td>
                  <td className="text-center py-5 px-3 align-top"></td>
                  <td className="text-center py-5 px-3 align-top">480</td>
                  <td className="text-center py-5 px-3 align-top">2400</td>
                  <td className="text-center py-5 px-3 align-top">Equipment</td>
                  <td className="text-center">
                    <MoreOption>
                      {['Edit', 'Delete'].map((option: any, key: number) => (
                        <ItemMenu key={key}>
                          <span className="text-stone-600 text-sm">{option}</span>
                        </ItemMenu>
                      ))}
                    </MoreOption>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white w-[20%] rounded-app shadow-sm flex flex-between flex-col p-2">
          <ScrollArea viewPortClassName="h-[calc(100vh-var(--header-height)-40px)]">
            <div className="flex flex-col gap-3">
              <div className="p-4">
                <p className="font-medium text-lg">Loading List Details</p>
              </div>
              <div className="p-4 rounded-app border-2 border-stone-200">
                Creator and
                When Created
              </div>     
              <div className="p-4 rounded-app border-2 border-stone-200">
                Loading Description
              </div>
              <div className="p-4 rounded-app border-2 border-stone-200">
                Loading Furnace
              </div>  
              <div className="p-4 rounded-app border-2 border-stone-200">
                Loading Type of Unit
              </div>    
              <div className="p-4 rounded-app border-2 border-stone-200">
                Loading Work
              </div> 
              <div className="p-4 rounded-app border-2 border-stone-200">
                Loading Additional Notes
              </div> 
            </div>
            <div className="sticky bottom-0 flex justify-end mt-2">
              <Button>Edit</Button>
            </div>
          </ScrollArea>
        </div>
      </div>
    </AdminLayout>
  )

}