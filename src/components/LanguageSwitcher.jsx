import { useTranslation } from 'react-i18next';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div className="flex items-center space-x-1 md:space-x-2">
      <GlobeAltIcon className="h-4 w-4 md:h-5 md:w-5 text-gray-600 flex-shrink-0" />
      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="border border-gray-300 rounded-md px-1.5 md:px-2 py-1 text-xs md:text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        <option value="en">EN</option>
        <option value="de">DE</option>
      </select>
    </div>
  );
}

