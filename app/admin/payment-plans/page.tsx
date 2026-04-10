// "use client";

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { API_BASE, USE_MOCK_DATA, logMockDataUsage } from '../../../lib/config'
// import SkeletonLoader from "@/components/Loader/SkeletonLoader";
// import { toast } from "sonner";
// import { BiEdit, BiTrash } from "react-icons/bi";
// import { PaymentPlan } from "@/lib/types/content";
// import PlanForm from "@/components/PlanForm/PlanForm";
// import Link from "next/link";
// interface ApiResponse {
//   count: number;
//   next: string | null;
//   previous: string | null;
//   results: PaymentPlan[];
// }

// interface Filters {
//   search?: string;
//   is_active?: string;
//   ad_supported?: string;
// }

// const PaymentPlansPage = () => {
//   const [plans, setPlans] = useState<PaymentPlan[]>([]);
//   const [filters, setFilters] = useState<Filters>({});
//   const [page, setPage] = useState(1);
//   const [count, setCount] = useState(0);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [editPlan, setEditPlan] = useState<PaymentPlan | null>(null);
//   const [loadingUpdate, setLoadingUpdate] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [confirmPlantDeletion, setConfirmPlantDeletion] = useState(false);

//   // Delete plan by id
//   const deletePlan = async (id: string) => {
    
//     try {
//       await axios.delete(`${API_BASE}api/v1/payments/plans/${id}`, {
//         headers: {
//           Authorization: `Bearer ${Cookies.get('access_token')}`
//         }
//       });
      
//             toast.success("Plan deleted successfully.");
//       fetchPlans();
//     } catch (error) { 
//       toast.error(error.response.data?.detail || "Failed to delete plan.");
//     }
//   };

//  const fetchPlans = async () => {
//   try {
//     setLoading(true);

//     const response = await axios.get<ApiResponse>(
//       `${API_BASE}api/v1/payments/plans?page=${page}&search=${filters.search || ""}&is_active=${filters.is_active ?? ""}&ad_supported=${filters.ad_supported ?? ""}`
//     );

//     setPlans(response.data.results);
//     setCount(response.data.count);

//   } catch (error) {
//     console.error(error);
//   } finally {
//     setLoading(false);      // ← stop skeleton
//   }
// };


//   useEffect(() => {
//     fetchPlans();
//   }, [page, filters]);
// const confirmDelete = (id: string) => {
//   toast.custom((t) => (
//     <div className="bg-neutral-900 border border-neutral-700 p-4 rounded-lg shadow-lg w-80">
//       <h3 className="text-white font-semibold mb-2">
//         Delete Payment Plan?
//       </h3>
//       <p className="text-neutral-400 text-sm mb-4">
//         This action cannot be undone.
//       </p>

//       <div className="flex justify-end gap-2">
//         <button
//           onClick={() => toast.dismiss(t)}
//           className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-white rounded-md text-sm"
//         >
//           Cancel
//         </button>

//         <button
//           onClick={async () => {
//             toast.dismiss(t);
//             await deletePlan(id);
//           }}
//           className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
//         >
//           Confirm
//         </button>
//       </div>
//     </div>
//   ));
// };

//   return (
//     <div className="md:p-6 p-2 mt-16 md:mt-0 min-h-screen bg-black">

//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <h1 className=" text-2xl md:text-3xl font-bold text-white">Payment Plans</h1>

//         <Link
//          href={'/admin/payment-plans/add'}
//           className="px-3 md:px-5 py-2 md:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg  text-sm md:text-md"
//         >
//           + Add New Payment Plan
//         </Link>
//       </div>

//       {/* Filters */}
//       <div className="  bg-neutral-900 p-4 rounded-lg mb-6">
//         <h2 className="text-lg font-semibold mb-3 text-neutral-300">Filters</h2>

//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

//           {/* Search by Name */}
//           <input
//             type="text"
//             placeholder="Search by name..."
//             value={filters.search || ""}
//             onChange={(e) => setFilters({ ...filters, search: e.target.value })}
//             className="px-4 py-2 bg-neutral-800 text-white rounded-lg"
//           />

