'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// ─── Global type stubs for Google APIs (loaded via CDN) ───────────────────────
declare global {
  interface Window {
    gapi: {
      load: (libraries: string, callback: () => void) => void;
      client: {
        init: (config: { apiKey: string; discoveryDocs: string[] }) => Promise<void>;
      };
    };
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: ((response: any) => void) | string;
          }) => {
            callback: (response: any) => void;
            requestAccessToken: (options: { prompt: string }) => void;
          };
        };
      };
      picker: {
        PickerBuilder: new () => any;
        DocsView: new (viewId?: any) => any;
        DocsUploadView: new () => any;
        Action: { PICKED: string };
        Feature: { MULTISELECT_ENABLED: string };
        ViewId: { DOCS: string };
      };
    };
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  url: string;
  sizeBytes?: number;
}

export interface GoogleDriveButtonProps {
  /** Called when the user selects / uploads files in the picker */
  onFilePicked?: (files: DriveFile[]) => void;
  /** Additional CSS classes for the button */
  className?: string;
  /** Button label — defaults to "Upload from Google Drive" */
  children?: React.ReactNode;
  /** Allow picking more than one file (default: false) */
  allowMultiple?: boolean;
  /** Restrict the picker to specific MIME types, e.g. ["video/mp4"] */
  mimeTypes?: string[];
  disabled?: boolean;
}

// ─── Env / config ─────────────────────────────────────────────────────────────

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? '';
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

// ─── Script loader helpers ────────────────────────────────────────────────────

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(script);
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GoogleDriveButton({
  onFilePicked,
  className = '',
  children,
  allowMultiple = false,
  mimeTypes,
  disabled = false,
}: GoogleDriveButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tokenClientRef = useRef<any>(null);
  const accessTokenRef = useRef<string | null>(null);
  const pickerLoadedRef = useRef(false);

  // ── Load GAPI + GIS scripts once on mount ──────────────────────────────────
useEffect(() => {
  if (!CLIENT_ID || !API_KEY) return;

  const initGoogle = async () => {
    try {
      await Promise.all([
        loadScript("https://apis.google.com/js/api.js"),
        loadScript("https://accounts.google.com/gsi/client"),
      ]);

      // Wait until gapi is available
      const waitForGapi = () =>
        new Promise<void>((resolve) => {
          const check = () => {
            if (window.gapi) resolve();
            else setTimeout(check, 50);
          };
          check();
        });

      await waitForGapi();

      await new Promise<void>((resolve) =>
        window.gapi.load("client:picker", resolve)
      );

      await window.gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [],
      });

      pickerLoadedRef.current = true;

      tokenClientRef.current =
        window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: "",
        });
    } catch (err) {
      console.error("[GoogleDriveButton] Init error:", err);
    }
  };

  initGoogle();
}, []);

  // ── Build & show the picker ────────────────────────────────────────────────
  const openPicker = useCallback(
    (token: string) => {
      if (!pickerLoadedRef.current) {
        setError('Google Picker is not ready yet. Please try again.');
        setLoading(false);
        return;
      }

      const { PickerBuilder, Action, DocsView, DocsUploadView, Feature, ViewId } =
        window.google.picker;

      // Upload view — lets the user upload a file from their machine to Drive
      const uploadView = new DocsUploadView();

      // Drive view — lets the user browse existing Drive files
      const driveView = new DocsView(ViewId.DOCS);
      driveView.setIncludeFolders(false);
      if (mimeTypes?.length) {
        driveView.setMimeTypes(mimeTypes.join(','));
      }

      const builder = new PickerBuilder()
        .setOAuthToken(token)
        .setDeveloperKey(API_KEY)
        .setTitle('Select or Upload a File')
        .addView(uploadView)
        .addView(driveView)
        .setCallback((data: any) => {
          // Google Picker returns the user action under `data.action`.
          // Keep a fallback check for compatibility with older payload shapes.
          const action = data?.action;
          console.log('[GoogleDriveButton] Picker callback:', data);

          if (action === Action.PICKED || data?.[Action.PICKED]) {
            const files: DriveFile[] = (data.docs ?? []).map((doc: any) => ({
              id: doc.id,
              name: doc.name,
              mimeType: doc.mimeType,
              url: doc.url,
              sizeBytes: doc.sizeBytes,
            }));
            onFilePicked?.(files);
          }
          setLoading(false);
        });

      if (allowMultiple) {
        builder.enableFeature(Feature.MULTISELECT_ENABLED);
      }

      builder.build().setVisible(true);
    },
    [allowMultiple, mimeTypes, onFilePicked],
  );

  // ── Button click handler ───────────────────────────────────────────────────
  const handleClick = useCallback(() => {
    if (!CLIENT_ID || !API_KEY) {
      setError(
        'Google API credentials are missing. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID and NEXT_PUBLIC_GOOGLE_API_KEY.',
      );
      return;
    }

    if (!tokenClientRef.current) {
      setError('Google Sign-In is not ready yet. Please wait a moment and try again.');
      return;
    }

    setError(null);
    setLoading(true);

    // If we already have a valid token, open the picker immediately
    if (accessTokenRef.current) {
      openPicker(accessTokenRef.current);
      return;
    }

    // Ask the user to grant Google Drive access
    tokenClientRef.current.callback = (response: any) => {
      if (response.error) {
        setError(`Google auth error: ${response.error}`);
        setLoading(false);
        return;
      }
      accessTokenRef.current = response.access_token;
      openPicker(response.access_token);
    };

    // Prompt for consent only if we don't have a token
    tokenClientRef.current.requestAccessToken({ prompt: '' });
  }, [openPicker]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || loading}
        className={[
          'inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium',
          'bg-white text-gray-700 border border-gray-300 shadow-sm',
          'hover:bg-gray-50 active:bg-gray-100 transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Google Drive icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 87.3 78"
          aria-hidden="true"
          className="h-5 w-5 shrink-0"
        >
          <path
            d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 53H0c0 1.55.4 3.1 1.2 4.5z"
            fill="#0066da"
          />
          <path
            d="M43.65 25L29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L1.2 48.5C.4 49.9 0 51.45 0 53h27.5z"
            fill="#00ac47"
          />
          <path
            d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L86.1 57.5c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 11.85z"
            fill="#ea4335"
          />
          <path
            d="M43.65 25L57.4 1.2A13.25 13.25 0 0 0 53.55 0h-19.8c-1.4 0-2.8.35-4.05.9z"
            fill="#00832d"
          />
          <path d="M59.8 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h49.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
          <path
            d="M73.4 26.5l-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25 59.8 53h27.45c0-1.55-.4-3.1-1.2-4.5z"
            fill="#ffba00"
          />
        </svg>

        {loading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Opening Drive…
          </>
        ) : (
          children ?? 'Upload from Google Drive'
        )}
      </button>

      {error && (
        <p className="text-xs text-red-500 max-w-xs leading-snug" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
