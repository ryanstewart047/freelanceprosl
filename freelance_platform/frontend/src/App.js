import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import PopupBanner from './components/PopupBanner';
import DarkModeToggle from './components/DarkModeToggle';
import BackToTop from './components/BackToTop';
import CookieConsent from './components/CookieConsent';
import InstallPrompt from './components/InstallPrompt';
import AppInstallBanner from './components/AppInstallBanner';

// Pages
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Register from './pages/Register';
import Marketplace from './pages/Marketplace';
import FreelancerProfile from './pages/FreelancerProfile';
import Dashboard from './pages/Dashboard';
import JobDetails from './pages/JobDetails';
import PostJob from './pages/PostJob';
import UserProfile from './pages/UserProfile';
import NotFound from './pages/NotFound';
import Freelancers from './pages/Freelancers';
import HowItWorks from './pages/HowItWorks';
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import AdminDashboard from './pages/AdminDashboard';

// Services
import { initializeCookieServices } from './services/cookieService';

// Styles
import './styles/main.css';

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (!isAdminRoute) {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 30000);
      initializeCookieServices();
      return () => clearTimeout(timer);
    }
  }, [isAdminRoute]);

  const closePopup = () => {
    setShowPopup(false);
  };

  // Completely isolated Layout for Admin Panel
  if (isAdminRoute) {
    return (
      <div className="admin-isolated-container">
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </div>
    );
  }

  // Standard Website Layout
  return (
    <div className="app-container">
      <Header />
      <DarkModeToggle />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/freelancers" element={<Freelancers />} />
          <Route path="/freelancers/:id" element={<FreelancerProfile />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      {showPopup && <PopupBanner onClose={closePopup} />}
      <BackToTop />
      <CookieConsent />
      <InstallPrompt />
      <AppInstallBanner />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
