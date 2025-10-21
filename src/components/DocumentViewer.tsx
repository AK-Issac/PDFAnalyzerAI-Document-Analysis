// src/components/DocumentViewer.tsx

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, BookmarkPlus, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import PdfViewer from './PdfViewer';

interface PdfFile {
  file: File;
  url: string;
}

// --- NEW PROPS ---
// We now accept an `onDocumentLoad` callback function from the Workspace.
interface DocumentViewerProps {
  documentId: string | null;
  onDocumentLoad: (isActive: boolean) => void;
}

function DocumentViewer({ documentId, onDocumentLoad }: DocumentViewerProps) {
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- STATE FOR CONTROLS ---
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1); // Still useful to track
  const [zoom, setZoom] = useState(100); // Default zoom is 100%

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPdfFile({ file, url });
      onDocumentLoad(true); // Tell the Workspace a document is now active!
    } else {
      alert('Please select a valid PDF file.');
    }
  }, [onDocumentLoad]);

  // Clean up the object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (pdfFile) {
        URL.revokeObjectURL(pdfFile.url);
      }
    };
  }, [pdfFile]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleRemoveFile = () => {
    setPdfFile(null);
    setTotalPages(0);
    setCurrentPage(1);
    setZoom(100);
    onDocumentLoad(false); // Tell the Workspace the document is gone
  };

  const handleZoomChange = (newZoom: number) => {
      // Clamp zoom between 25% and 300%
      setZoom(Math.max(25, Math.min(newZoom, 300)));
  }

  // Show this screen only if no document is selected from the sidebar AND no file is uploaded
  if (!pdfFile && !documentId) {
    return (
      <main className="flex-1 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookmarkPlus className="w-12 h-12 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
            Upload and Analyze Your Document
          </h3>
          <button onClick={handleUploadClick} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors mx-auto">
            <Upload className="w-4 h-4" />
            <span>Upload PDF</span>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-slate-100 dark:bg-slate-950 flex flex-col overflow-hidden">
      {/* --- HEADER WITH CONTROLS --- */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
              {pdfFile?.file.name || 'Document'}
            </h2>
            {pdfFile && (
                <button onClick={handleRemoveFile} title="Remove file" className="p-1 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                </button>
            )}
          </div>

          <div className="flex items-center gap-4">
              {/* Page Navigation (less useful for scroll, but good for display) */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                    Page {currentPage} of {totalPages}
                </p>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                <button onClick={() => handleZoomChange(zoom - 10)} className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                    <ZoomOut className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-slate-900 dark:text-white min-w-[50px] text-center">
                    {zoom}%
                </span>
                <button onClick={() => handleZoomChange(zoom + 10)} className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                    <ZoomIn className="w-5 h-5" />
                </button>
              </div>
          </div>
        </div>
      </div>
      
      {/* Pass zoom and page info down to the PdfViewer */}
      {pdfFile && (
        <PdfViewer 
          fileUrl={pdfFile.url} 
          zoom={zoom}
          onPageCountChange={setTotalPages}
        />
      )}
    </main>
  );
}

export default DocumentViewer;