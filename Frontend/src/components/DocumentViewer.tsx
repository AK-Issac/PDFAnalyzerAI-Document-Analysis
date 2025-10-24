// src/components/DocumentViewer.tsx

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, BookmarkPlus, X, ZoomIn, ZoomOut, Highlighter, Trash2 } from 'lucide-react';
import PdfViewer, { Highlight } from './PdfViewer'; // Import the new Highlight type
import { uploadPdf } from '../services/apiService';

// Defines the structure for the state holding the uploaded file
interface PdfFile {
  file: File;
  url: string;
}

// Defines the props this component receives from its parent (Workspace)
interface DocumentViewerProps {
  onUploadSuccess: (docId: string) => void;
  onSummarize: (selectedText: string) => void; 
}

function DocumentViewer({ onUploadSuccess, onSummarize }: DocumentViewerProps) {
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- State for the UI controls ---
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  // --- Handlers for User Actions ---

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;

    setIsUploading(true);
    try {
      const result = await uploadPdf(file);
      onUploadSuccess(result.doc_id);
      const url = URL.createObjectURL(file);
      setPdfFile({ file, url });
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload the file. Please check the console and ensure the backend is running.");
    } finally {
      setIsUploading(false);
    }
  }, [onUploadSuccess]);

  // Effect to clean up the temporary URL to prevent memory leaks
  useEffect(() => {
    return () => { if (pdfFile) URL.revokeObjectURL(pdfFile.url); };
  }, [pdfFile]);

  // Resets the viewer to its initial state when a file is closed
  const handleRemoveFile = () => {
    setPdfFile(null);
    setHighlights([]);
    setTotalPages(0);
    setCurrentPage(1);
    setZoom(100);
  };

  const handleUploadClick = () => fileInputRef.current?.click();
  
  const handleZoomChange = (newZoom: number) => {
    setZoom(Math.max(25, Math.min(newZoom, 300))); // Clamp zoom
  };
  
  // Adds a new highlight from the child and triggers the summarize logic in Workspace
  const handleAddHighlight = (highlight: Highlight) => {
    setHighlights(prev => [...prev, highlight]);
    onSummarize(highlight.text); 
  };

  const clearHighlights = () => {
    setHighlights([]);
  };

  // --- Conditional Rendering ---
  if (!pdfFile) {
    return (
      <main className="flex-1 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center p-8">
          <BookmarkPlus className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
            Upload and Analyze Your Document
          </h3>
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

  return (
    <main className="flex-1 bg-slate-200 dark:bg-slate-950 flex flex-col overflow-hidden">
      {/* TOP CONTROL BAR */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-2 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-md font-semibold text-slate-900 dark:text-white truncate" title={pdfFile.file.name}>
            {pdfFile.file.name}
          </h2>
          <button onClick={handleRemoveFile} title="Close file" className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md">
            <X className="w-4 h-4" />
          </button>
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
        fileUrl={pdfFile.url} 
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