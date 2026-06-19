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
      <div className="h-screen flex flex-col bg-[#e4e4e4] overflow-hidden select-none">
        {/* Apple style classic navigation bar */}
        <nav className="bg-gradient-to-b from-[#ffffff] to-[#cccccc] border-b border-[#808080] h-8 flex items-center justify-between px-3 shrink-0">
          <Link to="/" className="flex items-center gap-1.5 font-bold font-sans text-xs">
            <Briefcase className="w-3.5 h-3.5 text-[#0a5fcf]" />
            <span className="tracking-tight text-black font-extrabold uppercase">
              JobScrapper v1.0
            </span>
          </Link>

          <div className="flex items-center h-full">
            <Link
              to="/"
              className="h-full flex items-center px-3 font-sans text-xs font-bold text-black border-l border-[#b5b5b5] hover:bg-[#dbe7f9] hover:text-black transition-colors"
            >
              <Search className="w-3 h-3 mr-1" />
              Jobs
            </Link>
            <Link
              to="/recommended"
              className="h-full flex items-center px-3 font-sans text-xs font-bold text-black border-l border-[#b5b5b5] hover:bg-[#dbe7f9] hover:text-black transition-colors"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              For You
            </Link>
            <Link
              to="/applications"
              className="h-full flex items-center px-3 font-sans text-xs font-bold text-black border-l border-[#b5b5b5] hover:bg-[#dbe7f9] hover:text-black transition-colors"
            >
              <History className="w-3 h-3 mr-1" />
              History
            </Link>
            <Link
              to="/stats"
              className="h-full flex items-center px-3 font-sans text-xs font-bold text-black border-l border-r border-[#b5b5b5] hover:bg-[#dbe7f9] hover:text-black transition-colors"
            >
              <BarChart3 className="w-3 h-3 mr-1" />
              Stats
            </Link>
            <button
              onClick={() => setShowProfile(true)}
              className="h-full flex items-center px-3 font-sans text-xs font-bold text-black hover:bg-[#dbe7f9] hover:text-black transition-colors border-r border-[#b5b5b5] cursor-pointer bg-transparent border-0 outline-none"
            >
              <User className="w-3 h-3 mr-1" />
              Profile
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden relative">
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

        {/* Classic system status bar */}
        <footer className="h-6 bg-[#cccccc] border-t border-[#808080] flex items-center justify-between px-3 text-[10px] font-mono text-gray-700 shrink-0 select-none">
          <div>&copy; 2026 JobScrapper &bull; Retro Job Dashboard</div>
          <div className="flex items-center gap-3">
            <span>Status: Connected</span>
            <span>Index: Supabase SQL DB</span>
          </div>
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