//           {/* Active Filter */}
//           <select
//             value={filters.is_active ?? ""}
//             onChange={(e) => setFilters({ ...filters, is_active: e.target.value })}
//             className="px-4 py-2 bg-neutral-800 text-white rounded-lg"
//           >
//             <option value="">All</option>
//             <option value="true">Active Only</option>
//             <option value="false">Inactive Only</option>
//           </select>

//           {/* Ad Supported */}
//           <select
//             value={filters.ad_supported ?? ""}
//             onChange={(e) => setFilters({ ...filters, ad_supported: e.target.value })}
//             className="px-4 py-2 bg-neutral-800 text-white rounded-lg"
//           >
//             <option value="">All</option>
//             <option value="true">Ad Supported</option>
//             <option value="false">No Ads</option>
//           </select>
//         </div>
//       </div>

//       {/* Plans Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
 
//   {loading ? (
//     // Show 3 skeleton cards
//     <>
//       <PlanCardSkeleton />
//       <PlanCardSkeleton />
//       <PlanCardSkeleton />
//     </>
//   ) : (
//     plans.map((plan) => (
//       <div key={plan.id} className="bg-neutral-800 p-6 rounded-lg shadow-lg border border-neutral-700 relative">
//         {/* Delete Button Top Right */}
// <button
//                      onClick={() => confirmDelete(plan.id)}

//           title="Delete Plan"
//           className="absolute top-3 right-3 text-red-400   p-1 rounded-full  transition"
//         >
//           <BiTrash className="w-5 h-5"/>
//         </button>
//         <Link
// href={`/admin/payment-plans/${plan.id}`}
//           title="Delete Plan"
//           className="absolute top-3 right-9 text-neutral-400   p-1 rounded-full  transition"
//         >
//           <BiEdit className="w-5 h-5"/>
//         </Link>

//         <h3 className="text-xl text-neutral-300 font-bold mb-2">{plan.name}</h3>
//         <p className="text-neutral-400 mb-3">{plan.description}</p>

//         <p className="text-2xl text-neutral-300 font-bold mb-3">${plan.price}</p>

//         <ul className="text-neutral-300 text-sm space-y-1">
//           <li>Duration: {plan.duration_days} days</li>
//           <li>Devices: {plan.max_devices}</li>
//           <li>Profiles: {plan.max_profiles}</li>
//           <li>Ad Supported: {plan.ad_supported ? "Yes" : "No"}</li>
//           <li>Status: {plan.is_active ? "Active" : "Inactive"}</li>
//         </ul>

         
//       </div>
//     ))
//   )}
 


//       </div>

//       {/* Pagination */}
//       {plans && plans.length > 0 &&   !(page * 10 >= count) &&  <div className="flex justify-center items-center gap-4 mt-8">

//         <button
//           disabled={page === 1}
//           onClick={() => setPage((p) => p - 1)}
//           className={`px-4 py-2 rounded-lg ${page === 1 ? "bg-neutral-700" : "bg-neutral-600 hover:bg-neutral-700"} text-white`}
//         >
//           Previous
//         </button>

//         <span className="text-white">Page {page}</span>

//         <button
//           disabled={page * 10 >= count}
//           onClick={() => setPage((p) => p + 1)}
//           className={`px-4 py-2 rounded-lg ${(page * 10 >= count) ? "bg-neutral-700" : "bg-neutral-600 hover:bg-neutral-700"} text-white`}
//         >
//           Next
//         </button>

//       </div>}
// {plans.length === 0 && !loading && (
//   <div className="text-center text-neutral-400 mt-20">
//     <p className="text-xl">No payment plans found.</p>
    
//   </div>
// ) }
//       {/* Add New Plan Modal */}
//       {modalOpen && (
//   <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
//     <div className="bg-neutral-800 p-6 rounded-lg w-full max-w-lg">

//       <h2 className="text-xl font-bold mb-4 text-white">
//         {editPlan ? "Edit Payment Plan" : "Add New Payment Plan"}
//       </h2>

//       <PlanForm
//         initial={editPlan}
//         onClose={() => {
//           setModalOpen(false);
//           setEditPlan(null);
//         }}
//         onSuccess={() => {
//           setModalOpen(false);
//           setEditPlan(null);
//           toast.success(`Plan ${editPlan ? "updated" : "created"} successfully.`);
//           fetchPlans();
//         }}
//       />
//     </div>
//   </div>
// )}


