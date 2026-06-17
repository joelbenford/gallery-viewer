interface ImageItem {
  id: string;
  filename: string;
  src: string;
  metadata: {
    taken: string;
    model: string;
    lens?: string;
    focal: string;
    aperture: string;
    shutter: string;
    iso: string;
    bias: string;
    rating: number;
  };
}

interface InfoOverlayProps {
  activeImage: ImageItem;
  currentIndex: number;
  totalCount: number;
  starFilterActive: boolean;
}

export default function InfoOverlay({
  activeImage,
  //   currentIndex,
  //   totalCount,
  starFilterActive,
}: InfoOverlayProps) {
  return (
    <div
      id="info-overlay"
      className="absolute z-50 text-white p-5 flex flex-col select-text"
      style={{
        top: "20px",
        left: "20px",
        minWidth: "320px",
        maxWidth: "420px",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderRadius: "8px",
      }}
    >
      {/* Filename Header Row */}
      <h2
        className="font-sans font-bold tracking-tight truncate border-b border-neutral-800 pb-2 mb-3"
        style={{ fontSize: "28px" }}
      >
        {activeImage.filename}
      </h2>

      {/* EXIF Grid Frame */}
      <div
        className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5"
        style={{
          color: "#34d399",
          fontFamily: "monospace",
          fontSize: "16px",
          fontWeight: "bold",
        }}
      >
        <div>Taken:</div>
        <div>{activeImage.metadata.taken}</div>
        <div>Model:</div>
        <div>{activeImage.metadata.model}</div>

        {/* Conditional Lens Auto-Hide Trigger */}
        {activeImage.metadata.lens && (
          <>
            <div>Lens:</div>
            <div>{activeImage.metadata.lens}</div>
          </>
        )}

        <div>Focal:</div>
        <div>{activeImage.metadata.focal}</div>
        <div>Aperture:</div>
        <div>{activeImage.metadata.aperture}</div>
        <div>Shutter:</div>
        <div>{activeImage.metadata.shutter}</div>
        <div>ISO:</div>
        <div>{activeImage.metadata.iso}</div>
        <div>Bias:</div>
        <div>{activeImage.metadata.bias}</div>

        <div>Rating:</div>
        <div>
          {activeImage.metadata.rating > 0 ? (
            "★".repeat(activeImage.metadata.rating)
          ) : (
            <span className="text-neutral-500 font-sans tracking-wide font-normal">
              None
            </span>
          )}
        </div>
      </div>

      {/* Active Workspace Index Tracker Footer */}
      {/* <div className="mt-4 pt-2 border-t border-neutral-900 flex justify-between text-xs text-neutral-500 font-sans">
        <div>
          Index: {currentIndex + 1} / {totalCount}
        </div>
        {starFilterActive && (
          <div className="text-amber-500 font-bold">★4+ FILTER ACTIVE</div>
        )}
      </div> */}
      {/* Clean Filter Alert: Spans both grid columns and only shows up when active */}

      {/* Static Minimalist Filter Alert */}
      {starFilterActive && (
        <div className="col-span-2 mt-3 pt-2 border-t border-neutral-800 text-xs text-amber-500 font-sans font-bold tracking-wider">
          Showing 4-5 star only
        </div>
      )}
    </div>
  );
}
