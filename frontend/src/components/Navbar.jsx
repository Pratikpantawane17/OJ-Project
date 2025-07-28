import React, { useState } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';

const Navbar = ({ isAuthenticated = false, onLogout = () => {}, onNavigate = () => {} }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    closeMobileMenu();
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const navigateAndClose = (path) => {
    onNavigate(path);
    closeMobileMenu();
  };

  return (
    <nav className={`${
    isDarkMode
      ? 'backdrop-blur-md bg-[rgba(24,33,49,0.3)] border-b border-white/10'
      : 'backdrop-blur-md bg-[rgba(255,255,255,0.3)] border-b border-gray-300/40'} shadow-lg sticky top-0 z-50 border-b-1 border-gray-700`}>
      <div className="w-full flex items-center justify-between h-16 px-7 px py-0">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center space-x-3 hover:cursor-pointer">
            <img
              src="/logo_white.png"
              alt="AlgoArena Logo"
              className="w-10 h-10 hover:cursor-pointer" 
              onClick={() => onNavigate('/')}
            />
            <button 
              onClick={() => onNavigate('/')}
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text hover:cursor-pointer transition-opacity"
            >
              AlgoArena
            </button>
          </div>

          {/* Desktop Navigation */}

            <div className="hidden md:ml-10 md:flex md:items-center md:space-x-8">
              {/* Nav Links */}
              <div className="flex space-x-6">
                {!isAuthenticated ? (
                  <>
                    <button
                      onClick={() => onNavigate('/login')}
                      className={`${
                        isDarkMode ? 'text-white hover:text-blue-400 cursor-pointer' : 'text-gray-800 hover:text-blue-600 cursor-pointer'
                      } px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200`}
                    >
                      Login
                    </button>
                    <button
                      onClick={() => onNavigate('/signup')}
                      className={`${
                        isDarkMode ? 'text-white hover:text-blue-400 cursor-pointer' : 'text-gray-800 hover:text-blue-600 cursor-pointer'
                      } px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200`}
                    >
                      Register
                    </button>
                  </>
                ) : (
                  <>
                  <button
                      onClick={() => onNavigate('/')}
                      className={`${
                        isDarkMode ? 'text-white hover:text-blue-400 cursor-pointer' : 'text-gray-800 hover:text-blue-600 cursor-pointer'
                      } px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200`}
                    >
                      Home
                  </button>
                  <button
                      onClick={() => onNavigate('/problemlist')}
                      className={`${
                        isDarkMode ? 'text-white hover:text-blue-400 cursor-pointer' : 'text-gray-800 hover:text-blue-600 cursor-pointer'
                      } px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200`}
                    >
                      Problems
                    </button>
                    <button
                      onClick={() => onNavigate('/dashboard')}
                      className={`${
                        isDarkMode ? 'text-white hover:text-blue-400 cursor-pointer' : 'text-gray-800 hover:text-blue-600 cursor-pointer'
                      } px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200`}
                    >
                      Dashboard
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="bg-red-500 hover:bg-red-600 cursor-pointer text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 "
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>

              {/* Dark/Light Toggle */}
              {/* <button
                onClick={toggleTheme}
                className={`${
                  isDarkMode ? 'bg-blue-600' : 'bg-yellow-400'
                } relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    isDarkMode ? 'translate-x-7 bg-gray-800' : 'translate-x-1 bg-white'
                  } inline-block h-6 w-6 transform rounded-full transition-transform flex items-center justify-center`}
                >
                  {isDarkMode ? (
                    <Moon className="h-4 w-4 text-blue-400" />
                  ) : (
                    <Sun className="h-4 w-4 text-yellow-600" />
                  )}
                </span>
              </button> */}

          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Mobile Dark/Light Toggle */}
            {/* <button
              onClick={toggleTheme}
              className={`${
                isDarkMode ? 'bg-blue-600' : 'bg-yellow-400'
              } relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none`}
            >
              <span
                className={`${
                  isDarkMode ? 'translate-x-7 bg-gray-800' : 'translate-x-1 bg-white'
                } inline-block h-6 w-6 transform rounded-full transition-transform flex items-center justify-center`}
              >
                {isDarkMode ? (
                  <Moon className="h-4 w-4 text-blue-400" />
                ) : (
                  <Sun className="h-4 w-4 text-yellow-600" />
                )}
              </span>
            </button> */}

            {/* Hamburger Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className={`${
                isDarkMode ? 'text-white hover:text-blue-400 cursor-pointer' : 'text-gray-800 hover:text-blue-600'
              } inline-flex items-center justify-center p-2 rounded-md transition-colors duration-200`}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className={`md:hidden ${isDarkMode ? 'bg-gray-800 cursor-pointer' : 'bg-white'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => navigateAndClose('/login')}
                  className={`${
                    isDarkMode ? 'text-white hover:text-blue-400 hover:bg-gray-700 cursor-pointer' : 'text-gray-800 hover:text-blue-600 hover:bg-gray-100'
                  } block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 w-full text-left`}
                >
                  Login
                </button>
                <button
                  onClick={() => navigateAndClose('/signup')}
                  className={`${
                    isDarkMode ? 'text-white hover:text-blue-400 hover:bg-gray-700 cursor-pointer' : 'text-gray-800 hover:text-blue-600 hover:bg-gray-100'
                  } block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 w-full text-left`}
                >
                  Register
                </button>
              </>
            ) : (
              <>
              <button
                      onClick={() => onNavigate('/')}
                      className={`${
                        isDarkMode ? 'text-white hover:text-blue-400 cursor-pointer' : 'text-gray-800 hover:text-blue-600 cursor-pointer'
                      } px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200`}
                    >
                      Home
                </button>
                <button
                  onClick={() => navigateAndClose('/problemlist')}
                  className={`${
                    isDarkMode ? 'text-white hover:text-blue-400 hover:bg-gray-700 cursor-pointer' : 'text-gray-800 hover:text-blue-600 hover:bg-gray-100'
                  } block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 w-full text-left`}
                >
                  Problems
                </button>
                <button
                  onClick={() => navigateAndClose('/dashboard')}
                  className={`${
                    isDarkMode ? 'text-white hover:text-blue-400 hover:bg-gray-700 cursor-pointer' : 'text-gray-800 hover:text-blue-600 hover:bg-gray-100'
                  } block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 w-full text-left`}
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left bg-red-500 hover:bg-red-600 text-white block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

