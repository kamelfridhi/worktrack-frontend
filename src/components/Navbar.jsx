import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logozeen from '../assets/logozeen.png';

export default function Navbar() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <img src={logozeen} alt="ZeenAlZein Logo" className="h-10 w-auto object-contain" />
              {/* <span className="text-xl font-bold text-gray-900">ZeenAlZein</span> */}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

