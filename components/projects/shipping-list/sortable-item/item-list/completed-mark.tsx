import { CompleteIncompleteStatus } from "../../shipping_id";

export default function CompletedMark({ item }: any) {
  let render = null;

  if (!item) {
    render = <CompleteIncompleteStatus completed={false} />;
  }
  
  if (Number(item.is_custom) === 1) {
    if (Number(item.custom_total_added) === Number(item.shipping_item_quantity)) {
      render = <CompleteIncompleteStatus completed={true} />;
    }
  }

  if (Number(item.with_serial) === 1) {
    if (Number(item.total_added) === Number(item.shipping_item_quantity)) {
      render = <CompleteIncompleteStatus completed={true} />;
    }
  }

  if (Number(item.with_serial) === 0) {
    if (Number(item.unserialized_total_added) === Number(item.shipping_item_quantity)) {
      render = <CompleteIncompleteStatus completed={true} />;
    }
  }

  return (
    <div className="min-w-[150px] p-2 ps-12 flex items-center"> 
      {render || <CompleteIncompleteStatus completed={false} />}
    </div>
  );
}