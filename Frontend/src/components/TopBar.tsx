import {
  Upload,
  FileText,
  Youtube,
  Mic,
  Link2,
  Moon,
  Sun,
  Globe,
  RefreshCw,
  Crown,
  Bell,
  Search,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext'; // Ensure this path is correct for your project

function TopBar() {
  // Use the theme context to get darkMode state and the toggle function
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <span className="text-sm">Home</span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-sm">Documents</span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-sm font-medium text-slate-900 dark:text-white">Workspace</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search documents, chats..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:bg-white dark:focus:bg-slate-900"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 mr-2">
          <button
            title="Upload PDF"
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <FileText className="w-5 h-5" />
          </button>

          <button
            title="Upload Document"
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Upload className="w-5 h-5" />
          </button>

          <button
            title="Import from YouTube"
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Youtube className="w-5 h-5" />
          </button>

          <button
            title="Upload Audio"
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Mic className="w-5 h-5" />
          </button>

          <button
            title="Import from Link"
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Link2 className="w-5 h-5" />
          </button>
        </div>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>

        <button
          title="Language"
          className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Globe className="w-5 h-5" />
        </button>

        <button
          title="Toggle Theme"
          onClick={toggleTheme}
          className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button
          title="Refresh"
          className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>

        <button
          title="Notifications"
          className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>

        <button 
          onClick={() => navigate('/upgrade')} // <-- ADD THE ONCLICK HANDLER
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-sm"
        >
          <Crown className="w-4 h-4" />
          <span className="text-sm font-medium">Upgrade</span>
        </button>


        <button
          title="Profile"
          onClick={() => navigate('/profile')}
          className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

export default TopBar;