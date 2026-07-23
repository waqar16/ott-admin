'use client'

import React from 'react'
import { FiHelpCircle, FiChevronDown } from 'react-icons/fi'

export default function AdminContentHelpPanel() {
  return (
    <details className="group rounded-2xl border border-primary/20 bg-primary/5 shadow-sm transition-all overflow-hidden mb-6">
      <summary className="flex items-center justify-between cursor-pointer select-none px-5 py-4 text-sm font-semibold text-foreground hover:bg-primary/10 transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <FiHelpCircle className="w-4 h-4" />
          </div>
          <span>Quick Help: Create Content & Attach Trailers</span>
        </div>
        <FiChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
      </summary>

      <div className="space-y-5 border-t border-primary/15 px-5 py-5 text-xs sm:text-sm text-muted-foreground">
        <section>
          <h3 className="mb-2 font-bold text-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" /> Create Movie or Asset
          </h3>
          <ol className="list-decimal space-y-1.5 pl-6 text-muted-foreground">
            <li>Navigate to Content Management and click "+ Add New".</li>
            <li>Fill in title, description, genres, and media type settings.</li>
            <li>Set Kid Safe, Demo Content, or PPV monetization flags if required.</li>
            <li>Upload poster/banner images, then select and upload the primary video file.</li>
            <li>Publish when real-time ingest status becomes "Ready".</li>
          </ol>
        </section>

        <section>
          <h3 className="mb-2 font-bold text-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" /> Create Demo Content
          </h3>
          <ol className="list-decimal space-y-1.5 pl-6 text-muted-foreground">
            <li>Create content from the movie or documentary management workflow.</li>
            <li>Enable "Is Demo Content" in step 1 of the content editor.</li>
            <li>Complete uploads and publish after ingest transcoding is ready.</li>
          </ol>
        </section>

        <section>
          <h3 className="mb-2 font-bold text-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" /> Create Series & Episodes
          </h3>
          <ol className="list-decimal space-y-1.5 pl-6 text-muted-foreground">
            <li>Go to Series Management and create a new series container.</li>
            <li>Add seasons inside the series structure tree.</li>
            <li>Add episodes under each season and upload episode media files.</li>
            <li>Publish episodes and series after ingest transcoding completes.</li>
          </ol>
        </section>

        <section>
          <h3 className="mb-2 font-bold text-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" /> Attach Trailer to Specific Content
          </h3>
          <ol className="list-decimal space-y-1.5 pl-6 text-muted-foreground">
            <li>Click "Attach Trailer" (link icon button) on any content card.</li>
            <li>Choose Upload File or enter an external Trailer URL.</li>
            <li>If creating trailer content, select the parent content asset first.</li>
            <li>Save and verify the trailer playback link.</li>
          </ol>
        </section>
      </div>
    </details>
  )
}
