import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import {
  HomeIcon,
  FolderIcon,
  UserGroupIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline';

export default function Sidebar() {
  const location = useLocation();
  const { t } = useTranslation();

  const navigation = [
    { name: t('sidebar.dashboard'), href: '/dashboard', icon: HomeIcon },
    { name: t('sidebar.projects'), href: '/projects', icon: FolderIcon },
    { name: t('sidebar.employees'), href: '/employees', icon: UserGroupIcon },
    { name: t('sidebar.reports'), href: '/reports', icon: DocumentChartBarIcon },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-16">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 overflow-y-auto">
            <nav className="flex-1 px-2 space-y-1 pb-4">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href ||
                                (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                      ${isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <item.icon
                      className={`
                        mr-3 flex-shrink-0 h-6 w-6
                        ${isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'}
                      `}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="px-2 pb-4 border-t border-gray-200 pt-4 space-y-3">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <nav className="flex justify-around">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href ||
                            (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex flex-col items-center py-2 px-3 text-xs font-medium transition-colors
                  ${isActive ? 'text-blue-600' : 'text-gray-600'}
                `}
              >
                <item.icon className="h-6 w-6 mb-1" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

