import { authHeaders, baseUrl } from "./api.config";

export async function getSettings(token: any) {
  const res = await fetch(`${baseUrl}/api/setting`, {
    headers: {...authHeaders(token)}
  });
  const json = await res.json();
  return json;
}