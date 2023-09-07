import AdminLayout from "@/components/admin-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { baseUrl } from "@/utils/api.config";
import { avatarFallback } from "@/utils/avatar";
import { Mail, MoreHorizontal, Phone } from "lucide-react";
import { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import Pagination from "@/components/pagination";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { TD, TH, UserListHeaderForm, actionMenu, lengthOfService } from "@/components/admin-pages/users";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ItemMenu } from "@/components/items";

type UsersProps  = {
  user: any,
  serverStatus?: number
}

export default function Users(props: UsersProps) {
  const { user, serverStatus } = props;
  const router = useRouter();
  const [userPager, setUserPager] = useState<any>(null);

  const onPaginate = (page: any) => {
    router.query.page = page;
    router.push(router);
  };

  const onClickAction = (actionType: string) => {
    if (actionType === 'view') {
      router.push('/admin/users/123');
    }
  };

  useEffect(() => {
    if (user && user.pager) {
      setUserPager(user.pager);
    }
  }, [user]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.title = 'Users';
    }
  }, []);

  useEffect(() => {
    if (serverStatus === 500) {
      // display pop up for server error
    }

    if (serverStatus === 401) {
      // display pop up for unauthorized access
      console.log(401)
    }
  }, [serverStatus]);
 
  return (
    <AdminLayout>
      <div className="p-[20px] w-full max-w-[1600px] mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-medium">Users</h1>
          <Button>Add User</Button>
        </div>

        <div className="rounded-xl bg-white pt-5 pb-2 mt-4 shadow-sm flex flex-col min-h-[600px]">

          <UserListHeaderForm />

          <table className="w-full">
            <thead>
              <tr>
                <TH className="text-center">ID</TH>
                <TH>Photo</TH>
                <TH>Name</TH>
                <TH>Contact Info</TH>
                <TH>Role</TH>
                <TH>Length of Service</TH>
                <TH>Employed By</TH>
                <TH className="text-right pe-4">Actions</TH>
              </tr>
            </thead>
            <tbody>
              {user && Array.isArray(user.users) && user.users.map((user: any, key: number) => (
                <tr key={key} className="even:bg-stone-50 hover:bg-stone-100">
                  <TD className="font-bold text-stone-600 text-center">{user.user_identification}</TD>
                  <TD className="w-20">
                    <div>
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.user_photo} alt={user.user_lastname + ' ' + user.user_lastname} />
                        <AvatarFallback className="font-medium text-white" style={{ background: user.avatar_color }}>
                          {avatarFallback(user.user_firstname, user.user_lastname)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </TD>
                  <TD>
                    <span className="font-medium">
                      {user.user_lastname && user.user_lastname + ', '}
                    </span> 
                    {user.user_firstname}
                  </TD>
                  <TD>
                    <div className="flex flex-col gap-1">
                      {user.user_contact_number && (
                        <span className="text-sm flex gap-1 items-center">
                          <Phone width={14} height={14} strokeWidth={1} /> {user.user_contact_number}
                        </span>
                      )}
                      {user.email && (
                        <span className="text-sm flex gap-1 items-center">
                          <Mail width={14} height={14} strokeWidth={1} /> {user.email}
                        </span> 
                      )}
                    </div>
                  </TD>
                  <TD className="text-sm">Admin</TD>
                  <TD className="text-sm">
                    {lengthOfService(user.user_start_date)}
                  </TD>
                  <TD className="text-sm">
                    {user.company_name || '-'}
                  </TD>
                  <TD className="pe-4 text-right">
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="p-1 text-stone-400 border-0 bg-transparent h-auto rounded-full">
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border border-stone-50">
                        {[...actionMenu].map((action, key) => (
                          <ItemMenu key={key} onClick={() => onClickAction(action.actionType)}>
                            {action.icon}
                            <span className="text-stone-600 text-sm">{action.name}</span>
                          </ItemMenu>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>

          {userPager && (
            <div className="mt-auto border-t border-t-stone-100">
              <Pagination 
                pager={userPager}
                onPaginate={onPaginate}
              />
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession( context.req, context.res, authOptions );
  let token  = null;
  let serverStatus = null;

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

  const headers = { Authorization: 'Bearer ' + token };

  const page = context.query.page || 1;
  let res = await fetch(baseUrl + '/api/users/?page=' + page, { headers });
  let user = await res.json();
  serverStatus = res.status;

  return {
    props: {
      user,
      serverStatus
    },
  }
}