import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import type {
  SiteBuilderNavigationResponse,
  SiteBuilderPageNode
} from "../../features/siteBuilder/model/navigationModel";
import {
  buildActiveCodeSet,
  buildPageIndex,
  findPageByPath,
  sortPageNodes
} from "../router/navigationUtils";

type SiteBuilderSidebarProps = {
  navigation: SiteBuilderNavigationResponse | null;
  isLoading: boolean;
  error: string | null;
};

type OpenState = Record<string, boolean>;

function shouldShowStatusBadge(page: SiteBuilderPageNode): boolean {
  return page.status !== "connected";
}

function renderLeafNode(node: SiteBuilderPageNode, depth = 1): React.ReactNode {
  return (
    <NavLink
      key={node.page_code}
      to={node.route_path}
      className={({ isActive: isNavActive }) =>
        [
          "sb-sidebar-link",
          `sb-sidebar-node-depth-${Math.min(depth, 2)}`,
          isNavActive ? "sb-sidebar-link-active" : ""
        ]
          .filter(Boolean)
          .join(" ")
      }
    >
      <span>{node.title}</span>
      {shouldShowStatusBadge(node) ? <span className="sb-sidebar-status">规划</span> : null}
    </NavLink>
  );
}

function renderRootLeafNode(node: SiteBuilderPageNode): React.ReactNode {
  return (
    <NavLink
      key={node.page_code}
      to={node.route_path}
      className={({ isActive: isNavActive }) =>
        [
          "sb-sidebar-section-button",
          "sb-sidebar-section-link",
          isNavActive ? "sb-sidebar-section-link-active" : ""
        ]
          .filter(Boolean)
          .join(" ")
      }
    >
      <span>{node.title}</span>
      {shouldShowStatusBadge(node) ? <span className="sb-sidebar-status">规划</span> : null}
    </NavLink>
  );
}

export function SiteBuilderSidebar({
  navigation,
  isLoading,
  error
}: SiteBuilderSidebarProps) {
  const location = useLocation();
  const [openSections, setOpenSections] = useState<OpenState>({});

  const pages = useMemo(
    () => [...(navigation?.pages ?? [])].filter((page) => page.is_active).sort(sortPageNodes),
    [navigation]
  );

  const pageIndex = useMemo(() => buildPageIndex(pages), [pages]);
  const activePage = useMemo(
    () => findPageByPath(pages, location.pathname),
    [pages, location.pathname]
  );
  const activeCodeSet = useMemo(
    () => buildActiveCodeSet(activePage, pageIndex),
    [activePage, pageIndex]
  );

  function toggleSection(pageCode: string) {
    setOpenSections((current) => ({
      ...current,
      [pageCode]: !(current[pageCode] ?? activeCodeSet.has(pageCode))
    }));
  }

  function renderNode(node: SiteBuilderPageNode, depth = 1): React.ReactNode {
    const sortedChildren = [...node.children]
      .filter((child) => child.is_active && child.show_in_sidebar)
      .sort(sortPageNodes);

    if (sortedChildren.length === 0) {
      return renderLeafNode(node, depth);
    }

    return (
      <div key={node.page_code}>
        <div className="sb-sidebar-group">
          {node.title}
          {shouldShowStatusBadge(node) ? <span className="sb-sidebar-status">规划</span> : null}
        </div>
        <div className="sb-sidebar-children">
          {sortedChildren.map((child) => renderNode(child, depth + 1))}
        </div>
      </div>
    );
  }

  return (
    <aside className="sb-sidebar">
      <div className="sb-sidebar-brand">
        <div className="sb-sidebar-title">D2C Site Builder</div>
        <div className="sb-sidebar-subtitle">Internal Builder</div>
      </div>

      <nav className="sb-sidebar-nav">
        {isLoading ? <div className="sb-sidebar-empty">正在加载页面目录...</div> : null}
        {error ? <div className="sb-sidebar-empty">导航加载失败：{error}</div> : null}

        {!isLoading && !error && pages.length === 0 ? (
          <div className="sb-sidebar-empty">暂无可展示页面</div>
        ) : null}

        {pages.map((section) => {
          const sortedChildren = [...section.children]
            .filter((child) => child.is_active && child.show_in_sidebar)
            .sort(sortPageNodes);

          if (sortedChildren.length === 0) {
            return renderRootLeafNode(section);
          }

          const isOpen = openSections[section.page_code] ?? activeCodeSet.has(section.page_code);

          return (
            <div key={section.page_code} className="sb-sidebar-section">
              <button
                type="button"
                className="sb-sidebar-section-button"
                onClick={() => toggleSection(section.page_code)}
              >
                <span>{section.title}</span>
                <span>{isOpen ? "▾" : "▸"}</span>
              </button>

              {isOpen ? (
                <div className="sb-sidebar-children">
                  {sortedChildren.map((child) => renderNode(child))}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
