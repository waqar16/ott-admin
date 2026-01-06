export default function AdminUsersPage() {
  const users = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "User",
      subscription: "Premium",
      watchHours: 120,
      lastActive: "2 hours ago",
      status: "Active",
    },
    {
      id: 2,
      name: "Sara Ali",
      email: "sara@example.com",
      role: "User",
      subscription: "Free",
      watchHours: 34,
      lastActive: "1 day ago",
      status: "Active",
    },
    {
      id: 3,
      name: "Michael Smith",
      email: "michael@example.com",
      role: "Admin",
      subscription: "N/A",
      watchHours: 0,
      lastActive: "Online",
      status: "Admin",
    },
    {
      id: 4,
      name: "Emily Carter",
      email: "emily@example.com",
      role: "User",
      subscription: "Premium",
      watchHours: 250,
      lastActive: "5 hours ago",
      status: "Banned",
    },
  ];

  return (
    <div className="p-6 text-white space-y-6 bg-gray-900">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-gray-400">Analytics & control of all users</p>
        </div>

        <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">
          + Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatBox title="Total Users" value="4,921" change="+8%" />
        <StatBox title="Premium Users" value="1,232" change="+12%" />
        <StatBox title="Active Today" value="892" change="+5%" />
        <StatBox title="Banned Users" value="34" change="0%" />
      </div>

      {/* User Table */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">All Users</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="p-3">User</th>
                <th className="p-3">Email</th>
                <th className="p-3">Subscription</th>
                <th className="p-3">Watch Hours</th>
                <th className="p-3">Last Active</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-gray-700 hover:bg-gray-700/50 transition"
                >
                  <td className="p-3">{u.name}</td>
                  <td className="p-3 text-gray-300">{u.email}</td>
                  <td className="p-3">{u.subscription}</td>
                  <td className="p-3">{u.watchHours} hrs</td>
                  <td className="p-3 text-gray-400">{u.lastActive}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        u.status === "Active"
                          ? "bg-green-600/30 text-green-400"
                          : u.status === "Banned"
                          ? "bg-red-600/30 text-red-400"
                          : "bg-blue-600/30 text-blue-400"
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>

                  <td className="p-3">
                    <div className="flex justify-end gap-3">
                      <button className="px-3 py-1 bg-blue-600 rounded-lg hover:bg-blue-700">
                        View
                      </button>
                      {u.status !== "Banned" && (
                        <button className="px-3 py-1 bg-yellow-500 rounded-lg hover:bg-yellow-600">
                          Ban
                        </button>
                      )}
                      <button className="px-3 py-1 bg-red-600 rounded-lg hover:bg-red-700">
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
  );
}

function StatBox({ title, value, change }: any) {
  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
      <p className="text-gray-400 text-sm">{title}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
      <p className="text-green-400 text-sm mt-2">{change} this month</p>
    </div>
  );
}
