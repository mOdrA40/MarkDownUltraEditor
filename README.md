# 🚀 MarkDownUltraRemix

<div align="center">

![MarkDownUltraRemix Logo](public/markdownlogo.svg)

**Editor Markdown Modern dengan Fitur Lengkap dan Performa Tinggi**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/mOdrA40/MarkDownUltraRemix)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/mOdrA40/MarkDownUltraRemix)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![React Router](https://img.shields.io/badge/React%20Router-v7-red)](https://reactrouter.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://typescriptlang.org)
[![Netlify](https://img.shields.io/badge/Deploy-Netlify-00C7B7)](https://netlify.com)

[🌐 Live Demo](https://markdowneditorultra.netlify.app/) • [🐛 Laporkan Bug](https://github.com/mOdrA40/MarkDownUltraRemix/issues)

</div>

## 📋 Daftar Isi

- [✨ Fitur Utama](#-fitur-utama)
- [🎨 Screenshot](#-screenshot)
- [🛠️ Teknologi](#️-teknologi)
- [⚡ Quick Start](#-quick-start)
- [📦 Instalasi](#-instalasi)
- [🔧 Konfigurasi](#-konfigurasi)
- [🚀 Deployment](#-deployment)
- [📚 Penggunaan](#-penggunaan)
- [🔧 Troubleshooting](#-troubleshooting)
- [🤝 Kontribusi](#-kontribusi)
- [📄 Lisensi](#-lisensi)

## ✨ Fitur Utama

### 📝 **Editor Canggih**

- **Live Preview** - Lihat hasil markdown secara real-time
- **Syntax Highlighting** - Highlighting kode dengan dukungan 100+ bahasa
- **Auto-completion** - Pelengkapan otomatis untuk markdown syntax
- **Vim Mode** - Dukungan keybinding Vim untuk power user
- **Focus Mode** - Mode fokus tanpa distraksi
- **Typewriter Mode** - Baris aktif selalu di tengah layar

### 🎨 **Tema Indah**

- **6 Tema Premium**: Ocean, Forest, Sunset, Purple, Rose, Dark
- **Customizable** - Sesuaikan font, ukuran, dan spacing
- **Responsive** - Tampilan optimal di semua perangkat
- **Dark/Light Mode** - Otomatis mengikuti preferensi sistem

### 📊 **Analytics & Statistik**

- **Real-time Stats** - Jumlah kata, karakter, waktu baca
- **Document Structure** - Analisis struktur heading otomatis
- **Writing Progress** - Lacak produktivitas menulis
- **Performance Monitor** - Monitoring performa real-time

### 🔧 **Export & Tools**

- **Multi-format Export** - PDF, DOCX, HTML, EPUB, Slides
- **Template Library** - Template siap pakai untuk berbagai dokumen
- **File Management** - Import/export dengan cloud sync
- **Keyboard Shortcuts** - Workflow efisien dengan shortcut

### 🔐 **Keamanan & Authentication**

- **Clerk Authentication** - Login aman dengan berbagai provider
- **Supabase Database** - Database cloud yang aman dan scalable
- **Row Level Security** - Keamanan data tingkat baris
- **HTTPS Enforcement** - Koneksi terenkripsi end-to-end

### 📱 **PWA & Offline**

- **Progressive Web App** - Install seperti aplikasi native
- **Offline Support** - Bekerja tanpa koneksi internet
- **Auto-sync** - Sinkronisasi otomatis saat online
- **Cross-platform** - Windows, macOS, Linux, iOS, Android

## 🎨 Screenshot

<div align="center">

### 🌊 Ocean Theme

![Ocean Theme](https://via.placeholder.com/800x400/0ea5e9/ffffff?text=Ocean+Theme+Preview)

### 🌲 Forest Theme

![Forest Theme](https://via.placeholder.com/800x400/059669/ffffff?text=Forest+Theme+Preview)

### 🌅 Sunset Theme

![Sunset Theme](https://via.placeholder.com/800x400/ea580c/ffffff?text=Sunset+Theme+Preview)

</div>

## 🛠️ Teknologi

### **Frontend**

- **React Router v7** - Framework React modern dengan SSR/SPA
- **TypeScript** - Type safety dan developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Komponen UI accessible dan customizable
- **Lucide React** - Icon library modern dan konsisten

### **Backend & Database**

- **Supabase** - Backend-as-a-Service dengan PostgreSQL
- **Clerk** - Authentication dan user management
- **Native Third Party Auth** - Integrasi Clerk-Supabase terbaru

### **Build & Deploy**

- **Vite** - Build tool super cepat
- **Biome** - Linter dan formatter modern
- **Netlify** - Platform deployment dengan CI/CD
- **PWA** - Progressive Web App capabilities

### **Performance & Monitoring**

- **React Query** - Data fetching dan caching
- **Sentry** - Error tracking dan performance monitoring
- **Code Splitting** - Lazy loading untuk performa optimal
- **Service Worker** - Caching dan offline support

## ⚡ Quick Start

```bash
# Clone repository
git clone https://github.com/mOdrA40/MarkDownUltraRemix.git
cd MarkDownUltraRemix

# Install dependencies
bun install

# Setup environment variables
cp .env.example .env
# Edit .env dengan konfigurasi Anda

# Start development server
bun run dev
```

Buka [http://localhost:5173](http://localhost:5173) di browser Anda.

## 📦 Instalasi

### **Prerequisites**

- **Node.js** >= 18.0.0
- **Bun** >= 1.0.0 (recommended) atau npm/yarn
- **Git** untuk version control

### **1. Clone Repository**

```bash
git clone https://github.com/mOdrA40/MarkDownUltraRemix.git
cd MarkDownUltraRemix
```

### **2. Install Dependencies**

```bash
# Menggunakan Bun (recommended)
bun install

# Atau menggunakan npm
npm install

# Atau menggunakan yarn
yarn install
```

### **3. Setup Environment Variables**

Buat file `.env` di root directory:

```bash
cp .env.example .env
```

Edit file `.env` dengan konfigurasi Anda:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret

# Supabase Database
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Sentry Error Tracking
VITE_SENTRY_DSN=https://your-sentry-dsn

# Environment
NODE_ENV=development
```

## 🔧 Konfigurasi

### **Clerk Authentication Setup**

1. **Buat akun di [Clerk](https://clerk.com)**
2. **Buat aplikasi baru**
3. **Copy Publishable Key dan Secret Key**
4. **Configure OAuth providers** (Google, GitHub, dll)
5. **Set domain** untuk production

### **Supabase Database Setup**

1. **Buat project di [Supabase](https://supabase.com)**
2. **Copy URL dan Anon Key**
3. **Setup database schema**:

```sql
-- User files table
CREATE TABLE user_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can only access their own files" ON user_files
  FOR ALL USING (auth.jwt() ->> 'sub' = user_id);
```

4. **Configure Third Party Auth** dengan Clerk domain

### **Development Commands**

```bash
# Development server
bun run dev

# Type checking
bun run typecheck

# Linting
bun run lint
bun run lint:fix

# Formatting
bun run format

# Build for production
bun run build

# Preview production build
bun run preview

# Clean build artifacts
bun run clean
```

## 📚 Penggunaan

### **Menulis Dokumen**

1. **Mulai menulis** di editor panel kiri
2. **Lihat preview** real-time di panel kanan
3. **Gunakan toolbar** untuk formatting cepat
4. **Pilih tema** sesuai preferensi

### **Fitur Authentication**

- **Sign In/Sign Up** - Klik tombol di header untuk login
- **Multiple Providers** - Google, GitHub, Email/Password
- **Cloud Sync** - File otomatis tersimpan di cloud
- **Cross-device** - Akses file dari perangkat manapun

### **File Management**

- **Auto-save** - Penyimpanan otomatis setiap 2 detik
- **File Browser** - Kelola file di halaman `/files`
- **Import/Export** - Drag & drop atau browse file
- **Version History** - Lacak perubahan dokumen

### **Keyboard Shortcuts**

| Shortcut | Fungsi          |
| -------- | --------------- |
| `Ctrl+S` | Save file       |
| `Ctrl+O` | Open file       |
| `Ctrl+N` | New file        |
| `Ctrl+E` | Export          |
| `Ctrl+/` | Toggle preview  |
| `Ctrl+\` | Toggle sidebar  |
| `F11`    | Toggle zen mode |
| `Ctrl+B` | Bold text       |
| `Ctrl+I` | Italic text     |
| `Ctrl+K` | Insert link     |

### **Export Dokumen**

1. **Klik tombol Export** di toolbar
2. **Pilih format**: PDF, DOCX, HTML, EPUB
3. **Customize settings** sesuai kebutuhan
4. **Download** file hasil export

### **PWA Installation**

1. **Buka aplikasi** di browser
2. **Klik install prompt** atau menu browser
3. **Install** sebagai aplikasi desktop/mobile
4. **Gunakan offline** tanpa koneksi internet

## 🔧 Troubleshooting

### **Build Issues**

```bash
# Clear cache dan rebuild
bun run clean
bun install
bun run build
```

### **Authentication Issues**

- Pastikan Clerk keys sudah benar
- Check domain configuration di Clerk dashboard
- Verify Supabase Third Party Auth setup

### **Database Connection Issues**

- Verify Supabase URL dan keys
- Check RLS policies
- Ensure Clerk domain added to Supabase allowed origins

### **Performance Issues**

- Enable development monitoring: `NODE_ENV=development`
- Check browser console untuk errors
- Monitor network requests di DevTools

### **Common Errors**

| Error                              | Solusi                                    |
| ---------------------------------- | ----------------------------------------- |
| `Missing Clerk Publishable Key`    | Set `VITE_CLERK_PUBLISHABLE_KEY` di .env  |
| `Supabase connection failed`       | Verify URL dan anon key                   |
| `Build failed`                     | Run `bun run typecheck` untuk cek errors  |
| `404 on routes`                    | Check `_redirects` file untuk SPA routing |
| `Authentication modal not showing` | Verify Clerk configuration dan domain     |
| `Files not syncing`                | Check Supabase RLS policies dan auth      |

### **Performance Optimization**

- **Enable gzip compression** di hosting
- **Use CDN** untuk static assets
- **Monitor bundle size** dengan `bun run build`
- **Lazy load components** untuk performa optimal
- **Cache strategies** dengan service worker

### **Security Best Practices**

- **Never expose secret keys** di client-side
- **Use environment variables** untuk sensitive data
- **Enable HTTPS** di production
- **Configure CSP headers** untuk XSS protection
- **Regular security updates** untuk dependencies

## 🤝 Kontribusi

Kami menyambut kontribusi dari komunitas!

### **Cara Berkontribusi**

1. **Fork** repository ini
2. **Buat branch** untuk fitur baru: `git checkout -b feature/amazing-feature`
3. **Commit** perubahan: `git commit -m 'Add amazing feature'`
4. **Push** ke branch: `git push origin feature/amazing-feature`
5. **Buat Pull Request**

### **Development Guidelines**

- Gunakan TypeScript dengan strict mode
- Follow ESLint dan Prettier configuration
- Tulis tests untuk fitur baru
- Update dokumentasi jika diperlukan

### **Code Style**

```bash
# Format code
bun run format

# Lint code
bun run lint:fix

# Type check
bun run typecheck
```

## 📄 Lisensi

Distributed under the MIT License. See `LICENSE` for more information.

## 👨‍💻 Author

**Axel Modra**

- GitHub: [@mOdrA40](https://github.com/mOdrA40)
- Email: axelginald88@gmail.com

## 🙏 Acknowledgments

- [React Router](https://reactrouter.com) - Amazing React framework
- [Clerk](https://clerk.com) - Seamless authentication
- [Supabase](https://supabase.com) - Powerful backend platform
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [Radix UI](https://radix-ui.com) - Accessible components

---

<div align="center">

**⭐ Jika project ini membantu, berikan star di GitHub!**

[🌐 Live Demo](https://markdowneditorultra.netlify.app/) • [🐛 Issues](https://github.com/mOdrA40/MarkDownUltraRemix/issues)

</div>
