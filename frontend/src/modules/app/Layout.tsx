import { Outlet } from "react-router-dom";
import Header from "../../components/Header/Header";
import { Sidebar } from "../../components/Sidebar/Sidebar";
import { sidebarData } from "../../components/Sidebar/data";
import "../../index.css"; 
import "./Layout.css";

export default function Layout() {
  return (
    <div className="app-layout">
      <Header></Header>
      <div className="layout-main">
        <Sidebar data={sidebarData} />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};