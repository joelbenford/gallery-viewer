import { useEffect, useState } from "react";
import InfoOverlay from "./InfoOverlay";

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

interface ImageGalleryProps {
  filteredImages: ImageItem[];
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  showOverlay: boolean;
  setShowOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  starFilterActive: boolean;
  setStarFilterActive: React.Dispatch<React.SetStateAction<boolean>>;
  onCloseWorkspace: () => void;
  slideshowInterval: number;
}

export default function ImageGallery({
  filteredImages = [],
  currentIndex,
  setCurrentIndex,
  showOverlay,
  setShowOverlay,
  starFilterActive,
  setStarFilterActive,
  onCloseWorkspace,
  slideshowInterval,
}: ImageGalleryProps) {
  const [slideshowActive, setSlideshowActive] = useState<boolean>(false);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>("");

  // Hook Loop A: Keyboard Shortcuts (Chronological Flow)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const total = filteredImages ? filteredImages.length : 0;
      if (total === 0) return;

      if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev + 1) % total);
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev - 1 + total) % total);
      } else if (e.key === "i" || e.key === "I") {
        setShowOverlay((prev) => !prev);
      } else if (e.key === "f" || e.key === "F") {
        setStarFilterActive((prev) => !prev);
      } else if (e.key === "s" || e.key === "S") {
        setSlideshowActive((prev) => {
          const nextState = !prev;
          setMessageText(
            nextState
              ? `▶ SLIDESHOW ACTIVE (${slideshowInterval}s)`
              : "■ SLIDESHOW PAUSED",
          );
          setShowMessage(true);
          return nextState;
        });
      } else if (e.key === "Escape") {
        onCloseWorkspace();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    filteredImages,
    onCloseWorkspace,
    setCurrentIndex,
    setShowOverlay,
    setStarFilterActive,
    slideshowInterval,
  ]);

  // Hook Loop B: Auto-hide notification message pill after 3 seconds
  useEffect(() => {
    if (!showMessage) return;
    const t = setTimeout(() => setShowMessage(false), 3000);
    return () => clearTimeout(t);
  }, [showMessage]);

  // Hook Loop C: Automated Slideshow Timer Clock (Linear Index Steps)
  useEffect(() => {
    if (!slideshowActive || !filteredImages || filteredImages.length === 0)
      return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredImages.length);
    }, slideshowInterval * 1000);

    return () => clearInterval(intervalId);
  }, [slideshowActive, filteredImages, slideshowInterval, setCurrentIndex]);

  // Safety Break Out Guard
  if (!filteredImages || filteredImages.length === 0) {
    return (
      <div className="relative w-screen h-screen bg-black select-none flex items-center justify-center overflow-hidden">
        <div className="text-center p-8 max-w-md">
          <p className="text-xl font-medium text-neutral-300 mb-2">
            No files matching 4+ Stars found.
          </p>
          <p className="text-sm text-neutral-500">
            Press{" "}
            <kbd className="px-2 py-1 bg-neutral-800 text-white font-mono rounded">
              F
            </kbd>{" "}
            to go back, or{" "}
            <kbd className="px-2 py-1 bg-neutral-800 text-white font-mono rounded">
              Esc
            </kbd>{" "}
            to exit.
          </p>
        </div>
      </div>
    );
  }

  const activeImage = filteredImages[currentIndex];

  // Linear Sliding Preloader Cache Logic
  const next1Idx =
    filteredImages.length > 0 ? (currentIndex + 1) % filteredImages.length : 0;
  const next2Idx =
    filteredImages.length > 0 ? (currentIndex + 2) % filteredImages.length : 0;
  const prev1Idx =
    filteredImages.length > 0
      ? (currentIndex - 1 + filteredImages.length) % filteredImages.length
      : 0;

  return (
    <div className="relative w-screen h-screen bg-black select-none flex items-center justify-center overflow-hidden">
      {activeImage && (
        <>
          {/* Main Viewport Image Layer */}
          <img
            src={activeImage.src}
            alt={activeImage.filename}
            className="w-screen h-screen object-contain pointer-events-none"
          />

          {/* Background Preloader Engine Cache Loop */}
          <div className="hidden aria-hidden opacity-0 pointer-events-none absolute w-0 h-0 overflow-hidden">
            {[next1Idx, next2Idx, prev1Idx].map((preloadIndex, i) => {
              const targetImage = filteredImages[preloadIndex];
              if (!targetImage || !targetImage.id || !targetImage.src)
                return null;
              return (
                <img
                  key={`preload-${i}-${targetImage.id}`}
                  src={targetImage.src}
                  alt="preloading"
                />
              );
            })}
          </div>
        </>
      )}

      {showMessage && (
        <div className="absolute bottom-5 right-5 z-50 bg-black/75 border border-neutral-800 text-xs font-mono font-bold tracking-wider text-emerald-400 px-3 py-1.5 rounded-md pointer-events-none">
          {messageText}
        </div>
      )}

      {showOverlay && activeImage && (
        <InfoOverlay
          activeImage={activeImage}
          currentIndex={currentIndex}
          totalCount={filteredImages.length}
          starFilterActive={starFilterActive}
        />
      )}
    </div>
  );
}
