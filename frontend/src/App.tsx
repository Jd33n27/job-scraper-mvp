import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./pages/Home";
import Applications from "./pages/Applications";
import Traceback from "./pages/Traceback";
import Stats from "./pages/Stats";
import RecommendedJobs from "./pages/RecommendedJobs";
import MatchAnalytics from "./pages/MatchAnalytics";
import SystemHealth from "./pages/SystemHealth";
import HowItWorks from "./pages/HowItWorks";
import ProfileModal from "./components/ProfileModal";
import { fetchProfile, updateProfile, type UserProfile } from "./utils/profile";
import type { Job } from "./components/JobCard";
import {
  Briefcase,
  History,
  Search,
  User,
  BarChart3,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes cache
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const location = useLocation();

  // Shared application state cache
  const [globalJobs, setGlobalJobs] = useState<Job[]>([]);
  const [globalRecommended, setGlobalRecommended] = useState<Job[]>([]);
  const [jobsLoaded, setJobsLoaded] = useState(false);
  const [recommendedLoaded, setRecommendedLoaded] = useState(false);

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

  const NavLink = ({
    to,
    icon: Icon,
    label,
  }: {
    to: string;
    icon: any;
    label: string;
  }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-2 px-4 py-2 rounded-full font-sans text-xs font-semibold transition-all duration-300 ${
          isActive
            ? "bg-white/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]"
            : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
        }`}
      >
        <Icon
          className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`}
        />
        {label}
      </Link>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden relative selection:bg-cyan-500/30">
      <div className="fixed top-0 left-1/4 w-125 font-stretch-125 bg-violet-600/10 rounded-full mix-blend-screen filter blur-[128px] pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-1/4 w-125 h-125 bg-cyan-600/10 rounded-full mix-blend-screen filter blur-[128px] pointer-events-none z-0"></div>

      <nav className="sticky top-0 z-50 bg-slate-950/50 backdrop-blur-2xl border-b border-white/10 h-16 flex items-center justify-between px-6 shrink-0">
        <Link
          to="/"
          className="flex items-center gap-2 font-sans text-lg font-bold text-slate-100 hover:text-cyan-400 transition-colors group"
        >
          <div className="bg-linear-to-br from-cyan-400 to-violet-500 p-1.5 rounded-lg group-hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all">
            <Briefcase className="w-4 h-4 text-slate-950" />
          </div>
          <span className="tracking-wide">Phantom Scraper</span>
        </Link>

        <div className="flex items-center gap-2 h-full">
          <NavLink to="/" icon={Search} label="Catalog" />
          <NavLink to="/recommended" icon={Sparkles} label="Recommendations" />
          <NavLink to="/applications" icon={History} label="Applications" />
          <NavLink to="/stats" icon={BarChart3} label="Analytics" />
          <NavLink to="/how-it-works" icon={HelpCircle} label="How it Works" />

          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full font-sans text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all duration-300 bg-transparent border border-transparent hover:border-white/10 cursor-pointer outline-none ml-2"
          >
            <User className="w-4 h-4 text-slate-400" />
            Profile
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-hidden relative z-10">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                sharedJobs={globalJobs}
                setSharedJobs={setGlobalJobs}
                isLoaded={jobsLoaded}
                setIsLoaded={setJobsLoaded}
              />
            }
          />
          <Route
            path="/recommended"
            element={
              <RecommendedJobs
                sharedJobs={globalRecommended}
                setSharedJobs={setGlobalRecommended}
                isLoaded={recommendedLoaded}
                setIsLoaded={setRecommendedLoaded}
              />
            }
          />
          <Route path="/applications" element={<Applications />} />
          <Route path="/applications/:appId" element={<Traceback />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/analytics" element={<MatchAnalytics />} />
          <Route path="/health" element={<SystemHealth />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
        </Routes>
      </main>

      {showProfile && (
        <ProfileModal
          initialData={profile || undefined}
          onClose={() => setShowProfile(false)}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
