'use client';

export default function AdminContentHelpPanel() {
  return (
    <details className="mb-6 rounded-lg border border-blue-500/30 bg-blue-950/20">
      <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-blue-200 hover:bg-blue-900/20">
        Quick Help: Create Content and Attach Trailers
      </summary>

      <div className="space-y-4 border-t border-blue-500/20 px-4 py-4 text-sm text-gray-200">
        <section>
          <h3 className="mb-2 font-semibold text-white">Create Movie</h3>
          <ol className="list-decimal space-y-1 pl-5 text-gray-300">
            <li>Go to Movie Management and click Create New Content.</li>
            <li>Fill title, description, genres, and media type.</li>
            <li>Set Kid Safe, Demo Content, or PPV flags if required.</li>
            <li>Add metadata, upload poster/banner, then upload video.</li>
            <li>Publish when ingest status becomes ready.</li>
          </ol>
        </section>

        <section>
          <h3 className="mb-2 font-semibold text-white">Create Demo Content</h3>
          <ol className="list-decimal space-y-1 pl-5 text-gray-300">
            <li>Create content from movie or documentary flow.</li>
            <li>Enable Is Demo Content in step 1 of the editor.</li>
            <li>Complete uploads and publish after ingest is ready.</li>
          </ol>
        </section>

        <section>
          <h3 className="mb-2 font-semibold text-white">Create Series and Episodes</h3>
          <ol className="list-decimal space-y-1 pl-5 text-gray-300">
            <li>Go to Series Management and create a new series.</li>
            <li>Add seasons inside the series tree.</li>
            <li>Add episodes under each season and upload episode media.</li>
            <li>Publish episodes and series after ingest is ready.</li>
          </ol>
        </section>

        <section>
          <h3 className="mb-2 font-semibold text-white">Attach Trailer to Specific Content</h3>
          <ol className="list-decimal space-y-1 pl-5 text-gray-300">
            <li>Use Attach Trailer from any content card or series menu.</li>
            <li>Choose Upload File or Use Trailer URL.</li>
            <li>If creating trailer content, select parent content first.</li>
            <li>Save and verify trailer playback link.</li>
          </ol>
        </section>
      </div>
    </details>
  );
}