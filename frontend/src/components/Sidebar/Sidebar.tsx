import React, { useCallback, useEffect, useState } from "react";
import type { SidebarData } from "./types";
import { SidebarItem } from "./SidebarItem";
import { SidebarPopover } from "./SidebarPopover";
import { useLocation } from "react-router-dom";
import { useSidebar } from "../../contexts/SidebarContext";
import "./Sidebar.css";

export const SIDEBAR_WIDTH = '18vw';  // 18% of viewport width

type Props = {
  data: SidebarData;
  collapsed?: boolean;
};

export const Sidebar: React.FC<Props> = ({ data }) => {
  const { collapsed } = useSidebar();
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  const toggle = useCallback((id: string) => {
    setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // Hover state for collapsed popover
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [hoveredParent, setHoveredParent] = useState<string | null>(null);
  const openPopover = Boolean(anchorEl) && !!hoveredParent;
  const [popoverParent, setPopoverParent] = useState<any>(null);

  const handleIconEnter = (e: React.MouseEvent<HTMLElement>, pId: string) => {
    setAnchorEl(e.currentTarget);
    setHoveredParent(pId);
    const p = data.find((x) => x.id === pId) ?? null;
    setPopoverParent(p);
  };
  const handleIconLeave = () => {
    // small delay to allow moving mouse to popover
    setTimeout(() => {
      setAnchorEl(null);
      setHoveredParent(null);
      setPopoverParent(null);
    }, 150);
  };

  // When popover opens, we want to keep it until mouse leaves popover area:
  const handlePopoverClose = () => {
    setAnchorEl(null);
    setHoveredParent(null);
    setPopoverParent(null);
  };

  const location = useLocation();

  // Auto-open parent that contains current route when in expanded mode
  useEffect(() => {
    if (collapsed) return;
    // find parent that contains current path
    const path = location.pathname;
    const found = data.find((p) => p.children?.some((c) => c.path === path));
    if (found) {
      setExpandedMap((prev) => ({ ...prev, [found.id]: true }));
    }
    // optionally, you may close others or leave as-is
  }, [location.pathname, collapsed, data]);


  return (
    <div 
      className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}
      role="navigation"
      aria-label="Main sidebar"
    >
      <nav className="sidebar__nav">
        {data.map((p) => (
          <div key={p.id} className="sidebar__item">
            <SidebarItem
              parent={p}
              expanded={!!expandedMap[p.id]}
              onToggle={toggle}
              collapsed={collapsed}
              onIconMouseEnter={(e) => handleIconEnter(e, p.id)}
              onIconMouseLeave={() => handleIconLeave()}
            />
          </div>
        ))}
      </nav>

      {/* Popover for collapsed mode */}
      <SidebarPopover
        anchorEl={anchorEl}
        open={openPopover}
        parent={popoverParent}
        onClose={handlePopoverClose}
        onNavigate={handlePopoverClose}
      />
    </div>
  );
};
