import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  Eye,
  Heart,
  HeartOff,
  Mail,
  MapPin,
  Ruler,
  ShieldAlert,
  Sparkles,
  UserRound,
  Wand2,
} from "lucide-react";
import { listingContext } from "../context/listingContext";
import { engagementContext } from "../context/engagementContext";
import InquiryModal from "../component/InquiryModal";
import ViewingRequestModal from "../component/ViewingRequestModal";
import RenovationVisionModal from "../component/RenovationVisionModal";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("primenestUser") || localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", maximumFractionDigits: 0 }).format(value);

const formatDate = (value) => {
  if (!value) return "Not available";
  return new Date(value).toLocaleDateString("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function ListingDetail() {
  const { id } = useParams();
  const { getListingDetails, fetchSavedListings, toggleSavedListing } = useContext(listingContext);
  const { sendInquiry, requestViewing } = useContext(engagementContext);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showViewingModal, setShowViewingModal] = useState(false);
  const [showRenoVisionModal, setShowRenoVisionModal] = useState(false);
  const storedUser = useMemo(() => getStoredUser(), []);

  useEffect(() => {
    const loadListing = async () => {
      setLoading(true);
      try {
        const listingData = await getListingDetails(id);
        setListing(listingData);

        if (listingData && localStorage.getItem("token")) {
          const savedItems = await fetchSavedListings();
          const savedIds = savedItems.map((item) => item?._id || item?.id);
          setIsSaved(savedIds.includes(listingData._id));
        } else {
          setIsSaved(false);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadListing();
  }, [id, getListingDetails, fetchSavedListings]);

  const galleryImages = useMemo(() => {
    if (!listing?.media?.length) {
      return [
        "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80",
      ];
    }

    return listing.media.filter((item) => item.url).map((item) => item.url);
  }, [listing]);

  const mainImage = galleryImages[activeImage] || galleryImages[0];

  const handleSaveToggle = async () => {
    if (!localStorage.getItem("token")) {
      setSaveMessage("Please sign in to save this property.");
      return;
    }

    try {
      setSaving(true);
      const response = await toggleSavedListing(id);
      const saved = Boolean(response?.saved);
      setIsSaved(saved);
      setSaveMessage(saved ? "Saved to your collection." : "Removed from your saved listings.");
    } catch (error) {
      console.error(error);
      setSaveMessage("We could not update your saved listings right now.");
    } finally {
      setSaving(false);
    }
  };

  const owner = listing?.listedBy || null;
  const amenities = listing?.amenities || {};
  const amenityList = Object.entries(amenities).filter(([, value]) => value === true);

  const canEngage =
    Boolean(localStorage.getItem("token")) &&
    storedUser &&
    (storedUser.role === "tenant" || storedUser.role === "buyer") &&
    owner?._id &&
    owner._id !== (storedUser._id || storedUser.id);

  const isTenantOrBuyer =
    Boolean(localStorage.getItem("token")) && storedUser && (storedUser.role === "tenant" || storedUser.role === "buyer");

  const hasRenovatablePhotos = (listing?.media || []).some((item) => item?.type === "photo" && item?.url);

  const handleOpenRenovationVision = () => {
    if (!isTenantOrBuyer) {
      toast.error("Please sign in as a tenant or buyer to use AI Renovation Vision.");
      return;
    }
    setShowRenoVisionModal(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,rgba(67,134,8,0.08)_0%,rgba(67,134,25,0.03)_50%,rgba(67,134,25,0.09)_100%)]">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#438608]/20 border-t-[#438608]" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[linear-gradient(135deg,rgba(67,134,8,0.08)_0%,rgba(67,134,25,0.03)_50%,rgba(67,134,25,0.09)_100%)] px-6 text-center">
        <p className="text-xl font-semibold text-slate-900">We could not load this listing right now.</p>
        <Link to="/listings" className="mt-4 inline-flex items-center gap-2 text-[#438608] transition-transform duration-300 hover:-translate-x-1 hover:underline">
          <ArrowLeft size={16} /> See other homes
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,rgba(67,134,8,0.08)_0%,rgba(67,134,25,0.03)_50%,rgba(67,134,25,0.09)_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link to="/listings" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#438608] transition-transform duration-300 hover:-translate-x-1 hover:underline">
          <ArrowLeft size={16} /> Back to listings
        </Link>

        <div className="overflow-hidden rounded-4xl  bg-white">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="bg-slate-100 p-3 sm:p-4">
              <div className="group relative overflow-hidden rounded-3xl">
                <img src={mainImage} alt={listing.title} className="h-80 w-full object-cover transition duration-700 ease-out group-hover:scale-105 sm:h-110" />
                <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-[#438608] transition-transform duration-300 group-hover:scale-105">
                  {listing.listingType === "sale" ? "For Sale" : "For Rent"}
                </div>
                <div className="absolute bottom-4 left-4 rounded-full bg-slate-900/70 px-3 py-1 text-sm font-medium text-white">
                  {activeImage + 1} / {galleryImages.length}
                </div>
              </div>

              {galleryImages.length > 1 ? (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {galleryImages.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      className={`overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 ${activeImage === index ? "border-[#438608] shadow-md shadow-[#438608]/15" : "border-transparent hover:border-[#438608]/20"}`}
                    >
                      <img src={image} alt={`Preview ${index + 1}`} className="h-20 w-full object-cover transition duration-500 hover:scale-110" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="p-6 sm:p-8 lg:p-10">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#438608]/10 px-3 py-1 text-sm font-semibold text-[#438608] motion-safe:animate-pulse">
               
                Curated property
              </div>

              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="sm:text-3xl text-xl font-bold text-slate-900">{listing.title}</h1>
                  <p className="mt-3 flex items-center gap-2 text-slate-500">
                    <MapPin size={16} />
                    {listing.location?.neighborhood || listing.location?.city || "Prime location"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveToggle}
                  disabled={saving}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 sm:text-sm text-xs font-semibold transition ${
                    isSaved ? "bg-[#438608] text-white shadow-lg shadow-[#438608]/20" : "border border-[#438608]/20 bg-[#438608]/10 text-[#438608]"
                  } ${saving ? "opacity-70" : "hover:-translate-y-0.5 hover:brightness-95"}`}
                >
                  {isSaved ? <Heart size={16} /> : <HeartOff size={16} />}
                  {saving ? "Saving..." : isSaved ? "Saved" : "Save listing"}
                </button>
              </div>

              {saveMessage ? <p className="mt-3 text-sm text-[#438608]">{saveMessage}</p> : null}

              <p className="mt-4 text-4xl font-bold text-[#438608]">{formatCurrency(listing.price)}</p>
              <p className="mt-2 text-sm text-slate-500">
                {listing.propertyType} • {listing.listingType} • {listing.status || "active"}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 px-4 py-3">
                  <div className="flex items-center gap-2 font-semibold text-slate-700">
                    <BedDouble size={16} /> {listing.bedrooms || 2} bedrooms
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 px-4 py-3">
                  <div className="flex items-center gap-2 font-semibold text-slate-700">
                    <Bath size={16} /> {listing.bathrooms || 2} bathrooms
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 px-4 py-3">
                  <div className="flex items-center gap-2 font-semibold text-slate-700">
                    <Eye size={16} /> {listing.viewCount || 0} views
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-3xl bg-slate-50 p-5">
                <h2 className="text-lg font-semibold text-slate-900">Overview</h2>
                <p className="mt-3 leading-7 text-xs sm:text-sm text-slate-600">{listing.description}</p>
              </div>
            </div>
          </div>

          {hasRenovatablePhotos ? (
            <div className="border-t border-slate-200 bg-[linear-gradient(135deg,rgba(67,134,8,0.08)_0%,rgba(67,134,25,0.03)_50%,rgba(67,134,25,0.1)_100%)] p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#438608]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#438608] motion-safe:animate-pulse">
                    <Sparkles size={14} /> New · AI powered
                  </div>
                  <h3 className="mt-3 sm:text-xl text-lg font-bold text-slate-900">See this space redesigned in your style</h3>
                  <p className="mt-1 max-w-xl text-sm text-slate-600">
                    Use AI Renovation Vision to preview a modern, luxury, or Afrocentric makeover of any photo — complete
                    with a Ghana-specific cost estimate.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenRenovationVision}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#438608] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#438608]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#3b7808]"
                >
                  <Wand2 size={16} /> Try Renovation Vision
                </button>
              </div>
            </div>
          ) : null}

          <div className="border-t border-slate-200 bg-slate-50/70 p-6 sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-8">
                <section>
                  <h3 className="text-lg font-semibold text-slate-900">Property highlights</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Building2 size={16} /> Property type
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{listing.propertyType}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Ruler size={16} /> Size
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{listing.sizeSqm || "Available on request"} sqm</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <CalendarDays size={16} /> Listed on
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{formatDate(listing.createdAt)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <CheckCircle2 size={16} /> Verified
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{listing.isVerified ? "Verified by our team" : "Pending verification"}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-slate-900">Amenities</h3>
                  {amenityList.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {amenityList.map(([name]) => (
                        <span key={name} className="rounded-full border border-[#438608]/20 bg-[#438608]/10 px-3 py-1 text-sm text-[#438608] transition-transform duration-300 hover:-translate-y-0.5">
                          {name.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-600">No amenity details were provided.</p>
                  )}
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-slate-900">Risk alerts</h3>
                  {listing.riskAlerts?.length ? (
                    <div className="mt-4 space-y-3">
                      {listing.riskAlerts.map((risk, index) => (
                        <div key={`${risk.type}-${index}`} className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                              <ShieldAlert size={16} /> {risk.type?.replace(/_/g, " ")}
                            </div>
                            <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold uppercase text-amber-700">
                              {risk.severity}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-amber-700">{risk.description || "No additional details provided."}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-600">No known risk alerts for this property.</p>
                  )}
                </section>
              </div>

              <div className="space-y-8">
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900">Listed by</h3>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#438608]/10 text-[#438608] transition-transform duration-300 hover:scale-105">
                      <UserRound size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {owner?.firstName || owner?.name || "Property owner"} {owner?.lastName || ""}
                      </p>
                      <p className="text-sm text-slate-500">
                        {owner?.agentProfile?.agencyName || owner?.role || "Property manager"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    {owner?.phone ? <p>Phone: {owner.phone}</p> : null}
                    {owner?.email ? <p>Email: {owner.email}</p> : null}
                    {owner?.agentProfile?.bio ? <p>{owner.agentProfile.bio}</p> : null}
                  </div>

                  {canEngage ? (
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setShowInquiryModal(true)}
                        className="inline-flex items-center gap-2 rounded-full bg-[#438608] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#3b7808]"
                      >
                        <Mail size={16} /> Send an inquiry
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowViewingModal(true)}
                        className="inline-flex items-center gap-2 rounded-full border border-[#438608]/20 bg-[#438608]/10 px-4 py-2.5 text-sm font-semibold text-[#438608] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#438608]/15"
                      >
                        <CalendarClock size={16} /> Request a viewing
                      </button>
                    </div>
                  ) : null}
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900">Additional details</h3>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <p>• Price negotiable: {listing.priceNegotiable ? "Yes" : "No"}</p>
                    <p>• Payment terms: {listing.paymentTerms || "Not specified"}</p>
                    <p>• Furnished: {listing.amenities?.furnished || "Not specified"}</p>
                    <p>• Save count: {listing.saveCount || 0}</p>
                    <p>• Reviews: {listing.reviewSummary?.totalReviews || 0}</p>
                  </div>
                </section>

                {listing.priceHistory?.length ? (
                  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900">Price history</h3>
                    <div className="mt-4 space-y-3">
                      {listing.priceHistory.slice(0, 3).map((entry, index) => (
                        <div key={`${entry.changedAt}-${index}`} className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                          <div className="font-semibold text-slate-900">{formatCurrency(entry.price)}</div>
                          <div className="mt-1">Updated {formatDate(entry.changedAt)}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showInquiryModal ? (
        <InquiryModal listing={listing} onSend={sendInquiry} onClose={() => setShowInquiryModal(false)} />
      ) : null}

      {showViewingModal ? (
        <ViewingRequestModal listing={listing} onSend={requestViewing} onClose={() => setShowViewingModal(false)} />
      ) : null}

      {showRenoVisionModal ? (
        <RenovationVisionModal listing={listing} onClose={() => setShowRenoVisionModal(false)} />
      ) : null}
    </div>
  );
}
