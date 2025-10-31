import React, { useState, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2, AlertCircle, MessageSquare, Highlighter } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = '/src/pdf.worker.min.mjs';

// --- TYPE DEFINITIONS ---
export type AnnotationRect = {
  x: number; y: number; width: number; height: number;
};

export type Annotation = {
  id: string;
  type: 'highlight' | 'note';
  page: number;
  rects: AnnotationRect[];
  text: string;
  noteContent?: string;
};

interface PdfViewerProps {
  fileUrl: string;
  zoom: number;
  annotations: Annotation[];
  onAddAnnotation: (annotation: Annotation) => void;
  onPageCountChange: (count: number) => void;
  onPageChange: (page: number) => void;
}

// --- SELECTION POP-UP COMPONENT (IMPROVED) ---
interface SelectionPopupProps {
  position: { top: number; left: number };
  onAction: (type: 'highlight' | 'note', noteContent?: string) => void;
}

function SelectionPopup({ position, onAction }: SelectionPopupProps) {
  const [isNoting, setIsNoting] = useState(false);
  const [noteInput, setNoteInput] = useState('');

  const handleNoteSave = () => {
    if (noteInput.trim()) {
      onAction('note', noteInput.trim());
    }
  };

  // This function prevents the main viewer's click/mouseup events from firing,
  // which would otherwise close the popup instantly.
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      style={{ top: position.top, left: position.left, transform: 'translateX(-50%)' }}
      className="absolute z-50 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1"
      onMouseUp={stopPropagation}
      onClick={stopPropagation} // *** FIX: Stop click propagation to prevent closing
    >
      {!isNoting ? (
        <div className="flex p-1">
          <button
            onClick={() => onAction('highlight')}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-amber-500"
            title="Highlight"
          >
            <Highlighter className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsNoting(true)}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-sky-500"
            title="Add Note"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="p-2 flex items-center gap-2">
          <input
            type="text"
            placeholder="Your note..."
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleNoteSave(); }}
            className="px-2 py-1 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 outline-none"
            autoFocus
          />
          <button onClick={handleNoteSave} className="px-3 py-1 bg-sky-600 text-white rounded-md text-sm font-semibold hover:bg-sky-700">
            Save
          </button>
        </div>
      )}
    </div>
  );
}

function PdfViewer({ fileUrl, zoom, annotations, onAddAnnotation, onPageCountChange, onPageChange }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [popup, setPopup] = useState<{ top: number; left: number } | null>(null);
  
  // Use a ref to store the latest selection data without causing re-renders
  const selectionRef = useRef<Selection | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    onPageCountChange(numPages);
  };

  // This is the handler that fires when you release the mouse after selecting text
  const handleMouseUp = useCallback(() => {
    if (!viewerRef.current) return;
    
    const selection = window.getSelection();
    
    // Check if the selection is valid and contains enough text
    if (!selection || selection.isCollapsed || selection.toString().trim().length < 3) {
      setPopup(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const viewerRect = viewerRef.current.getBoundingClientRect();
    
    // Store the selection object in the ref
    selectionRef.current = selection;

    // Calculate position for the popup
    setPopup({
      top: rect.top - viewerRect.top + viewerRef.current.scrollTop - 45, // Position above selection
      left: rect.left - viewerRect.left + (rect.width / 2),
    });
  }, []);

  const handlePopupAction = (type: 'highlight' | 'note', noteContent?: string) => {
    const selection = selectionRef.current;
    if (!selection) return;

    const range = selection.getRangeAt(0);
    const pageElement = range.startContainer.parentElement?.closest('.react-pdf__Page');
    if (!pageElement) return;

    const pageNumber = Number(pageElement.getAttribute('data-page-number'));
    const pageRect = pageElement.getBoundingClientRect();
    const scale = zoom / 100;

    const annotationRects: AnnotationRect[] = Array.from(range.getClientRects()).map(rect => ({
      x: (rect.left - pageRect.left) / scale,
      y: (rect.top - pageRect.top) / scale,
      width: rect.width / scale,
      height: rect.height / scale,
    }));

    const newAnnotation: Annotation = {
      id: `${type}-${Date.now()}`,
      type: type,
      page: pageNumber,
      rects: annotationRects,
      text: selection.toString(),
      ...(type === 'note' && { noteContent }),
    };

    onAddAnnotation(newAnnotation);
    
    // Clean up
    setPopup(null);
    selectionRef.current = null;
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div 
      ref={viewerRef}
      className="flex-1 overflow-y-auto"
      onMouseUp={handleMouseUp}
      onClick={() => { if (popup) setPopup(null); }} // Hide popup if clicking away
    >
      {/* *** FIX: This container now correctly centers the PDF pages *** */}
      <div className="p-4 md:p-8 flex flex-col items-center">
        {popup && <SelectionPopup position={popup} onAction={handlePopupAction} />}
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div className="flex flex-col h-96 items-center justify-center text-slate-500"><Loader2 className="h-8 w-8 animate-spin mb-4" /><p>Loading Document...</p></div>}
          error={<div className="flex h-96 items-center justify-center text-red-500"><AlertCircle className="h-8 w-8" /><p className="ml-2">Failed to load PDF file.</p></div>}
        >
          {Array.from(new Array(numPages || 0), (_, index) => {
            const pageNumber = index + 1;
            const pageAnnotations = annotations.filter(a => a.page === pageNumber);

            return (
              <div key={`page_container_${pageNumber}`} className="relative">
                <Page
                  key={`page_${pageNumber}`}
                  pageNumber={pageNumber}
                  scale={zoom / 100}
                  className="mb-4 shadow-lg bg-white"
                  onInView={() => onPageChange(pageNumber)}
                />
                
                {/* --- RENDER ANNOTATION OVERLAYS --- */}
                {pageAnnotations.map(annotation => (
                  <div key={annotation.id}>
                    {annotation.rects.map((rect, i) => {
                      const baseStyle: React.CSSProperties = {
                        position: 'absolute',
                        left: `${rect.x * (zoom / 100)}px`,
                        top: `${rect.y * (zoom / 100)}px`,
                        width: `${rect.width * (zoom / 100)}px`,
                        height: `${rect.height * (zoom / 100)}px`,
                        pointerEvents: 'none',
                      };

                      if (annotation.type === 'highlight') {
                        return <div key={`${annotation.id}-${i}`} style={{ ...baseStyle, backgroundColor: 'rgba(252, 211, 77, 0.4)' }} />;
                      }
                      
                      if (annotation.type === 'note' && i === 0) {
                        return (
                          <div
                            key={`${annotation.id}-icon`}
                            className="absolute z-20 group"
                            style={{ left: baseStyle.left, top: baseStyle.top, pointerEvents: 'auto' }}
                          >
                            <MessageSquare className="w-5 h-5 text-sky-600 bg-white rounded-full p-0.5 shadow-lg cursor-pointer" />
                            <div className="absolute bottom-full mb-2 w-max max-w-xs p-2 bg-slate-800 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              {annotation.noteContent}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                ))}
              </div>
            );
          })}
        </Document>
      </div>
    </div>
  );
}

export default PdfViewer;