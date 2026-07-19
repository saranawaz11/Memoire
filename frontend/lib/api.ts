const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

type GetToken = () => Promise<string | null>;

/**
 * For 'use client' components. Pass getToken from Clerk's useAuth() hook —
 * this file can't call the hook itself since it's outside React.
 * Replaces manually setting the x-user-id header.
 */
export async function apiFetch(
  path: string,
  getToken: GetToken,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getToken();

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}


// import { auth } from '@clerk/nextjs/server';

// const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// export async function apiFetch(path: string, options: RequestInit = {}) {
//   const { getToken } = await auth();
//   const token = await getToken();

//   return fetch(`${API_BASE}${path}`, {
//     ...options,
//     headers: {
//       ...options.headers,
//       Authorization: `Bearer ${token}`,
//       'Content-Type': 'application/json',
//     },
//   });
// }