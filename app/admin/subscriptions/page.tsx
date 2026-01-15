"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../../lib/config";
import SkeletonLoader from "@/components/Loader/SkeletonLoader";

interface Subscription {
  id: string;
  user: string;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
  plan: {
    id: string;
    name: string;
    price: number;
  };
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Subscription[];
}

const SubscriptionPage = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  const [filters, setFilters] = useState({
    user: "",
    plan: "",
    status: "",
  });

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);

      const res = await axios.get<ApiResponse>(
        `${API_BASE}api/v1/payments/subscriptions`
        
        // `${API_BASE}api/v1/payments/subscriptions/?page=${page}&user=${filters.user}&plan=${filters.plan}&status=${filters.status}`
      );

      setSubscriptions(res.data.results);
      setCount(res.data.count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [page, filters]);

  return (
    <div className="mt-16 md:mt-0 p-2 md:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">User Subscriptions</h1>
      </div>

      {/* Filters */}
      <div className="bg-neutral-900 p-4 rounded-lg mb-6">
        <h2 className="text-lg text-neutral-300 font-semibold mb-3">Filters</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* User ID */}
          <input
            type="text"
            placeholder="Filter by User ID"
            value={filters.user}
            onChange={(e) =>
              setFilters({ ...filters, user: e.target.value })
            }
            className="px-4 py-2 bg-neutral-800 text-white rounded-lg"
          />

          {/* Plan ID */}
          <input
            type="text"
            placeholder="Filter by Plan ID"
            value={filters.plan}
            onChange={(e) =>
              setFilters({ ...filters, plan: e.target.value })
            }
            className="px-4 py-2 bg-neutral-800 text-white rounded-lg"
          />

          {/* Status */}
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }
            className="px-4 py-2 bg-neutral-800 text-white rounded-lg"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <>
            <SubscriptionCardSkeleton />
            <SubscriptionCardSkeleton />
            <SubscriptionCardSkeleton />
          </>
        ) : subscriptions.length === 0 ? (
          <p className="text-neutral-400">No subscriptions found.</p>
        ) : (
          subscriptions.map((sub) => (
            <div
              key={sub.id}
              className="bg-neutral-800 p-6 rounded-lg border border-neutral-700 shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2">
                {sub.plan?.name}
              </h3>

              <p className="text-neutral-300">
                Price: <span className="font-bold">${sub.plan.price}</span>
              </p>

              <p className="text-neutral-300 mt-1">
                User: <span className="text-white">{sub.user}</span>
              </p>

              <p className="text-neutral-300 mt-1">
                Status:{" "}
                <span
                  className={`font-bold ${
                    sub.status === "active"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {sub.status}
                </span>
              </p>

              <p className="text-neutral-400 text-sm mt-3">
                Start: {new Date(sub.start_date).toLocaleDateString()}
              </p>
              <p className="text-neutral-400 text-sm">
                End: {new Date(sub.end_date).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className={`px-4 py-2 rounded-lg ${
            page === 1
              ? "bg-neutral-800"
              : "bg-neutral-700 hover:bg-neutral-600"
          } text-white`}
        >
          Previous
        </button>

        <span className="text-white">Page {page}</span>

        <button
          disabled={page * 10 >= count}
          onClick={() => setPage((p) => p + 1)}
          className={`px-4 py-2 rounded-lg ${
            page * 10 >= count
              ? "bg-neutral-800"
              : "bg-neutral-700 hover:bg-neutral-600"
          } text-white`}
        >
          Next
        </button>
      </div>
    </div>
  );
};
const SubscriptionCardSkeleton = () => (
  <div className="bg-neutral-800 p-6 rounded-lg border border-neutral-700 animate-pulse">
    <SkeletonLoader className="h-6 w-36 bg-neutral-700 mb-4" />
    <SkeletonLoader className="h-4 w-24 bg-neutral-700 mb-3" />
    <SkeletonLoader className="h-4 w-44 bg-neutral-700 mb-3" />
    <SkeletonLoader className="h-4 w-28 bg-neutral-700 mb-3" />
    <SkeletonLoader className="h-4 w-40 bg-neutral-700 mt-5" />
  </div>
);

export default SubscriptionPage;
