import AdminLayout from "@/components/admin-layout";
import { ShippingDetails } from "@/components/projects/shipping-list/shipping_id";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import useSWR from 'swr';
import { fetchApi } from "@/utils/api.config";
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import React, { useEffect, useMemo, useState } from "react";
import {CSS} from '@dnd-kit/utilities';
import uniqid from "@/utils/text";
import { TH } from "..";

export default function ShippingId({ access_token }: any) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const [dataItems, setDataItems] = useState([]);

  const { data, isLoading, error } = useSWR(
    [`/api/projects/shipping/items/1`, access_token], 
    fetchApi,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  );

  function handleDragEnd(event: any) {
    const {active, over} = event;
    console.log({ active })
    
    // if (active.id !== over.id) {
    //   setDataItems((items) => {
    //     const oldIndex = items.indexOf(active.id);
    //     const newIndex = items.indexOf(over.id);
        
    //     return arrayMove(items, oldIndex, newIndex);
    //   });
    // }
  }

  useEffect(() => {
    let _dataItems: any = [];
    if (data && data.categories && data.categories.length > 0) {
      data.categories.forEach((cateItem: any) => {
        const equipments = data.equipments.filter((item: any) => item.shipping_category_id === cateItem.shipping_category_id);
        _dataItems.push({
          ...cateItem,
          equipments: equipments.map((item: any) => ({ ...item, uuid: uniqid() })),
        });
      });
    }
    if (data && data.equipments && data.equipments.length > 0) {
      const equipments = data.equipments.filter((item: any) => item.shipping_category_id === null);
      _dataItems.push(...equipments);
    }
    _dataItems = [..._dataItems].map((item: any) => ({ ...item, uuid: uniqid() }));
    setDataItems(_dataItems);
    console.log(_dataItems)
  }, [data]);

  return (
    <AdminLayout>
      <ShippingDetails>
        <table className="w-full">
          <thead>
            <tr>
              <TH>#</TH>
              <TH>Description</TH>
              <TH>Country</TH>
              <TH>HS Code</TH>
              <TH>Qnty</TH>
              <TH>Weight (kg)</TH>
              <TH>Unit Value</TH>
              <TH>Status</TH>
              <TH></TH>
            </tr>
          </thead>
        </table>
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={dataItems.map((item: any) => item.uuid)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2 p-3">
              {Array.isArray(dataItems) && dataItems.map((item: any, key: number) => (
                <React.Fragment key={key}>
                  {typeof item.shipping_category_name !== 'undefined' ? (
                    <SortableItem key={item.uuid} id={item.uuid}>
                      <div>
                        <div className="bg-green-100 py-3 px-3 rounded-lg" key={key}>
                          <span>{item.shipping_category_name}</span>
                        </div>
                        {item.equipments && (
                          <div className="border-l ps-3 mt-2 ms-3 flex flex-col gap-2">
                            <DndContext 
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={handleDragEnd}
                              onDragStart={(event) => console.log(event)}
                            >
                              <SortableContext 
                                items={item && item.equipments.map((item: any) => item.uuid)}
                                strategy={verticalListSortingStrategy}
                              >
                                {item.equipments && item.equipments.map((item: any) => (
                                  <SortableItem key={item.uuid} id={item.uuid}>
                                    <div className="bg-blue-100 py-3 px-3 rounded-lg" key={key}>
                                      <span>{item.shipping_item_name}</span>
                                    </div>
                                  </SortableItem>
                                ))}
                              </SortableContext>
                            </DndContext>
                          </div>
                        )}
                      </div>
                    </SortableItem>
                  ): (
                    <SortableItem key={item.uuid} id={item.uuid}>
                      <div className="bg-blue-100 py-3 px-3 rounded-lg">
                        <span>{item.shipping_item_name}</span>
                      </div>
                    </SortableItem>
                  )}
                </React.Fragment>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </ShippingDetails>
    </AdminLayout>
  );
}

function SortableItem(props: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: props.id});
  
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {props.children}
    </div>
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

  return {
    props: {
      access_token: token,
    },
  }
}