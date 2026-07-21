import { Link } from 'react-router-dom';

const Navbar = () => {
    const token = localStorage.getItem('token');
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('primenestUser');
        window.location.href = '/login';
    }
    return (
        <nav className="sticky top-0 z-50 border-b border-emerald-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-xl font-bold text-white shadow-lg">P</div>
            <div>
              <h1 className="text-2xl font-bold text-emerald-700">PrimeNest</h1>
              <p className="text-sm text-slate-500">Smart property discovery</p>
            </div>
          </div>
          <div className="hidden items-center gap-7 text-sm font-medium text-slate-700 md:flex">
            <a href="#features" className="transition hover:text-emerald-600">Features</a>
            <a href="#how" className="transition hover:text-emerald-600">How it Works</a>
            {token ? (
              <Link to="/my-dashboard-t" className="transition hover:text-emerald-600">Dashboard</Link>
            ) : (
              <Link to="/login" className="transition hover:text-emerald-600">Login</Link>
            )}

            {token && (
              <button onClick={handleLogout} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>
    );
}


export default Navbar;