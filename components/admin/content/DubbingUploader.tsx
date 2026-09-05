// import React from 'react'

// const DubbingUploader = () => {
//   return (
//     <></>
//     // <div className="space-y-6">

//     //             {subtitlesLoading ? (
//     //               <SkeletonLoader className="w-full h-[30vh] bg-gray-700 rounded-xl" />
//     //             ) : (
//     //               <>

//     //                 <h3 className="text-xl text-white font-semibold">
//     //                   {content?.ingest_status === 'processing'
//     //                     ? 'Content is uploading to cloud (this may take a while)'
//     //                     : 'Upload Dubbing '}
//     //                 </h3>

//     //                 <div className="relative max-h-[50vh] w-full aspect-video rounded-xl border-2 border-dashed border-gray-600 bg-neutral-900 hover:border-blue-500 transition cursor-pointer overflow-hidden group">

//     //                    {!videoFetchLoading && videoUrl && isEditing && (
//     //                     <div className="absolute inset-0">
//     //                       <HlsVideoPlayer src={videoUrl} />
//     //                     </div>
//     //                   )}

//     //                   {uploadFile && (
//     //                     <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-black/60">

//     //                       <svg
//     //                         fill="none"
//     //                         stroke="currentColor"
//     //                         strokeWidth={1.5}
//     //                         viewBox="0 0 24 24"
//     //                       >
//     //                         <path
//     //                           strokeLinecap="round"
//     //                           strokeLinejoin="round"
//     //                           d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M7 10l5-5 5 5M12 5v14"
//     //                         />
//     //                       </svg>

//     //                       <p className="text-white font-medium">
//     //                         {uploadFile.name}
//     //                       </p>
//     //                       <p className="text-xs text-gray-300 mt-1">
//     //                         {formatFileSize(uploadFile.size)}
//     //                       </p>
//     //                     </div>
//     //                   )}

//     //                   {!uploadFile && (
//     //                     <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-black/40 group-hover:bg-black/60 transition">

//     //                       <svg
//     //                         className="w-14 h-14 text-blue-400 mb-4"

//     //                         viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg"  >
//     //                         <title>file_upload_fill</title>
//     //                         <g id="页面-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
//     //                           <g id="File" transform="translate(-384.000000, -144.000000)">
//     //                             <g id="file_upload_fill" transform="translate(384.000000, 144.000000)">
//     //                               <path d="M24,0 L24,24 L0,24 L0,0 L24,0 Z M12.5934901,23.257841 L12.5819402,23.2595131 L12.5108777,23.2950439 L12.4918791,23.2987469 L12.4918791,23.2987469 L12.4767152,23.2950439 L12.4056548,23.2595131 C12.3958229,23.2563662 12.3870493,23.2590235 12.3821421,23.2649074 L12.3780323,23.275831 L12.360941,23.7031097 L12.3658947,23.7234994 L12.3769048,23.7357139 L12.4804777,23.8096931 L12.4953491,23.8136134 L12.4953491,23.8136134 L12.5071152,23.8096931 L12.6106902,23.7357139 L12.6232938,23.7196733 L12.6232938,23.7196733 L12.6266527,23.7031097 L12.609561,23.275831 C12.6075724,23.2657013 12.6010112,23.2592993 12.5934901,23.257841 L12.5934901,23.257841 Z M12.8583906,23.1452862 L12.8445485,23.1473072 L12.6598443,23.2396597 L12.6498822,23.2499052 L12.6498822,23.2499052 L12.6471943,23.2611114 L12.6650943,23.6906389 L12.6699349,23.7034178 L12.6699349,23.7034178 L12.678386,23.7104931 L12.8793402,23.8032389 C12.8914285,23.8068999 12.9022333,23.8029875 12.9078286,23.7952264 L12.9118235,23.7811639 L12.8776777,23.1665331 C12.8752882,23.1545897 12.8674102,23.1470016 12.8583906,23.1452862 L12.8583906,23.1452862 Z M12.1430473,23.1473072 C12.1332178,23.1423925 12.1221763,23.1452606 12.1156365,23.1525954 L12.1099173,23.1665331 L12.0757714,23.7811639 C12.0751323,23.7926639 12.0828099,23.8018602 12.0926481,23.8045676 L12.108256,23.8032389 L12.3092106,23.7104931 L12.3186497,23.7024347 L12.3186497,23.7024347 L12.3225043,23.6906389 L12.340401,23.2611114 L12.337245,23.2485176 L12.337245,23.2485176 L12.3277531,23.2396597 L12.1430473,23.1473072 Z" id="MingCute" fillRule="nonzero">

