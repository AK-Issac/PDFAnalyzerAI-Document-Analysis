// src/components/DocumentViewer.tsx

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, BookmarkPlus, X, ZoomIn, ZoomOut, Highlighter, Trash2 } from 'lucide-react';
import PdfViewer, { Highlight } from './PdfViewer';
import { uploadPdf } from '../services/apiService';

// Defines the props this component receives from its parent (Workspace)
interface DocumentViewerProps {
  documentUrl: string | null; // The URL of the document to display, passed from Workspace
  onUploadSuccess: (docId: string, file: File) => void;
  onSummarize: (selectedText: string) => void; 
}

function DocumentViewer({ documentUrl, onUploadSuccess, onSummarize }: DocumentViewerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- State for the UI controls, managed within this component ---
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  // Effect to reset the state when a new document is loaded (or unloaded)
  useEffect(() => {
    setHighlights([]);
    setTotalPages(0);
    setCurrentPage(1);
  }, [documentUrl]);

  // Handler for uploading a NEW file
  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;

    setIsUploading(true);
    try {
      // 1. Call the backend AI service to process the file
      const result = await uploadPdf(file);
      // 2. Notify the parent Workspace of the success, passing the backend ID and the full File object
      onUploadSuccess(result.doc_id, file);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload the file. Please check the console and ensure the backend is running.");
    } finally {
      setIsUploading(false);
    }
  }, [onUploadSuccess]);

  // --- UI Handlers ---
  const handleUploadClick = () => fileInputRef.current?.click();
  
  const handleZoomChange = (newZoom: number) => {
    setZoom(Math.max(25, Math.min(newZoom, 300))); // Clamp zoom
  };
  
  const handleAddHighlight = (highlight: Highlight) => {
    setHighlights(prev => [...prev, highlight]);
    onSummarize(highlight.text); 
  };

  const clearHighlights = () => {
    setHighlights([]);
  };

  // --- Conditional Rendering ---

  // If no document is selected in Workspace, show the placeholder/uploader.
  if (!documentUrl) {
    return (
      <main className="flex-1 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center p-8">
          <BookmarkPlus className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Select a Document
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-6">
            Choose a document from your workspace or upload a new one to begin.
          </p>
          <button 
            onClick={handleUploadClick} 
            disabled={isUploading} 
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors mx-auto"
          >
            {isUploading ? "Processing..." : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload PDF</span>
              </>
            )}
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden"/>
        </div>
      </main>
    );
  }

  // If a document URL is provided by Workspace, render the full viewer.
  return (
    <main className="flex-1 bg-slate-200 dark:bg-slate-950 flex flex-col overflow-hidden">
      {/* TOP CONTROL BAR */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-2 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="min-w-0">
          <h2 className="text-md font-semibold text-slate-900 dark:text-white truncate">
            Document Viewer
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-600 dark:text-slate-300">
            Page {currentPage} of {totalPages}
          </div>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleZoomChange(zoom - 10)} className="p-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-slate-900 dark:text-white min-w-[50px] text-center">
              {zoom}%
            </span>
            <button onClick={() => handleZoomChange(zoom + 10)} className="p-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
          <div className="flex items-center gap-2">
            <div className="p-1 text-amber-500 flex items-center gap-2" title={`${highlights.length} highlights`}>
              <Highlighter className="w-5 h-5" />
              <span className="text-sm font-semibold">{highlights.length}</span>
            </div>
            <button 
              onClick={clearHighlights} 
              title="Clear All Highlights" 
              disabled={highlights.length === 0}
              className="p-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* THE PDF VIEWER CHILD COMPONENT */}
      <PdfViewer 
        fileUrl={documentUrl} 
        zoom={zoom}
        highlights={highlights}
        onAddHighlight={handleAddHighlight}
        onPageCountChange={setTotalPages}
        onPageChange={setCurrentPage}
      />
    </main>
  );
}

export default DocumentViewer;