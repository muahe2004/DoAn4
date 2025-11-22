import React, { useCallback, useEffect, useState } from "react";
import type { SidebarData, SidebarParent } from "./types";
import { SidebarItem } from "./SidebarItem";
import { SidebarPopover } from "./SidebarPopover";
import { useLocation } from "react-router-dom";
import { useSidebar } from "../../contexts/SidebarContext";
import "./Sidebar.css";
import IconButton from "@mui/material/IconButton";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export const SIDEBAR_WIDTH = "18vw";

type Props = {
  data: SidebarData;
  collapsed?: boolean;
};

export const Sidebar: React.FC<Props> = ({ data }) => {
  const { collapsed, toggleSidebar } = useSidebar();

  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
  const toggle = useCallback((id: string) => {
    setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // Popover
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [hoveredParent, setHoveredParent] = useState<string | null>(null);
  const [popoverParent, setPopoverParent] = useState<SidebarParent>();
  const openPopover = Boolean(anchorEl) && !!hoveredParent;

  const handleIconEnter = (e: React.MouseEvent<HTMLElement>, pId: string) => {
    setAnchorEl(e.currentTarget);
    setHoveredParent(pId);
    const p = data.find((x) => x.id === pId);
    setPopoverParent(p);
  };

  const handleIconLeave = () => {
    setTimeout(() => {
      setAnchorEl(null);
      setHoveredParent(null);
      setPopoverParent(undefined);
    }, 150);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setHoveredParent(null);
    setPopoverParent(undefined);
  };

  // Auto-open parent of active child
  const location = useLocation();
  useEffect(() => {
    if (collapsed) return;
    const path = location.pathname;
    const found = data.find((p) => p.children?.some((c) => c.path === path));
    if (found) {
      setExpandedMap((prev) => ({ ...prev, [found.id]: true }));
    }
  }, [location.pathname, collapsed, data]);

  return (
    <>
      <div
        className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}
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
                onIconMouseLeave={handleIconLeave}
              />
            </div>
          ))}
        </nav>

        <SidebarPopover
          anchorEl={anchorEl}
          open={openPopover}
          parent={popoverParent!}
          onClose={handlePopoverClose}
          onNavigate={handlePopoverClose}
        />
      </div>

      <IconButton
        className="sidebar__toggle-btn"
        onClick={toggleSidebar}
      >
        {collapsed ? (
          <ArrowForwardIosIcon fontSize="small" />
        ) : (
          <ArrowBackIosNewIcon fontSize="small" />
        )}
      </IconButton>
    </>
  );
};
