"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE, USE_MOCK_DATA, logMockDataUsage } from '../../../lib/config'
import SkeletonLoader from "@/components/Loader/SkeletonLoader";
import { toast } from "sonner";
import { BiEdit, BiTrash } from "react-icons/bi";
interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  max_devices: number;
  max_profiles: number;
  ad_supported: boolean;
  stripe_price_id: string;
  is_active: boolean;
  created_at: string;
}

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
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<PaymentPlan | null>(null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmPlantDeletion, setConfirmPlantDeletion] = useState(false);

  // Delete plan by id
  const deletePlan = async (id: string) => {
    
    try {
      await axios.delete(`${API_BASE}api/v1/payments/plans/${id}/`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('access_token')}`
        }
      });
      fetchPlans();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete plan.");
    }
  };

 const fetchPlans = async () => {
  try {
    setLoading(true);

    const response = await axios.get<ApiResponse>(
      `${API_BASE}api/v1/payments/plans/?page=${page}&search=${filters.search || ""}&is_active=${filters.is_active ?? ""}&ad_supported=${filters.ad_supported ?? ""}`
    );

    setPlans(response.data.results);
    setCount(response.data.count);

  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);      // ← stop skeleton
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
            toast.success("Plan deleted successfully.");
          }}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
        >
          Confirm
        </button>
      </div>
    </div>
  ));
};

  return (
    <div className="md:p-6 p-2 mt-16 md:mt-0 min-h-screen bg-black">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className=" text-2xl md:text-3xl font-bold text-white">Payment Plans</h1>

        <button
          onClick={() => setModalOpen(true)}
          className="px-3 md:px-5 py-2 md:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg  text-sm md:text-md"
        >
          + Add New Payment Plan
        </button>
      </div>

      {/* Filters */}
      <div className="  bg-neutral-900 p-4 rounded-lg mb-6">
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
    // Show 3 skeleton cards
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
          className="absolute top-3 right-3 text-red-400   p-1 rounded-full  transition"
        >
          <BiTrash className="w-5 h-5"/>
        </button>
        <button
 onClick={() => {
            setModalOpen(true);
            setEditPlan(plan);
          }}
          title="Delete Plan"
          className="absolute top-3 right-9 text-neutral-400   p-1 rounded-full  transition"
        >
          <BiEdit className="w-5 h-5"/>
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
      {plans && plans.length > 0 &&   !(page * 10 >= count) &&  <div className="flex justify-center items-center gap-4 mt-8">

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

      </div>}
{plans.length === 0 && !loading && (
  <div className="text-center text-neutral-400 mt-20">
    <p className="text-xl">No payment plans found.</p>
    
  </div>
) }
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
const PlanForm = ({
  initial,
  onSuccess,
  onClose,
}: {
  initial?: PaymentPlan | null;
  onSuccess: () => void;
  onClose: () => void;
}) => {
  const [form, setForm] = useState({
    name: initial?.name || "",
    description: initial?.description || "",
    price: initial?.price || "",
    duration_days: initial?.duration_days || "",
    max_devices: initial?.max_devices || "",
    max_profiles: initial?.max_profiles || "",
    ad_supported: initial?.ad_supported || false,
    is_active: initial?.is_active ?? true,
  });

  const [loading, setLoading] = useState(false);

  const update = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (initial) {
        // 🔥 UPDATE
        await axios.put(`${API_BASE}api/v1/payments/plans/${initial.id}/`, form,{headers:{
          Authorization:`Bearer ${Cookies.get('access_token')}`
        }});
      } else {
        // ➕ CREATE NEW
        await axios.post(`${API_BASE}api/v1/payments/plans/`, form,{headers:{
          Authorization:`Bearer ${Cookies.get('access_token')}`
        }});
      }

      onSuccess();
    } catch (error:any) {
      console.error(error);
        const message =
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      "Something went wrong. Please try again.";

    toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-4">

        <input
          type="text"
          placeholder="Plan Name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          className="w-full px-4 py-2 bg-neutral-700 text-white rounded-lg 
             outline-none focus:outline-none 
             focus:ring-0 focus:border-none"
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
           className="w-full px-4 py-2 bg-neutral-700 text-white rounded-lg 
             outline-none focus:outline-none 
             focus:ring-0 focus:border-none"
        />

        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => update("price", parseFloat(e.target.value))}
           className="w-full px-4 py-2 bg-neutral-700 text-white rounded-lg 
             outline-none focus:outline-none 
             focus:ring-0 focus:border-none"
        />

        <input
          type="number"
          placeholder="Duration (days)"
          value={form.duration_days}
          onChange={(e) => update("duration_days", Number(e.target.value))}
           className="w-full px-4 py-2 bg-neutral-700 text-white rounded-lg 
             outline-none focus:outline-none 
             focus:ring-0 focus:border-none"
        />

        <input
          type="number"
          placeholder="Max Devices"
          value={form.max_devices}
          onChange={(e) => update("max_devices", Number(e.target.value))}
          className="w-full px-4 py-2 bg-neutral-700 text-white rounded-lg 
             outline-none focus:outline-none 
             focus:ring-0 focus:border-none"
        />

        <input
          type="number"
          placeholder="Max Profiles"
          value={form.max_profiles}
          onChange={(e) => update("max_profiles", Number(e.target.value))}
           className="w-full px-4 py-2 bg-neutral-700 text-white rounded-lg 
             outline-none focus:outline-none 
             focus:ring-0 focus:border-none"
        />

        {/* Ad Supported */}
        <select
          value={form.ad_supported ? "true" : "false"}
          onChange={(e) => update("ad_supported", e.target.value === "true")}
           className="w-full px-4 py-2 bg-neutral-700 text-white rounded-lg 
             outline-none focus:outline-none 
             focus:ring-0 focus:border-none"
        >
          <option value="false">No Ads</option>
          <option value="true">Ad Supported</option>
        </select>

        {/* Active */}
        <select
          value={form.is_active ? "true" : "false"}
          onChange={(e) => update("is_active", e.target.value === "true")}
           className="w-full px-4 py-2 bg-neutral-700 text-white rounded-lg 
             outline-none focus:outline-none 
             focus:ring-0 focus:border-none"
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-neutral-600 hover:bg-neutral-700 text-white rounded-lg"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg ${
            loading ? "opacity-50" : ""
          }`}
        >
          {loading ? "Saving..." : initial ? "Update Plan" : "Create Plan"}
        </button>
      </div>
    </>
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
 