# Project Structure Guide

This document explains the organization of the Cloud Storage project.

## Overview

```
cloud-storage/
├── src/                  # Application source code
├── public/              # Static assets
├── docs/                # Documentation (this folder)
├── package.json         # Dependencies & scripts
└── [config files]       # TypeScript, Next.js, Tailwind, etc.
```

---

## `/src` - Application Code

### `/src/app` - Next.js Routes & Pages

**Layout & Entry**
- `layout.tsx` - Root layout with providers, global styles
- `globals.css` - Tailwind CSS imports and base styles

**Pages**
- `page.tsx` - Root page (redirects to `/files` or `/login`)
- `/login/page.tsx` - Auth page: key generation, import, login
- `/files/page.tsx` - Main file manager interface
- `/share/page.tsx` - Public share page (no auth required)

**Key Implementation Details:**
- Login page handles Ed25519 keypair generation & import
- Files page manages upload FAB, drag-drop, settings modal
- Share page allows decrypting shared files with password

### `/src/lib` - Core Libraries

#### Encryption & Cryptography

**`crypto.ts`** (~250 lines)
- `generateKeyPair()` - Ed25519 keypair generation
- `deriveManifestKeyFromPrivateKey()` - HKDF derivation
- `exportKeyPair()` - Save keypair to JSON (with optional password)
- `importKeyPair()` - Load keypair from JSON
- Uses `@noble/ed25519` for key generation
- Uses Web Crypto API for HKDF key derivation

**`e2ee.ts`** (~450 lines)  
- `generateEncryptionKeyAndNonce()` - Random AES-256-GCM key
- `encryptFile()` - Encrypt file with AES-256-GCM
- `decryptFile()` - Decrypt file
- `deriveShareKey()` - PBKDF2 for share password
- `encryptSharePayload()` - Encrypt file key with share password
- Includes EXIF stripping from images

#### Storage & Manifest

**`manifest.ts`** (~600 lines)
- `initializeManifest()` - Create encrypted manifest with HKDF-derived key
- `unlockManifest()` - Load & decrypt manifest from R2
- `manifestExists()` - Check if manifest is initialized
- `addFileToManifest()` - Add file metadata
- `updateFolderStructure()` - Manage folder tree
- Stores encrypted metadata in `.manifest.enc` file

**`storage-client.ts`** (~400 lines)
- `testStorageConnection()` - Validate S3/R2 credentials
- `uploadToStorage()` - Upload encrypted files with progress
- `downloadFromStorage()` - Download and verify files
- `generatePresignedUrl()` - Create download links
- Handles S3 multipart uploads for large files

#### Notes System

**`notes.ts`** (~450 lines)
- `saveNote()` - Create/update encrypted note
- `loadNotes()` - Load all notes from manifest
- `deleteNote()` - Remove note
- `searchNotes()` - Full-text search on decrypted notes
- Uses same encryption as files (AES-256-GCM + manifest)

#### Configuration & Utilities

**`settings.ts`** (~100 lines)
- `getStorageConfig()` - Load S3/R2 settings from localStorage
- `saveStorageConfig()` - Persist storage configuration
- `isStorageConfigured()` - Check if setup complete
- Validates S3 credential format

**`types.ts`** (~150 lines)
- `User` - Current user info
- `EncryptedFileInfo` - File metadata structure
- `FolderType` - Folder with id, name, files
- `Note` - Markdown note with tags
- `StorageConfig` - S3/R2 configuration

**`utils.ts`** (~50 lines)
- `cn()` - classname merger (tailwind classes)
- `formatBytes()` - Human-readable file sizes
- `isElectronApp()` - Detect Electron environment

**`drag.ts`** (~30 lines)
- Drag-and-drop type detection helpers

### `/src/components` - React Components

#### Main Interface

**`FileManager.tsx`** (~2400 lines)
- File listing, folder navigation, sorting/filtering
- Drag-and-drop file selection
- Right-click context menu (rename, delete, share, etc.)
- Notes panel with markdown editor
- File previews (images, videos, text)
- Search & tags
- Pin/favorite system
- Responsive grid/list view toggle

**`FileUpload.tsx`** (~400 lines)
- Drag-and-drop upload zone
- File validation (size, type, count)
- Encryption progress indication
- Batch upload management
- Error handling & retry

#### Modals & Sections

**`StorageSettings.tsx`** (~500 lines)
- S3/R2 provider selection
- Credential input form
- Connection testing
- Import/export config
- About section with links

**`ManifestUnlock.tsx`** (~150 lines)
- Auto-unlock manifest on page load
- Shows error if keys don't match
- Fallback to manual initialization if needed

**`MarkdownEditor.tsx`** (~300 lines)
- Split-pane editor/preview
- Syntax highlighting
- Toolbar with formatting buttons
- Real-time preview with markdown plugins

#### UI Components

**`/ui/` Folder**
- `button.tsx` - Base button component
- `input.tsx` - Base input component
- `label.tsx` - Form label component
- `progress.tsx` - Progress bar
- `toaster.tsx` - Toast notifications

These are base components using Radix UI, styled with Tailwind CSS.

### `/src/contexts` - React Context Providers

**`AuthContext.tsx`** (~130 lines)
- Global auth state management
- User info & public key
- Loading states
- Logout functionality
- Private key access for signing

---

## Configuration Files

### TypeScript
- **`tsconfig.json`** - Strict mode enabled, ES2020 target
- **`next-env.d.ts`** - Next.js TypeScript definitions

### Next.js
- **`next.config.ts`** - Turbopack experimental setup, CSS optimization

### Styling
- **`tailwind.config.ts`** - Tailwind 4 config, custom colors
- **`postcss.config.js`** - PostCSS with Tailwind

### Package Management
- **`package.json`** - Dependencies, scripts, project metadata
- **`package-lock.json`** - Locked dependency versions

### Git
- **`.gitignore`** - Excludes: node_modules, .next, .env.local, .DS_Store, etc.

---

## Documentation Files (`/docs`)

- **`FEATURES.md`** - Full feature list, tech stack, quick start
- **`USAGE.md`** - User guide, setup instructions, troubleshooting
- **`PROJECT_STRUCTURE.md`** - This file (directory guide)

---

## Build & Development

### Scripts (in `package.json`)

```bash
npm run dev      # Development server (port 3003)
npm run build    # Production build
npm start    # Start production server
npm run lint     # Run ESLint
```

### Output

- **`.next/`** - Next.js build cache (git ignored)
- **`out/`** - Static export (if enabled)

---

## Key Dependencies

### Core
- `next@16.1.1` - React framework
- `react@19.2` - UI library
- `typescript@5.0` - Type safety

### Encryption
- `@noble/ed25519@^2.0` - Ed25519 keypairs
- Web Crypto API (browser native)

### UI & Styling
- `tailwindcss@4.0` - Utility CSS framework
- `lucide-react` - Icon library
- `react-markdown` - Markdown rendering
- `remark-gfm` - GitHub flavored markdown
- `date-fns` - Date formatting

### Storage
- `@aws-sdk/client-s3@^3.0` - S3/R2 client
- `@aws-sdk/lib-storage@^3.0` - Multipart upload

---

**Questions?** See the main [README.md](../README.md) or specific docs in `/docs/`.