//     //                               </path>
//     //                               <path d="M12,2 L12,8.5 C12,9.27969882 12.5949121,9.920449 13.3555442,9.99313345 L13.5,10 L20,10 L20,20 C20,21.0543909 19.18415,21.9181678 18.1492661,21.9945144 L18,22 L6,22 C4.94563773,22 4.08183483,21.18415 4.00548573,20.1492661 L4,20 L4,4 C4,2.94563773 4.81587733,2.08183483 5.85073759,2.00548573 L6,2 L12,2 Z M11.2929,11.1729 L9.17157,13.2942 C8.78105,13.6847 8.78105,14.3179 9.17157,14.7084 C9.5621,15.099 10.1953,15.099 10.5858,14.7084 L11,14.2942 L11,17 C11,17.5523 11.4477,18 12,18 C12.5523,18 13,17.5523 13,17 L13,14.2942 L13.4142,14.7084 C13.8047,15.099 14.4379,15.099 14.8284,14.7084 C15.219,14.3179 15.219,13.6847 14.8284,13.2942 L12.7071,11.1729 C12.3166,10.7824 11.6834,10.7824 11.2929,11.1729 Z M14,2.04336 C14.3222,2.11158 14.624049,2.25868408 14.8774606,2.47305359 L15,2.58579 L19.4142,7 C19.6506857,7.23646857 19.8218571,7.52605551 19.9160012,7.8407123 L19.9566,8 L14,8 L14,2.04336 Z" id="形状" fill="#09244B">

//     //                               </path>
//     //                             </g>
//     //                           </g>
//     //                         </g>
//     //                       </svg>
//     //                       <p className="text-white font-semibold text-lg">
//     //                         Click to Upload Dubbing File
//     //                       </p>
//     //                       <p className="text-xs text-gray-300 mt-1">
//     //                         Supported: .wav, .aiff, .mp3, .aac, .flac, .ogg · Max size 2GB
//     //                       </p>
//     //                     </div>
//     //                   )}

//     //                    <input
//     //                     type="file"
//     //                     accept=".srt,.vtt,.ass"
//     //                     onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
//     //                     disabled={uploading || content?.ingest_status === 'processing'}
//     //                     className="absolute inset-0 opacity-0 cursor-pointer"
//     //                   />
//     //                 </div>

//     //                 {uploadFile && uploadFile.size >= 1024 * 1024 * 1024 && (
//     //                   <p className="text-xs text-amber-500">
//     //                     Large file detected. Upload may take time — keep this tab open.
//     //                   </p>
//     //                 )}

//     //                  <div className="flex justify-between mt-6">

//     //                   <button
//     //                     onClick={handleFileUpload}
//     //                     disabled={!uploadFile || uploading || content?.ingest_status === 'processing'}
//     //                     className="px-6 py-2 bg-orange-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
//     //                   >
//     //                     {uploading   ? (
//     //                       <>
//     //                         <RoundLoader />
//     //                         <span> Uploading
//     //                         </span>
//     //                       </>
//     //                     ) : (
//     //                       'Upload Dubbing'
//     //                     )}
//     //                   </button>
//     //                 </div>
//     //               </>
//     //             )}
//     //           </div>
//   )
// }

// export default DubbingUploader
'use client'
import React, { useEffect, useState } from 'react'
import RoundLoader from '@/components/Loader/RoundLoader'
import SkeletonLoader from '@/components/Loader/SkeletonLoader'
import { uploadDubbings } from '@/lib/contentApi'
import ISO6391 from 'iso-639-1'
import { BiTrash } from 'react-icons/bi'

