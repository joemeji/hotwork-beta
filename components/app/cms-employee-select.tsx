import Combobox from "../ui/combobox";
import useSWR from "swr";
import { fetcher } from "@/utils/api.config";
import AvatarProfile from "../AvatarProfile";
import { useState } from "react";

const CmsEmployeeSelect = (props: CmsEmployeeSelectProps) => {
  const { value, onChangeValue, placeholder, cms_id } = props;
  const [isOpenPopover, setIsOpenPopover] = useState(false);

  const { data, isLoading, error, mutate } = useSWR(`/api/cms/${cms_id}/cms_employee`, fetcher);

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
      onOpenChange={open => setIsOpenPopover(open)}
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