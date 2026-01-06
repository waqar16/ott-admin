"use client";

import { useState } from "react";
import { FAQ } from "@/lib/faq";
import { createFaq, updateFaq } from "@/lib/faq";
import { toast } from "sonner";

type Props = {
  faq?: FAQ | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function FaqForm({ faq, onClose, onSuccess }: Props) {
  const isEdit = Boolean(faq);

  const [question, setQuestion] = useState(faq?.question || "");
  const [answer, setAnswer] = useState(faq?.answer || "");
  const [isActive, setIsActive] = useState(faq?.is_active ?? true);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!question || !answer) {
      toast.error("Question and answer are required");
      return;
    }

    setLoading(true);

    const payload = {
      question,
      answer,
      is_active: isActive,
    };

    const status = isEdit
      ? await updateFaq({ ...payload, id: faq!.id })
      : await createFaq(payload);

    if (status === 200 || status === 201) {
      toast.success(isEdit ? "FAQ updated" : "FAQ created");
      onSuccess();
      onClose();
    } else {
      toast.error("Something went wrong");
    }

    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-neutral-900 rounded-xl p-6 w-full max-w-lg border border-neutral-800">
        <h3 className="text-xl font-semibold mb-4">
          {isEdit ? "Edit FAQ" : "Create FAQ"}
        </h3>

        <div className="space-y-4">
          {/* Question */}
          <div>
            <label className="text-sm text-gray-400">Question</label>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-black border border-neutral-700 rounded"
              placeholder="Enter FAQ question"
            />
          </div>

          {/* Answer */}
          <div>
            <label className="text-sm text-gray-400">Answer</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={4}
              className="w-full mt-1 px-3 py-2 bg-black border border-neutral-700 rounded"
              placeholder="Enter FAQ answer"
            />
          </div>

          {/* Active */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isActive}
              onChange={() => setIsActive(!isActive)}
            />
            <span className="text-sm text-gray-300">Active</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 rounded"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isEdit ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
