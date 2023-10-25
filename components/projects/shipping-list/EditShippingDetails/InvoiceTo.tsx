import { ShippingDetailsContext } from "@/context/shipping-details-context";
import React, { memo, useContext, useState } from "react";
import CmsAddressSelect from "./CmsAddressSelect";
import CmsSelect from "@/components/app/cms-select";

const InvoiceTo = ({ value, onChangeValue, renderAddress }: InvoiceToProps) => {
  const shippingDetails: any = useContext(ShippingDetailsContext);
  const _invoice_to_id = shippingDetails ? shippingDetails.supplier_cms_id : null;

  return (
    <React.Fragment>
      <div className="flex flex-col gap-4 relative">
        <div>
          <p className="mb-3 font-medium text-base">Invoice To:</p>
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-1">Company</p>
              <CmsSelect 
                defaultValue={_invoice_to_id}
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
      </div>
    </React.Fragment>
  );
}

export function InvoiceEmployeeForm({ invoice_to_id, onChangeValue, value }: ChildFormProps) {
  return (
    <CmsAddressSelect 
      cms_id={invoice_to_id}
      value={value}
      onChangeValue={onChangeValue}
    />
  );
}

export default memo(InvoiceTo);

type ChildFormProps = {
  invoice_to_id?: any
  onChangeValue?: (id?: any) => void
  value?: any
}

type InvoiceToProps = {
  onChangeValue?: (deliver_to_id?: any) => void
  value?: any
  renderAddress?: React.ReactNode
}