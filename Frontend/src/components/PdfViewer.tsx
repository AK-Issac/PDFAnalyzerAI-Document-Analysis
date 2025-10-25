// src/components/PdfViewer.tsx

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2, AlertCircle } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// The path must be absolute from the root of the site (pointing to the public folder)
pdfjs.GlobalWorkerOptions.workerSrc = '/src/pdf.worker.min.mjs';

// --- TYPES FOR HIGHLIGHTING ---
// Defines the position of a single piece of a highlight
export type HighlightRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};



// Defines a complete highlight, which can be made of multiple rectangles
export type Highlight = {
  id: string;
  page: number;
  rects: HighlightRect[];
  text: string;
};

// Defines the props this component receives from its parent (DocumentViewer)
interface PdfViewerProps {
  fileUrl: string;
  zoom: number;
  highlights: Highlight[];
  onAddHighlight: (highlight: Highlight) => void;
  onPageCountChange: (count: number) => void;
  onPageChange: (page: number) => void;
}

function PdfViewer({ fileUrl, zoom, highlights, onAddHighlight, onPageCountChange, onPageChange }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    onPageCountChange(numPages);
  }

  // --- THE CORE HIGHLIGHTING LOGIC ---
  const handleMouseUp = () => {
    const selection = window.getSelection();
    // Ignore clicks and tiny selections
    if (!selection || selection.isCollapsed || selection.toString().trim().length < 5) {
      return;
    }

    const range = selection.getRangeAt(0);
    // Find the PDF page element that the selection is inside
    const pageElement = range.startContainer.parentElement?.closest('.react-pdf__Page');
    if (!pageElement) return;

    const pageNumber = Number(pageElement.getAttribute('data-page-number'));
    const pageRect = pageElement.getBoundingClientRect();
    
    // A single user highlight can be made of multiple smaller rectangles
    const clientRects = Array.from(range.getClientRects());
    
    // The viewer is scaled by the zoom level, so we must reverse that scaling
    // to get the true coordinates on the unscaled PDF page.
    const scale = zoom / 100;

    const highlightRects: HighlightRect[] = clientRects.map(rect => ({
      x: (rect.left - pageRect.left) / scale,
      y: (rect.top - pageRect.top) / scale,
      width: rect.width / scale,
      height: rect.height / scale,
    }));

    // Create the complete highlight object
    const newHighlight: Highlight = {
      id: `highlight-${Date.now()}`,
      page: pageNumber,
      rects: highlightRects,
      text: selection.toString(),
    };
    
    // Send the complete object (with position) to the parent DocumentViewer
    onAddHighlight(newHighlight);

    // Clear the browser's native blue selection to show only our yellow highlight
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div 
      className="flex-1 overflow-y-auto"
      onMouseUp={handleMouseUp}
    >
      <div className="max-w-4xl mx-auto p-4">
        <Document
          file={fileUrl}
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
          {Array.from(new Array(numPages || 0), (el, index) => {
            const pageNumber = index + 1;
            // Get only the highlights that belong on this specific page
            const pageHighlights = highlights.filter(h => h.page === pageNumber);

            return (
              // Each page is wrapped in a relative container to position highlights
              <div key={`page_container_${pageNumber}`} className="relative">
                <Page
                  key={`page_${pageNumber}`}
                  pageNumber={pageNumber}
                  scale={zoom / 100}
                  className="mb-4 shadow-lg"
                  renderTextLayer={true}
                  // Let the parent know which page is in view
                  onInView={() => onPageChange(pageNumber)} 
                />
                {/* --- RENDER HIGHLIGHT OVERLAYS FOR THIS PAGE --- */}
                {pageHighlights.map(highlight =>
                  highlight.rects.map((rect, i) => (
                    <div
                      key={`${highlight.id}-${i}`}
                      style={{
                        position: 'absolute',
                        // Re-apply the zoom scale to position the overlay correctly
                        left: `${rect.x * (zoom / 100)}px`,
                        top: `${rect.y * (zoom / 100)}px`,
                        width: `${rect.width * (zoom / 100)}px`,
                        height: `${rect.height * (zoom / 100)}px`,
                        backgroundColor: 'rgba(252, 211, 77, 0.4)', // Amber-300 with opacity
                        pointerEvents: 'none', // Allow clicking/selecting through the highlight
                      }}
                    />
                  ))
                )}
              </div>
            );
          })}
        </Document>
      </div>
    </div>
  );
}

export default PdfViewer;