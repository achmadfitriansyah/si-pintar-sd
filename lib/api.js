// API wrapper: switches between dummy mode and Apps Script backend
// Set NEXT_PUBLIC_API_URL to your deployed Apps Script Web App URL to enable backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Call an Apps Script API endpoint.
 * Uses text/plain content-type to avoid CORS preflight.
 *
 * @param {string} action - Server action name (e.g. "getBooks")
 * @param {object} payload - Request payload
 * @returns {Promise<any>} - Server response data
 */
export async function callApi(action, payload = {}) {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL not set. App is in dummy mode — using local data."
    );
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, payload }),
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);

  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

/**
 * Check if backend is configured. Useful for banners / warnings in UI.
 */
export const isBackendConnected = () => Boolean(API_URL);
