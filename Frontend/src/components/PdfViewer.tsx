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

// --- SELECTION POP-UP COMPONENT ---
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

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      // CHANGED: Position is now 'fixed' to align with viewport mouse coordinates
      style={{ top: position.top, left: position.left }}
      className="fixed z-[100] -translate-x-1/2 -translate-y-full mb-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1 animate-in fade-in zoom-in duration-200"
      onMouseUp={stopPropagation}
      onClick={stopPropagation}
    >
      {!isNoting ? (
        <div className="flex p-1">
          <button
            onClick={() => onAction('highlight')}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-amber-500 flex items-center gap-2"
            title="Highlight"
          >
            <Highlighter className="w-5 h-5" />
            <span className="text-xs font-semibold pr-1">Highlight</span>
          </button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
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
            className="px-2 py-1 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 outline-none w-48"
            autoFocus
          />
          <button onClick={handleNoteSave} className="px-3 py-1 bg-sky-600 text-white rounded-md text-sm font-semibold hover:bg-sky-700">
            Save
          </button>
        </div>
      )}
      {/* Arrow pointing down to cursor */}
      <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white dark:border-t-slate-800 drop-shadow-sm"></div>
    </div>
  );
}

function PdfViewer({ fileUrl, zoom, annotations, onAddAnnotation, onPageCountChange, onPageChange }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [popup, setPopup] = useState<{ top: number; left: number } | null>(null);
  
  const selectionRef = useRef<Selection | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  // MEMOIZE THE FILE PROP TO PREVENT INFINITE RELOADS
  // We type it as 'any' because react-pdf types don't officially surface httpHeaders, but pdfjs requires it
  const fileProp = React.useMemo<any>(() => {
    return {
      url: fileUrl,
      httpHeaders: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    };
  }, [fileUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    onPageCountChange(numPages);
  };

  // ... (rest unchanged) ...
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    const selection = window.getSelection();
    
    // Validation
    if (!selection || selection.isCollapsed || selection.toString().trim().length === 0) {
      setPopup(null);
      return;
    }

    // Store selection
    selectionRef.current = selection;

    // CHANGED: Use ClientX/Y directly for "Mouse Position"
    // We offset Y by -10px so the popup sits slightly above the cursor
    setPopup({
      top: e.clientY - 10,
      left: e.clientX,
    });
  }, []);

  const handlePopupAction = (type: 'highlight' | 'note', noteContent?: string) => {
    const selection = selectionRef.current;
    if (!selection) return;

    const range = selection.getRangeAt(0);
    
    // Find the specific PDF page element (the container for the text layer)
    // We look for .react-pdf__Page because that's the reference frame for the coordinate system
    const pageElement = range.startContainer.parentElement?.closest('.react-pdf__Page') as HTMLElement;
    
    if (!pageElement) {
      console.error("Could not find page element");
      return;
    }

    const pageNumber = Number(pageElement.getAttribute('data-page-number'));
    const pageRect = pageElement.getBoundingClientRect(); // Viewport coordinates of the page
    const scale = zoom / 100;

    // CHANGED: Improve coordinate math
    // 1. We get all rects associated with the selection (handles multi-line)
    // 2. We subtract the PAGE's left/top from the SELECTION's left/top.
    // 3. We divide by scale to get the original PDF point coordinates.
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
    
    setPopup(null);
    selectionRef.current = null;
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div 
      ref={viewerRef}
      className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-900 relative"
      onMouseUp={handleMouseUp}
      onClick={() => setPopup(null)} 
    >
      <div className="p-4 md:p-8 flex flex-col items-center min-h-full">
        {/* Popup is now fixed, so it lives outside the relative flow visually */}
        {popup && <SelectionPopup position={popup} onAction={handlePopupAction} />}
        
        <Document
          file={fileProp}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col h-96 items-center justify-center text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>Loading Document...</p>
            </div>
          }
          error={
            <div className="flex h-96 items-center justify-center text-red-500">
              <AlertCircle className="h-8 w-8" />
              <p className="ml-2">Failed to load PDF file.</p>
            </div>
          }
        >
          {Array.from(new Array(numPages || 0), (_, index) => {
            const pageNumber = index + 1;
            const pageAnnotations = annotations.filter(a => a.page === pageNumber);

            return (
              // CHANGED: Added relative positioning here to strictly bound the absolute children
              <div key={`page_container_${pageNumber}`} className="relative group mb-6">
                <Page
                  key={`page_${pageNumber}`}
                  pageNumber={pageNumber}
                  scale={zoom / 100}
                  className="shadow-md"
                  renderAnnotationLayer={false} // Disable default annotations if they interfere, enable if needed
                  renderTextLayer={true}
                />
                
                {/* --- RENDER ANNOTATIONS LAYER --- */}
                {/* This div matches the exact size/position of the Page component */}
                <div className="absolute inset-0 pointer-events-none">
                  {pageAnnotations.map(annotation => (
                    <div key={annotation.id}>
                      {annotation.rects.map((rect, i) => {
                        return (
                          <React.Fragment key={`${annotation.id}-${i}`}>
                            {/* The Highlight Box */}
                            <div
                              style={{
                                position: 'absolute',
                                left: `${rect.x * (zoom / 100)}px`,
                                top: `${rect.y * (zoom / 100)}px`,
                                width: `${rect.width * (zoom / 100)}px`,
                                height: `${rect.height * (zoom / 100)}px`,
                                backgroundColor: annotation.type === 'highlight' ? 'rgba(252, 211, 77, 0.3)' : 'rgba(14, 165, 233, 0.2)',
                                borderBottom: annotation.type === 'note' ? '2px solid rgba(14, 165, 233, 0.8)' : 'none',
                                mixBlendMode: 'multiply', // Helps text show through clearer
                                pointerEvents: 'auto', // Allows clicking the highlight later if needed
                              }}
                            />
                            
                            {/* The Note Icon (Only render once per annotation) */}
                            {annotation.type === 'note' && i === 0 && (
                               <div
                                 className="absolute z-20 group/icon cursor-pointer"
                                 style={{ 
                                   left: `${(rect.x + rect.width) * (zoom / 100)}px`, // Place at end of highlight
                                   top: `${rect.y * (zoom / 100) - 10}px`,
                                   pointerEvents: 'auto' 
                                 }}
                               >
                                 <MessageSquare className="w-5 h-5 text-white bg-sky-500 rounded-full p-1 shadow-sm transform hover:scale-110 transition-transform" />
                                 {/* Tooltip */}
                                 <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-xs p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover/icon:opacity-100 transition-opacity pointer-events-none z-30">
                                   {annotation.noteContent}
                                 </div>
                               </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </Document>
      </div>
    </div>
  );
}

export default PdfViewer;