"use client";
import React, { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { API_BASE } from "@/lib/config";
import {
  Content,
  CreateContentPayload,
  Rendition,
} from '@/lib/types/content';
import {
  createContent,
  updateContent,
  uploadImage,
  initUpload,
  publishContent,
  uploadImageForEpisode,
  getRenditions,
  deleteContent,
} from '@/lib/contentApi';
import { uploadWithCallback, validateFile, formatFileSize } from '@/lib/uploadHelper';
import CE from "./admin/content/ContentEditor.client";
import { CONTENT_TYPES, ContentEditorProps, MEDIA_TYPES } from "./admin/content/ContentEditor.client";
import { formatBitrate, getQualityBadgeColor } from "@/lib/utils";
import HlsVideoPlayer from "@/players/HLSPlayer";
import { BiCheck, BiPencil } from "react-icons/bi";
import { FiMoreVertical } from "react-icons/fi";
import { BsTrash2 } from "react-icons/bs";
import { toast } from "sonner";
export interface Episode {
  id: number;
  episode_number: number;
  title: string;
  children?: []
}

interface EpisodePlayerModalProps {
  episode: any;
  onClose: () => void;
}

export interface Season {
  id: number;
  season_number: number;
  children?: Episode[];
}


interface SeriesTreeProps {
  seriesList: Content[];
  setSeriesList: React.Dispatch<React.SetStateAction<Content[]>>;
  refresh: () => Promise<void>;
  editSeriesHandler?: () => void;
  setSelectedContent?: React.Dispatch<React.SetStateAction<Content | null>>;
}
interface SeriesItemProps {
  series: Content;
  setSeriesList: React.Dispatch<React.SetStateAction<Content[]>>;
  refresh: () => Promise<void>;
  editSeriesHandler?: () => void;
  setSelectedContent?: React.Dispatch<React.SetStateAction<Content | null>>;
}
export default function SeriesTree({
  seriesList,
  setSeriesList,
  refresh,
  editSeriesHandler,
  setSelectedContent
}: SeriesTreeProps) {
  return (
    <div className="space-y-4">
      {seriesList.length>0?
      <>{seriesList.map((series) => (
        <SeriesItem key={series.id} series={series} refresh={refresh} setSelectedContent={setSelectedContent} setSeriesList={setSeriesList} editSeriesHandler={editSeriesHandler} />
      ))}
      
      </>:
      <p>No series found. Create One!</p>}
    </div>
  );
}

/* -----------------------------------------------------
   SERIES ITEM
----------------------------------------------------- */
export function SeriesItem({ series, refresh, setSeriesList, editSeriesHandler, setSelectedContent }: SeriesItemProps) {
  const [open, setOpen] = useState(false);
  const [selectedSeasonContent, setSelectedSeasonContent] = useState<Content | null>(null);

  const [showAddSeason, setShowAddSeason] = useState(false);
  const [seasonNumber, setSeasonNumber] = useState("");
    const [seriesToDelete, setSeriesToDelete] = useState<Content | null>(null);
  const [editSeries, setEditSeries] = useState<Content | null>(null); 
  const [openSeriesMenuId, setOpenSeriesMenuId] = useState<string | null>(null);

  return (
    <div className="bg-neutral-800 rounded-lg p-4">
      {/* Series Header */}
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>{open ? "▼" : "▶"} </span> {series.title}
        </h2>
<div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenSeriesMenuId(prev => (prev === series.id ? null : series.id));

                  }}
                  className="p-1 rounded hover:bg-gray-800"
                >

                  <FiMoreVertical className="w-4 h-4 text-gray-300" />
                </button>

                {openSeriesMenuId == series.id && (
                  <div className="absolute right-0 mt-1 w-32 bg-neutral-700 border border-gray-800 rounded-md shadow-lg z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenSeriesMenuId(null);

                         editSeriesHandler?.();
          if (setSelectedContent) {
            setSelectedContent(series)
          };
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-800"
                    >
                      <BiPencil className="w-4 h-4" />
                      Edit
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation(); 
                        setOpenSeriesMenuId(null);

                        setSeriesToDelete(series) 
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-gray-800"
                    >
                      <BsTrash2 className="w-4 h-4" />
                      Delete
                    </button>
                      
                  </div>
                )}
              </div>
         
      </div>

      {/* Seasons */}
      {open && (
        <div className="mt-3 ml-6 space-y-3">
          {series.children?.map((season,index) => (
            <SeasonItem setSeriesList={setSeriesList} key={index} season={season} refresh={refresh} series={series} />
          ))}

          {/* Add Season */}
          <button
            className="mt-2 text-left text-blue-400 hover:text-blue-300"
            onClick={() => setShowAddSeason(true)}
          >
            + Add Season
          </button>

          {/* Add Season Modal */}
          {showAddSeason && (
            <CE
              setContent={setSeriesList}
              content={selectedSeasonContent}
              onClose={() => setShowAddSeason(false)}
              onSuccess={() => setShowAddSeason(false)}
              contentType={'season'}
              parentId={series?.id}
              seasonNumber={(Number(series?.children?.length) || 0) + 1}
            />
          )}
        </div>
      )}
 {seriesToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">
              Delete Series?
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Are you sure you want to delete{" "}
              <span className="font-medium text-white">
                {seriesToDelete.title}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSeriesToDelete(null)}
                className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  let contentDeletion = await deleteContent(seriesToDelete.id)
                  if (contentDeletion == 204) {
                    setSeriesList((prev: Content[]) =>
                      prev.filter(
                                (child: Content) => child.id !== seriesToDelete.id
                              )
                    );

                    toast.success(`${seriesToDelete.title} is deleted successfully`)
                  }
                  else {
                    toast.success(`Error deleting ${seriesToDelete.title}`)

                  }
                  setSeriesToDelete(null);
                }}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


