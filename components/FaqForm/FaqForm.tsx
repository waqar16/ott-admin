'use client'

import React, { useState } from 'react'
import { FAQ, createFaq, updateFaq } from '@/lib/faq'
import { toast } from 'sonner'
import { FiRefreshCw } from 'react-icons/fi'

type Props = {
  faq?: FAQ | null
  onClose: () => void
  onSuccess: () => void
}

export default function FaqForm({ faq, onClose, onSuccess }: Props) {
  const isEdit = Boolean(faq)

  const [question, setQuestion] = useState(faq?.question || '')
  const [answer, setAnswer] = useState(faq?.answer || '')
  const [isActive, setIsActive] = useState(faq?.is_active ?? true)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!question || !question.trim() || !answer || !answer.trim()) {
      toast.error('Question and answer are required')
      return
    }

    setLoading(true)

    const payload = {
      question: question.trim(),
      answer: answer.trim(),
      is_active: isActive,
    }

    try {
      const status = isEdit && faq?.id ? await updateFaq({ ...payload, id: faq.id }) : await createFaq(payload)

      if (status === 200 || status === 201) {
        toast.success(isEdit ? 'FAQ updated' : 'FAQ created')
        onSuccess()
        onClose()
      } else {
        toast.error('Something went wrong')
      }
    } catch (err) {
      console.error('Error submitting FAQ form:', err)
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col justify-between overflow-y-auto p-6 sm:p-8 bg-background text-foreground space-y-6">
      <div className="space-y-6 flex-1">
        {/* Question Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Question <span className="text-rose-500">*</span>
          </label>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-background border border-input text-foreground rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground"
            placeholder="Enter FAQ question (e.g., How do I reset my password?)"
          />
        </div>

        {/* Answer Textarea */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Answer Details <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={6}
            className="w-full px-3.5 py-2.5 bg-background border border-input text-foreground rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground resize-y"
            placeholder="Provide a clear, detailed answer..."
          />
        </div>

        {/* Active Toggle Switch / Checkbox */}
        <div className="p-4 rounded-xl border border-border/80 bg-card/60 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-sm font-semibold text-foreground block">
              Publish Status
            </span>
            <span className="text-xs text-muted-foreground block">
              Make this FAQ visible immediately in user support sections.
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={() => setIsActive(!isActive)}
              className="peer sr-only"
            />

            <div
              className="
      relative h-6 w-11 rounded-full
      border border-border
      bg-muted
      transition-colors duration-200

      peer-checked:bg-primary
      peer-checked:border-primary

      after:absolute
      after:left-0.5
      after:top-0.4
      after:h-5
      after:w-5
      after:rounded-full
      after:bg-background
      after:border
      after:border-border
      after:shadow-sm
      after:transition-all
      after:duration-200
      after:content-['']

      peer-checked:after:translate-x-5
      peer-checked:after:border-primary/20
    "
            />
          </label>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-6 border-t border-border/60 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2.5 text-sm font-semibold rounded-lg text-foreground bg-accent hover:bg-accent/80 border border-border transition-all cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={handleSubmit}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <>
              <FiRefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>{isEdit ? 'Update FAQ' : 'Create FAQ'}</span>
          )}
        </button>
      </div>
    </div>
  )
}
