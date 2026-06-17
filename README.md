# Gallery Viewer (v1.0.0 - Initial Version)

A high-performance, read-only desktop gallery viewer tailored for rapid analysis of exported digital photography workflows (JPEG, PNG, AVIF). Decoupled into an independent Fastify-driven metadata parser and a fluid, hardware-accelerated Vite/React user interface.

## 🚀 Key Features

* **Hierarchical Tree Exploration:** Discovers and maps monitored folder paths directly from your hard drives, organizing them under structural parent-year nodes while preserving your custom chronological sorting layout.
* **One-Click Batch Selection:** Features smart recursive checkboxes to instantly select, deselect, or partially isolate whole drive volumes or year branches with a single click.
* **Parallel Batch Extraction:** Leverages `exiftool-vendored` concurrently across your CPU thread architectures to sweep and process metadata variables in bulk.
* **Automated Folder Validation Caching:** Implements folders' physical Modification Time (`mtime`) checking to cache analyzed files instantly (0ms reloads), while triggering self-healing re-scans automatically if a folder is overwritten.
* **Sliding Preloader Cache Engine:** Silently fetches the next two images ahead and one behind in browser memory, eliminating layout blinks for smooth, instant arrow-key transitions.
* **Non-Destructive Read-Only Viewer:** Protects your source assets and maintains workflow integrity by restricting modifications entirely from the layout viewport.

---

## ⌨️ Viewer Keyboard Shortcuts

| Hotkey | Action |
| :--- | :--- |
| **Arrow Right** | Skip to next image in timeline |
| **Arrow Left** | Skip to previous image in timeline |
| **I / i** | Toggle metadata EXIF info overlay panel view |
| **F / f** | Toggle live filter (Showing 4-5 star photos only) |
| **S / s** | Toggle automated chronological slideshow loop |
| **Escape** | Close current workspace gallery loop and return safely to the tree selection panel |

---

## ⚙️ System Architecture & Layout

```text
Shows/
├── backend/                  # Fastify TypeScript server application
│   ├── src/
│   │   ├── routes/           # Decoupled endpoint controllers (folders, imagesBatch, stream)
│   │   └── server.ts         # Lightweight bootstrapping core controller
│   └── settings.json         # Direct drive storage watch path targets mapping
├── web-client/               # Vite React front-end single-page client workspace
│   └── src/
│       ├── App.tsx           # Primary view-state orchestration router switch
│       ├── FolderTree.tsx    # Tree node picker container dashboard
│       ├── TreeNodeItem.tsx  # Recursive component row item checkbox pipeline
│       ├── ImageGallery.tsx  # Fullscreen image viewer and background caching engine
│       └── InfoOverlay.tsx   # Isolated graphic layout specification data rows table
└── launch-gallery.bat        # Automated one-click Windows launcher macro script
```

---

## 🛠️ Installation & Getting Started

### 1. Configure Monitored Folders
Open your local `backend/settings.json` and insert your target photographic output drive path tracking arrays using doubled backslashes (`\\`) alongside your desired automatic slideshow duration:

```json
{
  "watchPaths": [
    "P:\\@Output\\pix3-5",
    "G:\\Photos\\5 Review"
  ],
  "slideshowIntervalSeconds": 30
}
```

### 2. Install Project Dependencies
Open your terminals and initialize the project components by downloading the required node modules:

```powershell
# Navigate and build server ecosystem
cd backend
npm install

# Navigate and build client ecosystem
cd ../web-client
npm install
```

### 3. Launch with One Click
Double-click the **`launch-gallery.bat`** file floating in your root workspace. The Windows automation script will:
1. Initialize the backend engine on port `3000`.
2. Spin up the Vite web server on port `5173`.
3. Wait 3 seconds for compilation, open your default web browser to the dashboard, and dismiss itself cleanly.

---

## 💡 Technical Notes for Adobe Lightroom Exports

If properties like Shutter Speed or Aperture show up as **Unknown** on certain high-fidelity files (such as high-dynamic-range panoramic images or AVIF configurations), it means Lightroom stripped the camera properties during the export save process [INDEX]. 

To prevent this, ensure that inside Lightroom Classic's Export menu, the **Metadata** panel dropdown is set to **"All Metadata"** and that **"Remove Camera Info"** remains completely **unchecked** [INDEX].
