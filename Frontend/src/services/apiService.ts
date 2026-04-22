// src/services/apiService.ts

const BASE_URL = 'http://localhost:5000/api';

/**
 * Helper to get the standard headers, optionally with a JSON content type.
 * It automatically retrieves the JWT token from localStorage.
 */
function getAuthHeaders(includeJson: boolean = true): HeadersInit {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
}

// --- AUTHENTICATION ---

export async function login(email: string, password: string) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Login failed');
  }
  return response.json();
}

export async function signup(email: string, password: string) {
  const response = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Signup failed');
  }
  return response.json();
}

export async function onboardUser(data: {
  first_name: string;
  last_name: string;
  company?: string;
  role?: string;
  bio?: string;
}) {
  const response = await fetch(`${BASE_URL}/user/onboard`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Onboarding failed');
  }
  return response.json();
}

// --- DATA SERVICES ---

export async function uploadPdf(file: File, folder_id: string | null = null) {
  const formData = new FormData();
  formData.append('file', file);
  if (folder_id) {
    formData.append('folder_id', folder_id);
  }

  const response = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: getAuthHeaders(false), // Do not set Content-Type for FormData
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }
  return response.json();
}

export async function queryDocument(doc_id: string, chat_id: string, question: string) {
  const response = await fetch(`${BASE_URL}/query`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ doc_id, chat_id, question }), 
  });

  if (!response.ok) {
    throw new Error('Query failed');
  }
  return response.json();
}

export async function summarizeText(text: string, description: string) {
  const response = await fetch(`${BASE_URL}/summarize`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ text, description }),
  });

  if (!response.ok) {
    throw new Error('Summarization failed');
  }
  return response.json();
}

// --- FULL STACK ENDPOINTS ---

export async function fetchWorkspace() {
  const response = await fetch(`${BASE_URL}/workspace`, {
    headers: getAuthHeaders(false)
  });
  if (!response.ok) throw new Error('Failed to fetch workspace');
  return response.json();
}

export async function fetchMessages(chat_id: string) {
  const response = await fetch(`${BASE_URL}/messages/${chat_id}`, {
    headers: getAuthHeaders(false)
  });
  if (!response.ok) throw new Error('Failed to fetch messages');
  return response.json();
}

export async function fetchChatForDocument(doc_id: string) {
  const response = await fetch(`${BASE_URL}/chat/${doc_id}`, {
    headers: getAuthHeaders(false)
  });
  if (!response.ok) throw new Error('Failed to fetch chat');
  return response.json();
}

export async function createFolder(name: string) {
  const response = await fetch(`${BASE_URL}/folder`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name })
  });
  if (!response.ok) throw new Error('Failed to create folder');
  return response.json();
}

export async function deleteDocument(doc_id: string) {
  const response = await fetch(`${BASE_URL}/document/${doc_id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(false)
  });
  if (!response.ok) throw new Error('Failed to delete document');
  return response.json();
}

// Helper to get PDF URL
export function getDocumentUrl(doc_id: string) {
  // It's a bit tricky to pass Auth Headers natively in an `<iframe>` src or `<object>` data.
  // Often it's done by returning the raw Blob. If you just pass the URL, the browser won't attach the JWT.
  // For a portfolio, URL query parameters (e.g. ?token=...) or downloading as Blob works. 
  // Let's assume we rely on an object element and see if it works without query params context or if we must change DocumentViewer later.
  return `${BASE_URL}/document/${doc_id}`;
}