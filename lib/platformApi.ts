import { get, post } from './api';
// import { getAccessToken } from './tokenStore';

export interface PlatformSettings {
  site_name: string;
  logo_s3_key: string;
  primary_color: string;
  secondary_color: string;
  support_email: string;
  currency_default: string;
  updated_at: string;
}

export interface UpdatePlatformSettingsRequest {
  site_name?: string;
  primary_color?: string;
  secondary_color?: string;
  support_email?: string;
  currency_default?: string;
}

export interface PlatformLogoUploadResponse {
  logo_url: string;
  s3_key: string;
}

import { getAccessToken } from './tokenStore';

export function getPlatformSettings(token?: string) {
  const accessToken = token || getAccessToken();
  console.log('object')
  return get<PlatformSettings>('api/v1/platform/settings', accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined);
}

export function updatePlatformSettings(data: UpdatePlatformSettingsRequest, token?: string) {
  const accessToken = token || getAccessToken();
  return post<PlatformSettings>('api/v1/platform/settings', data, accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined);
}

import { API_CONFIG } from './config';

// import { getAccessToken } from './tokenStore';
// 
export function uploadPlatformLogo(file: File, token?: string): Promise<PlatformLogoUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const accessToken = token || getAccessToken();
  return fetch(`${API_CONFIG.baseUrl}api/v1/platform/logo-upload`, {
    method: 'POST',
    body: formData,
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  }).then(res => {
    if (!res.ok) throw new Error('Logo upload failed');
    return res.json();
  });
}
