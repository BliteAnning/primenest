import { useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bath, BedDouble, BookmarkPlus, MapPin, RefreshCw, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { listingContext } from "../context/listingContext";
import axiosInstance from "../axiosInstance";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", maximumFractionDigits: 0 }).format(value);

const initialFilters = {
  q: "",
  sortBy: "newest",
  listingType: "",
  propertyType: "",
  region: "",
  city: "",
  bedrooms: "",
  bathrooms: "",
  radius: "10",
};

export default function Listings() {
  const { listings, loading, error, getListings } = useContext(listingContext);
  const [filters, setFilters] = useState(initialFilters);
  const [geoCoords, setGeoCoords] = useState(null);
  const [geoMessage, setGeoMessage] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchMessage, setSearchMessage] = useState("");

  const featuredCount = useMemo(() => listings.filter((item) => item.isFeatured).length, [listings]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const params = Object.fromEntries(
      Object.entries({ ...filters }).filter(([, value]) => value !== "" && value !== null)
    );

    if (geoCoords && params.radius) {
      params.lat = geoCoords.lat;
      params.lng = geoCoords.lng;
    }

    await getListings(params);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoMessage("Geolocation is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setGeoMessage("Location ready for nearby searches.");
      },
      () => {
        setGeoMessage("Unable to access your location right now.");
      },
      { enableHighAccuracy: true }
    );
  };

  const handleReset = async () => {
    setFilters(initialFilters);
    setGeoCoords(null);
    setGeoMessage("");
    await getListings();
  };

  const handleSaveSearch = async () => {
    if (!localStorage.getItem("token")) {
      setSearchMessage("Please sign in to save your search.");
      return;
    }

    try {
      const payload = {
        name: searchName || "My saved search",
        criteria: { ...filters, lat: geoCoords?.lat || undefined, lng: geoCoords?.lng || undefined },
        alertEnabled: false,
      };

      await axiosInstance.post("/users/me/saved-searches", payload);
      setSearchMessage("Search saved to your dashboard.");
    } catch (error) {
      console.error(error);
      setSearchMessage("We could not save this search right now.");
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f7fff9_0%,#ffffff_45%,#f0fdf4_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 rounded-4xl border border-emerald-100 bg-white/80 p-6 shadow-lg backdrop-blur md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
              <Sparkles size={16} />
              Homes tailored for tenants and buyers
            </div>
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Discover the latest listings</h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Browse verified properties, compare spaces, and open detailed pages for each home.
            </p>
          </div>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline">
            Back to home <ArrowRight size={16} />
          </Link>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Fresh listings</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{listings.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Featured homes</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{featuredCount}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Coverage</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">Accra & Beyond</p>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="mb-8 rounded-4xl border border-emerald-100 bg-white/90 p-4 shadow-lg sm:p-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-emerald-700">
              <SlidersHorizontal size={18} />
              <h2 className="text-lg font-semibold text-slate-900">Search & refine listings</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleUseMyLocation}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
              >
                <MapPin size={15} />
                Use my location
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <RefreshCw size={15} />
                Reset
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-600">
              <span className="mb-2 flex items-center gap-2 font-medium text-slate-700">
                <Search size={15} /> Search
              </span>
              <input
                name="q"
                value={filters.q}
                onChange={handleChange}
                placeholder="Neighborhood, keyword, or title"
                className="w-full border-none bg-transparent p-0 outline-none"
              />
            </label>

            <label className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Sort</span>
              <select name="sortBy" value={filters.sortBy} onChange={handleChange} className="w-full border-none bg-transparent p-0 outline-none">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="most_viewed">Most viewed</option>
                <option value="relevance">Relevance</option>
              </select>
            </label>

            <label className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Property type</span>
              <select name="listingType" value={filters.listingType} onChange={handleChange} className="w-full border-none bg-transparent p-0 outline-none">
                <option value="">All</option>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </label>

            <label className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Category</span>
              <input
                name="propertyType"
                value={filters.propertyType}
                onChange={handleChange}
                placeholder="Apartment, house, office"
                className="w-full border-none bg-transparent p-0 outline-none"
              />
            </label>

            <label className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Region</span>
              <input
                name="region"
                value={filters.region}
                onChange={handleChange}
                placeholder="Greater Accra"
                className="w-full border-none bg-transparent p-0 outline-none"
              />
            </label>

            <label className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">City</span>
              <input
                name="city"
                value={filters.city}
                onChange={handleChange}
                placeholder="Accra"
                className="w-full border-none bg-transparent p-0 outline-none"
              />
            </label>

            <label className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Bedrooms</span>
              <input
                type="number"
                min="1"
                name="bedrooms"
                value={filters.bedrooms}
                onChange={handleChange}
                placeholder="2"
                className="w-full border-none bg-transparent p-0 outline-none"
              />
            </label>

            <label className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Bathrooms</span>
              <input
                type="number"
                min="1"
                name="bathrooms"
                value={filters.bathrooms}
                onChange={handleChange}
                placeholder="2"
                className="w-full border-none bg-transparent p-0 outline-none"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600">
              <span className="font-medium text-slate-700">Radius</span>
              <select name="radius" value={filters.radius} onChange={handleChange} className="border-none bg-transparent p-0 outline-none">
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="20">20 km</option>
                <option value="50">50 km</option>
              </select>
            </label>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              {geoMessage ? <span>{geoMessage}</span> : <span>Use location for nearby listings.</span>}
              <input
                value={searchName}
                onChange={(event) => setSearchName(event.target.value)}
                placeholder="Name this search"
                className="rounded-full border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />
              <button type="button" onClick={handleSaveSearch} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 px-3 py-2 font-semibold text-emerald-700 transition hover:bg-emerald-50">
                <BookmarkPlus size={15} /> Save search
              </button>
              <button type="submit" className="rounded-full bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700">
                Apply filters
              </button>
            </div>
          </div>

          {searchMessage ? <p className="mt-3 text-sm text-emerald-700">{searchMessage}</p> : null}
      
    </form>

        {
    error ? (
      <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
    ) : null
  }

  {
    loading ? (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-80 animate-pulse rounded-4xl border border-slate-200 bg-slate-100" />
        ))}
      </div>
    ) : listings.length === 0 ? (
      <div className="rounded-4xl border border-dashed border-slate-300 bg-white/70 p-10 text-center text-slate-600 shadow-sm">
        <p className="text-lg font-semibold text-slate-900">No properties matched your search yet.</p>
        <p className="mt-2">Try a broader location or clear a few filters to explore more homes.</p>
      </div>
    ) : (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {listings.map((listing) => {
          const image =
            listing.media?.find((item) => item.type === "photo" && item.url)?.url ||
            listing.image ||
            "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80";

          return (
            <Link
              key={listing._id}
              to={`/listings/${listing._id || listing.slug}`}
              className="group overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-56 overflow-hidden">
                <img src={image} alt={listing.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-emerald-700">
                  {listing.listingType === "sale" ? "For Sale" : "For Rent"}
                </div>
              </div>

              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{listing.title}</h2>
                    <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                      <MapPin size={14} />
                      {listing.location?.neighborhood || listing.location?.city || "Prime location"}
                    </p>
                  </div>
                  <div className="text-right text-lg font-bold text-emerald-600">{formatCurrency(listing.price)}</div>
                </div>

                <p className="text-sm leading-6 text-slate-600 line-clamp-3">{listing.description}</p>

                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <BedDouble size={14} /> {listing.bedrooms || 2} bed
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath size={14} /> {listing.bathrooms || 2} bath
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    )
  }
      </div >
    </div >
  );
}
