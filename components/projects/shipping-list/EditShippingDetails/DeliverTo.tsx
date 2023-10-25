import { Input } from "@/components/ui/input";
import { ShippingDetailsContext } from "@/context/shipping-details-context";
import React, { memo, useContext, useState } from "react";
// import CmsSelect from "@/components/CmsSelect";
import CmsAddressSelect from "./CmsAddressSelect";
import CmsEmployeeSelect from "@/components/app/cms-employee-select";
import CmsSelect from "@/components/app/cms-select";

const DeliverTo = (props: DeliverToProps) => {
  const shippingDetails: any = useContext(ShippingDetailsContext);
  const _deliver_to_id = shippingDetails ? shippingDetails.cms_id : null;
  const { onChangeValue, value, renderAddress, renderEmployee } = props;

  return (
    <React.Fragment>
      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-3 font-medium text-base">Deliver To:</p>
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-1">Company</p>
              <CmsSelect 
                defaultValue={_deliver_to_id}
                value={value} 
                onChangeValue={onChangeValue}
              />
            </div>
            <div>
            <p className="mb-1">Location</p>
              {renderAddress}
            </div>
          </div>
        </div>
        <div>
          <p className="mb-1">Contact Person</p>
          {renderEmployee}
        </div>
      </div>
    </React.Fragment>
  );
}

export default memo(DeliverTo);

export function AddressForm({ deliver_to_id, onChangeValue, value }: ChildFormProps) {
  return (
    <CmsAddressSelect 
      cms_id={deliver_to_id}
      value={value}
      onChangeValue={onChangeValue}
    />
  );
}

export function EmployeeForm({ deliver_to_id, onChangeValue, value }: ChildFormProps) {
  return (
    <CmsEmployeeSelect 
      cms_id={deliver_to_id} 
      onChangeValue={onChangeValue}
      value={value}
    />
  );
}

type ChildFormProps = {
  deliver_to_id?: any
  onChangeValue?: (id?: any) => void
  value?: any
}

type DeliverToProps = {
  onChangeValue?: (deliver_to_id?: any) => void
  value?: any
  renderAddress?: React.ReactNode
  renderEmployee?: React.ReactNode
}