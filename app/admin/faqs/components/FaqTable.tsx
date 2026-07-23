'use client'

import React from 'react'
import { FAQ } from '@/lib/faq'
import { FiEdit2, FiTrash2, FiHelpCircle } from 'react-icons/fi'

interface FaqTableProps {
  faqs: FAQ[]
  onEdit: (faq: FAQ) => void
  onDelete: (faq: FAQ) => void
}

export const FaqTable: React.FC<FaqTableProps> = ({ faqs, onEdit, onDelete }) => {
  return (
    <div className="hidden md:block overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-muted-foreground text-xs uppercase font-semibold tracking-wider sticky top-0 backdrop-blur-md">
              <th className="py-3.5 px-4 w-5/12">Question & Preview</th>
              <th className="py-3.5 px-4 w-4/12">Answer Content</th>
              <th className="py-3.5 px-4 w-2/12">Status</th>
              <th className="py-3.5 px-4 text-right w-1/12">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {faqs.map((faq) => (
              <tr
                key={faq.id}
                className="hover:bg-accent/40 transition-colors duration-150 group align-top"
              >
                {/* Question Title */}
                <td className="py-4 px-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5 shrink-0">
                      <FiHelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-foreground block group-hover:text-primary transition-colors leading-snug">
                        {faq.question}
                      </span>
                      <span className="text-[11px] text-muted-foreground mt-0.5 block">
                        ID: #{faq.id}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Answer Preview */}
                <td className="py-4 px-4">
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {faq.answer}
                  </p>
                </td>

                {/* Status Pill */}
                <td className="py-4 px-4">
                  {faq.is_active ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
                      Inactive
                    </span>
                  )}
                </td>

                {/* Action Buttons */}
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onEdit(faq)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                      title="Edit FAQ"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDelete(faq)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete FAQ"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
