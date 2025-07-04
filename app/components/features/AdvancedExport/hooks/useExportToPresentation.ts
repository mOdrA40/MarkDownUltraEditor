import { useCallback, useState } from 'react';
import type { ExportOptions, SlideData, UseExportReturn } from '../types/export.types';
import { ERROR_MESSAGES, EXPORT_PROGRESS_STEPS, SUCCESS_MESSAGES } from '../utils/constants';
import { downloadFile, sanitizeFilename } from '../utils/downloadFile';

/**
 * Custom hook untuk export ke Presentation
 *
 * @param markdown - Konten markdown
 * @param fileName - Nama file default
 * @param onSuccess - Callback ketika export berhasil
 * @param onError - Callback ketika export gagal
 * @returns Export state dan functions
 */
export const useExportToPresentation = (
  markdown: string,
  fileName: string,
  onSuccess?: (message: string) => void,
  onError?: (error: string) => void
): UseExportReturn => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const startExport = useCallback(
    async (options: ExportOptions) => {
      if (!markdown?.trim()) {
        onError?.(ERROR_MESSAGES.EMPTY_CONTENT);
        return;
      }

      setIsExporting(true);
      setExportProgress(EXPORT_PROGRESS_STEPS.INITIALIZING);

      try {
        // Parse markdown menjadi slides
        const slides = parseMarkdownToSlides(markdown);
        setExportProgress(EXPORT_PROGRESS_STEPS.PROCESSING);

        if (slides.length === 0) {
          throw new Error('No slides found. Make sure your markdown has headings.');
        }

        // Generate presentation HTML
        const presentationHTML = generatePresentationHTML(options, slides);
        setExportProgress(EXPORT_PROGRESS_STEPS.GENERATING);

        // Create blob dan download
        const blob = new Blob([presentationHTML], { type: 'text/html' });
        setExportProgress(EXPORT_PROGRESS_STEPS.FINALIZING);

        const safeFileName = sanitizeFilename(`${options.title || fileName}-presentation`, '.html');
        downloadFile(blob, safeFileName);

        setExportProgress(EXPORT_PROGRESS_STEPS.COMPLETE);
        onSuccess?.(SUCCESS_MESSAGES.PRESENTATION_EXPORTED);
      } catch (error) {
        console.error('Presentation export error:', error);
        const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.EXPORT_FAILED;
        onError?.(errorMessage);
      } finally {
        setIsExporting(false);
        setExportProgress(0);
      }
    },
    [markdown, fileName, onSuccess, onError]
  );

  const resetExport = useCallback(() => {
    setIsExporting(false);
    setExportProgress(0);
  }, []);

  return {
    isExporting,
    exportProgress,
    startExport,
    resetExport,
  };
};

/**
 * Parse markdown menjadi slides berdasarkan headings
 */
const parseMarkdownToSlides = (markdown: string): SlideData[] => {
  const slides: SlideData[] = [];
  const lines = markdown.split('\n');
  let currentSlide: SlideData = { title: '', content: [] };

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Heading level 1 atau 2 membuat slide baru
    if (trimmedLine.startsWith('# ') || trimmedLine.startsWith('## ')) {
      // Simpan slide sebelumnya jika ada
      if (currentSlide.title) {
        slides.push(currentSlide);
      }

      // Mulai slide baru
      currentSlide = {
        title: trimmedLine.replace(/^#+\s/, ''),
        content: [],
      };
    } else if (trimmedLine) {
      // Tambahkan konten ke slide saat ini
      currentSlide.content.push(trimmedLine);
    }
  }

  // Tambahkan slide terakhir
  if (currentSlide.title) {
    slides.push(currentSlide);
  }

  return slides;
};

/**
 * Generate HTML presentation
 */
const generatePresentationHTML = (options: ExportOptions, slides: SlideData[]): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(options.title)} - Presentation</title>
    <style>
        ${generatePresentationStyles(options)}
    </style>
</head>
<body>
    <div class="presentation">
        <div class="slide-counter">
            <span id="current-slide">1</span> / <span id="total-slides">${slides.length}</span>
        </div>

        ${generateTitleSlide(options)}
        ${slides.map((slide) => generateSlideHTML(slide)).join('')}

        <div class="navigation">
            <button class="nav-btn" onclick="previousSlide()">Previous</button>
            <button class="nav-btn" onclick="toggleFullscreen()">Fullscreen</button>
            <button class="nav-btn" onclick="nextSlide()">Next</button>
        </div>
    </div>

    <script>
        ${generatePresentationScript(slides.length + 1)}
    </script>
