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
  getContent,
  getStreamingUrl,
} from '@/lib/contentApi';
import { uploadWithCallback, validateFile, formatFileSize } from '@/lib/uploadHelper';
import CE from "./admin/content/ContentEditor.client";
import { CONTENT_TYPES, ContentEditorProps, MEDIA_TYPES } from "./admin/content/ContentEditor.client";
import { formatBitrate, getQualityBadgeColor } from "@/lib/utils";
import HlsVideoPlayer from "@/players/HLSPlayer";
import { BiCheck, BiInfoCircle, BiLink, BiPencil } from "react-icons/bi";
import { FiMoreVertical } from "react-icons/fi";
import { BsTrash2 } from "react-icons/bs";
import { toast } from "sonner";
import ContentDetailsModal from "./Content/ContentDetailsModal";
import { ApiError } from "@/lib/authApi";
import EpisodePlayerModal from "./EpisodePlayerModal";
import UploadTrailerClient from "./admin/content/UploadTrailerClient";
import RoundLoader from "./Loader/RoundLoader";
export interface Episode {
  id: number;
  episode_number: number;
  title: string;
  children?: []
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

 
export function SeriesItem({ series, refresh, setSeriesList, editSeriesHandler, setSelectedContent }: SeriesItemProps) {
  const [open, setOpen] = useState(false);
  const [selectedSeasonContent, setSelectedSeasonContent] = useState<Content | null>(null);
  const [trailerOpen,setTrailerOpen] = useState(false);
  const [showAddSeason, setShowAddSeason] = useState(false);
  const [seasonNumber, setSeasonNumber] = useState("");
    const [seriesToDelete, setSeriesToDelete] = useState<Content | null>(null);
  const [editSeries, setEditSeries] = useState<Content | null>(null); 
  const [openSeriesMenuId, setOpenSeriesMenuId] = useState<string | null>(null);
  const [showSeriesDetails, setShowSeriesDetails] = useState(false);
  const [trailerUrlLoading, setTrailerUrlLoading] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [error,setError] = useState<string | null>(null);
  async function handleViewDetails(item: Content) {
    try {
      setTrailerUrlLoading(true);   
      setShowSeriesDetails(true);  
      try {
        const urlPayload = await getStreamingUrl(item.trailer_id || "");
        setTrailerUrlLoading(false);
        console.log("urlPayload.dash_url",urlPayload.hls_url)
        setTrailerUrl(urlPayload.hls_url);
      } catch (rendErr) {
        console.error('Error fetching renditions:', rendErr);
        // Don't fail the whole operation if renditions fail
      }
      setTrailerUrlLoading(false)
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load content details');
    } finally { 
    }
  }
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
                        {series.status!='published' && <button
                                onClick={async (e) => {
                                  e.stopPropagation();
 
                                  let pc = await publishContent(openSeriesMenuId || "") 
                                  if(pc.status == 'published'){
                                    toast.success(`${series.title} is published successfully`)
                                    setOpenSeriesMenuId(prev => (prev === prev.id ? null : prev.id));
                                  }
else{
                                    toast.error(`Error publishing ${series.title}`)
}


                                }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-yellow-600 hover:bg-gray-800"
                              >
                                <BiCheck className="w-4 h-4" />
                                Publish
                              </button> }
 <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenSeriesMenuId(null);
                       handleViewDetails(series);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-800"
                    >
                      <BiInfoCircle className="w-4 h-4" />
                      Details
                    </button>
 <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenSeriesMenuId(null);
                       setTrailerOpen(true);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-800"
                    >
                      <BiLink className="w-4 h-4" />
                      Trailer
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
{showSeriesDetails  && (
        <ContentDetailsModal
          open={showSeriesDetails}
          detailContent={series}
          onClose={() => {
            refresh();
          }}
          videoUrl={trailerUrl}
          videoUrlLoading={trailerUrlLoading} 
          publishContent={publishContent}  
        />
      )}

      {trailerOpen && 
      <UploadTrailerClient trailer_id={series.trailer_id}
      content={series}
      trailer_url={series.trailer_url || ""}
      setOpen={setTrailerOpen}
      
      
      />}
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
  const [deleting,setDeleting] = useState(false);
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
                      className={`group ${ep.ingest_status == 'ready' ? 'cursor-pointer' : ''}  `}
                      onClick={() => {
                        if(ep.ingest_status == 'ready'){
                          setPlayingEpisode(ep)
                        }
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
                          {ep.ingest_status == 'processing' ? <div className="text-xs flex flex-col items-center">
<RoundLoader/>
<span className="text-center">Processing</span>
                          </div>:
                          <div className="w-14 h-14 rounded-full bg-black/70 flex items-center justify-center">
                            ▶
                          </div>}
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
          <div className="bg-neutral-900 rounded-xl p-6 w-full max-w-sm">
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
              disabled={deleting}
                onClick={async () => {
                  setDeleting(true)
                  let contentDeletion = await deleteContent(episodeToDelete.id)
                  setDeleting(false)
                  
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
                {deleting?'Deleting...':'Delete'}
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



 
 