//     </div>
//   );
// };

// const PlanCardSkeleton = () => (
//   <div className="bg-neutral-800 p-6 rounded-lg border border-neutral-700 animate-pulse">
//     <SkeletonLoader className="h-6 w-32 bg-neutral-700 mb-4" />
//     <SkeletonLoader className="h-4 w-full bg-neutral-700 mb-3" />
//     <SkeletonLoader className="h-4 w-1/2 bg-neutral-700 mb-6" />
    
//     <SkeletonLoader className="h-8 w-20 bg-neutral-700 mb-4" />

//     <div className="space-y-2">
//       <SkeletonLoader className="h-4 w-40 bg-neutral-700" />
//       <SkeletonLoader className="h-4 w-28 bg-neutral-700" />
//       <SkeletonLoader className="h-4 w-32 bg-neutral-700" />
//       <SkeletonLoader className="h-4 w-24 bg-neutral-700" />
//     </div>

//     <SkeletonLoader className="h-10 w-full bg-neutral-700 mt-5 rounded" />
//   </div>
// );

// export default PaymentPlansPage;
 "use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE, USE_MOCK_DATA, logMockDataUsage } from '../../../lib/config'
import SkeletonLoader from "@/components/Loader/SkeletonLoader";
import { toast } from "sonner";
import { BiEdit, BiTrash } from "react-icons/bi";
import { PaymentPlan } from "@/lib/types/content";
import PlanForm from "@/components/PlanForm/PlanForm";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PaymentPlan[];
}

interface Filters {
  search?: string;
  is_active?: string;
  ad_supported?: string;
}

