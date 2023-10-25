import { AccessTokenContext } from "@/context/access-token-context";
import Combobox from "../ui/combobox";
import { useContext, useState } from "react";
import { fetchApi } from "@/utils/api.config";
import useSWRInfinite from "swr/infinite";
import { cn } from "@/lib/utils";
import { beginScrollDataPagerForInfiniteswr } from "../pagination";

const CmsSelect = (props: CmsSelectProps) => {
  const access_token = useContext(AccessTokenContext);
  const [search, setSearch] = useState(null);
  const { value, defaultValue, onChangeValue, onSelectedItem, placeholder, className, popOverContentClassName } = props;

  const { data, isLoading, error, size, setSize, isValidating } = useSWRInfinite(
    (index) => {
      let paramsObj: any = {};

      if (search) {
        paramsObj = {};
        paramsObj['search'] = search;
        paramsObj['page'] = 0;
      }

      paramsObj['page'] = index + 1;

      if (defaultValue) paramsObj['first'] = defaultValue;
      
      let searchParams = new URLSearchParams(paramsObj);
      return [
        `/api/cms?${searchParams.toString()}`, 
        access_token
      ];
    }, 
    fetchApi
  );

  const _data: any = data ? [].concat(...data) : [];
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");

  const onscrollend = () => {
    const currentPage = beginScrollDataPagerForInfiniteswr(_data);
    if (currentPage) {
      setSize(currentPage + 1);
    }
  }

  const _onChangeValue = (value?: any) => {
    onChangeValue && onChangeValue(value);
    let item = null;
    for (let i = 0; i < size; i++) {
      if (_data[i] && Array.isArray(_data[i].cms)) {
        const foundCms = _data[i].cms.find((item: any) => item.cms_id == value);
        if (foundCms) item = foundCms;
      }
    }
    onSelectedItem && onSelectedItem(item);
  };

  const contentData = () => {
    const items: any = [];
    if (_data && Array.isArray(_data)) {
      _data.forEach((item: any) => {
        if (item && Array.isArray(item.cms)) {
          item.cms.forEach((item: any) => {
            items.push({
              text: (
                <div 
                  className={cn(
                    "flex justify-between py-1",
                    "items-start hover:bg-stone-100 cursor-pointer"
                  )}
                >
                  <div className="flex gap-0 flex-col">
                    <p className="font-medium">{item.cms_name}</p>
                    {item.default_address_inline && <span className="opacity-70">{item.default_address_inline}</span>}
                  </div>
                </div>
              ),
              value: item.cms_id
            });
          })
        }
      });
    }
    return items;
  };

  return (
    <Combobox 
      contents={contentData()}
      placeholder={placeholder}
      value={value}
      onChangeValue={_onChangeValue}
      isLoadingMore={isLoadingMore}
      onScrollEnd={onscrollend}
      className={className}
      popOverContentClassName={popOverContentClassName}
    />
  );
};

type CmsSelectProps = {
  value?: any
  defaultValue?: any
  defaultAddress?: any
  onChangeValue?: (value?: any) => void
  onSelectedItem?: (cmsItem?: any) => void
  placeholder?: string | undefined
  className?: string | undefined
  popOverContentClassName?: string | undefined
}
export default CmsSelect;