export function SeasonItem({ season, refresh, series, setSeriesList }) {

  const [open, setOpen] = useState(false);
  console.log("series", series)
  const [showAddEpisode, setShowAddEpisode] = useState(false);
  const [editSeason, setEditSeason] = useState<Content | null>(null);
  const [epNumber, setEpNumber] = useState("");
  const [epTitle, setEpTitle] = useState("");
  const [playingEpisode, setPlayingEpisode] = useState<any | null>(null);
  const [episodeToDelete, setEpisodeToDelete] = useState<Content | null>(null);
  const [seasonToDelete, setSeasonToDelete] = useState<Content | null>(null);
  const [editEpisode, setEditEpisode] = useState<Content | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openSeasonMenuId, setOpenSeasonMenuId] = useState<string | null>(null);

  return (
    <div className="border-l border-gray-700 pl-4 ">
      {/* Season Header */}
      <div
        className="cursor-pointer flex items-center gap-2 "
        onClick={() => setOpen(!open)}
      >
        <span>{open ? "▼" : "▶"}</span>
        <span className="font-medium">Season {season.season_number}</span>
      </div>

      {/* Episodes */}
      {open && (
        <div className="mt-2 flex flex-col items-start w-11/12 ml-6 w-auto p-2 rounded-sm  ">
          <div className="flex flex-col items-start w-full bg-neutral-700 rounded-md p-2">
            <div className="flex flex-row items-start w-full justify-between">
             <div className="w-full flex flex-row items-center ">
               <span className="font-bold text-lg capitalize"> {season.title}</span>
              
                              
             </div>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenSeasonMenuId(prev => (prev === season.id ? null : season.id));

                  }}
                  className="p-1 rounded hover:bg-neutral-800"
                >

                  <FiMoreVertical className="w-4 h-4 text-gray-300" />
                </button>

                {openSeasonMenuId == season.id && (
                  <div className="absolute right-0 mt-1 w-32 bg-neutral-700 border border-gray-800 rounded-md shadow-lg z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenSeasonMenuId(null);

                        setEditSeason(season)
                        // onEdit();
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-800"
                    >
                      <BiPencil className="w-4 h-4" />
                      Edit
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenSeasonMenuId(null);
                        setOpenSeasonMenuId(null);

                        setSeasonToDelete(season)
                        // onDelete();
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-gray-800"
                    >
                      <BsTrash2 className="w-4 h-4" />
                      Delete
                    </button>
                      
                  </div>
                )}
              </div>
              
            </div>
            <span className="font-medium text-gray-500 text-xs">{season.description}</span>

          </div>
          <div className=" mt-2 space-y-1  w-full   ">


            {season.children?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4w-full">
                {season.children.map((ep) => {
                  const thumbnail =
                    ep.thumbnail_url ||
                    ep.banner_url ||
                    "/placeholder-video.jpg"; // add a fallback image

                  return (
                    <div
                      key={ep.id}
                      className="group cursor-pointer"
                      onClick={() => {
                        setPlayingEpisode(ep)
                      }}
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-700">
                        <img
                          src={thumbnail}
                          alt={ep.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition">
                          <div className="w-14 h-14 rounded-full bg-black/70 flex items-center justify-center">
                            ▶
                          </div>
                        </div>

                        {/* Episode Number */}
                        <span className="absolute top-2 left-2 text-xs bg-black/70 px-2 py-1 rounded">
                          Ep {ep.episode_number}
                        </span>
                      </div>

                      {/* Title */}
                      <div className="flex flex-row items-center justify-between w-full">
                        <div className="mt-2">
                          <p className="text-sm font-medium text-white line-clamp-2">
                            {ep.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            Season {season.season_number}
                          </p>
                          <div className="flex flex-row items-center w-full">
                            {ep.ingest_status != 'ready' ? <p className="text-xs   bg-gray-700 text-white rounded-full p-1">
                              {`${ep.ingest_status}`}
                            </p> :
                              <p className={`mt-1 text-[9px] ${ep.status=='published'?'bg-green-700':'bg-gray-700'}   text-white rounded-full px-[4px] py-[2px]`}>
                                {`${ep.status=='published'?'published':'Ready to Publish'}`}
                              </p>}

                          </div>
                        </div>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(prev => (prev === ep.id ? null : ep.id));

                            }}
                            className="p-1 rounded hover:bg-gray-800"
                          >
                            <FiMoreVertical className="w-4 h-4 text-gray-300" />
                          </button>

                          {openMenuId === ep.id && (
                            <div className="absolute right-0 mt-1 w-32 bg-neutral-700 border border-neutral-800 rounded-md shadow-lg z-20">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(prev => (prev === ep.id ? null : ep.id));
                                  setEditEpisode(ep)
                                }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-800"
                              >
                                <BiPencil className="w-4 h-4" />
                                Edit
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(prev => (prev === ep.id ? null : ep.id));

                                  setEpisodeToDelete(ep)

                                }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-gray-800"
                              >
                                <BsTrash2 className="w-4 h-4" />
                                Delete
                              </button>
                              {ep.ingest_status == 'ready' && ep.status != 'published' &&  <button
                                onClick={async (e) => {
                                  e.stopPropagation();

                                  console.log(openMenuId, "openMenuId")
                                  let pc = await publishContent(openMenuId || "")
                                  setOpenMenuId(prev => (prev === ep.id ? null : ep.id));



                                }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-yellow-600 hover:bg-gray-800"
                              >
                                <BiCheck className="w-4 h-4" />
                                Publish
                              </button>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Episode */}
            <button
              className="mt-1 text-blue-400 hover:text-blue-300"
              onClick={() => setShowAddEpisode(true)}
            >
              + Add Episode
            </button>

            {/* Add Episode Modal */}
            {showAddEpisode && (
              //  <ContentEditor series={series} setSeriesList={setSeriesList} season={season}/>
              <CE
                setContent={setSeriesList}
                content={null}
                onClose={() => setShowAddEpisode(false)}
                onSuccess={() => setShowAddEpisode(false)}
                contentType={'episode'}
                parentId={season?.id}
                seasonNumber={(Number(season?.children?.length) || 0) + 1}
              />
            )}
          </div></div>
      )}
      {playingEpisode && (
        <EpisodePlayerModal
          episode={playingEpisode}
          onClose={() => setPlayingEpisode(null)}
        />
      )}
      {editSeason && <CE
        setContent={setSeriesList}
        content={editSeason}
        onClose={() => setEditSeason(null)}
        onSuccess={() => setEditSeason(null)}
        contentType={'season'}
        parentId={series?.id}
        seasonNumber={(Number(series?.children?.length) || 0) + 1}
      />}
      {editEpisode && <CE
        setContent={setSeriesList}
        content={editEpisode}
        onClose={() => setEditEpisode(null)}
        onSuccess={() => setEditEpisode(null)}
        contentType={'episode'}
        parentId={season?.id}
        seasonNumber={(Number(season?.children?.length) || 0) + 1}
      />}
      {episodeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">
              Delete Episode?
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Are you sure you want to delete{" "}
              <span className="font-medium text-white">
                {episodeToDelete.title}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEpisodeToDelete(null)}
                className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  let contentDeletion = await deleteContent(episodeToDelete.id)
                  if (contentDeletion == 204) {
                    setSeriesList((prev: Content[]) =>
                      prev.map((series: Content) => ({
                        ...series,
                        children: series.children?.map((s: Content) =>
                          s.id === season.id
                            ? {
                              ...season,
                              children: (s.children || []).filter(
                                (child: Content) => child.id !== episodeToDelete.id
                              ),
                            }
                            : season
                        ),
                      }))
                    );

                    toast.success(`${episodeToDelete.title} is deleted successfully`)
                  }
                  else {
                    toast.success(`Error deleting ${episodeToDelete.title}`)

                  }
                  setEpisodeToDelete(null);
                }}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {seasonToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">
              Delete Season?
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Are you sure you want to delete{" "}
              <span className="font-medium text-white">
                {seasonToDelete.title}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSeasonToDelete(null)}
                className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  let contentDeletion = await deleteContent(seasonToDelete.id)
                  if (contentDeletion == 204) {

                    setSeriesList((prev: Content[]) =>
                      prev.map(s =>
                        s.id == series.id
                          ? {
                            ...s,
                            children: (s.children || []).filter(
                              (child: Content) => child.id !== seasonToDelete.id
                            ),
                          }
                          : s
                      )
                    );
                    toast.success(`${seasonToDelete.title} is deleted successfully`)
                  }
                  else {
                    toast.success(`Error deleting ${seasonToDelete.title}`)

                  }
                  setSeasonToDelete(null);
                }}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}



