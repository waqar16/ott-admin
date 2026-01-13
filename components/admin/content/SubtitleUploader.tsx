'use client'
import React, { useState } from 'react'
import RoundLoader from '@/components/Loader/RoundLoader'
import { fetchSubtitles, uploadSubtitles } from '@/lib/contentApi'
import ISO6391 from 'iso-639-1'
import SkeletonLoader from '@/components/Loader/SkeletonLoader'
import { FiDelete } from 'react-icons/fi'
import { BiTrash } from 'react-icons/bi'

const languageOptions = ISO6391.getAllCodes().map(code => ({
  code,
  name: ISO6391.getName(code),
}))
interface SubtitleItem {
  file: File | null
  language: string
  name: string
  is_default:boolean
is_forced:boolean 

}

interface SubtitleUploaderProps {
  assetId: string 
}

export const SubtitleUploader: React.FC<SubtitleUploaderProps> = ({
  assetId, 
}) => {
  const [subtitlesLoading, setSubtitlesLoading] = useState(false)
  const [subtitles, setSubtitles] = useState<SubtitleItem[]>([
    { file: null, language: 'en', name: '' },
  ])
  const [uploading, setUploading] = useState(false)

  const handleAddSubtitle = () => {
    setSubtitles((prev) => [...prev, { file: null, language: 'en', name: '' }])
  }

  const handleRemoveSubtitle = (index: number) => {
    setSubtitles((prev) => prev.filter((_, i) => i !== index))
  }
const handleDefaultChange = (selectedIndex: number) => {
  setSubtitles(prev =>
    prev.map((item, i) => ({
      ...item,
      is_default: i === selectedIndex
        ? !item.is_default // toggle current
        : false,           // force others false
    }))
  )
}

  const handleChange = (
    index: number,
    field: keyof SubtitleItem,
    value: any
  ) => {
    setSubtitles((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    )
  }
async function subs() {
    let subt = await fetchSubtitles(assetId || '')
  }
  const handleUploadAll = async () => {
    const files = subtitles.map((s) => s.file!).filter(Boolean)
    const languages = subtitles.map((s) => s.language)
    const names = subtitles.map((s) => s.name)

    if (files.length === 0) return alert('No files selected!')

    setUploading(true)
    try {
      await uploadSubtitles(assetId, files, languages, names)
      alert('All subtitles uploaded successfully!')
      setSubtitles([{ file: null, language: 'en', name: '' }])
    } catch (err) {
      alert(`Upload failed: ${err}`)
    } finally {
      setUploading(false)
    }
  }
 React.useEffect(() => {
      setSubtitlesLoading(true)
      subs()
      .finally(() => setSubtitlesLoading(false))

  }, [])
  return (
    <div className="space-y-6 w-full col-span-2">
      {subtitlesLoading ? (
                          <SkeletonLoader className="w-full h-[30vh] bg-gray-700 rounded-xl" />

      ) : (
        <>
          <h3 className="text-xl text-white font-semibold">Upload Subtitles</h3>

          {/* Subtitle Items */}
          <div className='w-full grid grid-cols-1 gap-2'>
            {subtitles.map((item, index) => (
            <div
              key={index}
              className="col-span-1 flex flex-col md:flex-row gap-4 items-start md:items-end bg-neutral-900 p-4 rounded-lg border border-gray-700"
            >
              {/* File Upload */}
              <div className="flex-1 relative">
                <input
                  type="file"
                  accept=".srt,.vtt,.ass"
                  onChange={(e) =>
                    handleChange(index, 'file', e.target.files?.[0] || null)
                  }
                  className="w-full p-2 bg-neutral-800 rounded text-white"
                />
                {item.file && (
                  <p className="text-xs text-gray-300 mt-1">
                    {item.file.name} ({(item.file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {/* Language */}
             <div className="flex-1">
  <label className="text-gray-300 text-sm">Language</label>

  <select
    value={item.language}
    onChange={(e) => handleChange(index, 'language', e.target.value)}
    className="w-full p-2 bg-neutral-800 rounded text-white mt-1"
  >
    <option value="" disabled>
      Select language
    </option>

    {languageOptions.map(lang => (
      <option key={lang.code} value={lang.code}>
        {lang.name} ({lang.code})
      </option>
    ))}
  </select>
</div>


              {/* Subtitle Name */}
              <div className="flex-1">
                <label className="text-gray-300 text-sm">Subtitle Name</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleChange(index, 'name', e.target.value)}
                  placeholder="English CC"
                  className="w-full p-2 bg-neutral-800 rounded text-white mt-1"
                />
              </div>
<div className="flex items-center gap-2 mb-3">
  <input
    type="checkbox"
    checked={item.is_default}
    onChange={() => handleDefaultChange(index)}
    className="h-4 w-4 accent-orange-500 cursor-pointer"
  />
  <label className="text-sm text-gray-300">
    Set as default subtitle
  </label>
</div>

              {/* Remove Button */}
              {subtitles.length > 1 && (
                <button
                  onClick={() => handleRemoveSubtitle(index)}
                  className="text-red-500 hover:text-red-400 px-2 py-1 font-bold"
                >
                  <BiTrash size={20} className='mb-2'/>
                </button>
              )}
            </div>
          ))}
          </div>

          {/* Add Subtitle Item */}
          <button
            onClick={handleAddSubtitle}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            + Add Subtitle
          </button>

          {/* Upload All */}
          <div className="flex justify-end mt-4">
            <button
              onClick={handleUploadAll}
              disabled={uploading}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <RoundLoader />
                  <span>Uploading...</span>
                </>
              ) : (
                'Upload All'
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
