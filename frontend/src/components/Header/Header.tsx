import React, { useState, useRef, useEffect } from 'react';
import './Header.css';

interface HeaderProps {
  customerName?: string;
  fiscalYear?: string;
  userName?: string;
  userRole?: string;
  customers?: string[];
  fiscalYears?: string[];
}

const Header: React.FC<HeaderProps> = ({ 
  customerName = 'CONG TY TNHH TX',
  fiscalYear = '2025',
  userName = 'demo',
  userRole = 'Quản trị viên',
  customers = [
    'CONG TY TNHH TX',
    'CONG TY CP ABC',
    'CONG TY TNHH XYZ',
    'DOANH NGHIEP TNHH 123'
  ],
  fiscalYears = [
    '2025',
    '2024', 
    '2023',
    '2022'
  ]
}) => {
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [isFiscalYearOpen, setIsFiscalYearOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(customerName);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(fiscalYear);
  
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCustomerSelect = (customer: string) => {
    setSelectedCustomer(customer);
    setIsCustomerOpen(false);
  };

  const handleFiscalYearSelect = (year: string) => {
    setSelectedFiscalYear(year);
    setIsFiscalYearOpen(false);
  };

  const handleHelpClick = () => {
    console.log('Mở trợ giúp');
  };

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
          
          <div className="customer-dropdown">
            <span className="dropdown-label">Khách hàng đang làm việc:</span>
            <div className="dropdown-container">
              <button 
                className="dropdown-toggle"
                onClick={() => setIsCustomerOpen(!isCustomerOpen)}
              >
                <span className="selected-value">{selectedCustomer}</span>
                <span className={`dropdown-arrow ${isCustomerOpen ? 'open' : ''}`}>▼</span>
              </button>
              
              {isCustomerOpen && (
                <div className="dropdown-menu">
                  {customers.map((customer, index) => (
                    <button
                      key={index}
                      className="dropdown-item"
                      onClick={() => handleCustomerSelect(customer)}
                    >
                      {customer}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="header-center">
          <div className="fiscal-year-section">
            <span className="fiscal-year-label">Năm tài chính</span>
            <div className="fiscal-year-dropdown">
              <div className="dropdown-container">
                <button 
                  className="dropdown-toggle center-toggle"
                  onClick={() => setIsFiscalYearOpen(!isFiscalYearOpen)}
                >
                  <span className="fiscal-year-value">{selectedFiscalYear}</span>
                  <span className={`dropdown-arrow ${isFiscalYearOpen ? 'open' : ''}`}>▼</span>
                </button>
                
                {isFiscalYearOpen && (
                  <div className="dropdown-menu">
                    {fiscalYears.map((year, index) => (
                      <button
                        key={index}
                        className="dropdown-item"
                        onClick={() => handleFiscalYearSelect(year)}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="header-right">
          <button className="help-link" onClick={handleHelpClick}>
            <span className="help-icon"></span>
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
                  <span className="menu-item-text">Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );};

export default Header;