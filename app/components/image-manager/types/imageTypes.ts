/**
 * TypeScript interfaces untuk Image Manager
 * Mendefinisikan struktur data dan props yang digunakan dalam sistem manajemen gambar
 */

export interface ImageItem {
  /** Unique identifier untuk setiap gambar */
  id: string;
  /** Nama file gambar */
  name: string;
  /** URL atau base64 data gambar */
  url: string;
  /** Ukuran file dalam bytes */
  size: number;
  /** MIME type gambar (image/jpeg, image/png, dll) */
  type: string;
  /** Lebar gambar dalam pixels */
  width: number;
  /** Tinggi gambar dalam pixels */
  height: number;
  /** Tanggal pembuatan/upload */
  createdAt: Date;
  /** Array tag untuk kategorisasi */
  tags: string[];
  /** Flag apakah gambar sudah dikompres */
  compressed?: boolean;
  /** Ukuran file asli sebelum kompresi */
  originalSize?: number;
}

export interface ImageManagerProps {
  /** Callback untuk memasukkan gambar ke dokumen */
  onInsertImage: (imageUrl: string, altText: string) => void;
  /** Status dialog terbuka/tertutup */
  isOpen: boolean;
  /** Callback untuk menutup dialog */
  onClose: () => void;
}

export interface ImageUploaderProps {
  /** Callback ketika upload berhasil */
  onUploadSuccess: (images: ImageItem[]) => void;
  /** Status loading upload */
  isUploading: boolean;
  /** Callback untuk mengubah status loading */
  onUploadingChange: (loading: boolean) => void;
}

export interface ImageGalleryProps {
  /** Array gambar yang akan ditampilkan */
  images: ImageItem[];
  /** Gambar yang sedang dipilih */
  selectedImage: ImageItem | null;
  /** Callback ketika gambar dipilih */
  onImageSelect: (image: ImageItem) => void;
  /** Mode tampilan: grid atau list */
  viewMode: 'grid' | 'list';
  /** Status drag and drop aktif */
  dragActive: boolean;
  /** Callback untuk drag events */
  onDrag: (e: React.DragEvent) => void;
  /** Callback untuk drop events */
  onDrop: (e: React.DragEvent) => void;
}

export interface ImageDetailsProps {
  /** Gambar yang akan ditampilkan detailnya */
  image: ImageItem | null;
  /** Callback untuk memasukkan gambar ke dokumen */
  onInsertImage: (imageUrl: string, altText: string) => void;
  /** Callback untuk menutup dialog */
  onClose: () => void;
  /** Callback untuk menghapus gambar */
  onDeleteImage: (imageId: string) => void;
  /** Callback untuk copy URL gambar */
  onCopyUrl: (url: string) => void;
  /** Callback untuk membuka editor */
  onShowEditor: () => void;
}

export interface ImageFiltersProps {
  /** Term pencarian */
  searchTerm: string;
  /** Callback untuk mengubah term pencarian */
  onSearchChange: (term: string) => void;
  /** Tag filter yang dipilih */
  filterTag: string;
  /** Callback untuk mengubah filter tag */
  onFilterChange: (tag: string) => void;
  /** Array semua tag yang tersedia */
  availableTags: string[];
  /** Mode tampilan saat ini */
  viewMode: 'grid' | 'list';
  /** Callback untuk mengubah mode tampilan */
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export interface ImageGridProps {
  /** Array gambar yang difilter */
  filteredImages: ImageItem[];
  /** Mode tampilan */
  viewMode: 'grid' | 'list';
  /** Gambar yang dipilih */
  selectedImage: ImageItem | null;
  /** Callback ketika gambar dipilih */
  onImageSelect: (image: ImageItem) => void;
}

export interface DragDropState {
  /** Status drag aktif */
  dragActive: boolean;
  /** Callback untuk drag enter */
  onDragEnter: (e: React.DragEvent) => void;
  /** Callback untuk drag leave */
  onDragLeave: (e: React.DragEvent) => void;
  /** Callback untuk drag over */
  onDragOver: (e: React.DragEvent) => void;
  /** Callback untuk drop */
  onDrop: (e: React.DragEvent) => void;
}

export interface ImageCompressionOptions {
  /** Lebar maksimal */
  maxWidth?: number;
  /** Tinggi maksimal */
  maxHeight?: number;
  /** Kualitas kompresi (0-1) */
  quality?: number;
}

export interface ImageValidationResult {
  /** Apakah file valid */
  isValid: boolean;
  /** Pesan error jika tidak valid */
  error?: string;
}

export type ViewMode = 'grid' | 'list';
export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';