</body>
</html>`;
};

/**
 * Generate presentation styles
 */
const generatePresentationStyles = (options: ExportOptions): string => {
  return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: '${options.fontFamily}', sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            overflow: hidden;
        }

        .presentation {
            display: flex;
            flex-direction: column;
            height: 100vh;
            position: relative;
        }

        .slide {
            display: none;
            flex: 1;
            padding: 60px;
            text-align: center;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            position: relative;
        }

        .slide.active {
            display: flex;
        }

        .slide h1 {
            font-size: 3.5em;
            margin-bottom: 0.5em;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            font-weight: 700;
        }

        .slide h2 {
            font-size: 2.8em;
            margin-bottom: 0.8em;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            font-weight: 600;
        }

        .slide-content {
            font-size: 1.5em;
            line-height: 1.6;
            max-width: 900px;
            text-align: left;
        }

        .slide-content p {
            margin: 0.8em 0;
        }

        .slide-content ul, .slide-content ol {
            text-align: left;
            margin: 1em 0;
            padding-left: 2em;
        }

        .slide-content li {
            margin: 0.5em 0;
        }

        .slide-content code {
            background: rgba(255,255,255,0.2);
            padding: 0.2em 0.5em;
            border-radius: 4px;
            font-family: monospace;
        }

        .slide-content blockquote {
            border-left: 4px solid rgba(255,255,255,0.5);
            padding-left: 1em;
            margin: 1em 0;
            font-style: italic;
            opacity: 0.9;
        }

        .title-slide {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .title-slide h1 {
            font-size: 4em;
            margin-bottom: 0.3em;
        }

        .title-slide .subtitle {
            font-size: 1.5em;
            opacity: 0.8;
            margin-bottom: 0.5em;
        }

        .title-slide .author {
            font-size: 1.2em;
            opacity: 0.7;
        }

        .navigation {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 15px;
            z-index: 1000;
        }

        .nav-btn {
            padding: 12px 24px;
            background: rgba(255,255,255,0.2);
            border: none;
            border-radius: 25px;
            color: white;
            cursor: pointer;
            backdrop-filter: blur(10px);
            font-size: 1em;
            transition: all 0.3s ease;
        }

        .nav-btn:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-2px);
        }

        .nav-btn:active {
            transform: translateY(0);
        }

        .slide-counter {
            position: fixed;
            top: 30px;
            right: 30px;
            background: rgba(0,0,0,0.3);
            padding: 10px 20px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            z-index: 1000;
            font-size: 1.1em;
        }

        .progress-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            height: 4px;
            background: rgba(255,255,255,0.3);
            transition: width 0.3s ease;
            z-index: 1000;
        }

        @media (max-width: 768px) {
            .slide {
                padding: 30px 20px;
            }

            .slide h1 {
                font-size: 2.5em;
            }

            .slide h2 {
                font-size: 2em;
            }

            .slide-content {
                font-size: 1.2em;
            }

            .navigation {
                bottom: 20px;
                gap: 10px;
            }

            .nav-btn {
                padding: 10px 16px;
                font-size: 0.9em;
            }
        }

        @media print {
            .slide {
                display: block !important;
                page-break-after: always;
                height: 100vh;
            }

            .navigation, .slide-counter {
                display: none;
            }
        }
    `;
};

/**
 * Generate title slide
 */
const generateTitleSlide = (options: ExportOptions): string => {
  // Detect dark theme context
  const isDark =
    typeof window !== 'undefined' &&
    (document.body.classList.contains('dark') ||
      document.body.classList.contains('theme-dark') ||
      document.body.getAttribute('data-theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const textColor = isDark ? '#ffffff' : '#333333';

  return `
    <div class="slide title-slide active">
        <h1>${escapeHtml(options.title)}</h1>
        ${options.description ? `<div class="subtitle">${escapeHtml(options.description)}</div>` : ''}
        <div class="author" style="color: ${textColor};">by ${escapeHtml(options.author)}</div>
    </div>
  `;
};

/**
 * Generate single slide HTML
 */
const generateSlideHTML = (slide: SlideData): string => {
  const processedContent = slide.content
    .map((line) => {
      // Process basic markdown dalam content
      let processed = line;

      // Bold
      processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      // Italic
      processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');

      // Code
      processed = processed.replace(/`(.*?)`/g, '<code>$1</code>');

      // Lists
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return `<li>${processed.substring(2)}</li>`;
      }

      if (/^\d+\.\s/.test(line)) {
        const match = line.match(/^\d+\.\s(.*)$/);
        if (match) {
          return `<li>${processed.replace(/^\d+\.\s/, '')}</li>`;
        }
      }

      // Blockquotes
      if (line.startsWith('> ')) {
        return `<blockquote>${processed.substring(2)}</blockquote>`;
      }

      return `<p>${processed}</p>`;
    })
    .join('');

  return `
    <div class="slide">
        <h2>${escapeHtml(slide.title)}</h2>
        <div class="slide-content">
            ${processedContent}
        </div>
    </div>
  `;
};

/**
 * Generate presentation JavaScript
 */
const generatePresentationScript = (totalSlides: number): string => {
  return `
        let currentSlide = 0;
        const slides = document.querySelectorAll('.slide');
        const totalSlidesCount = ${totalSlides};

        function showSlide(n) {
            slides[currentSlide].classList.remove('active');
            currentSlide = (n + totalSlidesCount) % totalSlidesCount;
            slides[currentSlide].classList.add('active');
            document.getElementById('current-slide').textContent = currentSlide + 1;
            updateProgressBar();
        }

        function nextSlide() {
            showSlide(currentSlide + 1);
        }

        function previousSlide() {
            showSlide(currentSlide - 1);
        }

        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }

        function updateProgressBar() {
            const progress = ((currentSlide + 1) / totalSlidesCount) * 100;
            let progressBar = document.querySelector('.progress-bar');
            if (!progressBar) {
                progressBar = document.createElement('div');
                progressBar.className = 'progress-bar';
                document.body.appendChild(progressBar);
            }
            progressBar.style.width = progress + '%';
        }

        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            switch(e.key) {
                case 'ArrowRight':
                case ' ':
                case 'PageDown':
                    e.preventDefault();
                    nextSlide();
                    break;
                case 'ArrowLeft':
                case 'PageUp':
                    e.preventDefault();
                    previousSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    showSlide(0);
                    break;
                case 'End':
                    e.preventDefault();
                    showSlide(totalSlidesCount - 1);
                    break;
                case 'F11':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
            }
        });

        // Touch/swipe support
        let startX = 0;
        let startY = 0;

        document.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', function(e) {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;

            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    nextSlide();
                } else {
                    previousSlide();
                }
            }
        });

        // Initialize
        updateProgressBar();
    `;
};

/**
 * Escape HTML characters
 */
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};
