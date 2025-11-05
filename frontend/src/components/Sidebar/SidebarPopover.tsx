import React from "react";
import type { SidebarParent, SidebarChild } from "./types";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

type Props = {
  anchorEl: HTMLElement | null;
  open: boolean;
  parent: SidebarParent;
  onClose: () => void;
  onNavigate?: () => void;
};

export const SidebarPopover: React.FC<Props> = ({ anchorEl, open, parent, onClose, onNavigate }) => {
  if (!parent) return null;

  const children = parent.children ?? [];

  if (!open) return null;

  const popoverStyle: React.CSSProperties = {
    position: 'absolute',
    top: anchorEl?.getBoundingClientRect().bottom + 'px',
    left: anchorEl?.getBoundingClientRect().right + 'px',
    zIndex: 1300,
  };

  return (
    <div className="sidebar__popover" style={popoverStyle} onClick={(e) => e.stopPropagation()}>
      <div className="sidebar__popover-content">
        {children.length === 0 ? (
          <NavLink 
            to={parent.path ?? "#"} 
            className="sidebar__popover-item"
            onClick={() => { onClose(); onNavigate?.(); }}
          >
            {parent.icon && <span className="sidebar__popover-icon">{parent.icon}</span>}
            {parent.label}
          </NavLink>
        ) : (
          <div className="sidebar__popover-list">
            {children.map((c: SidebarChild) => (
              <NavLink
                key={c.id}
                to={c.path}
                className={({ isActive }) => 
                  `sidebar__popover-item ${isActive ? 'sidebar__popover-item--active' : ''}`
                }
                onClick={() => { onClose(); onNavigate?.(); }}
              >
                {c.icon && <span className="sidebar__popover-icon">{c.icon}</span>}
                {c.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
