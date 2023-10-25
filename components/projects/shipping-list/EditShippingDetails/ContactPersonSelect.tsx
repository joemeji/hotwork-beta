import AvatarProfile from "@/components/AvatarProfile";
import { beginScrollDataPagerForInfiniteswr } from "@/components/pagination";
import Combobox from "@/components/ui/combobox";
import { AccessTokenContext } from "@/context/access-token-context";
import { fetchApi } from "@/utils/api.config";
import { memo, useContext } from "react";
import useSWRInfinite from "swr/infinite";

const ContactPersonSelect = (props: ContactPersonSelectProps) => {
  const { value, onChangeValue, defaultValue, placeholder } = props;
  const access_token = useContext(AccessTokenContext);

  const { data, isLoading, error, size, setSize, isValidating } = useSWRInfinite(
    (index) => {
      let paramsObj: any = {};

      paramsObj['page'] = index + 1;

      if (defaultValue) paramsObj['first'] = defaultValue;
      
      let searchParams = new URLSearchParams(paramsObj);
      return [
        `/api/users/company?${searchParams.toString()}`, 
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

  const contentData = () => {
    const items: any = [];
    if (_data && Array.isArray(_data)) {
      _data.forEach((item: any) => {
        if (item && Array.isArray(item.users)) {
          item.users.forEach((user: any) => {
            items.push({
              text: (
                <div className="flex gap-2 items-start">
                  <AvatarProfile 
                    firstname={user.user_firstname}
                    lastname={user.user_lastname}
                    avatarColor={user.avatar_color}
                    photo={user.user_photo}
                    avatarClassName="text-white font-medium"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{user.user_firstname} {user.user_lastname}</span>
                    <span>{user.user_contact_number}</span>
                  </div>
                </div>
              ),
              value: user.user_id
            });
          })
        }
      });
    }
    return items;
  };

  return (
    <>
      <Combobox 
        contents={contentData()}
        isLoadingMore={isLoadingMore}
        onScrollEnd={onscrollend}
        value={value}
        onChangeValue={onChangeValue}
        placeholder={"Contact Person"}
      />
    </>
  );
  
};

type ContactPersonSelectProps = {
  value?: any
  defaultValue?: any
  onChangeValue?: (value?: any) => void
  placeholder?: any
}

export default memo(ContactPersonSelect);