interface TreeNode {
  name: string;
  id?: string;
  children: TreeNode[];
}

interface TreeNodeItemProps {
  node: TreeNode;
  currentPath: string;
  depth?: number;
  selectedFolderIds: string[];
  expandedNodes: Record<string, boolean>;
  onToggleExpand: (path: string) => void;
  onToggleFolder: (id: string) => void;
}

export default function TreeNodeItem({
  node,
  currentPath,
  depth = 0,
  selectedFolderIds,
  expandedNodes,
  onToggleExpand,
  onToggleFolder,
}: TreeNodeItemProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedNodes[currentPath];

  // Helper A: Recursively extracts all bottom-level image folder IDs nested under this node
  const getAllDescendantIds = (targetNode: TreeNode): string[] => {
    const ids: string[] = [];
    if (targetNode.id) ids.push(targetNode.id);
    targetNode.children.forEach((child) => {
      ids.push(...getAllDescendantIds(child));
    });
    return ids;
  };

  const descendantIds = getAllDescendantIds(node);
  const selectedDescendants = descendantIds.filter((id) =>
    selectedFolderIds.includes(id),
  );

  // Calculate checkbox states for intermediate branch nodes
  const isBranchFullyChecked =
    descendantIds.length > 0 &&
    selectedDescendants.length === descendantIds.length;
  const isBranchPartiallyChecked =
    selectedDescendants.length > 0 &&
    selectedDescendants.length < descendantIds.length;

  // Helper B: Handles bulk selection/deselection when clicking a parent branch node
  const handleToggleParentBranch = () => {
    if (descendantIds.length === 0) return;

    if (isBranchFullyChecked) {
      // Bulk Deselect: Turn off all child folders under this year/branch node
      descendantIds.forEach((id) => {
        if (selectedFolderIds.includes(id)) onToggleFolder(id);
      });
    } else {
      // Bulk Select: Check everything under this year/branch node
      descendantIds.forEach((id) => {
        if (!selectedFolderIds.includes(id)) onToggleFolder(id);
      });
    }
  };

  return (
    <div className="flex flex-col select-none">
      <div className="group flex items-center py-1 px-2 hover:bg-neutral-800 rounded transition-colors">
        {/* Expand/Collapse arrow trigger */}
        <button
          type="button"
          onClick={() => hasChildren && onToggleExpand(currentPath)}
          className={`w-4 h-4 mr-1 flex items-center justify-center text-xs text-neutral-500 hover:text-white rounded transition-transform ${
            !hasChildren ? "opacity-0 pointer-events-none" : ""
          } ${isExpanded ? "rotate-90" : ""}`}
        >
          ▶
        </button>

        {node.id ? (
          // Standard green checkbox for endpoint gallery folders containing pictures
          <input
            type="checkbox"
            checked={selectedFolderIds.includes(node.id)}
            onChange={() => onToggleFolder(node.id!)}
            className="w-4 h-4 mr-2.5 rounded text-emerald-500 accent-emerald-500 cursor-pointer focus:ring-0"
          />
        ) : (
          // Smart blue checkbox for parent branches/years with partial dash [-] support
          <input
            type="checkbox"
            checked={isBranchFullyChecked}
            ref={(el) => {
              if (el) el.indeterminate = isBranchPartiallyChecked;
            }}
            onChange={handleToggleParentBranch}
            className="w-4 h-4 mr-2.5 rounded text-sky-500 accent-sky-500 cursor-pointer focus:ring-0"
          />
        )}

        {/* Text node target with combined single-click selection/expansion routing */}
        <span
          onClick={() => {
            if (node.id) {
              onToggleFolder(node.id);
            } else {
              handleToggleParentBranch();
            }
          }}
          className={`text-sm tracking-wide transition-colors cursor-pointer ${
            node.id
              ? "text-neutral-200 group-hover:text-white font-medium"
              : "text-neutral-400 font-normal hover:text-white"
          }`}
        >
          {node.name}
        </span>
      </div>

      {/* Recursive Deep Descendants Rendering Pipeline */}
      {hasChildren && isExpanded && (
        <div className="flex flex-col border-l border-neutral-850 ml-3">
          {node.children.map((childNode) => (
            <TreeNodeItem
              key={`${currentPath}/${childNode.name}`}
              node={childNode}
              currentPath={`${currentPath}/${childNode.name}`}
              depth={depth + 1}
              selectedFolderIds={selectedFolderIds}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
              onToggleFolder={onToggleFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
}
