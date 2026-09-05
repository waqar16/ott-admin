'use client'

import React from 'react'
import { FAQ } from '@/lib/faq'
import { FiEdit2, FiTrash2, FiHelpCircle } from 'react-icons/fi'

interface FaqCardMobileProps {
  faqs: FAQ[]
  onEdit: (faq: FAQ) => void
  onDelete: (faq: FAQ) => void
}

export const FaqCardMobile: React.FC<FaqCardMobileProps> = ({ faqs, onEdit, onDelete }) => {
  return (
    <div className="md:hidden space-y-3">
      {faqs.map((faq) => (
        <div
          key={faq.id}
          className="bg-card border border-border/80 rounded-xl p-4 shadow-sm space-y-3 hover:border-primary/30 transition-all"
        >
          <div className="flex items-start justify-between border-b border-border/40 pb-3 gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary mt-0.5 shrink-0">
                <FiHelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm leading-snug">
                  {faq.question}
                </h3>
              </div>
            </div>

            {faq.is_active ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground border border-border shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
                Inactive
              </span>
            )}
          </div>

          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
            {faq.answer}
          </p>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
            <button
              onClick={() => onEdit(faq)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent hover:bg-accent/80 text-foreground border border-border transition-colors cursor-pointer"
            >
              <FiEdit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => onDelete(faq)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
