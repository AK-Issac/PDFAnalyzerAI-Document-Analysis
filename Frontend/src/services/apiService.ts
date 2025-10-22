// src/services/apiService.ts

const BASE_URL = 'http://localhost:5000/api';

/**
 * Uploads a PDF file to the backend.
 * @param file The PDF file to upload.
 * @returns The JSON response from the server, including the doc_id.
 */
export async function uploadPdf(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }
  return response.json();
}

/**
 * Sends a question about a document to the backend.
 * @param doc_id The ID of the document.
 * @param question The user's question.
 * @returns The JSON response from the server, including the AI's answer.
 */
export async function queryDocument(doc_id: string, question: string) {
  const response = await fetch(`${BASE_URL}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doc_id, question }),
  });

  if (!response.ok) {
    throw new Error('Query failed');
  }
  return response.json();
}

/**
 * Sends selected text to the backend for summarization.
 * @param selected_text The text selected by the user.
 * @returns The JSON response from the server, including the summary.
 */
export async function summarizeText(selected_text: string) {
  const response = await fetch(`${BASE_URL}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selected_text }),
  });

  if (!response.ok) {
    throw new Error('Summarization failed');
  }
  return response.json();
}