import React, { useState, useEffect } from 'react'
import {
  getLoginScreenContent,
  createLoginScreenContent,
  updateLoginScreenContent,
  deleteLoginScreenContent,
  LoginScreenContent,
  CreateLoginScreenContentRequest,
  UpdateLoginScreenContentRequest,
} from '../api/contentApi'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Card } from '../components/ui/Card'
import { toast } from 'react-hot-toast'

export default function LoginScreenContentManagement() {
  const [content, setContent] = useState<LoginScreenContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState<CreateLoginScreenContentRequest>({
    tag: '',
    title: '',
    description: '',
    text_position_1: '',
    text_position_2: '',
  })

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setLoading(true)
      const data = await getLoginScreenContent()
      setContent(data)
      setFormData({
        tag: data.tag,
        title: data.title,
        description: data.description,
        text_position_1: data.text_position_1,
        text_position_2: data.text_position_2,
      })
      setIsCreating(false)
    } catch (error: any) {
      if (error.response?.status === 404) {
        setIsCreating(true)
        setContent(null)
      } else {
        toast.error('Failed to load login screen content')
        console.error('Error fetching content:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateLoginScreenContentRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      if (isCreating) {
        await createLoginScreenContent(formData)
        toast.success('Login screen content created successfully')
      } else if (content) {
        const updateData: UpdateLoginScreenContentRequest = {}
        if (formData.tag !== content.tag) updateData.tag = formData.tag
        if (formData.title !== content.title) updateData.title = formData.title
        if (formData.description !== content.description)
          updateData.description = formData.description
        if (formData.text_position_1 !== content.text_position_1)
          updateData.text_position_1 = formData.text_position_1
        if (formData.text_position_2 !== content.text_position_2)
          updateData.text_position_2 = formData.text_position_2

        await updateLoginScreenContent(content.id, updateData)
        toast.success('Login screen content updated successfully')
      }
      setIsEditing(false)
      fetchContent()
    } catch (error) {
      toast.error('Failed to save login screen content')
      console.error('Error saving content:', error)
    }
  }

  const handleDelete = async () => {
    if (!content || !window.confirm('Are you sure you want to delete this content?')) return

    try {
      await deleteLoginScreenContent(content.id)
      toast.success('Login screen content deleted successfully')
      fetchContent()
    } catch (error) {
      toast.error('Failed to delete login screen content')
      console.error('Error deleting content:', error)
    }
  }

  const handleCancel = () => {
    if (content) {
      setFormData({
        tag: content.tag,
        title: content.title,
        description: content.description,
        text_position_1: content.text_position_1,
        text_position_2: content.text_position_2,
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Login Screen Content</h1>
        <p className="text-gray-600">Manage the content displayed on your login screen</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Tag */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tag</label>
            {editMode ? (
              <Input
                value={formData.tag}
                onChange={(e) => handleInputChange('tag', e.target.value)}
                placeholder="Enter tag (e.g., 'Unlimited Enterprise')"
                className="w-full"
              />
            ) : (
              <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {content?.tag || 'Not set'}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            {editMode ? (
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter title"
                className="w-full"
              />
            ) : (
              <p className="text-gray-900 text-lg font-semibold">{content?.title || 'Not set'}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            {editMode ? (
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter description"
                rows={3}
                className="w-full"
              />
            ) : (
              <p className="text-gray-700">{content?.description || 'Not set'}</p>
            )}
          </div>

          {/* Text Position 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Position 1 (Top Text)
            </label>
            {editMode ? (
              <Input
                value={formData.text_position_1}
                onChange={(e) => handleInputChange('text_position_1', e.target.value)}
                placeholder="Enter top text"
                className="w-full"
              />
            ) : (
              <p className="text-gray-700">{content?.text_position_1 || 'Not set'}</p>
            )}
          </div>

          {/* Text Position 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Position 2 (Bottom Text)
            </label>
            {editMode ? (
              <Input
                value={formData.text_position_2}
                onChange={(e) => handleInputChange('text_position_2', e.target.value)}
                placeholder="Enter bottom text"
                className="w-full"
              />
            ) : (
              <p className="text-gray-700">{content?.text_position_2 || 'Not set'}</p>
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
