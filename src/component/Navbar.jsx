import { useState } from 'react';
import { Link } from 'react-router-dom';

import { HouseIcon, Menu, X } from 'lucide-react';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const token = localStorage.getItem('token');
    const storedUser = (() => {
        try {
            return JSON.parse(localStorage.getItem('primenestUser') || 'null');
        } catch {
            return null;
        }
    })();
    const userRole = storedUser?.role;
    const dashboardPath = storedUser?.role === 'agent' ? '/my-dashboard-a' : '/my-dashboard-t';
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('primenestUser');
        window.location.href = '/login';
    }
    const closeMenu = () => setIsMenuOpen(false);

    const navLinks = token && userRole === 'tenant' ? (
        <>
            <a href="/" onClick={closeMenu} className="transition hover:text-lime-600">Home</a>
            <a href="/listings" onClick={closeMenu} className="transition hover:text-lime-600">Explore</a>
            <a href="/my-dashboard-t" onClick={closeMenu} className="transition hover:text-lime-600">Dashboard</a>
        </>
    ) : token && userRole === 'agent' ? (
        <>
            <a href="/my-dashboard-a" onClick={closeMenu} className="transition hover:text-lime-600">Dashboard</a>
        </>
    ) : token && userRole === 'admin' ? (
        <>
            <a href="/admin-dashboard" onClick={closeMenu} className="transition hover:text-lime-600">Admin Dashboard</a>
        </>
    ) : (
        <>
            <a href="/" onClick={closeMenu} className="transition hover:text-lime-600">Home</a>
            <a href="/listings" onClick={closeMenu} className="transition hover:text-lime-600">Explore</a>
            <a href="/login" onClick={closeMenu} className="transition hover:text-lime-600">Login</a>
        </>
    );

    return (
        <nav className="sticky top-0 z-50 border-b border-lime-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <div className="flex items-center gap-3">
            
            
              <HouseIcon size={25} className="text-lime-700" />
              <span className=" text-lg font-semibold text-slate-900">PrimeNest</span>
            
          </div>
          <div className="hidden items-center gap-7 text-sm font-medium text-slate-700 md:flex">
            
            {navLinks}
            
            
           {/* {token ? (
              <Link to={dashboardPath} className="transition hover:text-lime-600">Dashboard</Link>
            ) : (
              <Link to="/login" className="transition hover:text-lime-600">Login</Link>
            )}*/}

            {token && (
              <button onClick={handleLogout} className="rounded-full bg-lime-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-lime-700">
                Logout
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 transition hover:text-lime-600 md:hidden"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="border-t border-lime-100 bg-white px-6 py-5 md:hidden">
            <div className="flex flex-col items-start gap-5 text-sm font-medium text-slate-700">
              {navLinks}

              {token && (
                <button
                  onClick={() => { handleLogout(); closeMenu(); }}
                  className="rounded-full bg-lime-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-lime-700"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    );
}


export default Navbar;