"use client";

import { useEffect, useState } from "react";
import { BiRefresh } from "react-icons/bi";
import { toast } from "sonner";

import SkeletonLoader from "@/components/Loader/SkeletonLoader"; 
import { FAQ , getFaqs, deleteFaq} from "@/lib/faq";
import FaqForm from "@/components/FaqForm/FaqForm";
export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [editFaq, setEditFaq] = useState<FAQ | null>(null);
const [showCreate, setShowCreate] = useState(false);

  const [loading, setLoading] = useState(true);
  const [faqToDelete, setFaqToDelete] = useState<FAQ | null>(null);

  async function fetchFaqs() {
    setLoading(true);
    const res = await getFaqs();
    setFaqs(res);
    setLoading(false);
  }

  useEffect(() => {
    fetchFaqs();
  }, []);

  return (
    <div className="p-6 text-white space-y-6 bg-black">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">FAQs Management</h1>
          <p className="text-gray-400">Manage platform frequently asked questions</p>
        </div>
 
      </div>
<div className="flex gap-3">
  <button
    onClick={() => setShowCreate(true)}
    className="px-4 py-2 bg-blue-600 rounded"
  >
    + Add FAQ
  </button>

  <button
    onClick={fetchFaqs}
    className="p-2 rounded-md bg-neutral-800 flex items-center"
  >
    Refresh <BiRefresh className="ml-1" />
  </button>
</div>

      {/* Table */}
      <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
        <h2 className="text-xl font-semibold mb-4">All FAQs</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="p-3">Question</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading
                ? [1, 2, 3].map((i) => (
                    <tr key={i} className="border-b border-neutral-800">
                      <td className="p-3">
                        <SkeletonLoader className="h-6 w-64 bg-neutral-800" />
                      </td>
                      <td className="p-3">
                        <SkeletonLoader className="h-6 w-20 bg-neutral-800" />
                      </td>
                      <td className="p-3 text-right">
                        <SkeletonLoader className="h-8 w-24 bg-neutral-800 ml-auto" />
                      </td>
                    </tr>
                  ))
                : faqs.map((faq) => (
                    <tr
                      key={faq.id}
                      className="border-b border-gray-700 hover:bg-gray-700/40"
                    >
                      <td className="p-3">
                        <p className="font-medium">{faq.question}</p>
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {faq.answer}
                        </p>
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            faq.is_active
                              ? "bg-green-600/30 text-green-400"
                              : "bg-red-600/30 text-red-400"
                          }`}
                        >
                          {faq.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="flex justify-end gap-3">
                         <button
  onClick={() => setEditFaq(faq)}
  className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700"
>
  Edit
</button>

                          <button
                            onClick={() => setFaqToDelete(faq)}
                            className="px-3 py-1 bg-red-600 rounded hover:bg-red-700"
                          >
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

      {/* Delete Modal */}
      {faqToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">Delete FAQ?</h3>
            <p className="text-sm text-gray-400 mb-4">
              Are you sure you want to delete this FAQ?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setFaqToDelete(null)}
                className="px-4 py-2 bg-gray-800 rounded"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const status = await deleteFaq(faqToDelete);
                  if (status === 200 || status === 204) {
                    setFaqs((prev) =>
                      prev.filter((f) => f.id !== faqToDelete.id)
                    );
                    toast.success("FAQ deleted successfully");
                  } else {
                    toast.error("Failed to delete FAQ");
                  }
                  setFaqToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
  <FaqForm
    onClose={() => setShowCreate(false)}
    onSuccess={fetchFaqs}
  />
)}

{editFaq && (
  <FaqForm
    faq={editFaq}
    onClose={() => setEditFaq(null)}
    onSuccess={fetchFaqs}
  />
)}

    </div>
  );
}
