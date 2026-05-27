import type { SiteBuilderPageNode } from "../../features/siteBuilder/model/navigationModel";

export function normalizePath(path: string): string {
  const trimmed = path.trim();

  if (!trimmed) {
    return "/";
  }

  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const withoutTrailingSlash =
    withLeadingSlash.length > 1 ? withLeadingSlash.replace(/\/+$/, "") : withLeadingSlash;

  return withoutTrailingSlash || "/";
}

export function flattenPageNodes(nodes: SiteBuilderPageNode[]): SiteBuilderPageNode[] {
  return nodes.flatMap((node) => [node, ...flattenPageNodes(node.children)]);
}

export function buildPageIndex(
  nodes: SiteBuilderPageNode[]
): Record<string, SiteBuilderPageNode> {
  return Object.fromEntries(flattenPageNodes(nodes).map((node) => [node.page_code, node]));
}

export function findPageByPath(
  nodes: SiteBuilderPageNode[],
  currentPath: string
): SiteBuilderPageNode | null {
  const normalizedCurrentPath = normalizePath(currentPath);

  return (
    flattenPageNodes(nodes).find(
      (node) => normalizePath(node.route_path) === normalizedCurrentPath
    ) ?? null
  );
}

export function buildActiveCodeSet(
  activePage: SiteBuilderPageNode | null,
  pageIndex: Record<string, SiteBuilderPageNode>
): Set<string> {
  const codes = new Set<string>();
  let currentCode = activePage?.page_code ?? null;

  while (currentCode) {
    codes.add(currentCode);
    currentCode = pageIndex[currentCode]?.parent_code ?? null;
  }

  return codes;
}

export function findFirstLeafPath(node: SiteBuilderPageNode): string | null {
  if (node.children.length === 0) {
    return node.route_path;
  }

  const sortedChildren = [...node.children].sort(sortPageNodes);

  for (const child of sortedChildren) {
    const childPath = findFirstLeafPath(child);

    if (childPath) {
      return childPath;
    }
  }

  return null;
}

export function sortPageNodes(
  a: SiteBuilderPageNode,
  b: SiteBuilderPageNode
): number {
  const sortDiff = a.sort_order - b.sort_order;

  if (sortDiff !== 0) {
    return sortDiff;
  }

  return a.title.localeCompare(b.title, "zh-CN");
}
