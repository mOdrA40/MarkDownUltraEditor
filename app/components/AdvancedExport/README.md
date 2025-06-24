# Advanced Export Component - Refactored Architecture

## 📋 Overview

Komponen AdvancedExport telah direfactor secara komprehensif dengan arsitektur yang lebih baik, mengikuti best practices React/TypeScript dan prinsip-prinsip software engineering yang solid.

## 🏗️ Arsitektur Baru

### Struktur Folder
```
app/components/AdvancedExport/
├── index.tsx                    # Main component (simplified)
├── types/
│   ├── export.types.ts         # All interfaces & types
│   └── theme.types.ts          # Theme-related types (future)
├── hooks/
│   ├── useExportOptions.ts     # State management hook
│   ├── useExportToPDF.ts       # PDF export logic
│   ├── useExportToDocx.ts      # DOCX export logic
│   ├── useExportToEpub.ts      # EPUB export logic
│   └── useExportToPresentation.ts # Presentation export logic
├── utils/
│   ├── downloadFile.ts         # File download utility
│   ├── markdownConverter.ts    # Markdown to HTML conversion
│   ├── htmlGenerator.ts        # Styled HTML generation
│   └── constants.ts            # Default options & themes
├── components/
│   ├── FormatSelector.tsx      # Format selection UI
│   ├── StyleOptions.tsx        # Style configuration UI
│   ├── AdvancedOptions.tsx     # Advanced settings UI
│   └── PreviewPanel.tsx        # Preview functionality
└── README.md                   # This documentation
```

## 🎯 Prinsip Refactoring

### 1. **Separation of Concerns**
- **UI Components**: Fokus pada rendering dan user interaction
- **Custom Hooks**: Menangani business logic dan state management
- **Utility Functions**: Operasi data dan transformasi
- **Types**: Type safety dan interface definitions

### 2. **Single Responsibility Principle**
- Setiap file memiliki tanggung jawab yang jelas dan terbatas
- Maksimal 100-150 baris per file
- Satu komponen = satu fungsi utama

### 3. **Reusability & Maintainability**
- Custom hooks dapat digunakan kembali
- Utility functions yang modular
- Type-safe dengan TypeScript
- Consistent naming conventions

### 4. **Performance Optimization**
- Proper memoization dengan useCallback
- Efficient state management
- Lazy loading untuk heavy operations
- Optimized re-renders

## 🔧 Custom Hooks

### `useExportOptions`
Mengelola state untuk export options dengan validation.

```typescript
const {
  options,
  updateOption,
  updateOptions,
  resetOptions,
  validateOptions,
  getValidatedOptions
} = useExportOptions(fileName);
```

### Export Hooks
Setiap format export memiliki hook terpisah:
- `useExportToPDF` - Export ke PDF via print dialog
- `useExportToDocx` - Export ke RTF format
- `useExportToEpub` - Export ke HTML e-book format
- `useExportToPresentation` - Export ke HTML presentation

```typescript
const pdfExport = useExportToPDF(markdown, onSuccess, onError);
await pdfExport.startExport(options);
```

## 🧩 UI Components

### `FormatSelector`
Komponen untuk memilih format export dan konfigurasi dasar.

### `StyleOptions`
Komponen untuk konfigurasi theme, typography, dan layout.

### `AdvancedOptions`
Komponen untuk watermark dan custom CSS.

### `PreviewPanel`
Komponen untuk preview dengan kontrol responsif.

## 🛠️ Utility Functions

### `downloadFile.ts`
- Native browser download functionality
- File sanitization
- Size estimation
- Error handling

### `markdownConverter.ts`
- Markdown to HTML conversion
- Metadata extraction
- Table of contents generation
- Sanitization

### `htmlGenerator.ts`
- Styled HTML generation
- Theme application
- Print-optimized CSS
- Responsive design

## 📱 Responsive Design

Komponen menggunakan mobile-first approach dengan breakpoints:
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

## 🔒 Type Safety

Semua komponen menggunakan TypeScript dengan strict typing:
- Interface definitions untuk semua props
- Type-safe event handlers
- Generic types untuk reusability
- Proper error handling

## 🧪 Testing Strategy

### Unit Tests
- Test individual utility functions
- Test custom hooks with React Testing Library
- Mock external dependencies

### Integration Tests
- Test component interactions
- Test export workflows
- Test responsive behavior

### E2E Tests
- Test complete export flows
- Test file downloads
- Test error scenarios

## 📈 Performance Metrics

