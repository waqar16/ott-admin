interface UploadProgressProps {
  progress: number
  status: string
}

export function UploadToastProgress({ progress, status }: UploadProgressProps) {
  return (
    <div className="bg-neutral-800 w-[320px] space-y-3 p-4 rounded-md shadow-lg">
      <p className="text-xs text-yellow-400 font-medium">⚠ Do not refresh or close this page</p>

      {/* Progress Bar */}
      <div className="relative">
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white">
          {progress.toFixed(0)}%
        </div>
      </div>

      <p className="text-xs text-gray-300">{status}</p>
    </div>
  )
}
