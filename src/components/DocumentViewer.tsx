import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Printer,
  BookmarkPlus,
  Upload,
  X,
} from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import PdfViewer from './PdfViewer';
import { validatePdfFile, createFileUrl, revokeFileUrl } from '../utils/pdfUtils';

interface DocumentViewerProps {
  documentId: string | null;
}

interface PdfFile {
  file: File;
  url: string;
  name: string;
  size: number;
  pageCount: number;
}

function DocumentViewer({ documentId }: DocumentViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('File selected:', file.name, file.type, file.size);
    setIsUploading(true);
    setUploadError(null);

    const validation = validatePdfFile(file);
    if (!validation.isValid) {
      console.error('File validation failed:', validation.error);
      setUploadError(validation.error || 'Invalid file');
      setIsUploading(false);
      return;
    }

    const url = createFileUrl(file);
    console.log('File URL created:', url);
    setPdfFile({
      file,
      url,
      name: file.name,
      size: file.size,
      pageCount: 0,
    });
    setIsUploading(false);
  }, []);

  const handleRemoveFile = useCallback(() => {
    if (pdfFile) {
      revokeFileUrl(pdfFile.url);
      setPdfFile(null);
      setCurrentPage(1);
      setZoom(100);
    }
  }, [pdfFile]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const handlePageCountChange = useCallback((pageCount: number) => {
    if (pdfFile) {
      setPdfFile(prev => prev ? { ...prev, pageCount } : null);
    }
  }, [pdfFile]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  if (!documentId && !pdfFile) {
    return (
      <div className="flex-1 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookmarkPlus className="w-12 h-12 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            No Document Selected
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
            Select a document from the sidebar or upload a new PDF file to get started with AI-powered analysis.
          </p>

          {uploadError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mx-auto"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload PDF</span>
                </>
              )}
            </button>

            <input
              id="pdf-file-input"
              name="pdf-file"
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />

            <p className="text-xs text-slate-400 dark:text-slate-500">
              Maximum file size: 50MB
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 bg-slate-100 dark:bg-slate-950 flex flex-col">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {pdfFile ? pdfFile.name : 'NDA Agreement.pdf'}
              </h2>
              {pdfFile && (
                <button
                  onClick={handleRemoveFile}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {pdfFile ? `PDF • ${pdfFile.size > 0 ? `${(pdfFile.size / 1024 / 1024).toFixed(1)}MB` : 'Unknown size'}` : 'Contract • 25 pages • Last modified 2 hours ago'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {pdfFile && (
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 min-w-[100px] justify-center">
                  <input
                    id="page-number-input"
                    name="page-number"
                    type="number"
                    value={currentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value) || 1;
                      handlePageChange(page);
                    }}
                    className="w-12 text-center text-sm font-medium text-slate-900 dark:text-white bg-transparent border-none focus:outline-none"
                  />
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    / {pdfFile.pageCount || '?'}
                  </span>
                </div>
                <button
                  onClick={() => handlePageChange(Math.min(pdfFile.pageCount || 1, currentPage + 1))}
                  disabled={currentPage === (pdfFile.pageCount || 1)}
                  className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>

            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
              <button
                onClick={() => handleZoomChange(Math.max(25, zoom - 10))}
                className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium text-slate-900 dark:text-white min-w-[50px] text-center">
                {zoom}%
              </span>
              <button
                onClick={() => handleZoomChange(Math.min(300, zoom + 10))}
                className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>

            <button
              title="Fit to screen"
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Maximize2 className="w-5 h-5" />
            </button>

            <button
              title="Download"
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
            </button>

            <button
              title="Print"
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Printer className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {pdfFile ? (
        // --- FIX 3: Pass the `url` to the PdfViewer, not the `File` object ---
        // `react-pdf` works most reliably with a URL string, which you
        // already created with `createFileUrl`.
        <PdfViewer
          file={pdfFile.url} // <-- CORRECTED PROP
          currentPage={currentPage}
          onPageChange={handlePageChange}
          zoom={zoom}
          onZoomChange={handleZoomChange}
          onPageCountChange={handlePageCountChange}
          className="flex-1"
        />
      ) : (
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div
              className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-12"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            >
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <h1 className="text-2xl font-bold mb-6">
                  NON-DISCLOSURE AGREEMENT
                </h1>
                <p className="text-slate-700 leading-relaxed mb-4">
                  This Non-Disclosure Agreement (the "Agreement") is entered into as of{' '}
                  <span className="font-semibold">January 15, 2024</span> (the "Effective Date")
                  by and between:
                </p>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 mb-6">
                  <p className="mb-2">
                    <span className="font-semibold">Party A:</span> TechCorp Industries Inc.
                  </p>
                  <p>
                    <span className="font-semibold">Party B:</span> Innovation Solutions LLC
                  </p>
                </div>
                <h2 className="text-xl font-semibold mt-8 mb-4">
                  1. Definition of Confidential Information
                </h2>
                <p className="leading-relaxed mb-4">
                  For purposes of this Agreement, "Confidential Information" shall include all
                  information or material that has or could have commercial value or other utility
                  in the business in which Disclosing Party is engaged. If Confidential Information
                  is in written form, the Disclosing Party shall label or stamp the materials with
                  the word "Confidential" or some similar warning.
                </p>
                {/* ... (rest of placeholder content) ... */}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default DocumentViewer;