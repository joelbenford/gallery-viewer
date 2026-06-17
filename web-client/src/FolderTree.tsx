import { useState } from "react";
import ShortcutLegend from "./ShortcutLegend";
import TreeNodeItem from "./TreeNodeItem";

interface FolderItem {
  id: string;
  name: string;
  groupKey: string;
}

interface TreeNode {
  name: string;
  id?: string;
  children: TreeNode[];
}

interface FolderTreeProps {
  folders: FolderItem[];
  selectedFolderIds: string[];
  onToggleFolder: (id: string) => void;
  onLoadWorkspace: () => void;
  isWorkspaceLoading: boolean;
}

export default function FolderTree({
  folders,
  selectedFolderIds,
  onToggleFolder,
  onLoadWorkspace,
  isWorkspaceLoading,
}: FolderTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>(
    () => {
      const initialExpanded: Record<string, boolean> = {};
      folders.forEach((f) => {
        if (f.groupKey) initialExpanded[f.groupKey] = true;
      });
      return initialExpanded;
    },
  );

  const toggleExpand = (nodePath: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodePath]: !prev[nodePath] }));
  };

  const rootNodes: Record<string, TreeNode> = {};

  folders.forEach((folder) => {
    const rootKey = folder.groupKey;
    if (!rootNodes[rootKey]) {
      rootNodes[rootKey] = { name: rootKey, children: [] };
    }

    const segments = folder.name.split(/[/\\]/).filter(Boolean);
    let currentLevel = rootNodes[rootKey];

    if (segments.length === 0) {
      rootNodes[rootKey].id = folder.id;
    }

    segments.forEach((segment, index) => {
      let targetChild = currentLevel.children.find((c) => c.name === segment);
      if (!targetChild) {
        targetChild = { name: segment, children: [] };
        currentLevel.children.push(targetChild);
      }
      if (index === segments.length - 1) {
        targetChild.id = folder.id;
      }
      currentLevel = targetChild;
    });
  });

  // Global helper to walk a root node down to find all endpoint IDs
  const getAllRootDescendantIds = (node: TreeNode): string[] => {
    const ids: string[] = [];
    if (node.id) ids.push(node.id);
    node.children.forEach((child) => {
      ids.push(...getAllRootDescendantIds(child));
    });
    return ids;
  };

  const handleToggleWholeDrive = (rootNode: TreeNode) => {
    const descendantIds = getAllRootDescendantIds(rootNode);
    if (descendantIds.length === 0) return;

    const allSelected = descendantIds.every((id) =>
      selectedFolderIds.includes(id),
    );
    descendantIds.forEach((id) => {
      if (allSelected) {
        if (selectedFolderIds.includes(id)) onToggleFolder(id);
      } else {
        if (!selectedFolderIds.includes(id)) onToggleFolder(id);
      }
    });
  };

  return (
    <div className="min-h-screen text-gray-200 flex flex-col items-center justify-center p-4 bg-neutral-950">
      <div className="w-full max-w-3xl h-[95vh] bg-neutral-900 border border-neutral-800 p-8 rounded-xl shadow-xl flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-4">
            Choose Galleries
          </h1>
        </div>

        <div className="h-[75vh] overflow-y-auto space-y-4 mb-4 pr-2 bg-neutral-950 p-4 border border-neutral-850 rounded-lg">
          {folders.length === 0 ? (
            <p className="text-sm text-neutral-400 animate-pulse py-8 text-center">
              Reading local drive trees structures...
            </p>
          ) : (
            Object.entries(rootNodes).map(([rootKey, rootNode]) => {
              const descendantIds = getAllRootDescendantIds(rootNode);
              const selectedDescendants = descendantIds.filter((id) =>
                selectedFolderIds.includes(id),
              );
              const isRootFullyChecked =
                descendantIds.length > 0 &&
                selectedDescendants.length === descendantIds.length;
              const isRootPartiallyChecked =
                selectedDescendants.length > 0 &&
                selectedDescendants.length < descendantIds.length;

              return (
                <div key={rootKey} className="space-y-1">
                  <div
                    onClick={() => toggleExpand(rootKey)}
                    className="flex items-center space-x-2 py-2 px-2 bg-neutral-900 border-b border-neutral-800 cursor-pointer text-emerald-400 font-mono text-xs font-bold tracking-wider hover:bg-neutral-850 rounded transition-colors"
                  >
                    <span>{expandedNodes[rootKey] ? "▼" : "▶"}</span>

                    <input
                      type="checkbox"
                      checked={isRootFullyChecked}
                      ref={(el) => {
                        if (el) el.indeterminate = isRootPartiallyChecked;
                      }}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleToggleWholeDrive(rootNode);
                      }}
                      className="w-4 h-4 text-emerald-500 accent-emerald-500 cursor-pointer focus:ring-0"
                    />

                    <span className="pl-1 truncate">💾 {rootKey}</span>
                  </div>

                  {expandedNodes[rootKey] &&
                    rootNode.children.map((childNode) => (
                      <TreeNodeItem
                        key={`${rootKey}/${childNode.name}`}
                        node={childNode}
                        currentPath={`${rootKey}/${childNode.name}`}
                        selectedFolderIds={selectedFolderIds}
                        expandedNodes={expandedNodes}
                        onToggleExpand={toggleExpand}
                        onToggleFolder={onToggleFolder}
                      />
                    ))}
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={onLoadWorkspace}
          disabled={selectedFolderIds.length === 0 || isWorkspaceLoading}
          className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 disabled:text-neutral-500 rounded-lg text-white font-semibold transition-colors shadow-lg flex items-center justify-center space-x-2"
        >
          {isWorkspaceLoading ? (
            <>
              {/* Animated CSS Spinner using built-in Tailwind animation hooks */}
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://w3.org"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Compiling Image Datasets...</span>
            </>
          ) : (
            <span>Load Selected Galleries ({selectedFolderIds.length})</span>
          )}
        </button>

        <ShortcutLegend />
      </div>
    </div>
  );
}
