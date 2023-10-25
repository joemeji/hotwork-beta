import { AccessTokenContext } from "@/context/access-token-context";
import Combobox from "../ui/combobox";
import { useContext, useState } from "react";
import useSWR from "swr";
import { fetchApi } from "@/utils/api.config";

const CurrencySelect = (props: CurrencySelectProps) => {
  const { value, onChangeValue, placeholder } = props;
  const access_token = useContext(AccessTokenContext);

  const { data, isLoading, error, mutate } = useSWR(
    [`/api/currency`, access_token], 
    fetchApi
  );

  const contentData = () => {
    if (Array.isArray(data) && data.length > 0) {
      return data.map((item: any) => {
        return {
          value: item.currency_id,
          text: (
            <div className="flex gap-2 items-center justify-between w-full">
              <span className="font-medium">{item.currency_name} ({item.currency_sign})</span>
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

type CurrencySelectProps = {
  value?: any
  onChangeValue?: (value?: any) => void
  placeholder?: any
}

export default CurrencySelect;