import Combobox from "@/components/ui/combobox";
import { AccessTokenContext } from "@/context/access-token-context";
import { fetchApi } from "@/utils/api.config";
import { memo, useContext, useEffect, useState } from "react";
import useSWR from "swr";

const CmsAddressSelect = (props: CmsAddressSelectProps) => {
  const { cms_id, value, onChangeValue, placeholder } = props;
  const access_token = useContext(AccessTokenContext);
  const [_value, set_value] = useState<any>(null);

  const { data, isLoading, error, mutate } = useSWR(() => {
    return cms_id ? [`/api/cms/cms_address/${cms_id}?${value ? `first=${value}` : ''}`, access_token] : null;
  }, 
    fetchApi
  );
  
  const cmsAddressTextCity = (cms_address: any) => {
    if (cms_address) {
      const { 
        cms_address_building,
        cms_address_street,
        cms_address_zip,
      } = cms_address;
      let text = [];
      text[0] = cms_address_building ? cms_address_building?.replace(',', '') : null;
      text[1] = cms_address_street ? cms_address_street?.replace(',', '') : null;
      text[2] = cms_address_zip ? cms_address_zip?.replace(',', '') : null;
      return text.filter((item: any) => item !== null).join(', ');
    }
    return null;
  };

  const cmsAddressCountry = (cms_address: any) => {
    if (cms_address) {
      const { 
        cms_address_city,
        cms_address_country,
      } = cms_address;
      let text = [];
      text[3] = cms_address_city ? cms_address_city?.replace(',', '') : null;
      text[4] = cms_address_country ? cms_address_country?.replace(',', '') : null;
      return text.filter((item: any) => item !== null).join(', ');
    }
    return null;
  };
  
  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      let defaultData = Array.isArray(data) ? data.find((item: any) => item.is_default == 1) : null;
      defaultData = defaultData || data[0];
      set_value(defaultData ? defaultData.cms_address_id : null);
    } else {
      set_value(null);
    }
  }, [data]);

  const contentData = () => {
    if (Array.isArray(data) && data.length > 0) {
      return data.map((item: any) => {
        return {
          text: (
            <div className="flex flex-col">
              <span className="font-medium">{cmsAddressTextCity(item)}</span>
              <span>{cmsAddressCountry(item)}</span>
            </div>
          ),
          value: item.cms_address_id,
        }
      });
    }
  };

  return (
    <Combobox 
      value={value}
      onChangeValue={onChangeValue}
      contents={contentData()}
      placeholder={placeholder}
      isLoading={isLoading}
    />
  );
};

export default memo(CmsAddressSelect);

type CmsAddressSelectProps = {
  contents?: any[]
  cms_id?: any
  value?: any
  onChangeValue?: (value?: any) => void
  placeholder?: any
}