'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import CreatorDrawer from '@/components/Creator/CreatorDrawer'
import FaqForm from '@/components/FaqForm/FaqForm'
import { FAQ, getFaqs, deleteFaq } from '@/lib/faq'

import { FaqPageHeader } from './components/FaqPageHeader'
import { FaqStatsCards } from './components/FaqStatsCards'
import { FaqSearchFilter } from './components/FaqSearchFilter'
import { FaqTable } from './components/FaqTable'
import { FaqCardMobile } from './components/FaqCardMobile'
import { DeleteFaqDialog } from './components/DeleteFaqDialog'
import { EmptyFaqState } from './components/EmptyFaqState'
import { FaqTableSkeleton } from './components/FaqTableSkeleton'

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [editFaq, setEditFaq] = useState<FAQ | null>(null)
  const [showCreate, setShowCreate] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [faqToDelete, setFaqToDelete] = useState<FAQ | null>(null)

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedFilter, setSelectedFilter] = useState<string>('all')

  async function fetchFaqs() {
    try {
      setLoading(true)
      const res = await getFaqs()
      if (Array.isArray(res)) {
        setFaqs(res)
      } else {
        setFaqs([])
      }
    } catch (err) {
      console.error('Error fetching FAQs:', err)
      toast.error('Failed to load FAQs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFaqs()
  }, [])

  const handleDeleteConfirm = async (targetFaq: FAQ) => {
    try {
      const status = await deleteFaq(targetFaq)
      if (status === 200 || status === 204) {
        setFaqs((prev) => prev.filter((f) => f.id !== targetFaq.id))
        toast.success('FAQ deleted successfully')
      } else {
        toast.error('Failed to delete FAQ')
      }
    } catch (err) {
      console.error('Error deleting FAQ:', err)
      toast.error('Failed to delete FAQ')
    } finally {
      setFaqToDelete(null)
    }
  }

  const handleCloseDrawer = () => {
    setShowCreate(false)
    setEditFaq(null)
  }

  // Client-side Filter & Search logic
  const filteredFaqs = faqs.filter((faq) => {
    const query = searchQuery.toLowerCase().trim()
    const matchesSearch =
      query === '' ||
      (faq.question && faq.question.toLowerCase().includes(query)) ||
      (faq.answer && faq.answer.toLowerCase().includes(query))

    if (!matchesSearch) return false

    if (selectedFilter === 'all') return true
    if (selectedFilter === 'active') return faq.is_active === true
    if (selectedFilter === 'inactive') return faq.is_active === false

    return true
  })

  if (loading && faqs.length === 0) {
    return <FaqTableSkeleton />
  }

  const isDrawerOpen = showCreate || Boolean(editFaq)

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto min-h-screen bg-background text-foreground"
    >
      {/* Header */}
      <FaqPageHeader
        onRefresh={fetchFaqs}
        onAddFaq={() => setShowCreate(true)}
        loading={loading}
        totalFaqsCount={faqs.length}
      />

      {/* Analytics KPI Cards */}
      <FaqStatsCards faqs={faqs} />

      {/* Client-side Search & Filter Bar */}
      <FaqSearchFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        totalResults={filteredFaqs.length}
        totalFaqs={faqs.length}
      />

      {/* FAQ Data View (Desktop Table + Mobile Cards) */}
      {filteredFaqs.length > 0 ? (
        <>
          <FaqTable
            faqs={filteredFaqs}
            onEdit={(faq) => setEditFaq(faq)}
            onDelete={(faq) => setFaqToDelete(faq)}
          />
          <FaqCardMobile
            faqs={filteredFaqs}
            onEdit={(faq) => setEditFaq(faq)}
            onDelete={(faq) => setFaqToDelete(faq)}
          />
        </>
      ) : (
        <EmptyFaqState
          onAddFaq={() => setShowCreate(true)}
          hasQuery={Boolean(searchQuery || selectedFilter !== 'all')}
          onClearQuery={() => {
            setSearchQuery('')
            setSelectedFilter('all')
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteFaqDialog
        faq={faqToDelete}
        onClose={() => setFaqToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Slide-over Drawer for Create & Edit FAQ */}
      <CreatorDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={showCreate ? 'Create FAQ' : 'Edit FAQ'}
        description={
          showCreate
            ? 'Create a new frequently asked question for the platform.'
            : 'Update an existing frequently asked question.'
        }
      >
        {isDrawerOpen && (
          <FaqForm
            faq={editFaq}
            onClose={handleCloseDrawer}
            onSuccess={fetchFaqs}
          />
        )}
      </CreatorDrawer>
    </motion.div>
  )
}
