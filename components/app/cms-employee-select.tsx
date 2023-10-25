import { AccessTokenContext } from "@/context/access-token-context";
import Combobox from "../ui/combobox";
import { useContext, useState } from "react";
import useSWR from "swr";
import { fetchApi } from "@/utils/api.config";
import AvatarProfile from "../AvatarProfile";

const CmsEmployeeSelect = (props: CmsEmployeeSelectProps) => {
  const { value, onChangeValue, placeholder, cms_id } = props;
  const access_token = useContext(AccessTokenContext);

  const { data, isLoading, error, mutate } = useSWR(
    [`/api/cms/employee/all/${cms_id}`, access_token], 
    fetchApi
  );

  const contentData = () => {
    if (Array.isArray(data) && data.length > 0) {
      return data.map((employee: any) => {
        return {
          value: employee.cms_employee_id,
          text: (
            <div className="flex gap-2 items-start">
              <AvatarProfile 
                firstname={employee.cms_employee_firstname}
                lastname={employee.cms_employee_lastname}
                avatarColor={employee.avatar_color}
                photo={employee.cms_employee_photo}
                avatarClassName="text-white font-medium"
              />
              <div className="flex flex-col">
                <span className="font-medium">{employee.cms_employee_firstname} {employee.cms_employee_lastname}</span>
                <span>{employee.cms_employee_phone_number}</span>
              </div>
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

type CmsEmployeeSelectProps = {
  value?: any
  onChangeValue?: (value?: any) => void
  placeholder?: any
  cms_id?: any
}

export default CmsEmployeeSelect;