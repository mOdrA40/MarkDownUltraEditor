# 🚀 MarkDownUltraRemix

<div align="center">

![MarkDownUltraRemix Logo](public/markdownlogo.svg)

**Modern Markdown Editor with Advanced Features and High Performance**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/mOdrA40/MarkDownUltraRemix)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/mOdrA40/MarkDownUltraRemix)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![React Router](https://img.shields.io/badge/React%20Router-v7-red)](https://reactrouter.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://typescriptlang.org)
[![Netlify](https://img.shields.io/badge/Deploy-Netlify-00C7B7)](https://netlify.com)

[🌐 Live Demo](https://markdowneditorultra.netlify.app/) • [🐛 Report Bug](https://github.com/mOdrA40/MarkDownUltraRemix/issues)

</div>

## 📋 Table of Contents

- [✨ Key Features](#-key-features)
- [🎨 Screenshots](#-screenshots)
- [🛠️ Tech Stack](#️-tech-stack)
- [⚡ Quick Start](#-quick-start)
- [📦 Installation](#-installation)
- [🔧 Configuration](#-configuration)
- [🚀 Deployment](#-deployment)
- [📚 Usage](#-usage)
- [🔧 Troubleshooting](#-troubleshooting)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## ✨ Key Features

### 📝 **Advanced Editor**

- **Live Preview** - See your markdown rendered in real-time
- **Syntax Highlighting** - Code highlighting with 100+ language support
- **Auto-completion** - Smart markdown syntax completion
- **Vim Mode** - Vim keybindings for power users
- **Focus Mode** - Distraction-free writing environment
- **Typewriter Mode** - Keep current line centered

### 🎨 **Beautiful Themes**

- **6 Premium Themes**: Ocean, Forest, Sunset, Purple, Rose, Dark
- **Customizable** - Adjust fonts, sizes, and spacing
- **Responsive** - Optimal display on all devices
- **Dark/Light Mode** - Automatic system preference detection

### 📊 **Analytics & Statistics**

- **Real-time Stats** - Word count, character count, reading time
- **Document Structure** - Automatic heading analysis
- **Writing Progress** - Track your productivity
- **Performance Monitor** - Real-time performance monitoring

### 🔧 **Export & Tools**

- **Multi-format Export** - PDF, DOCX, HTML, EPUB, Slides
- **Template Library** - Ready-to-use templates for various documents
- **File Management** - Import/export with cloud sync
- **Keyboard Shortcuts** - Efficient workflow with shortcuts

### 🔐 **Security & Authentication**

- **Clerk Authentication** - Secure login with multiple providers
- **Supabase Database** - Secure and scalable cloud database
- **Row Level Security** - Row-level data security
- **HTTPS Enforcement** - End-to-end encrypted connections

### 📱 **PWA & Offline**

- **Progressive Web App** - Install like a native application
- **Offline Support** - Work without internet connection
- **Auto-sync** - Automatic synchronization when online
- **Cross-platform** - Windows, macOS, Linux, iOS, Android

## 🎨 Screenshots

<div align="center">

### 🌊 Ocean Theme

![Ocean Theme](https://via.placeholder.com/800x400/0ea5e9/ffffff?text=Ocean+Theme+Preview)

### 🌲 Forest Theme

![Forest Theme](https://via.placeholder.com/800x400/059669/ffffff?text=Forest+Theme+Preview)

### 🌅 Sunset Theme

![Sunset Theme](https://via.placeholder.com/800x400/ea580c/ffffff?text=Sunset+Theme+Preview)

</div>

## 🛠️ Tech Stack

### **Frontend**

- **React Router v7** - Modern React framework with SSR/SPA
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible and customizable UI components
- **Lucide React** - Modern and consistent icon library

### **Backend & Database**

- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Clerk** - Authentication and user management
- **Native Third Party Auth** - Latest Clerk-Supabase integration

### **Build & Deploy**

- **Vite** - Lightning-fast build tool
- **Biome** - Modern linter and formatter
- **Netlify** - Deployment platform with CI/CD
- **PWA** - Progressive Web App capabilities

### **Performance & Monitoring**

- **React Query** - Data fetching and caching
- **Sentry** - Error tracking and performance monitoring
- **Code Splitting** - Lazy loading for optimal performance
- **Service Worker** - Caching and offline support

## ⚡ Quick Start

```bash
# Clone repository
git clone https://github.com/mOdrA40/MarkDownUltraRemix.git
cd MarkDownUltraRemix

# Install dependencies
bun install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📦 Installation

### **Prerequisites**

- **Node.js** >= 18.0.0
- **Bun** >= 1.0.0 (recommended) or npm/yarn
- **Git** for version control

### **1. Clone Repository**

```bash
git clone https://github.com/mOdrA40/MarkDownUltraRemix.git
cd MarkDownUltraRemix
```

### **2. Install Dependencies**

```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install

# Or using yarn
yarn install
```

### **3. Setup Environment Variables**

Create `.env` file in root directory:

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

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

## 🔧 Configuration

### **Clerk Authentication Setup**

1. **Create account at [Clerk](https://clerk.com)**
2. **Create new application**
3. **Copy Publishable Key and Secret Key**
4. **Configure OAuth providers** (Google, GitHub, etc.)
5. **Set domain** for production

### **Supabase Database Setup**

1. **Create project at [Supabase](https://supabase.com)**
2. **Copy URL and Anon Key**
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

4. **Configure Third Party Auth** with Clerk domain

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

## 📚 Usage

### **Writing Documents**

1. **Start writing** in the left editor panel
2. **See real-time preview** in the right panel
3. **Use toolbar** for quick formatting
4. **Choose theme** according to preference

### **Authentication Features**

- **Sign In/Sign Up** - Click button in header to login
- **Multiple Providers** - Google, GitHub, Email/Password
- **Cloud Sync** - Files automatically saved to cloud
- **Cross-device** - Access files from any device

### **File Management**

- **Auto-save** - Automatic saving every 2 seconds
- **File Browser** - Manage files at `/files` page
- **Import/Export** - Drag & drop or browse files
- **Version History** - Track document changes

### **Keyboard Shortcuts**

| Shortcut | Function        |
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

### **Export Documents**

1. **Click Export button** in toolbar
2. **Choose format**: PDF, DOCX, HTML, EPUB
3. **Customize settings** as needed
4. **Download** exported file

### **PWA Installation**

1. **Open application** in browser
2. **Click install prompt** or browser menu
3. **Install** as desktop/mobile app
4. **Use offline** without internet connection

## 🔧 Troubleshooting

### **Build Issues**

```bash
# Clear cache and rebuild
bun run clean
bun install
bun run build
```

### **Authentication Issues**

- Ensure Clerk keys are correct
- Check domain configuration in Clerk dashboard
- Verify Supabase Third Party Auth setup

### **Database Connection Issues**

- Verify Supabase URL and keys
- Check RLS policies
- Ensure Clerk domain added to Supabase allowed origins

### **Performance Issues**

- Enable development monitoring: `NODE_ENV=development`
- Check browser console for errors
- Monitor network requests in DevTools

### **Common Errors**

| Error                              | Solution                                 |
| ---------------------------------- | ---------------------------------------- |
| `Missing Clerk Publishable Key`    | Set `VITE_CLERK_PUBLISHABLE_KEY` in .env |
| `Supabase connection failed`       | Verify URL and anon key                  |
| `Build failed`                     | Run `bun run typecheck` to check errors  |
| `404 on routes`                    | Check `_redirects` file for SPA routing  |
| `Authentication modal not showing` | Verify Clerk configuration and domain    |
| `Files not syncing`                | Check Supabase RLS policies and auth     |

### **Performance Optimization**

- **Enable gzip compression** on hosting
- **Use CDN** for static assets
- **Monitor bundle size** with `bun run build`
- **Lazy load components** for optimal performance
- **Cache strategies** with service worker

### **Security Best Practices**

- **Never expose secret keys** on client-side
- **Use environment variables** for sensitive data
- **Enable HTTPS** in production
- **Configure CSP headers** for XSS protection
- **Regular security updates** for dependencies

## 🤝 Contributing

We welcome contributions from the community!

### **How to Contribute**

1. **Fork** this repository
2. **Create branch** for new feature: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Create Pull Request**

### **Development Guidelines**

- Use TypeScript with strict mode
- Follow ESLint and Prettier configuration
- Write tests for new features
- Update documentation if needed

### **Code Style**

```bash
# Format code
bun run format

# Lint code
bun run lint:fix

# Type check
bun run typecheck
```

## 📄 License

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

**⭐ If this project helps you, please give it a star on GitHub!**

[🌐 Live Demo](https://markdowneditorultra.netlify.app/) • [🐛 Issues](https://github.com/mOdrA40/MarkDownUltraRemix/issues)

</div>
