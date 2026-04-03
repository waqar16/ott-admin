"use client"
import SkeletonLoader from "@/components/Loader/SkeletonLoader" 
import EditUser from "@/components/User/UpdateUser";
import { deleteUser, getUsers, User } from "@/lib/userApi";
import { useEffect, useState } from "react";
import { BiRefresh } from "react-icons/bi";
import { toast } from "sonner";
type EditUserProps = {
  user: User ;
  setEditUser: React.Dispatch<React.SetStateAction<User | null>>;
};
export default async function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
      const [seriesToDelete, setSeriesToDelete] = useState<User | null>(null);
  
  const [usersFetchLoading, setUsersFetchLoading] = useState<boolean>(true)
  const [editUser, setEditUser] = useState<User | null>(null)
  async function fetch() {
    setUsersFetchLoading(true)
      const usersToFetch = await getUsers();
      if (Array.isArray(usersToFetch)) {
        setUsers(usersToFetch)
      }
      setUsersFetchLoading(false)
    }
  useEffect(() => {
    
    fetch()

  }, [])
  return (
   <>
    {editUser?
      <EditUser setEditUser={setEditUser} user={editUser} setUsers={setUsers}/>:
      <div className="p-2 md:p-6 text-white space-y-6 bg-black md:mt-0 mt-16"> 
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-gray-400">Analytics & control of all users</p>
        </div>

        {/* <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">
          + Add User
        </button> */}
      </div>

      {/* Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatBox title="Total Users" value="4,921" change="+8%" />
        <StatBox title="Premium Users" value="1,232" change="+12%" />
        <StatBox title="Active Today" value="892" change="+5%" />
       </div> */}

      {/* User Table */}
      {usersFetchLoading ?
      <div className="w-full flex flex-col items-start ">
         <div className='flex flex-row items-center w-full justify-end p-2 '>
          <SkeletonLoader className="h-[40px] w-[100px] bg-neutral-900" />
          </div>
        <div className="bg-black rounded-xl p-6 shadow-lg border border-neutral-800 w-full">
         
          <h2 className="text-xl font-semibold mb-4">All Users</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400">
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {[1, 2, 3].map((index, u) => (
                  <tr
                    key={index}
                    className="border-b border-neutral-800   transition"
                  >
                    <td className="p-3"><SkeletonLoader className="h-[40px] w-[100px] bg-neutral-900" /></td>
                    <td className="p-3"><SkeletonLoader className="h-[40px] w-[100px] bg-neutral-900" /></td>
                    <td className="p-3"><SkeletonLoader className="h-[40px] w-[100px] bg-neutral-900" /></td>
                    <td className="p-3"><SkeletonLoader className="h-[40px] w-[100px] bg-neutral-900" /></td>



                    <td className="p-3">
                      <div className="flex justify-end gap-3">
                        <SkeletonLoader className="h-[40px] w-[100px] bg-neutral-900" />

                        <SkeletonLoader className="h-[40px] w-[100px] bg-neutral-900" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div></div> :
        <div className="w-full flex flex-col items-start ">
          <div className='flex flex-row items-center w-full justify-end p-2'>
            <button className='p-2 rounded-md bg-neutral-800 flex flex-row items-center' onClick={()=>{ 
              fetch()
            }}>Refresh <BiRefresh className='ml-1'/> </button>
          </div>
          <div className="bg-neutral-900 rounded-xl p-6 shadow-lg border border-neutral-800 w-full">
          <h2 className="text-xl font-semibold mb-4">All Users</h2>

          <div className="overflow-x-auto">

            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400">
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u:User) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-700 hover:bg-gray-700/50 transition"
                  >
                    <td className="p-3">{u.name}</td>
                    <td className="p-3 text-gray-300">{u.email}</td>
                    <td className="p-3 text-gray-300">{u.role}</td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${u.is_active === true
                          ? "bg-green-600/30 text-green-400"
                          :"bg-blue-600/30 text-blue-400"
                          }`}
                      >
                        {u.is_active?'Active':'InActive'}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="flex justify-end gap-3">
                        <button className="px-3 py-1 bg-blue-600 rounded-lg hover:bg-blue-700" onClick={()=>setEditUser(u)}>
                          Edit
                        </button>
                        {/* {u.status !== "Banned" && (
                        <button className="px-3 py-1 bg-yellow-500 rounded-lg hover:bg-yellow-600">
                          Ban
                        </button>
                      )} */}
                        <button className="px-3 py-1 bg-red-600 rounded-lg hover:bg-red-700"  onClick={()=>setSeriesToDelete(u)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
        
        }
     {seriesToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">
              Delete User?
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Are you sure you want to delete{" "}
              <span className="font-medium text-white">
                {seriesToDelete.name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSeriesToDelete(null)}
                className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  let contentDeletion = await deleteUser(seriesToDelete)
                  if (contentDeletion == 200) {
                    setUsers(
                      prev=>prev.filter((u) => u.id !== seriesToDelete.id)
                    )
                    toast.success(`${seriesToDelete.name} is deleted successfully`)
                  }
                  else {
                    toast.success(`Error deleting ${seriesToDelete.name}`)

                  }
                  setSeriesToDelete(null);
                }}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    }</>
  );
}

function StatBox({ title, value, change }: any) {
  return (
    <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 shadow-lg">
      <p className="text-gray-400 text-sm">{title}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
      <p className="text-green-400 text-sm mt-2">{change} this month</p>
    </div>
  );
}


