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
      <div className="h-screen flex flex-col bg-brand-cream overflow-hidden">
        {/* Bio-Organic Sanctuary Bento Navigation Bar */}
        <nav className="bg-brand-forest border-b border-brand-border-dark h-14 flex items-center justify-between px-6 shrink-0 shadow-sm z-30">
          <Link to="/" className="flex items-center gap-2 font-serif text-lg font-bold text-brand-light-text hover:opacity-90 transition-opacity">
            <Briefcase className="w-5 h-5 text-brand-terracotta" />
            <span className="tracking-tight">
              Sanctuary Scrapper
            </span>
          </Link>

          <div className="flex items-center gap-1.5 h-full">
            <Link
              to="/"
              className="px-4 py-1.5 rounded-lg font-sans text-xs font-semibold text-brand-light-text hover:bg-brand-border-dark hover:text-brand-light-text transition-all duration-200"
            >
              <div className="flex items-center">
                <Search className="w-3.5 h-3.5 mr-1.5 text-brand-sage" />
                Catalog
              </div>
            </Link>
            <Link
              to="/recommended"
              className="px-4 py-1.5 rounded-lg font-sans text-xs font-semibold text-brand-light-text hover:bg-brand-border-dark hover:text-brand-light-text transition-all duration-200"
            >
              <div className="flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-brand-sage" />
                Recommendations
              </div>
            </Link>
            <Link
              to="/applications"
              className="px-4 py-1.5 rounded-lg font-sans text-xs font-semibold text-brand-light-text hover:bg-brand-border-dark hover:text-brand-light-text transition-all duration-200"
            >
              <div className="flex items-center">
                <History className="w-3.5 h-3.5 mr-1.5 text-brand-sage" />
                Applications
              </div>
            </Link>
            <Link
              to="/stats"
              className="px-4 py-1.5 rounded-lg font-sans text-xs font-semibold text-brand-light-text hover:bg-brand-border-dark hover:text-brand-light-text transition-all duration-200"
            >
              <div className="flex items-center">
                <BarChart3 className="w-3.5 h-3.5 mr-1.5 text-brand-sage" />
                Analytics
              </div>
            </Link>
            <button
              onClick={() => setShowProfile(true)}
              className="px-4 py-1.5 rounded-lg font-sans text-xs font-semibold text-brand-light-text hover:bg-brand-border-dark hover:text-brand-light-text transition-all duration-200 cursor-pointer bg-transparent border-0 outline-none"
            >
              <div className="flex items-center">
                <User className="w-3.5 h-3.5 mr-1.5 text-brand-sage" />
                Profile
              </div>
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden relative bg-brand-cream">
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

        {/* Bio-Organic clean footer */}
        <footer className="h-8 bg-brand-panel-light border-t border-brand-border flex items-center justify-between px-6 text-xs text-brand-muted-text shrink-0 select-none">
          <div className="font-sans font-medium">&copy; 2026 Sanctuary Job Suite</div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>System: <span className="text-brand-forest font-bold">Healthy</span></span>
            <span>Catalog: <span className="text-brand-terracotta font-bold">Supabase</span></span>
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
