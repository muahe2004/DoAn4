import React, { useState, useRef, useEffect } from "react";
import "./Header.css";
import { MdHelpOutline } from "react-icons/md";
import { useSidebar } from "../../contexts/SidebarContext";
import { submitLogout } from "../../modules/auth/services/authService";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar } from "@mui/material";

interface HeaderProps {
  customerName?: string;
  fiscalYear?: string;
  userName?: string;
  userRole?: string;
  customers?: string[];
  fiscalYears?: string[];
}

const Header: React.FC<HeaderProps> = ({ 
  userName = 'demo',
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "info" | "success" | "error" }>({
    open: false,
    message: "",
    severity: "info",
  });
  const { toggleSidebar } = useSidebar();
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Đóng user menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHelpClick = () => console.log('Mở trợ giúp');
  const handleLogout = () => {
    setIsUserMenuOpen(false);
    setConfirmOpen(true);
  };

  const performLogout = async () => {
    setLoggingOut(true);
    setToast({ open: true, message: "Hẹn gặp bạn lần sau", severity: "info" });
    try {
      await submitLogout();
      navigate("/sign-in", { replace: true });
    } catch {
      setToast({ open: true, message: "Đăng xuất không thành công, vui lòng thử lại", severity: "error" });
    } finally {
      setLoggingOut(false);
      setConfirmOpen(false);
    }
  };

  const closeToast = () => setToast((prev) => ({ ...prev, open: false }));
  const handleProfile = () => {
    console.log('Thông tin cá nhân');
    setIsUserMenuOpen(false);
  };
  const handleChangePassword = () => {
    console.log('Đổi mật khẩu');
    setIsUserMenuOpen(false);
  };

  return (
    <header className="customs-header">
      <div className="header-top">
        <div className="header-left">
          <button className="menu-btn" onClick={toggleSidebar}>
            <span className="menu-icon">☰</span>
          </button>
          
        </div>


        <div className="header-right">
          <button className="help-link" onClick={handleHelpClick}>
            <MdHelpOutline className="text-5xl text-gray-700" />
            <span className="help-text">Trợ giúp</span>
          </button>

          <div className="user-dropdown" ref={userDropdownRef}>
            <button 
              className="user-toggle"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <div className="user-avatar">
                <span className="avatar-text">{userName.charAt(0).toUpperCase()}</span>
              </div>
              <span className="user-name">{userName}</span>
            </button>
            
            {isUserMenuOpen && (
              <div className="user-dropdown-menu">
                <button className="user-menu-item" onClick={handleProfile}>
                  <span className="menu-item-text">Thông tin cá nhân</span>
                </button>
                
                <button className="user-menu-item" onClick={handleChangePassword}>
                  <span className="menu-item-text">Đổi mật khẩu</span>
                </button>
                
                <button className="user-menu-item logout-item" onClick={handleLogout}>
                  <span className="menu-item-text">{loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Xác nhận đăng xuất</DialogTitle>
        <DialogContent>Bạn có chắc chắn muốn đăng xuất?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Hủy</Button>
          <Button color="primary" onClick={performLogout} disabled={loggingOut}>
            {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={toast.open} autoHideDuration={3000} onClose={closeToast} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert onClose={closeToast} severity={toast.severity} sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </header>
  );
};

export default Header;
