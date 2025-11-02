import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import logozeen from '../assets/logozeen.png';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <img src={logozeen} alt="ZeenAlZein Logo" className="h-10 w-auto object-contain" />
              {/* <span className="text-xl font-bold text-gray-900">ZeenAlZein</span> */}
            </Link>
          </div>

          {/* Mobile: Language and Logout */}
          <div className="md:hidden flex items-center space-x-3">
            <LanguageSwitcher />
            <button
              onClick={logout}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md text-sm font-medium transition-colors hover:bg-gray-50"
              title={t('navbar.logout')}
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Desktop: Nothing here (handled by Sidebar) */}
          <div className="hidden md:block"></div>
        </div>
      </div>
    </nav>
  );
}

