import AvatarProfile from "@/components/AvatarProfile";
import MoreOption from "@/components/MoreOption";
import AdminLayout from "@/components/admin-layout";
import { ItemMenu, actionMenu } from "@/components/items";
import Pagination from "@/components/pagination";
import StatusChip from "@/components/projects/shipping-list/StatusChip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { addressFormat } from "@/lib/shipping";
import { cn } from "@/lib/utils";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { baseUrl, fetchApi } from "@/utils/api.config";
import { avatarFallback } from "@/utils/avatar";
import { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import useSWR from 'swr';

export default function ShippingList({ access_token }: any) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const payload: any = {};
  if (router.query.page) payload['page'] = router.query.page;
  if (router.query.search) payload['search'] = router.query.search;
  const queryString = new URLSearchParams(payload).toString();

  const { data, isLoading, error } = useSWR(
    [`/api/projects/shipping?${queryString}`, access_token], 
    fetchApi,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  );

  const onPaginate = (page: string) => {
    router.query.page = page;
    router.push(router);
  };

  const onSearch = () => {
    if (!search) return;
    router.query.search = search;
    router.push(router);
  };

  return (
    <AdminLayout>
      <div className="p-[20px] w-full max-w-[1600px] mx-auto">
        <div className="bg-white w-full rounded-sm shadow-sm">
          <div className="flex justify-between p-4 items-center">
            <p className="text-xl flex font-medium">Shipping List</p>
            <form onSubmit={onSearch}>
              <Input type="search" placeholder="Search" 
                className="rounded-xl placeholder:text-stone-400 w-[400px]"
                name="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
            <Link href="/projects/shipping-list/create">
              <Button>New Shipping</Button>
            </Link>
          </div>
          <table className="w-full">
            <thead className="sticky z-10 top-[var(--header-height)]">
              <tr>
                <TH className="ps-4">Shipping No.</TH>
                <TH>Invoice To</TH>
                <TH>Delivery To</TH>
                <TH>Added By</TH>
                <TH>Furnace</TH>
                <TH className="w-[200px]">Delivery Date</TH>
                <TH>Status</TH>
                <TH className="text-right pe-4">Actions</TH>
              </tr>
            </thead>
            <tbody>
              {isLoading && 
                [0,0,0,0,0,0,0].map((item: any, key: number) => (
                  <tr key={key}>
                    <td className="py-3 ps-4 pe-2 align-top">
                      <Skeleton className="w-[100px] h-[15px]" />
                    </td>
                    <td className="py-3 px-2 align-top">
                      <div className="flex flex-col gap-4">
                        <Skeleton className="w-[300px] h-[15px]" />
                        <Skeleton className="w-[200px] h-[15px]" />
                      </div>
                    </td>
                    <td className="py-3 px-2 align-top">
                      <div className="flex flex-col gap-4">
                        <Skeleton className="w-[300px] h-[15px]" />
                        <Skeleton className="w-[200px] h-[15px]" />
                      </div>
                    </td>
                    <td className="py-3 px-2 align-top">
                      <Skeleton className="w-12 h-12 rounded-full" />
                    </td>
                    <td className="py-3 px-2 align-top">
                      <Skeleton className="w-[100px] h-[15px]" />
                    </td>
                    <td className="py-3 px-2 align-top">
                      <Skeleton className="w-[100px] h-[15px]" />
                    </td>
                    <td className="py-3 px-2 align-top" colSpan={2}>
                      <Skeleton className="w-[100px] h-[15px]" />
                    </td>
                  </tr>
                ))}
              {data && Array.isArray(data.shipping) && data.shipping.map((row: any, key: number) => (
                <tr key={key} className="group">
                  <TD className="ps-4 align-top">
                    <Link href={`${router.pathname}/${row._shipping_id}`}>
                      <span className="text-blue-600 font-medium">
                        {row.shipping_number}
                      </span>
                    </Link>
                  </TD>
                  <TD className="align-top w-[350px]">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm uppercase">{row.supplier}</span>
                      <span className="text-sm text-stone-500">
                        {addressFormat(
                          row.supplier_address_building,
                          row.supplier_address_street,
                          row.supplier_address_city,
                          row.supplier_address_country,
                        )}
                      </span>
                    </div>
                  </TD>
                  <TD className="align-top w-[350px]">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm uppercase">{row.client}</span>
                      <span className="text-sm text-stone-500">
                        {addressFormat(
                          row.cms_address_building,
                          row.cms_address_street,
                          row.cms_address_city,
                          row.cms_address_country,
                        )}
                      </span>
                    </div>
                  </TD>
                  <TD className="align-top">
                    <TooltipProvider delayDuration={400}>
                      <Tooltip>
                        <TooltipTrigger>
                          <AvatarProfile 
                            firstname={row.user_firstname}
                            lastname={row.user_lastname}
                            photo={baseUrl + '/users/thumbnail/' + row.user_photo}
                            avatarClassName="w-10 h-10"
                            avatarColor={row.avatar_color}
                            avatarFallbackClassName="font-medium text-white text-xs"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{(row.user_firstname || 'N') + ' ' + (row.user_lastname || 'A')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TD>
                  <TD className="align-top">
                    <span className="text-sm">{row.shipping_furnace || '--'}</span>
                  </TD>
                  <TD className="align-top">
                    <span className="text-sm">{row.shipping_delivery_date || '--'}</span>
                  </TD>
                  <TD className="align-top">
                    <StatusChip status={row.shipping_status} />
                  </TD>
                  <TD className="align-top text-right pe-4">
                    <MoreOption>
                      {[...actionMenu].map((action, key) => (
                        <ItemMenu key={key}>
                          {action.icon}
                          <span className="text-stone-600 text-sm">{action.name}</span>
                        </ItemMenu>
                      ))}
                    </MoreOption>
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
          {data && data.pager && (
            <div className="mt-auto border-t border-t-stone-100">
              <Pagination 
                pager={data.pager}
                onPaginate={(page: any) => onPaginate(page)}
              />
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export const TH = ({ className, children }: { className?: string, children?: React.ReactNode }) => (
  <td className={cn('py-3 px-2 text-sm bg-stone-200 text-stone-600 font-medium', className)}>{children}</td>
);
export const TD = ({ className, children }: { className?: string, children?: React.ReactNode }) => (
  <td className={cn('py-3 px-2 border-b border-b-stone-100 group-last:border-0', className)}>{children}</td>
);

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

  return {
    props: {
      access_token: token,
    },
  }
}