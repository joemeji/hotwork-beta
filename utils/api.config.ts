import jwt_decode from "jwt-decode";

export const baseUrl = process.env.API_ENDPOINT || 'http://localhost:8080';

export const azureStorageUrl = 'https://hotware.blob.core.windows.net/apps/Hotware';

export function authHeaders(token: any) {
  const headers: object | any = {
    'Content-Type': 'application/json'
  };

  if (typeof token === 'string') {
    headers['Authorization'] = 'Bearer ' + token;
  }

  if (token && typeof token === 'object') {
    headers['Authorization'] = 'Bearer ' + token.access_token;
  }
  
  return headers;
}

export async function appClientFetch({
  url, 
  options = {}, 
  authStatus
}: {
  url: string,
  options?: any,
  authStatus: string | any
}) {
  if (authStatus === 'loading') { 
    return {
      status: 'authenticating',
    }
  }
  if (authStatus === 'unauthenticated') { 
    return {
      status: 'unauthenticated',
    }
  }
  if (options.headers && options.headers['Authorization']) {
    const [, token] = options.headers['Authorization'].split('Bearer ');
    const decodedToken: any = jwt_decode(token);
    if (decodedToken && decodedToken.exp && (Date.now() >= decodedToken.exp * 1000)) {
      return {
        status: 'unauthorized',
      }
    }
  }
  const res = await fetch(baseUrl + url, options);
  return res;
}

export const fetchApi = async ([url, token]) => {
  const res = await fetch(baseUrl + url, { headers: { Authorization: 'Bearer ' + token } });

  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.')
    // Attach extra info to the error object.
    error.info = await res.json()
    error.status = res.status
    throw error
  }

  return res.json();
}