### Before Refactoring
- **File Size**: 1324 lines in single file
- **Complexity**: High cyclomatic complexity
- **Maintainability**: Low (mixed concerns)
- **Testability**: Difficult (monolithic structure)

### After Refactoring
- **File Size**: Average 100-150 lines per file
- **Complexity**: Low (single responsibility)
- **Maintainability**: High (separation of concerns)
- **Testability**: High (modular structure)

## 🚀 Usage

### Basic Usage
```typescript
import { AdvancedExport } from '@/components/AdvancedExport';

<AdvancedExport
  markdown={markdownContent}
  fileName="document.md"
  isOpen={isDialogOpen}
  onClose={() => setIsDialogOpen(false)}
/>
```

### Advanced Usage with Custom Hooks
```typescript
import { useExportToPDF } from '@/components/AdvancedExport/hooks';

const pdfExport = useExportToPDF(
  markdown,
  (message) => toast.success(message),
  (error) => toast.error(error)
);

// Start export
await pdfExport.startExport(exportOptions);
```

## 🔄 Migration Guide

### From Legacy Component
1. Import tetap sama: `import { AdvancedExport } from '@/components/AdvancedExport'`
2. Props interface tidak berubah
3. Functionality tetap sama
4. Performance dan maintainability meningkat

### Breaking Changes
- **None**: Backward compatibility terjaga
- Legacy wrapper tersedia untuk smooth transition

## 🎨 Styling

### CSS Classes
- `.advanced-export-tabs-list` - Desktop tabs navigation
- `.advanced-export-tabs-trigger` - Desktop tab buttons
- `.advanced-export-mobile-tabs` - Mobile tabs container
- `.advanced-export-mobile-tab-trigger` - Mobile tab buttons
- `.advanced-export-tabs-content` - Content area tabs
- `.advanced-export-options-panel` - Options panel container
- `.advanced-export-preview-panel` - Preview panel container
- `.advanced-export-preview-header` - Preview header
- `.advanced-export-preview-content` - Preview content area
- `.advanced-export-preview-document` - Preview document container
- `.advanced-export-preview-desktop` - Desktop preview mode
- `.advanced-export-preview-tablet` - Tablet preview mode
- `.advanced-export-preview-mobile` - Mobile preview mode
- `.advanced-export-button` - Export buttons
- `.advanced-export-progress` - Progress bar container
- `.advanced-export-progress-bar` - Progress bar fill

### Layout Improvements
- **Desktop**: TabsList dengan max-width dan proper spacing
- **Tablet**: Optimized layout untuk tablet screens
- **Mobile**: Vertical tabs dengan improved spacing
- **Responsive**: Smooth transitions antar breakpoints

### Theme Support
- Support untuk 4 built-in themes
- Custom CSS injection
- Dark mode compatibility
- Print-optimized styles
- Consistent design language

## 🐛 Error Handling & Bug Fixes

### Recent Fixes
- **Fixed downloadFile.ts**: Resolved TypeScript error pada line 59-60 dengan proper browser API detection
- **Fixed Layout Issues**: Memperbaiki TabsList layout pada desktop yang terlalu lebar dan hampir menyentuh preview panel

### Validation
- Input validation untuk semua fields
- File size limits
- Format compatibility checks
- Browser compatibility checks

### Error Recovery
- Graceful degradation
- User-friendly error messages
- Retry mechanisms
- Fallback options

## 📚 Best Practices

### Development
1. Follow TypeScript strict mode
2. Use ESLint + Prettier
3. Write JSDoc comments
4. Test-driven development

### Performance
1. Use React.memo untuk expensive components
2. Implement proper useCallback/useMemo
3. Lazy load heavy dependencies
4. Optimize bundle size

### Accessibility
1. WCAG 2.1 AA compliance
2. Keyboard navigation
3. Screen reader support
4. High contrast support

## 🔮 Future Enhancements

### Planned Features
- [ ] Additional export formats (Word, PowerPoint)
- [ ] Cloud storage integration
- [ ] Batch export functionality
- [ ] Template system
- [ ] Advanced styling options

### Technical Improvements
- [ ] Web Workers untuk heavy processing
- [ ] Service Worker untuk offline support
- [ ] Progressive enhancement
- [ ] Performance monitoring

## 📞 Support

Untuk pertanyaan atau issues terkait refactoring ini:
1. Check dokumentasi ini terlebih dahulu
2. Review type definitions di `types/export.types.ts`
3. Lihat contoh usage di komponen utama
4. Test dengan unit tests yang tersedia
