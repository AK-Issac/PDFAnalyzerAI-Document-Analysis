import { useState, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2, AlertCircle, FileText } from 'lucide-react';
import { PdfViewerProps } from '../types/pdf';
import { formatFileSize } from '../utils/pdfUtils';

// --- FIX 1: Correctly configure the PDF.js worker ---
// This modern approach uses the bundler (like Vite or Create React App)
// to automatically find the worker file in `node_modules` and provide
// a correct public path to it. This is the most reliable method.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

function PdfViewer({
  file,
  currentPage,
  onPageChange,
  zoom,
  onZoomChange,
  onPageCountChange,
  className = ''
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);
  const [documentLoaded, setDocumentLoaded] = useState(false);

  // --- FIX 2: Correct the useEffect dependency array ---
  // The dependencies were changed from `[file, loading, documentLoaded]` to just `[file]`.
  // This prevents an infinite loop where state changes would constantly reset the timeout.
  // Now, this effect only runs ONCE when a new file is provided.
  useEffect(() => {
    setLoading(true);
    setError(null);
    setDocumentLoaded(false);
    setNumPages(null);

    const timeout = setTimeout(() => {
      // If this timeout runs, it means the document hasn't successfully loaded
      // within the time limit, because onLoadSuccess would have cleared the loading state.
      if (!documentLoaded) {
        console.warn('PDF loading timeout');
        setError('PDF loading timed out. The file may be corrupted or too large. Try a different PDF file.');
        setLoading(false);
      }
    }, 15000); // 15 second timeout

    return () => clearTimeout(timeout);
  }, [file]); // <-- CORRECTED DEPENDENCY ARRAY

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully:', { numPages, file: typeof file === 'string' ? file : file?.name });
    setNumPages(numPages);
    setLoading(false);
    setError(null);
    setDocumentLoaded(true);

    if (onPageCountChange) {
      onPageCountChange(numPages);
    }

    if (file instanceof File) {
      setFileInfo({
        name: file.name,
        size: file.size,
      });
    }
  }, [file, onPageCountChange]);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF load error:', error);
    setError(`Failed to load PDF: ${error.message}. This might be due to PDF.js worker issues. Try refreshing the page.`);
    setLoading(false);
    setDocumentLoaded(false);
  }, []);

  const onDocumentLoadStart = useCallback(() => {
    console.log('PDF load started for file:', file);
    setLoading(true);
    setError(null);
  }, [file]);

  const scale = zoom / 100;

  if (loading && !documentLoaded) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-slate-400 dark:text-slate-500 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Loading PDF...</p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            File: {typeof file === 'string' ? 'URL' : file instanceof File ? file.name : 'Unknown'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
            If this takes too long, try a different PDF file.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Error Loading PDF
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 max-w-md">
            {error}
          </p>
          <div className="space-y-2">
            <button
              onClick={() => {
                // Manually trigger a reload attempt by resetting state
                setLoading(true);
                setError(null);
                setDocumentLoaded(false);
              }}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Try Again
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              If the issue persists, try a different PDF file or refresh the page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-800">
        <div className="flex justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            <Document
              file={file}
              onLoadStart={onDocumentLoadStart}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                  <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">Loading PDF...</span>
                </div>
              }
              error={
                <div className="flex items-center justify-center p-8">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  <span className="ml-2 text-sm text-red-600 dark:text-red-400">Error loading PDF</span>
                </div>
              }
            >
              <Page
                pageNumber={currentPage}
                scale={scale}
                className="shadow-lg"
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                    <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">Loading page...</span>
                  </div>
                }
                error={
                  <div className="flex items-center justify-center p-8">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="ml-2 text-sm text-red-600 dark:text-red-400">Error loading page</span>
                  </div>
                }
              />
            </Document>
          </div>
        </div>
      </div>

      {fileInfo && (
        <div className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-3">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <FileText className="w-4 h-4" />
            <span className="font-medium">{fileInfo.name}</span>
            <span>•</span>
            <span>{formatFileSize(fileInfo.size)}</span>
            {numPages && (
              <>
                <span>•</span>
                <span>{numPages} pages</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PdfViewer;