import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#243d04] px-6 py-16 text-white sm:px-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div>
            <div className="flex items-center justify-center gap-3 md:justify-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-lg font-bold text-[#438608]">P</div>
              <h2 className="text-2xl font-bold">PrimeNest</h2>
            </div>
            <p className="mt-3 text-[#d4e6b8]">Making real estate simple, modern, and trustworthy in Ghana.</p>
          </div>
          <div className="flex gap-4 text-sm text-[#e6e8d3]">
            <Link to="/register" className="transition hover:text-white">Create account</Link>
            <Link to="/listings" className="transition hover:text-white">Explore homes</Link>
          </div>
        </div>
      </footer>
  );
}

export default Footer;