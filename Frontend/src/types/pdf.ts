export interface PdfDocument {
  id: string;
  title: string;
  fileUrl: string;
  pageCount: number;
  fileSize: number;
  uploadedAt: Date;
}

export interface PdfViewerProps {
  file: File | string;
  currentPage: number;
  onPageChange: (page: number) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onPageCountChange?: (pageCount: number) => void;
  className?: string;
}

export interface PdfPageProps {
  pageNumber: number;
  scale: number;
  className?: string;
}
