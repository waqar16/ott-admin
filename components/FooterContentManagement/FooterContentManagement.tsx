'use client'
import React, { useState, useEffect } from 'react'
import { SettingInput } from '../SettingInput/SettingInput'
import {
  getFooterContent,
  createFooterContent,
  updateFooterContent,
  deleteFooterContent,
  FooterContent,
  CreateFooterContentRequest,
  UpdateFooterContentRequest,
} from '../../lib/additionalSettingsApi'

import { Card } from '../Card'
import { toast } from 'sonner'
import { Button } from '../Button'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium text-neutral-300">{label}</label>}

      <input
        {...props}
        className={`w-full rounded-md bg-neutral-950 border border-neutral-800 px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-700 ${className}`}
      />
    </div>
  )
}
export default function FooterContentManagement() {
  const [content, setContent] = useState<FooterContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState<CreateFooterContentRequest>({
    text_1: '',
    text_2: '',
    social_links: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: '',
    },
    other_links: {
      privacy: '',
      terms: '',
      contact: '',
    },
  })

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setLoading(true)
      const data = await getFooterContent()
      setContent(data)
      setFormData({
        text_1: data.text_1,
        text_2: data.text_2,
        social_links: data.social_links || {
          facebook: '',
          twitter: '',
          linkedin: '',
          instagram: '',
        },
        other_links: data.other_links || {
          privacy: '',
          terms: '',
          contact: '',
        },
      })
      setIsCreating(false)
    } catch (error: any) {
      if (error.response?.status === 404) {
        setIsCreating(true)
        setContent(null)
      } else {
        toast.error('Failed to load footer content')
        console.error('Error fetching content:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: 'text_1' | 'text_2', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value,
      },
    }))
  }

  const handleOtherLinkChange = (linkType: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      other_links: {
        ...prev.other_links,
        [linkType]: value,
      },
    }))
  }

  const handleSave = async () => {
    try {
      if (isCreating) {
        await createFooterContent(formData)
        toast.success('Footer content created successfully')
      } else if (content) {
        const updateData: UpdateFooterContentRequest = {}

        if (formData.text_1 !== content.text_1) updateData.text_1 = formData.text_1
        if (formData.text_2 !== content.text_2) updateData.text_2 = formData.text_2

        if (JSON.stringify(formData.social_links) !== JSON.stringify(content.social_links)) {
          updateData.social_links = formData.social_links
        }

        if (JSON.stringify(formData.other_links) !== JSON.stringify(content.other_links)) {
          updateData.other_links = formData.other_links
        }

        await updateFooterContent(content.id, updateData)
        toast.success('Footer content updated successfully')
      }
      setIsEditing(false)
      fetchContent()
    } catch (error) {
      toast.error('Failed to save footer content')
      console.error('Error saving content:', error)
    }
  }

  const handleDelete = async () => {
    if (!content || !window.confirm('Are you sure you want to delete this content?')) return

    try {
      await deleteFooterContent(content.id)
      toast.success('Footer content deleted successfully')
      fetchContent()
    } catch (error) {
      toast.error('Failed to delete footer content')
      console.error('Error deleting content:', error)
    }
  }

  const handleCancel = () => {
    if (content) {
      setFormData({
        text_1: content.text_1,
        text_2: content.text_2,
        social_links: content.social_links || {
          facebook: '',
          twitter: '',
          linkedin: '',
          instagram: '',
        },
        other_links: content.other_links || {
          privacy: '',
          terms: '',
          contact: '',
        },
      })
    }
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const editMode = isEditing || isCreating

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Footer Content</h1>
        <p className="text-gray-600">Manage the content and links displayed in your site footer</p>
      </div>

      <div className="space-y-6">
        {/* Basic Text Content */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Footer Text</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text 1 (Copyright/Year)
              </label>
              {editMode ? (
                <SettingInput label="Text 1 (Copyright/Year)">
                  <input
                    type="text"
                    value={formData.text_1}
                    onChange={(e) => handleInputChange('text_1', e.target.value)}
                    disabled={loading}
                    className="w-full rounded-md bg-neutral-950 border border-neutral-800 px-3 py-2"
                    placeholder="e.g., © 2026 Urview"
                  />
                </SettingInput>
              ) : (
                <p className="text-gray-700">{content?.text_1 || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text 2 (Rights Statement)
              </label>
              {editMode ? (
                <Input
                  value={formData.text_2}
                  onChange={(e) => handleInputChange('text_2', e.target.value)}
                  placeholder="e.g., All rights reserved"
                  className="w-full"
                />
              ) : (
                <p className="text-gray-700">{content?.text_2 || 'Not set'}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Social Links */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Social Media Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
              {editMode ? (
                <Input
                  value={formData.social_links?.facebook || ''}
                  onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                  className="w-full"
                />
              ) : (
                <p className="text-gray-700 truncate">
                  {content?.social_links?.facebook || 'Not set'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
              {editMode ? (
                <Input
                  value={formData.social_links?.twitter || ''}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/yourhandle"
                  className="w-full"
                />
              ) : (
                <p className="text-gray-700 truncate">
                  {content?.social_links?.twitter || 'Not set'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
              {editMode ? (
                <Input
                  value={formData.social_links?.linkedin || ''}
                  onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/company/yourcompany"
                  className="w-full"
                />
              ) : (
                <p className="text-gray-700 truncate">
                  {content?.social_links?.linkedin || 'Not set'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
              {editMode ? (
                <Input
                  value={formData.social_links?.instagram || ''}
                  onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/yourhandle"
                  className="w-full"
                />
              ) : (
                <p className="text-gray-700 truncate">
                  {content?.social_links?.instagram || 'Not set'}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Other Links */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Other Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Privacy Policy</label>
              {editMode ? (
                <Input
                  value={formData.other_links?.privacy || ''}
                  onChange={(e) => handleOtherLinkChange('privacy', e.target.value)}
                  placeholder="/privacy"
                  className="w-full"
                />
              ) : (
                <p className="text-gray-700 truncate">
                  {content?.other_links?.privacy || 'Not set'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Terms of Service
              </label>
              {editMode ? (
                <Input
                  value={formData.other_links?.terms || ''}
                  onChange={(e) => handleOtherLinkChange('terms', e.target.value)}
                  placeholder="/terms"
                  className="w-full"
                />
              ) : (
                <p className="text-gray-700 truncate">{content?.other_links?.terms || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact</label>
              {editMode ? (
                <Input
                  value={formData.other_links?.contact || ''}
                  onChange={(e) => handleOtherLinkChange('contact', e.target.value)}
                  placeholder="/contact"
                  className="w-full"
                />
              ) : (
                <p className="text-gray-700 truncate">
                  {content?.other_links?.contact || 'Not set'}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Updated At & Actions */}
        <Card className="p-6">
          {content && !editMode && (
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Last updated: {new Date(content.updated_at).toLocaleString()}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            {editMode ? (
              <>
                <Button onClick={handleSave} variant="primary">
                  {isCreating ? 'Create' : 'Save Changes'}
                </Button>
                {!isCreating && (
                  <Button onClick={handleCancel} variant="secondary">
                    Cancel
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button onClick={() => setIsEditing(true)} variant="primary">
                  Edit Content
                </Button>
                {content && (
                  <Button onClick={handleDelete} variant="danger">
                    Delete Content
                  </Button>
                )}
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
