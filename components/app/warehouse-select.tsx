import { AccessTokenContext } from "@/context/access-token-context";
import Combobox from "../ui/combobox";
import { useContext, useState } from "react";
import useSWR from "swr";
import { fetchApi } from "@/utils/api.config";

const WarehouseSelect = (props: WarehouseSelectProps) => {
  const { value, onChangeValue, placeholder } = props;
  const access_token = useContext(AccessTokenContext);

  const { data, isLoading, error, mutate } = useSWR(
    [`/api/warehouse/all`, access_token], 
    fetchApi
  );

  const contentData = () => {
    if (Array.isArray(data) && data.length > 0) {
      return data.map((item: any) => {
        return {
          value: item.warehouse_id,
          text: (
            <div className="flex flex-col">
              <span className="font-medium">{item.warehouse_name}</span>
              <span className=" opacity-80">{item.warehouse_location}</span>
            </div>
          )
        }
      });
    }
    return;
  };

  return (
    <Combobox 
      contents={contentData()}
      placeholder={placeholder}
      value={value}
      onChangeValue={onChangeValue}
    />
  );
};

type WarehouseSelectProps = {
  value?: any
  onChangeValue?: (value?: any) => void
  placeholder?: any
}

export default WarehouseSelect;