import React from "react";
import { FiChevronDown } from "react-icons/fi";
import type { SidebarParent } from "./types";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

type Props = {
  parent: SidebarParent;
  expanded: boolean;
  onToggle: (id: string) => void;
  collapsed?: boolean;
  onIconMouseEnter?: (e: React.MouseEvent<HTMLElement>, id: string) => void;
  onIconMouseLeave?: () => void;
};

export const SidebarItem: React.FC<Props> = ({
  parent,
  expanded,
  onToggle,
  collapsed = false,
  onIconMouseEnter: onIconMouseEnterProp,
  onIconMouseLeave: onIconMouseLeaveProp,
}) => {
  const hasChildren = (parent.children && parent.children.length > 0) ?? false;
  const navigate = useNavigate();

  const onIconMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (onIconMouseEnterProp) {
      onIconMouseEnterProp(e, parent.id);
    }
  };

  const onIconMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const timer = setTimeout(() => {
      if (onIconMouseLeaveProp) {
        onIconMouseLeaveProp();
      }
    }, 300);
    
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget?.closest('.sidebar__popover')) {
      clearTimeout(timer);
    }
    
    return () => clearTimeout(timer);
  };

  // Handle click on parent item
  const handleParentClick = () => {
    if (hasChildren) {
      if (!expanded) {
        onToggle(parent.id);
        if (parent.children?.[0]?.path) {
          navigate(parent.children[0].path);
        }
      } else {
        if (parent.children?.[0]?.path) {
          navigate(parent.children[0].path);
        }
      }
    } else if (parent.path) {
      navigate(parent.path);
    }
  };

  // When collapsed: we only render icon button with hover handlers
  if (collapsed) {
    return (
      <div className="collapsed-icon-wrapper">
        <button
          className="sidebar__button"
          aria-label={parent.label}
          onMouseEnter={onIconMouseEnter}
          onMouseLeave={onIconMouseLeave}
          onClick={() => !hasChildren && parent.path && (window.location.href = parent.path)}
        >
          <span className="sidebar__icon">
            {parent.icon}
          </span>
        </button>
      </div>
    );
  }

  // Expanded rendering
  return (
    <div className="sidebar__item">
      <button 
        className={`sidebar__button ${hasChildren ? 'sidebar__button--has-children' : ''}`}
        onClick={handleParentClick}
        type="button"
      >
        <span className="sidebar__button-content">
          <span className="sidebar__icon">
            {parent.icon}
          </span>
          <span className="sidebar__label">
            {parent.label}
          </span>
        </span>

        {hasChildren && (
          <span 
            className={`sidebar__chevron ${expanded ? 'sidebar__chevron--open' : ''}`}
            onClick={(e) => {
              e.stopPropagation(); // Prevent parent click handler from firing
              onToggle(parent.id);
            }}
          >
            <FiChevronDown />
          </span>
        )}
      </button>

      {hasChildren && (
        <div className="sidebar__children" style={{
          display: expanded ? 'block' : 'none'
        }}>
          {parent.children!.map((child) => (
            <NavLink
              key={child.id}
              to={child.path}
              className={({ isActive }) => 
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
            >
              {child.icon && <span className="sidebar__link-icon">{child.icon}</span>}
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};
