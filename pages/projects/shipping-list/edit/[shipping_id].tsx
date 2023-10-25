import AdminLayout from "@/components/admin-layout";
import EditShippingDetails from "@/components/projects/shipping-list/EditShippingDetails";
import { AccessTokenContext, SettingsContext } from "@/context/access-token-context";
import { ShippingDetailsContext } from "@/context/shipping-details-context";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { authHeaders, baseUrl } from "@/utils/api.config";
import { getSettings } from "@/utils/settings";
import { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";

export default function EditShippingList({ shippingData, access_token, settings }: any) {
  return (
    <SettingsContext.Provider value={settings}>
      <AccessTokenContext.Provider value={access_token}>
        <ShippingDetailsContext.Provider value={shippingData}>
          <AdminLayout>
            <EditShippingDetails />
          </AdminLayout>
      </ShippingDetailsContext.Provider>
      </AccessTokenContext.Provider>
    </SettingsContext.Provider>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession( context.req, context.res, authOptions );
  let token  = null;

  if (session && session.user) {
    token = session.user.access_token;
  } else {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    }
  }

  let res = await fetch(`${baseUrl}/api/projects/shipping/details/${context.params?.shipping_id}`, {
    headers: {...authHeaders(token)},
  });
  let shippingData = await res.json();

  let settings = await getSettings(token);
  
  return {
    props: {
      access_token: token,
      shippingData,
      settings,
    },
  }
}