const PaymentPlansPage = () => {
  const router = useRouter();
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<PaymentPlan | null>(null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmPlantDeletion, setConfirmPlantDeletion] = useState(false);
  const [redirectingPlanId, setRedirectingPlanId] = useState<string | null>(null);

  // Delete plan by id
  const deletePlan = async (id: string) => {
    try {
      await axios.delete(`${API_BASE}api/v1/payments/plans/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('access_token')}`
        }
      });
      
      toast.success("Plan deleted successfully.");
      fetchPlans();
    } catch (error) { 
      toast.error(error.response.data?.detail || "Failed to delete plan.");
    }
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);

      const response = await axios.get<ApiResponse>(
        `${API_BASE}api/v1/payments/plans?page=${page}&search=${filters.search || ""}&is_active=${filters.is_active ?? ""}&ad_supported=${filters.ad_supported ?? ""}`
      );

      setPlans(response.data.results);
      setCount(response.data.count);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [page, filters]);

  const confirmDelete = (id: string) => {
    toast.custom((t) => (
      <div className="bg-neutral-900 border border-neutral-700 p-4 rounded-lg shadow-lg w-80">
        <h3 className="text-white font-semibold mb-2">
          Delete Payment Plan?
        </h3>
        <p className="text-neutral-400 text-sm mb-4">
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t)}
            className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-white rounded-md text-sm"
          >
            Cancel
          </button>

          <button
            onClick={async () => {
              toast.dismiss(t);
              await deletePlan(id);
            }}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
          >
            Confirm
          </button>
        </div>
      </div>
    ));
  };

  const handleEditClick = (planId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setRedirectingPlanId(planId);
    router.push(`/admin/payment-plans/${planId}`);
  };

  return (
    <div className="md:p-6 p-2 mt-16 md:mt-0 min-h-screen bg-black">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Payment Plans</h1>

        <Link
          href={'/admin/payment-plans/add'}
          className="px-3 md:px-5 py-2 md:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm md:text-md"
        >
          + Add New Payment Plan
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-neutral-900 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-3 text-neutral-300">Filters</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          {/* Search by Name */}
          <input
            type="text"
            placeholder="Search by name..."
            value={filters.search || ""}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-2 bg-neutral-800 text-white rounded-lg"
          />

          {/* Active Filter */}
          <select
            value={filters.is_active ?? ""}
            onChange={(e) => setFilters({ ...filters, is_active: e.target.value })}
            className="px-4 py-2 bg-neutral-800 text-white rounded-lg"
          >
            <option value="">All</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>

          {/* Ad Supported */}
          <select
            value={filters.ad_supported ?? ""}
            onChange={(e) => setFilters({ ...filters, ad_supported: e.target.value })}
            className="px-4 py-2 bg-neutral-800 text-white rounded-lg"
          >
            <option value="">All</option>
            <option value="true">Ad Supported</option>
            <option value="false">No Ads</option>
          </select>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
 
        {loading ? (
          <>
            <PlanCardSkeleton />
            <PlanCardSkeleton />
            <PlanCardSkeleton />
          </>
        ) : (
          plans.map((plan) => (
            <div key={plan.id} className="bg-neutral-800 p-6 rounded-lg shadow-lg border border-neutral-700 relative">
              {/* Delete Button Top Right */}
              <button
                onClick={() => confirmDelete(plan.id)}
                title="Delete Plan"
                className="absolute top-3 right-3 text-red-400 p-1 rounded-full transition"
              >
                <BiTrash className="w-5 h-5"/>
              </button>

              {/* Edit Button */}
              <button
                onClick={(e) => handleEditClick(plan.id, e)}
                disabled={redirectingPlanId === plan.id}
                title="Edit Plan"
                className="absolute top-3 right-9 text-neutral-400 p-1 rounded-full transition disabled:opacity-50"
              >
                {redirectingPlanId === plan.id ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                ) : (
                  <BiEdit className="w-5 h-5"/>
                )}
              </button>

              <h3 className="text-xl text-neutral-300 font-bold mb-2">{plan.name}</h3>
              <p className="text-neutral-400 mb-3">{plan.description}</p>

              <p className="text-2xl text-neutral-300 font-bold mb-3">${plan.price}</p>

              <ul className="text-neutral-300 text-sm space-y-1">
                <li>Duration: {plan.duration_days} days</li>
                <li>Devices: {plan.max_devices}</li>
                <li>Profiles: {plan.max_profiles}</li>
                <li>Ad Supported: {plan.ad_supported ? "Yes" : "No"}</li>
                <li>Status: {plan.is_active ? "Active" : "Inactive"}</li>
              </ul>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {plans && plans.length > 0   && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className={`px-4 py-2 rounded-lg ${page === 1 ? "bg-neutral-700" : "bg-neutral-600 hover:bg-neutral-700"} text-white`}
          >
            Previous
          </button>

          <span className="text-white">Page {page}</span>

          <button
            disabled={page * 10 >= count}
            onClick={() => setPage((p) => p + 1)}
            className={`px-4 py-2 rounded-lg ${(page * 10 >= count) ? "bg-neutral-700" : "bg-neutral-600 hover:bg-neutral-700"} text-white`}
          >
            Next
          </button>
        </div>
      )}

      {plans.length === 0 && !loading && (
        <div className="text-center text-neutral-400 mt-20">
          <p className="text-xl">No payment plans found.</p>
        </div>
      )}

      {/* Add New Plan Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-neutral-800 p-6 rounded-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4 text-white">
              {editPlan ? "Edit Payment Plan" : "Add New Payment Plan"}
            </h2>

            <PlanForm
              initial={editPlan}
              onClose={() => {
                setModalOpen(false);
                setEditPlan(null);
              }}
              onSuccess={() => {
                setModalOpen(false);
                setEditPlan(null);
                toast.success(`Plan ${editPlan ? "updated" : "created"} successfully.`);
                fetchPlans();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const PlanCardSkeleton = () => (
  <div className="bg-neutral-800 p-6 rounded-lg border border-neutral-700 animate-pulse">
    <SkeletonLoader className="h-6 w-32 bg-neutral-700 mb-4" />
    <SkeletonLoader className="h-4 w-full bg-neutral-700 mb-3" />
    <SkeletonLoader className="h-4 w-1/2 bg-neutral-700 mb-6" />
    
    <SkeletonLoader className="h-8 w-20 bg-neutral-700 mb-4" />

    <div className="space-y-2">
      <SkeletonLoader className="h-4 w-40 bg-neutral-700" />
      <SkeletonLoader className="h-4 w-28 bg-neutral-700" />
      <SkeletonLoader className="h-4 w-32 bg-neutral-700" />
      <SkeletonLoader className="h-4 w-24 bg-neutral-700" />
    </div>

    <SkeletonLoader className="h-10 w-full bg-neutral-700 mt-5 rounded" />
  </div>
);

export default PaymentPlansPage;