function Modal({ children, title, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button className="text-gray-400 hover:text-white" onClick={onClose}>
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
function ContentEditor(props: any) {
  const { content, onClose, onSuccess, setContent, series, setSeriesList, season } = props;

  const isEditing = !!content;
  const [step, setStep] = useState(1);

  const nextStep = () => setStep((p) => p + 1);
  const prevStep = () => setStep((p) => p - 1);

  const [formData, setFormData] = useState<CreateContentPayload>({
    title: content?.title || "",
    description: content?.description || "",
    content_type: "episode",
    media_type: content?.media_type || "flat",
    status: content?.status || "draft",
    is_kid_safe: content?.is_kid_safe || false,
    is_ppv: content?.is_ppv || false,
    price_cents: content?.price_cents || 0,
    genres: content?.genres || [],
  });

  const [loading, setLoading] = useState(false);
  const [createdContent, setCreatedContent] = useState<Content | null>(content || null);

  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState<string | null>(null);
  const [epNumber, setEpNumber] = useState("")
  const [epTitle, setEpTitle] = useState("")
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  function handleChange(field: keyof CreateContentPayload, value: any) {
    setFormData((p) => ({ ...p, [field]: value }));
  }

  // ---------------- STEP 1 SUBMIT ----------------
  async function handleSubmit() {
    if (!formData.title.trim()) return alert("Title required");
    if (!formData.description.trim()) return alert("Description required");

    try {
      setLoading(true);

      if (isEditing && content) {
        const updated = await updateContent(content.id, formData);
        setCreatedContent(updated);
        setContent((prev) =>
          prev.map((c) => (c.id === content.id ? updated : c))
        );
      } else {
        // console.log('object')
        const created = await createContent(formData);
        //   const res = await fetch(`${API_BASE}api/v1/content/episodes/`, {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //     Authorization: `Bearer ${Cookies.get("access_token")}`,
        //   },
        //   body: JSON.stringify({
        //     season: season.id,
        //     content: created.id,
        //     episode_number: Number(epNumber),
        //     title: epTitle,
        //   }),
        // });

        // if (!res.ok) throw new Error("Failed to create episode");
        //  const newSeason = await res.json();
        setCreatedContent(created);

      }

      nextStep();
    } finally {
      setLoading(false);
    }
  }

  // ---------------- STEP 2 IMAGE UPLOAD ----------------
  async function uploadImageHandler(type: "poster" | "banner") {
    const file = type === "poster" ? posterFile : bannerFile;
    if (!file || !createdContent) return;

    setImageUploading(type);

    const res = await uploadImageForEpisode(createdContent.id, file, type);

    setCreatedContent((prev) =>
      prev ? { ...prev, [`${type}_url`]: res.thumbnail_url } : prev
    );

    setImageUploading(null);
  }

  // ---------------- STEP 3 MEDIA UPLOAD ----------------
  async function uploadMediaHandler() {
    if (!uploadFile || !createdContent) return;

    setUploadingMedia(true);

    const init = await initUpload(createdContent.id, uploadFile.name);

    await uploadWithCallback(init, uploadFile, {
      onProgress: (p) => setUploadProgress(p.percentage),
    });

    setUploadingMedia(false);
  }

  // ---------------- PUBLISH ----------------
  async function handlePublish() {
    if (!createdContent) return;

    const pub = await publishContent(createdContent.id);
    onSuccess(pub);
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-8">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            {isEditing ? "Edit Content" : "Create Content"}
          </h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            ✕
          </button>
        </div>

        {/* STEPPER */}
        <div className="border-b border-gray-700 px-6 py-4">
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                onClick={() => (createdContent || s === 1) && setStep(s)}
                className={`flex-1 h-2 rounded-full cursor-pointer transition 
                  ${step >= s ? "bg-blue-500" : "bg-gray-600"}
                `}
              />
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-2">
            {step === 1 && "Step 1: Content Details"}
            {step === 2 && "Step 2: Upload Images"}
            {step === 3 && "Step 3: Upload Media File"}
          </p>
        </div>

        <div className="p-6">
          {/* -------------------------------- STEP 1 -------------------------------- */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="block text-gray-300">Episode Number</label> <input type="number" value={epNumber} onChange={(e) => setEpNumber(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" /> <label className="block text-gray-300">Episode Title</label> <input type="text" value={epTitle} onChange={(e) => setEpTitle(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2" />
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-300">Title *</label>
                  <input
                    className="w-full bg-gray-700 px-4 py-2 rounded"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-300">Description *</label>
                  <textarea
                    rows={3}
                    className="w-full bg-gray-700 px-4 py-2 rounded"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                  />
                </div>





                {formData.is_ppv && (
                  <input
                    type="number"
                    className="bg-gray-700 px-4 py-2 rounded"
                    value={formData.price_cents}
                    onChange={(e) =>
                      handleChange("price_cents", parseInt(e.target.value) || 0)
                    }
                  />
                )}
              </div>

              <button
                onClick={handleSubmit}
                className="mt-6 w-full bg-blue-600 py-3 rounded text-white"
              >
                {loading ? "Saving..." : "Continue"}
              </button>
            </>
          )}

          {/* -------------------------------- STEP 2 -------------------------------- */}
          {step === 2 && createdContent && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Poster */}
                <div>
                  <label className="text-gray-300">Poster Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
                    className="w-full bg-gray-700 px-4 py-2 rounded"
                  />
                  <button
                    className="w-full mt-2 bg-purple-600 py-2 rounded text-white"
                    onClick={() => uploadImageHandler("poster")}
                    disabled={!posterFile || imageUploading === "poster"}
                  >
                    {imageUploading === "poster" ? "Uploading..." : "Upload Poster"}
                  </button>
                </div>

                {/* Banner */}
                <div>
                  <label className="text-gray-300">Banner Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                    className="w-full bg-gray-700 px-4 py-2 rounded"
                  />
                  <button
                    className="w-full mt-2 bg-purple-600 py-2 rounded text-white"
                    onClick={() => uploadImageHandler("banner")}
                    disabled={!bannerFile || imageUploading === "banner"}
                  >
                    {imageUploading === "banner" ? "Uploading..." : "Upload Banner"}
                  </button>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  className="flex-1 py-3 bg-gray-600 rounded text-white"
                  onClick={prevStep}
                >
                  Back
                </button>
                <button
                  className="flex-1 py-3 bg-blue-600 rounded text-white"
                  onClick={nextStep}
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {/* -------------------------------- STEP 3 -------------------------------- */}
          {step === 3 && createdContent && (
            <>
              <label className="text-gray-300">Upload Media File</label>
              <input
                type="file"
                accept="video/*,audio/*"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full bg-gray-700 px-4 py-2 rounded"
              />

              <button
                onClick={uploadMediaHandler}
                disabled={!uploadFile || uploadingMedia}
                className="w-full mt-3 bg-green-600 py-3 rounded text-white"
              >
                {uploadingMedia ? "Uploading..." : "Upload Media"}
              </button>

              {uploadingMedia && (
                <div className="text-center text-gray-300 mt-3">
                  {uploadProgress}%
                </div>
              )}

              <button
                onClick={handlePublish}
                className="mt-6 w-full bg-orange-600 py-3 rounded text-white"
              >
                Publish
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EpisodePlayerModal({
  episode,
  onClose,
}: EpisodePlayerModalProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [renditions, setRenditions] = useState<Rendition[]>([]);
  const [loadingRenditions, setLoadingRenditions] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  useEffect(() => {
    async function fetchVideo() {
      try {
        const token = Cookies.get("access_token");

        const res = await fetch(
          `${API_BASE}api/v1/content/content/${episode.id}/stream/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch video");
        const renditionsResponse = await getRenditions(episode.id);
        setRenditions(renditionsResponse.renditions)
        const data = await res.json();
        setVideoUrl(data.playback_url);
        setCurrentSrc(data.playback_url);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchVideo();
  }, [episode.id]);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-5xl relative max-h-[90vh] flex flex-col">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white text-xl z-10"
        >
          ✕
        </button>

        {/* Header */}
        <div className="p-4 border-b border-gray-700 shrink-0">
          <h2 className="text-xl font-semibold">{episode.title}</h2>
          <p className="text-sm text-gray-400">
            Episode {episode.episode_number}
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">

          {/* 🎥 Player */}
          <div className="aspect-video bg-black flex items-center justify-center p-4">
            {loading && <span className="text-gray-400">Loading video…</span>}

            {!loading && currentSrc && (
              <div className="relative w-full h-full">
                <HlsVideoPlayer src={currentSrc} />

                {/* ⚙️ Gear */}
                <button
                  onClick={() => setShowQualityMenu((p) => !p)}
                  className="absolute top-4 right-4 bg-black/70 p-2 rounded-full hover:bg-black"
                >
                  ⚙️
                </button>

                {/* 🎚️ Quality Menu */}
                {showQualityMenu && (
                  <div className="absolute bottom-16 right-4 bg-gray-900 rounded-lg shadow-lg overflow-hidden">
                    <button
                      className="block w-full px-4 py-2 text-left hover:bg-gray-700"
                      onClick={() => {
                        setCurrentSrc(videoUrl!); // auto / master
                        setShowQualityMenu(false);
                      }}
                    >
                      Auto
                    </button>

                    {renditions.map((r) => (
                      <button
                        key={r.id}
                        className="block w-full px-4 py-2 text-left hover:bg-gray-700"
                        onClick={() => {
                          setCurrentSrc(r.stream_url);
                          setShowQualityMenu(false);
                        }}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}


            {!loading && !videoUrl && (
              <span className="text-red-400">Video unavailable</span>
            )}
          </div>

          {/* 📦 Renditions */}
          <div className="p-4">
            <h3 className="text-xl font-bold text-white mb-4">
              Available Video Qualities{" "}
              {renditions.length > 0 && `(${renditions.length})`}
            </h3>

            {loadingRenditions ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-400">Loading renditions...</p>
              </div>
            ) : renditions.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-400">No renditions available yet.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Renditions will appear here once transcoding is complete.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-2">
                {renditions.map((rendition) => (
                  <div
                    key={rendition.id}
                    className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-blue-600">
                        {rendition.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm w-full ">
                      {rendition.width && rendition.height && (
                        <div>
                          <span className="text-gray-500">Resolution:</span>
                          <span className="text-white ml-2">
                            {rendition.width}x{rendition.height}
                          </span>
                        </div>
                      )}

                      {rendition.bitrate && (
                        <div>
                          <span className="text-gray-500">Bitrate:</span>
                          <span className="text-white ml-2">
                            {rendition.bitrate}
                          </span>
                        </div>
                      )}
                    </div>

                    {rendition.stream_url && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <video
                          src={rendition.stream_url}
                          controls
                          className="w-full rounded-lg bg-black"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}