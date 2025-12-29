
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, Briefcase, Home, TrendingUp } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const cachedUser = localStorage.getItem('waiter_user');
    if (cachedUser) {
      setUser(JSON.parse(cachedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('waiter_session');
    localStorage.removeItem('waiter_user');
    window.location.href = createPageUrl('Auth');
  };

  const handleLogin = () => {
    navigate(createPageUrl('Auth'));
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <nav className="bg-gradient-to-r from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] text-white shadow-2xl sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                שירות <span className="text-[#D4AF37]">מלצרות</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link to={createPageUrl('Home')}>
                <Button variant="ghost" className="text-white hover:text-[#D4AF37] hover:bg-transparent">
                  <Home className="w-4 h-4 ml-2" />
                  דף הבית
                </Button>
              </Link>

              {user ? (
                <>
                  <Link to={createPageUrl('MyProfile')}>
                    <Button variant="ghost" className="text-white hover:text-[#D4AF37] hover:bg-transparent">
                      <User className="w-4 h-4 ml-2" />
                      האזור האישי
                    </Button>
                  </Link>
                  <Link to={createPageUrl('JobRequests')}>
                    <Button variant="ghost" className="text-white hover:text-[#D4AF37] hover:bg-transparent">
                      <Briefcase className="w-4 h-4 ml-2" />
                      בקשות עבודה
                    </Button>
                  </Link>
                  {user.role === 'admin' && (
                    <Link to={createPageUrl('Analytics')}>
                      <Button variant="ghost" className="text-white hover:text-[#D4AF37] hover:bg-transparent">
                        <TrendingUp className="w-4 h-4 ml-2" />
                        דשבורד מנהל
                      </Button>
                    </Link>
                  )}
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="text-white hover:text-[#D4AF37] hover:bg-transparent"
                  >
                    <LogOut className="w-4 h-4 ml-2" />
                    התנתק
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleLogin}
                  className="bg-[#D4AF37] text-[#1a1a1a] hover:bg-[#B8941F] font-bold"
                >
                  התחבר / הירשם
                </Button>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-700">
              <div className="flex flex-col gap-2">
                <Link to={createPageUrl('Home')}>
                  <Button variant="ghost" className="w-full text-white hover:text-[#D4AF37] hover:bg-transparent justify-start">
                    <Home className="w-4 h-4 ml-2" />
                    דף הבית
                  </Button>
                </Link>

                {user ? (
                  <>
                    <Link to={createPageUrl('MyProfile')}>
                      <Button variant="ghost" className="w-full text-white hover:text-[#D4AF37] hover:bg-transparent justify-start">
                        <User className="w-4 h-4 ml-2" />
                        האזור האישי
                      </Button>
                    </Link>
                    <Link to={createPageUrl('JobRequests')}>
                      <Button variant="ghost" className="w-full text-white hover:text-[#D4AF37] hover:bg-transparent justify-start">
                        <Briefcase className="w-4 h-4 ml-2" />
                        בקשות עבודה
                      </Button>
                    </Link>
                    {user.role === 'admin' && (
                      <Link to={createPageUrl('Analytics')}>
                        <Button variant="ghost" className="w-full text-white hover:text-[#D4AF37] hover:bg-transparent justify-start">
                          <TrendingUp className="w-4 h-4 ml-2" />
                          דשבורד מנהל
                        </Button>
                      </Link>
                    )}
                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      className="w-full text-white hover:text-[#D4AF37] hover:bg-transparent justify-start"
                    >
                      <LogOut className="w-4 h-4 ml-2" />
                      התנתק
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleLogin}
                    className="w-full bg-[#D4AF37] text-[#1a1a1a] hover:bg-[#B8941F] font-bold"
                  >
                    התחבר / הירשם
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <main>{children}</main>

      <footer className="bg-gradient-to-r from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] text-white py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <div className="text-2xl font-bold mb-2">
            שירות <span className="text-[#D4AF37]">מלצרות</span>
          </div>
          <p className="text-gray-400">חיבור בין אנשי מקצוע למנהלי אירועים</p>
        </div>
      </footer>
    </div>
  );
}
