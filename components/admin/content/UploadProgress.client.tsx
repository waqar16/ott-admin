'use client';

interface UploadProgressProps {
  progress: number;
  status: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

export default function UploadProgress({ 
  progress, 
  status, 
  showRetry = false,
  onRetry 
}: UploadProgressProps) {
  return (
    <div className="bg-neutral-900 rounded-lg p-4 space-y-3">
      {/* Progress Bar */}
      <div className="relative">
        <div className="h-4 bg-gray-600 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
          {progress.toFixed(0)}%
        </div>
      </div>

      {/* Status Text */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-300">{status}</p>
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="text-xs text-blue-400 hover:text-blue-300 underline"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
