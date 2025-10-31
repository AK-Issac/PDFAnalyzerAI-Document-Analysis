import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, ZoomIn, ZoomOut, Highlighter, MessageSquare, Trash2 } from 'lucide-react';
import PdfViewer, { Annotation } from './PdfViewer'; // Import the unified Annotation type
import { uploadPdf } from '../services/apiService';

interface DocumentViewerProps {
  documentUrl: string | null;
  onUploadSuccess: (docId: string, file: File) => void;
  onSummarize: (selectedText: string) => void; 
}

function DocumentViewer({ documentUrl, onUploadSuccess, onSummarize }: DocumentViewerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [annotations, setAnnotations] = useState<Annotation[]>([]); // Unified state for notes and highlights

  useEffect(() => {
    setAnnotations([]); // Clear annotations when document changes
    setTotalPages(0);
    setCurrentPage(1);
  }, [documentUrl]);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;

    setIsUploading(true);
    try {
      const result = await uploadPdf(file);
      onUploadSuccess(result.doc_id, file);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload the file.");
    } finally {
      setIsUploading(false);
    }
  }, [onUploadSuccess]);

  const handleUploadClick = () => fileInputRef.current?.click();
  
  const handleZoomChange = (newZoom: number) => {
    setZoom(Math.max(25, Math.min(newZoom, 300)));
  };
  
  const handleAddAnnotation = (annotation: Annotation) => {
    setAnnotations(prev => [...prev, annotation]);
    // If it was a highlight, also trigger the summarize action in the AI panel
    if (annotation.type === 'highlight') {
      onSummarize(annotation.text); 
    }
  };

  const clearAnnotations = () => {
    setAnnotations([]);
  };

  // --- Conditional Rendering ---
  if (!documentUrl) {
    return (
      <main className="flex-1 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        {/* Placeholder UI remains the same */}
        <div className="text-center p-8">
            <Upload className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Upload a Document</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-6">Begin by uploading a PDF to start your analysis.</p>
            <button onClick={handleUploadClick} disabled={isUploading} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors mx-auto">
                {isUploading ? "Processing..." : <><Upload className="w-4 h-4" /><span>Upload PDF</span></>}
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden"/>
        </div>
      </main>
    );
  }

  // --- THE REDESIGNED VIEWER ---
  return (
    <main className="flex-1 bg-slate-100 dark:bg-slate-950 flex flex-col overflow-hidden">
      {/* TOP CONTROL BAR */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-2 flex items-center justify-between shadow-sm flex-shrink-0 z-10">
        <h2 className="text-md font-semibold text-slate-900 dark:text-white truncate">
          Document Viewer
        </h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-600 dark:text-slate-300">Page {currentPage} of {totalPages}</div>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button onClick={() => handleZoomChange(zoom - 10)} className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"><ZoomOut className="w-5 h-5" /></button>
            <span className="text-sm font-medium text-slate-900 dark:text-white w-12 text-center">{zoom}%</span>
            <button onClick={() => handleZoomChange(zoom + 10)} className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"><ZoomIn className="w-5 h-5" /></button>
          </div>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
          {/* Annotation Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-amber-500" title="Highlights">
              <Highlighter className="w-5 h-5" />
              <span className="text-sm font-semibold">{annotations.filter(a => a.type === 'highlight').length}</span>
            </div>
             <div className="flex items-center gap-2 text-sky-500" title="Notes">
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm font-semibold">{annotations.filter(a => a.type === 'note').length}</span>
            </div>
            <button onClick={clearAnnotations} title="Clear All Annotations" disabled={annotations.length === 0} className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md disabled:opacity-50">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* THE PDF VIEWER CHILD COMPONENT */}
      <PdfViewer 
        fileUrl={documentUrl} 
        zoom={zoom}
        annotations={annotations}
        onAddAnnotation={handleAddAnnotation}
        onPageCountChange={setTotalPages}
        onPageChange={setCurrentPage}
      />
    </main>
  );
}

export default DocumentViewer;