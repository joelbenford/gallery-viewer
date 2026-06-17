import { useState, useEffect } from "react";
import FolderTree from "./FolderTree";
import ImageGallery from "./ImageGallery";

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

interface FolderItem {
  id: string;
  name: string;
  groupKey: string;
}

export default function App() {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const [workspaceImages, setWorkspaceImages] = useState<ImageItem[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageItem[]>([]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showOverlay, setShowOverlay] = useState<boolean>(false); // Starts hidden by default
  const [starFilterActive, setStarFilterActive] = useState<boolean>(false);
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState<boolean>(false);
  const [isWorkspaceLoaded, setIsWorkspaceLoaded] = useState<boolean>(false);

  // New state tracking the slideshow configuration fetched from settings.json
  const [slideshowInterval, setSlideshowInterval] = useState<number>(30);

  useEffect(() => {
    fetch("http://localhost:3000/api/folders")
      .then((res) => res.json())
      .then((data) => {
        // Correctly handle the new backend object layout structure
        setFolders(data.folders || []);
        setSlideshowInterval(data.slideshowIntervalSeconds || 30);
      })
      .catch((err) => console.error("Failed to load folders:", err));
  }, []);

  const loadWorkspace = async () => {
    if (selectedFolderIds.length === 0) return;
    setIsWorkspaceLoading(true); // <-- Trigger spinner state immediately on click

    try {
      const response = await fetch("http://localhost:3000/api/images/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderIds: selectedFolderIds }),
      });
      const images: ImageItem[] = await response.json();
      setWorkspaceImages(images);
      setFilteredImages(images);
      setCurrentIndex(0);
      setStarFilterActive(false);
      setIsWorkspaceLoaded(true);
    } catch (err) {
      console.error("Failed to compile target directory files:", err);
    } finally {
      setIsWorkspaceLoading(false); // <-- Clear loading lock state if fetch returns or crashes
    }
  };

  // Synchronize filtering adjustments smoothly
  useEffect(() => {
    if (starFilterActive) {
      const currentImage = filteredImages[currentIndex];
      const filtered = workspaceImages.filter(
        (img) => img.metadata.rating >= 4,
      );
      setFilteredImages(filtered);

      if (currentImage && currentImage.metadata.rating >= 4) {
        const newIdx = filtered.findIndex((img) => img.id === currentImage.id);
        setCurrentIndex(newIdx !== -1 ? newIdx : 0);
      } else {
        setCurrentIndex(0);
      }
    } else {
      const currentImage = filteredImages[currentIndex];
      setFilteredImages(workspaceImages);
      if (currentImage) {
        const originalIdx = workspaceImages.findIndex(
          (img) => img.id === currentImage.id,
        );
        setCurrentIndex(originalIdx !== -1 ? originalIdx : 0);
      }
    }
  }, [starFilterActive, workspaceImages]);

  const handleCloseWorkspace = () => {
    setIsWorkspaceLoaded(false);
    setWorkspaceImages([]);
    setFilteredImages([]);
    setSelectedFolderIds([]);
  };

  const toggleFolderSelection = (id: string) => {
    setSelectedFolderIds((prev) =>
      prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id],
    );
  };

  // Structural Interface Router Switch
  if (!isWorkspaceLoaded) {
    return (
      <FolderTree
        folders={folders}
        selectedFolderIds={selectedFolderIds}
        onToggleFolder={toggleFolderSelection}
        onLoadWorkspace={loadWorkspace}
        isWorkspaceLoading={isWorkspaceLoading} // <-- PASS PROP HERE
      />
    );
  }

  return (
    <ImageGallery
      filteredImages={filteredImages}
      currentIndex={currentIndex}
      setCurrentIndex={setCurrentIndex}
      showOverlay={showOverlay}
      setShowOverlay={setShowOverlay}
      starFilterActive={starFilterActive}
      setStarFilterActive={setStarFilterActive}
      onCloseWorkspace={handleCloseWorkspace}
      slideshowInterval={slideshowInterval} // Pass timer value down to the component
    />
  );
}
