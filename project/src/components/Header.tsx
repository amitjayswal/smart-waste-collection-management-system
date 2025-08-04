import React from 'react';
import { Trash2, Menu, X, Bell } from 'lucide-react';

interface HeaderProps {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

const Header: React.FC<HeaderProps> = ({ isMobileMenuOpen, toggleMobileMenu }) => {
  return (
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Trash2 className="h-8 w-8 text-green-600" />
            <h1 className="ml-2 text-xl font-semibold text-gray-800">
              Smart Waste <span className="hidden sm:inline">Collection Management</span>
            </h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex space-x-4">
              <a href="#dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-50">
                Dashboard
              </a>
              <a href="#map" className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-50">
                Map View
              </a>
              <a href="#list" className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-50">
                List View
              </a>
              <a href="#analytics" className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-50">
                Analytics
              </a>
            </nav>
            
            <div className="flex items-center">
              <button 
                className="relative p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                aria-label="Notifications"
              >
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
              </button>
              
              <div className="ml-4 flex items-center">
                <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white">
                  A
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 hidden lg:block">Admin</span>
              </div>
            </div>
          </div>
          
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg">
            <a href="#dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50">
              Dashboard
            </a>
            <a href="#map" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50">
              Map View
            </a>
            <a href="#list" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50">
              List View
            </a>
            <a href="#analytics" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50">
              Analytics
            </a>
            
            <div className="border-t border-gray-200 pt-4 pb-3">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white">
                    A
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">Admin User</div>
                  <div className="text-sm font-medium text-gray-500">admin@example.com</div>
                </div>
                <button 
                  className="ml-auto flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  aria-label="Notifications"
                >
                  <Bell className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;