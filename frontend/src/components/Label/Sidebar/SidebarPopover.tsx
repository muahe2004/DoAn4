import React, { useEffect, useRef } from "react";
import { createPortal } from 'react-dom';
import type { SidebarParent, SidebarChild } from "../../../components/Sidebar/types";
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
  const popoverRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);
  const isHovering = useRef<boolean>(false);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node) && 
          anchorEl && !anchorEl.contains(event.target as Node)) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, [open, anchorEl, onClose]);

  useEffect(() => {
    if (!parent) return;
    
    isHovering.current = true;
    return () => {
      isHovering.current = false;
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
    };
  }, [parent?.id]);

  if (!parent || !open || !anchorEl) return null;

  const children = parent.children ?? [];
  const rect = anchorEl.getBoundingClientRect();
  
  const popover = (
    <div 
      ref={popoverRef}
      className="sidebar__popover"
      style={{
        top: `${rect.top}px`,
        left: `${rect.right + 5}px`,
      }}
      onMouseLeave={() => {
        isHovering.current = false;
        closeTimer.current = window.setTimeout(() => {
          if (!isHovering.current) {
            onClose();
          }
        }, 300);
      }}
      onMouseEnter={() => {
        isHovering.current = true;
        if (closeTimer.current !== null) {
          clearTimeout(closeTimer.current);
          closeTimer.current = null;
        }
      }}
      onClick={(e) => e.stopPropagation()}
    >
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
            {children.map((c: SidebarChild, index: number) => (
              <NavLink
                key={`${c.id}-${index}`}
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

  return createPortal(popover, document.body);
};
