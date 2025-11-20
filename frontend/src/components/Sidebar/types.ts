import type { ReactNode } from "react";

export type SidebarChild = {
  id: string;
  label: string;
  path: string;
  icon?: ReactNode;
  meta?: Record<string, string>;
};

export type SidebarParent = {
  id: string;
  label: string;
  icon?: ReactNode;
  path?: string; // optional route for parent itself
  children?: SidebarChild[];
  collapsible?: boolean;
};

export type SidebarData = SidebarParent[];
