import { pdfjs } from 'react-pdf';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validatePdfFile = (file: File): { isValid: boolean; error?: string } => {
  if (file.type !== 'application/pdf') {
    return { isValid: false, error: 'Please select a PDF file.' };
  }
  
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 50MB.' };
  }
  
  return { isValid: true };
};

export const createFileUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

export const revokeFileUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};
