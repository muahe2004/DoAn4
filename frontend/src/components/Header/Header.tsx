import React, { useState, useRef, useEffect } from 'react';
import './Header.css';
import { MdHelpOutline } from "react-icons/md";

interface HeaderProps {
  userName?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  userName = 'demo'
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Đóng menu khi click ra ngoài
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
    console.log('Đăng xuất');
    setIsUserMenuOpen(false);
  };
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
          <button className="menu-btn">
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
                <span className="avatar-text">
                  {userName.charAt(0).toUpperCase()}
                </span>
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
                  <span className="menu-item-text">Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
