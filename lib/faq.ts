import { API_BASE } from "./config";
import Cookies from "js-cookie";
export type FAQ = {
  id: number;
  question: string;
  answer: string;
  is_active: boolean;
  order: number;
  created_at?: string;
  updated_at?: string;
};


const BASE = `${API_BASE}api/v1/platform/faqs`;

export async function getFaqs(): Promise<FAQ[]> {
  const res = await fetch(BASE, { cache: "no-store" });
  return res.json();
}

export async function deleteFaq(faq: FAQ) {
  const res = await fetch(`${BASE}/${faq.id}/`, { method: "DELETE",
     headers: { 
      "Authorization": `Bearer ${Cookies.get('access_token')}`
    },
   });
  return res.status;
}
export async function createFaq(faq: Partial<FAQ>) {
  const res = await fetch(`${BASE}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Cookies.get('access_token')}`
    },
    body: JSON.stringify(faq),
  });
  return res.status;
}
export async function updateFaq(faq: Partial<FAQ>) {
  const res = await fetch(`${BASE}/${faq.id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Cookies.get('access_token')}`

    },
    body: JSON.stringify(faq),
  });
  return res.status;
}