const languageOptions = ISO6391.getAllCodes().map((code) => ({
  code,
  name: ISO6391.getName(code),
}))

interface DubbingItem {
  file: File | null
  language: string
  name: string
  is_default: boolean
}

interface DubbingUploaderProps {
  assetId: string
}

export const DubbingUploader: React.FC<DubbingUploaderProps> = ({ assetId }) => {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [dubbings, setDubbings] = useState<DubbingItem[]>([
    { file: null, language: 'en', name: '', is_default: true },
  ])

  /* ------------------ Handlers ------------------ */

  const handleAdd = () => {
    setDubbings((prev) => [...prev, { file: null, language: 'en', name: '', is_default: false }])
  }

  const handleRemove = (index: number) => {
    setDubbings((prev) => prev.filter((_, i) => i !== index))
  }

  const handleChange = (index: number, field: keyof DubbingItem, value: any) => {
    setDubbings((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  /** only ONE default allowed */
  const handleDefaultChange = (selectedIndex: number) => {
    setDubbings((prev) =>
      prev.map((item, i) => ({
        ...item,
        is_default: i === selectedIndex,
      }))
    )
  }

  /* ------------------ Upload ------------------ */

  const handleUploadAll = async () => {
    const files = dubbings.map((d) => d.file!).filter(Boolean)
    const languages = dubbings.map((d) => d.language)
    const names = dubbings.map((d) => d.name)
    const isDefault = dubbings.map((d) => d.is_default)

    if (files.length == 0) {
      alert('No audio files selected')
      return
    }

    setUploading(true)
    try {
      await uploadDubbings(assetId, files, languages, names, isDefault)
      alert('Dubbings uploaded successfully')
      setDubbings([{ file: null, language: 'en', name: '', is_default: true }])
    } catch (err) {
      alert(`Upload failed: ${err}`)
    } finally {
      setUploading(false)
    }
  }

  /* ------------------ UI ------------------ */

  return (
    <div className="space-y-6 w-full col-span-2">
      {loading ? (
        <SkeletonLoader className="w-full h-[30vh] bg-gray-700 rounded-xl" />
      ) : (
        <>
          <h3 className="text-xl text-white font-semibold">Upload Dubbing Tracks</h3>

          <div className="w-full grid grid-cols-1 gap-2">
            {dubbings.map((item, index) => (
              <div
                key={index}
                className="col-span-1 flex flex-col md:flex-row gap-4 items-start md:items-end bg-neutral-900 p-4 rounded-lg border border-gray-700"
              >
                {/* Audio file */}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleChange(index, 'file', e.target.files?.[0] || null)}
                    className="w-full p-2 bg-neutral-800 rounded text-white"
                  />
                  {item.file && <p className="text-xs text-gray-400 mt-1">{item.file.name}</p>}
                </div>

                {/* Language */}
                <div className="flex-1">
                  <label className="text-sm text-gray-300">Language</label>
                  <select
                    value={item.language}
                    onChange={(e) => handleChange(index, 'language', e.target.value)}
                    className="w-full p-2 bg-neutral-800 rounded text-white mt-1"
                  >
                    <option value="" disabled>
                      Select language
                    </option>
                    {languageOptions.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name} ({lang.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name */}
                <div className="flex-1">
                  <label className="text-sm text-gray-300">Track Name</label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                    placeholder="English Dub"
                    className="w-full p-2 bg-neutral-800 rounded text-white mt-1"
                  />
                </div>

                {/* Default */}
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={item.is_default}
                    onChange={() => handleDefaultChange(index)}
                    className="h-4 w-4 accent-orange-500"
                  />
                  <span className="text-sm text-gray-300">Default</span>
                </div>

                {/* Remove */}
                {dubbings.length > 1 && (
                  <button
                    onClick={() => handleRemove(index)}
                    className="text-red-500 hover:text-red-400 mb-2"
                  >
                    <BiTrash size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add */}
          <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            + Add Dubbing
          </button>

          {/* Upload */}
          <div className="flex justify-end">
            <button
              onClick={handleUploadAll}
              disabled={uploading}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <RoundLoader />
                  <span>Uploading…</span>
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
