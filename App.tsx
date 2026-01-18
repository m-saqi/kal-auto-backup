import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { BottomNav } from './components/BottomNav';
import { ScrollToTop } from './components/ScrollToTop';
import { Home } from './pages/Home';
import { Calculator } from './pages/Calculator';
import { Profiles } from './pages/Profiles';
import { About } from './pages/About';

const App = () => {
  return (
    <AppProvider>
      <HashRouter>
        {/* ScrollToTop must be inside HashRouter to access location context */}
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
          <Navbar />
          {/* Main content area with bottom padding for mobile navigation */}
          <main className="flex-grow pb-24 md:pb-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/profiles" element={<Profiles />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <BottomNav />
        </div>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
