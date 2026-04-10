import { get, post, put, del } from './api';
import { getAccessToken } from './tokenStore';

// ============================================
// LANDING PAGE CONTENT
// ============================================

export interface LandingPageContent {
  id: number;
  main_text: string;
  sub_text: string;
  description: string;
  button_text: string;
  updated_at: string;
}

export interface CreateLandingPageContentRequest {
  main_text: string;
  sub_text: string;
  description: string;
  button_text: string;
}

export interface UpdateLandingPageContentRequest {
  main_text?: string;
  sub_text?: string;
  description?: string;
  button_text?: string;
}

export function getLandingPageContent(token?: string) {
  const accessToken = token || getAccessToken();
  return get<LandingPageContent>(
    'api/landing-page-content/single/', 
    accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined
  );
}

export function createLandingPageContent(data: CreateLandingPageContentRequest, token?: string) {
  const accessToken = token || getAccessToken();
  return post<LandingPageContent>(
    'api/landing-page-content/single/', 
    data,
    accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined
  );
}

export function updateLandingPageContent(id: number, data: UpdateLandingPageContentRequest, token?: string) {
  const accessToken = token || getAccessToken();
  return put<LandingPageContent>(
    `api/landing-page-content/single/${id}`, 
    data,
    accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined
  );
}

export function deleteLandingPageContent(id: number, token?: string) {
  const accessToken = token || getAccessToken();
  return del<void>(
    `api/landing-page-content/single/${id}`,
    accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined
  );
}

// ============================================
// LOGIN SCREEN CONTENT
// ============================================

export interface LoginScreenContent {
  id: number;
  tag: string;
  title: string;
  description: string;
  text_position_1: string;
  text_position_2: string;
  updated_at: string;
}

export interface CreateLoginScreenContentRequest {
  tag: string;
  title: string;
  description: string;
  text_position_1: string;
  text_position_2: string;
}

export interface UpdateLoginScreenContentRequest {
  tag?: string;
  title?: string;
  description?: string;
  text_position_1?: string;
  text_position_2?: string;
}

export function getLoginScreenContent(token?: string) {
  const accessToken = token || getAccessToken();
  return get<LoginScreenContent>(
    'api/login-screen-content/single/', 
    accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined
  );
}

export function createLoginScreenContent(data: CreateLoginScreenContentRequest, token?: string) {
  const accessToken = token || getAccessToken();
  return post<LoginScreenContent>(
    'api/login-screen-content/single/', 
    data,
    accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined
  );
}

export function updateLoginScreenContent(id: number, data: UpdateLoginScreenContentRequest, token?: string) {
  const accessToken = token || getAccessToken();
  return put<LoginScreenContent>(
    `api/login-screen-content/single/${id}`, 
    data,
    accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined
  );
}

export function deleteLoginScreenContent(id: number, token?: string) {
  const accessToken = token || getAccessToken();
  return del<void>(
    `api/login-screen-content/single/${id}`,
    accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined
  );
}

// ============================================
// FOOTER CONTENT
// ============================================

export interface FooterContent {
  id: number;
  text_1: string;
  text_2: string;
  social_links: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  other_links: {
    privacy?: string;
    terms?: string;
    contact?: string;
  };
  updated_at: string;
}

export interface CreateFooterContentRequest {
  text_1: string;
  text_2: string;
  social_links?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  other_links?: {
    privacy?: string;
    terms?: string;
    contact?: string;
  };
}

export interface UpdateFooterContentRequest {
  text_1?: string;
  text_2?: string;
  social_links?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  other_links?: {
    privacy?: string;
    terms?: string;
    contact?: string;
  };
}

export function getFooterContent(token?: string) {
  const accessToken = token || getAccessToken();
  return get<FooterContent>(
    'api/v1/platform/footer-content/single/', 
    accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined
  );
}
 
export function createFooterContent(data: CreateFooterContentRequest, token?: string) {
  const accessToken = token || getAccessToken();
  return post<FooterContent>(
    'api/footer-content/single/', 
    data,
    accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined
  );
}

export function updateFooterContent(id: number, data: UpdateFooterContentRequest, token?: string) {
  const accessToken = token || getAccessToken();
  return put<FooterContent>(
    `api/footer-content/single/${id}`, 
    data,
    accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined
  );
}

export function deleteFooterContent(id: number, token?: string) {
  const accessToken = token || getAccessToken();
  return del<void>(
    `api/footer-content/single/${id}`,
    accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined
  );
}