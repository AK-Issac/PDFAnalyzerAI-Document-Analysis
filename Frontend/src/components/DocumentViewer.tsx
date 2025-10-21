// src/components/DocumentViewer.tsx

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, BookmarkPlus } from 'lucide-react';
import PdfViewer from './PdfViewer';
import { uploadPdf } from '../services/apiService'; // Import our new service

interface PdfFile {
  file: File;
  url: string;
}

interface DocumentViewerProps {
  onUploadSuccess: (docId: string) => void;
  onSummarize: (text: string) => void;
}

function DocumentViewer({ onUploadSuccess, onSummarize }: DocumentViewerProps) {
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;

    setIsUploading(true);
    try {
      // Use the apiService to upload the file
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

  useEffect(() => {
    return () => { if (pdfFile) URL.revokeObjectURL(pdfFile.url); };
  }, [pdfFile]);

  const handleUploadClick = () => fileInputRef.current?.click();

  if (!pdfFile) {
    return (
      <main className="flex-1 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center p-8">
          <BookmarkPlus className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-6">Upload and Analyze Your Document</h3>
          <button onClick={handleUploadClick} disabled={isUploading} className="px-6 py-3 rounded-lg bg-slate-900 text-white disabled:opacity-60">
            {isUploading ? "Processing..." : "Upload PDF"}
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden"/>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-slate-100 flex flex-col overflow-hidden">
      {/* Pass handleSummarizeSelection down to PdfViewer */}
      {pdfFile && <PdfViewer fileUrl={pdfFile.url} onTextSelect={onSummarize} />}
    </main>
  );
}

export default DocumentViewer;