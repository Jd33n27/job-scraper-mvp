import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Applications from "./pages/Applications";
import Traceback from "./pages/Traceback";
import Stats from "./pages/Stats";
import RecommendedJobs from "./pages/RecommendedJobs";
import MatchAnalytics from "./pages/MatchAnalytics";
import SystemHealth from "./pages/SystemHealth";
import ProfileModal from "./components/ProfileModal";
import { fetchProfile, updateProfile, type UserProfile } from "./utils/profile";
import {
  Briefcase,
  History,
  Search,
  User,
  BarChart3,
  Sparkles,
  LineChart,
  Activity,
} from "lucide-react";
import "./App.css";

function App() {
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchProfile().then(setProfile);
  }, []);

  const handleSaveProfile = async (data: UserProfile) => {
    const success = await updateProfile(data);
    if (success) {
      setProfile(data);
      setShowProfile(false);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Navigation Bar */}
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 min-h-16 flex flex-wrap items-center justify-between py-2 md:py-0">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-gray-900 tracking-tight">
                JobScrapper
              </span>
            </Link>

            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              <Link
                to="/"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs md:text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                Jobs
              </Link>
              <Link
                to="/recommended"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs md:text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                For You
              </Link>
              <Link
                to="/applications"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs md:text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                <History className="w-4 h-4" />
                History
              </Link>
              <Link
                to="/stats"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs md:text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </Link>
              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs md:text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                <User className="w-4 h-4" />
                Profile
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recommended" element={<RecommendedJobs />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/applications/:appId" element={<Traceback />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/analytics" element={<MatchAnalytics />} />
            <Route path="/health" element={<SystemHealth />} />
          </Routes>
        </main>

        <footer className="py-8 text-center text-gray-400 text-sm border-t border-gray-100 bg-white">
          &copy; 2026 JobScrapper &bull; Empowering your career with
          transparency.
        </footer>

        {showProfile && (
          <ProfileModal
            initialData={profile || undefined}
            onClose={() => setShowProfile(false)}
            onSave={handleSaveProfile}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
