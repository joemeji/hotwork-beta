'use client';

import AdminLayout from "@/components/admin-layout";
import { appClientFetch, authHeaders } from "@/utils/api.config";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status: authStatus } = useSession();

  console.log(session)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await appClientFetch({
          url: '/api/items',
          authStatus,
          options: {
            headers: { ...authHeaders(session?.user) }
          }
        })
        console.log(res);
      }
      catch(e) {
        console.log('Error: ' + e)
      }
    }
    fetchData();
  }, [authStatus, session?.user]);

  return (
    <AdminLayout>
      <h1 onClick={() => signOut()} className="text-center">Dashboard coming soon.</h1>
    </AdminLayout>
  );
}