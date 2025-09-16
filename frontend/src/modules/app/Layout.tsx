import { Outlet } from "react-router-dom";
import Header from "../../components/Header/Header";

import "../../index.css"; 
import "./Layout.css";

export default function Layout() {
  return (
    <div className="app-layout">
      <Header></Header>
      <main><Outlet/></main>
    </div>
  );
};