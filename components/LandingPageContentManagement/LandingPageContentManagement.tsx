import React, { useState, useEffect } from 'react'
import {
  getLandingPageContent,
  createLandingPageContent,
  updateLandingPageContent,
  deleteLandingPageContent,
  LandingPageContent,
  CreateLandingPageContentRequest,
  UpdateLandingPageContentRequest,
} from '../api/contentApi'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Card } from '../components/ui/Card'
import { toast } from 'react-hot-toast'

export default function LandingPageContentManagement() {
  const [content, setContent] = useState<LandingPageContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState<CreateLandingPageContentRequest>({
    main_text: '',
    sub_text: '',
    description: '',
    button_text: '',
  })

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setLoading(true)
      const data = await getLandingPageContent()
      setContent(data)
      setFormData({
        main_text: data.main_text,
        sub_text: data.sub_text,
        description: data.description,
        button_text: data.button_text,
      })
      setIsCreating(false)
    } catch (error: any) {
      if (error.response?.status === 404) {
        setIsCreating(true)
        setContent(null)
      } else {
        toast.error('Failed to load landing page content')
        console.error('Error fetching content:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateLandingPageContentRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      if (isCreating) {
        await createLandingPageContent(formData)
        toast.success('Landing page content created successfully')
      } else if (content) {
        const updateData: UpdateLandingPageContentRequest = {}
        if (formData.main_text !== content.main_text) updateData.main_text = formData.main_text
        if (formData.sub_text !== content.sub_text) updateData.sub_text = formData.sub_text
        if (formData.description !== content.description)
          updateData.description = formData.description
        if (formData.button_text !== content.button_text)
          updateData.button_text = formData.button_text

        await updateLandingPageContent(content.id, updateData)
        toast.success('Landing page content updated successfully')
      }
      setIsEditing(false)
      fetchContent()
    } catch (error) {
      toast.error('Failed to save landing page content')
      console.error('Error saving content:', error)
    }
  }

  const handleDelete = async () => {
    if (!content || !window.confirm('Are you sure you want to delete this content?')) return

    try {
      await deleteLandingPageContent(content.id)
      toast.success('Landing page content deleted successfully')
      fetchContent()
    } catch (error) {
      toast.error('Failed to delete landing page content')
      console.error('Error deleting content:', error)
    }
  }

  const handleCancel = () => {
    if (content) {
      setFormData({
        main_text: content.main_text,
        sub_text: content.sub_text,
        description: content.description,
        button_text: content.button_text,
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Landing Page Content</h1>
        <p className="text-gray-600">Manage the main content displayed on your landing page</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Main Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Main Text</label>
            {editMode ? (
              <Input
                value={formData.main_text}
                onChange={(e) => handleInputChange('main_text', e.target.value)}
                placeholder="Enter main heading text"
                className="w-full"
              />
            ) : (
              <p className="text-gray-900 text-lg font-semibold">
                {content?.main_text || 'Not set'}
              </p>
            )}
          </div>

          {/* Sub Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sub Text</label>
            {editMode ? (
              <Input
                value={formData.sub_text}
                onChange={(e) => handleInputChange('sub_text', e.target.value)}
                placeholder="Enter sub-heading text"
                className="w-full"
              />
            ) : (
              <p className="text-gray-700">{content?.sub_text || 'Not set'}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            {editMode ? (
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter description text"
                rows={4}
                className="w-full"
              />
            ) : (
              <p className="text-gray-700">{content?.description || 'Not set'}</p>
            )}
          </div>

          {/* Button Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
            {editMode ? (
              <Input
                value={formData.button_text}
                onChange={(e) => handleInputChange('button_text', e.target.value)}
                placeholder="Enter button text"
                className="w-full"
              />
            ) : (
              <p className="text-gray-700">{content?.button_text || 'Not set'}</p>
            )}
          </div>

          {/* Updated At */}
          {content && !editMode && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Last updated: {new Date(content.updated_at).toLocaleString()}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
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
        </div>
      </Card>
    </div>
  )
}
