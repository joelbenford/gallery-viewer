export default function ShortcutLegend() {
  return (
    <div className="bg-neutral-950 border border-neutral-850 rounded-lg p-4 mt-4 font-mono text-xs text-neutral-400 space-y-1">
      <div className="text-emerald-400 font-bold border-b border-neutral-800 pb-1 mb-2 tracking-wider uppercase">
        ⌨️ Viewer Keyboard Shortcuts
      </div>
      <div className="grid grid-cols-[80px_1fr] gap-x-2">
        <span className="text-white font-bold">Arrow Right</span>
        <span>➔ Skip to next image</span>

        <span className="text-white font-bold">Arrow Left</span>
        <span>➔ Skip to previous image</span>

        <span className="text-white font-bold">I / i</span>
        <span>➔ Toggle metadata EXIF info overlay panel</span>

        <span className="text-white font-bold">F / f</span>
        <span>➔ Toggle live filter (Showing 4-5 star only)</span>

        <span className="text-white font-bold">S / s</span>
        <span>➔ Toggle automated slideshow loop</span>

        <span className="text-white font-bold">Escape</span>
        <span>➔ Close workspace loop and return to tree panel</span>
      </div>
    </div>
  );
}
