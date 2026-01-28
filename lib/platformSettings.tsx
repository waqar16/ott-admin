"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API_BASE } from '@/lib/config';

type PlatformSettings = {
  site_name?: string;
  logo_url?: string;
  primary_color?: string;
};

type PlatformSettingsValue = {
  settings: PlatformSettings;
  loading: boolean;
  error: Error | null;
};

const DEFAULT_BRAND: Required<PlatformSettings> = {
  site_name: "UR VIEW",
  logo_url: "",
  primary_color: "#1d4ed8",
};

const PlatformSettingsContext = createContext<PlatformSettingsValue | undefined>(undefined);

export function PlatformSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_BRAND);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/v1/platform/settings/`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Failed to load platform settings (${response.status})`);
        }

        const data = await response.json();
        if (isCancelled) return;

        setSettings(normalizeSettings(data));
        setError(null);
      } catch (err) {
        if (isCancelled) return;
        setError(err as Error);
        setSettings(DEFAULT_BRAND);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchSettings();
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    applyBranding(settings.primary_color);
    applyDocumentTitle(settings.site_name);
  }, [settings]);

  const value = useMemo(
    () => ({
      settings,
      loading,
      error,
    }),
    [settings, loading, error]
  );

  return <PlatformSettingsContext.Provider value={value}>{children}</PlatformSettingsContext.Provider>;
}

export function usePlatformSettings() {
  const context = useContext(PlatformSettingsContext);

  if (!context) {
    throw new Error("usePlatformSettings must be used within PlatformSettingsProvider");
  }

  return {
    ...context,
    settings: {
      ...DEFAULT_BRAND,
      ...context.settings,
    },
  };
}

function normalizeSettings(data: any): PlatformSettings {
  const siteName = typeof data?.site_name === "string" && data.site_name.trim() ? data.site_name.trim() : DEFAULT_BRAND.site_name;
  const logoUrl = typeof data?.logo_url === "string" ? data.logo_url : "";
  const primaryColor = resolveColor(data?.primary_color) ?? DEFAULT_BRAND.primary_color;

  return {
    site_name: siteName,
    logo_url: logoUrl,
    primary_color: primaryColor,
  };
}

function resolveColor(candidate?: string | null): string | null {
  if (!candidate || typeof candidate !== "string") return null;

  const value = candidate.trim();
  if (!value) return null;

  const prefixed = value.startsWith("#") ? value : `#${value}`;
  const isHex = /^#([0-9a-fA-F]{6})$/.test(prefixed);

  return isHex ? prefixed : null;
}

function applyBranding(primary?: string) {
  if (typeof document === "undefined") return;
  
  const root = document.documentElement;
  const primaryColor = resolveColor(primary) ?? DEFAULT_BRAND.primary_color;
  const hoverColor = shadeHexColor(primaryColor, -0.12);

  root.style.setProperty("--brand-primary", primaryColor);
  root.style.setProperty("--brand-primary-hover", hoverColor);
  root.style.setProperty("--brand-primary-ring", hexToRgba(primaryColor, 0.35));
}

function applyDocumentTitle(siteName?: string) {
  if (typeof document === "undefined") return;
  
  const name = siteName?.trim() || DEFAULT_BRAND.site_name;
  document.title = `${name} Admin Panel`;
}

function shadeHexColor(hex: string, percent: number) {
  const normalized = hex.replace("#", "");
  const num = parseInt(normalized, 16);

  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;

  const factor = percent < 0 ? 1 + percent : 1 + percent;

  const clamp = (v: number) => Math.min(255, Math.max(0, Math.round(v)));
  const newR = clamp(r * factor);
  const newG = clamp(g * factor);
  const newB = clamp(b * factor);

  return `#${[newR, newG, newB]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const num = parseInt(normalized, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const safeAlpha = Math.max(0, Math.min(1, alpha));

  return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
}

export { DEFAULT_BRAND };
