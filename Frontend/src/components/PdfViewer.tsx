// src/components/PdfViewer.tsx

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2, AlertCircle } from 'lucide-react';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';


pdfjs.GlobalWorkerOptions.workerSrc = '/src/pdf.worker.min.mjs';

interface PdfViewerProps {
  fileUrl: string;
  zoom: number;
  onPageCountChange: (count: number) => void;
}

// This is the corrected and simplified component
function PdfViewer({ fileUrl, zoom, onPageCountChange }: PdfViewerProps) {
  // We manage the number of pages internally in this component.
  const [numPages, setNumPages] = useState<number | null>(null);

  // This function runs when the PDF successfully loads.
  function onDocumentLoadSuccess({ numPages: nextNumPages }: { numPages: number }) {
    // 1. Set our internal state to know how many pages to render.
    setNumPages(nextNumPages);
    // 2. Notify the parent component (`DocumentViewer`) of the total page count for its UI.
    onPageCountChange(nextNumPages);
  }

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      console.log("Selected Text:", selection.toString());
    }
  };

  return (
    <div 
      className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-800 p-4"
      onMouseUp={handleTextSelection}
    >
      <div className="max-w-4xl mx-auto">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin" /><p>Loading Document...</p></div>
          }
          error={
            <div className="flex flex-col items-center justify-center h-96 text-red-500"><AlertCircle className="w-8 h-8" /><p>Failed to load PDF.</p></div>
          }
        >
          {/* THE FIX: We use the internal `numPages` state variable, which is now correctly defined. */}
          {Array.from(new Array(numPages || 0), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              className="mb-4 shadow-lg"
              renderTextLayer={true}
              renderAnnotationLayer={false}
              scale={zoom / 100} // Apply the zoom level
            />
          ))}
        </Document>
      </div>
    </div>
  );
}

export default PdfViewer;