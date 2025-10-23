// src/components/PdfViewer.tsx

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2, AlertCircle } from 'lucide-react';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// The path must be absolute from the root of the site (pointing to the public folder)
pdfjs.GlobalWorkerOptions.workerSrc = '/src/pdf.worker.min.mjs';

interface PdfViewerProps {
  fileUrl: string;
  zoom: number;
  onTextSelect: (selectedText: string) => void;
  onPageCountChange: (count: number) => void;
  onPageChange: (page: number) => void; // For updating the display in the header
}

function PdfViewer({ fileUrl, zoom, onTextSelect, onPageCountChange, onPageChange }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    onPageCountChange(numPages); // Inform the parent of the total page count
  }

  const handleMouseUp = () => {
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : '';
    if (selectedText.length > 10) {
      onTextSelect(selectedText);
    }
  };

  return (
    // This div is the key to scrolling and filling the space
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
          {/* Loop to render all pages, enabling scrolling */}
          {Array.from(new Array(numPages || 0), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              scale={zoom / 100} // Apply the zoom level from the parent
              className="mb-4 shadow-lg"
              renderTextLayer={true}
              onInView={() => onPageChange(index + 1)} // Update current page when it comes into view
            />
          ))}
        </Document>
      </div>
    </div>
  );
}

export default PdfViewer;