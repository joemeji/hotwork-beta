export const saveScannedItemApi = async (
  _shipping_id: any, 
  payload: {
    _item_id?: any
    _serial_number_id?: any
  }
) => {
  const res = await fetch('/api/shipping/' + _shipping_id + '/item/save_scanned_item', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  
  return json;
}