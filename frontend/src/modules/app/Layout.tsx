import { Outlet } from "react-router-dom";
import { useSidebar } from "../../contexts/SidebarContext";
import Header from "../../components/Header/Header";
import { Sidebar } from "../../components/Sidebar/Sidebar";
import { sidebarData } from "../../components/Sidebar/data";
import { SidebarProvider } from "../../contexts/SidebarContext";
import "../../index.css";
import "./Layout.css";

const LayoutContent = () => {
  const { collapsed } = useSidebar();
  
  return (
    <div className="app-layout">
      <Header />
      <div className={`layout-main ${collapsed ? 'collapsed' : ''}`}>
        <Sidebar data={sidebarData} />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default function Layout() {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
}