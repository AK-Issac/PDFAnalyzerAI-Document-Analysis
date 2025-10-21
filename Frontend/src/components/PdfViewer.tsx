// src/components/PdfViewer.tsx

import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';


pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

interface PdfViewerProps {
  fileUrl: string;
  onTextSelect: (selectedText: string) => void;
}

function PdfViewer({ fileUrl, onTextSelect }: PdfViewerProps) {
  const handleMouseUp = () => {
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : '';
    if (selectedText.length > 10) {
      onTextSelect(selectedText);
    }
  };

  return (
    <div 
      className="flex-1 overflow-y-auto p-4"
      onMouseUp={handleMouseUp}
    >
      <Document file={fileUrl}>
        <Page pageNumber={1} />
        {/* You could implement all pages if needed, according to parent's handling */}
      </Document>
    </div>
  );
}

export default PdfViewer;