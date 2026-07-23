import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { ImagePlus, LoaderCircle, Save, Upload, X } from "lucide-react";
import axiosInstance from "../../axiosInstance";

const propertyTypeOptions = [
  "apartment", "house", "townhouse", "studio", "duplex", "mansion", "commercial", "office", "land", "short_stay",
];

const listingTypeOptions = ["rent", "sale", "short_stay"];
const paymentTermsOptions = ["monthly", "annual", "two_years_advance", "negotiable"];
const propertyConditionOptions = ["brand_new", "newly_renovated", "good", "fair", "needs_renovation"];
const titleDeedTypeOptions = ["freehold", "leasehold", "stool_land", "family_land", "government_land"];
const furnishedOptions = ["unfurnished", "semi_furnished", "fully_furnished"];

const amenityOptions = [
  { value: "securityGuard", label: "Security guard" },
  { value: "securityDogs", label: "Security dogs" },
  { value: "cctv", label: "CCTV" },
  { value: "gatedCommunity", label: "Gated community" },
  { value: "electricFence", label: "Electric fence" },
  { value: "generator", label: "Generator" },
  { value: "solarPower", label: "Solar power" },
  { value: "borehole", label: "Borehole" },
  { value: "pipedWater", label: "Piped water" },
  { value: "waterTank", label: "Water tank" },
  { value: "internet", label: "Internet" },
  { value: "cableTv", label: "Cable TV" },
  { value: "carPark", label: "Car park" },
  { value: "swimmingPool", label: "Swimming pool" },
  { value: "gym", label: "Gym" },
  { value: "garden", label: "Garden" },
  { value: "playground", label: "Playground" },
  { value: "airConditioning", label: "Air conditioning" },
  { value: "petFriendly", label: "Pet friendly" },
];

const emptyForm = {
  title: "",
  description: "",
  propertyType: "apartment",
  listingType: "rent",
  price: "",
  currency: "GHS",
  paymentTerms: "annual",
  priceNegotiable: false,
  region: "",
  city: "",
  neighborhood: "",
  streetAddress: "",
  nearbyLandmarks: "",
  sizeSqm: "",
  bedrooms: "",
  bathrooms: "",
  toilets: "",
  floors: "",
  yearBuilt: "",
  propertyCondition: "good",
  titleDeedAvailable: false,
  titleDeedType: "",
  furnished: "unfurnished",
  parkingSpaces: "",
  amenities: {},
};

export default function AgentListingForm({ user, editingListingId, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(Boolean(editingListingId));
  const [saving, setSaving] = useState(false);
  const [media, setMedia] = useState([]);
  const [listingId, setListingId] = useState(editingListingId || null);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);

  const isApproved = Boolean(user.isActive);

  useEffect(() => {
    setListingId(editingListingId || null);

    if (!editingListingId) {
      setForm(emptyForm);
      setMedia([]);
      setLoading(false);
      return;
    }

    const loadListing = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/listings/${editingListingId}`);
        const listing = response?.data?.data?.listing;
        if (!listing) throw new Error("Listing not found");

        setForm({
          title: listing.title || "",
          description: listing.description || "",
          propertyType: listing.propertyType || "apartment",
          listingType: listing.listingType || "rent",
          price: listing.price ?? "",
          currency: listing.currency || "GHS",
          paymentTerms: listing.paymentTerms || "annual",
          priceNegotiable: Boolean(listing.priceNegotiable),
          region: listing.location?.region || "",
          city: listing.location?.city || "",
          neighborhood: listing.location?.neighborhood || "",
          streetAddress: listing.location?.streetAddress || "",
          nearbyLandmarks: listing.location?.nearbyLandmarks?.join(", ") || "",
          sizeSqm: listing.sizeSqm ?? "",
          bedrooms: listing.bedrooms ?? "",
          bathrooms: listing.bathrooms ?? "",
          toilets: listing.toilets ?? "",
          floors: listing.floors ?? "",
          yearBuilt: listing.yearBuilt ?? "",
          propertyCondition: listing.propertyCondition || "good",
          titleDeedAvailable: Boolean(listing.titleDeedAvailable),
          titleDeedType: listing.titleDeedType || "",
          furnished: listing.amenities?.furnished || "unfurnished",
          parkingSpaces: listing.amenities?.parkingSpaces ?? "",
          amenities: listing.amenities || {},
        });
        setMedia(listing.media || []);
      } catch (err) {
        console.error(err);
        toast.error("We could not load this listing for editing.");
      } finally {
        setLoading(false);
      }
    };

    loadListing();
  }, [editingListingId]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const handleAmenityToggle = (key) => {
    setForm((current) => ({
      ...current,
      amenities: { ...current.amenities, [key]: !current.amenities?.[key] },
    }));
  };

  const buildPayload = () => ({
    title: form.title,
    description: form.description,
    propertyType: form.propertyType,
    listingType: form.listingType,
    price: Number(form.price),
    currency: form.currency,
    paymentTerms: form.paymentTerms,
    priceNegotiable: form.priceNegotiable,
    location: {
      region: form.region,
      city: form.city,
      neighborhood: form.neighborhood,
      streetAddress: form.streetAddress,
      nearbyLandmarks: form.nearbyLandmarks.split(",").map((item) => item.trim()).filter(Boolean),
    },
    sizeSqm: form.sizeSqm ? Number(form.sizeSqm) : undefined,
    bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
    bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
    toilets: form.toilets ? Number(form.toilets) : undefined,
    floors: form.floors ? Number(form.floors) : undefined,
    yearBuilt: form.yearBuilt ? Number(form.yearBuilt) : undefined,
    propertyCondition: form.propertyCondition || undefined,
    titleDeedAvailable: form.titleDeedAvailable,
    titleDeedType: form.titleDeedType || undefined,
    amenities: {
      ...form.amenities,
      furnished: form.furnished,
      parkingSpaces: form.parkingSpaces ? Number(form.parkingSpaces) : 0,
    },
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = buildPayload();

      if (listingId) {
        await axiosInstance.patch(`/listings/${listingId}`, payload);
        toast.success("Listing updated successfully.");
        return;
      }

      const response = await axiosInstance.post("/listings", payload);
      const newListing = response?.data?.data?.listing;
      toast.success(response?.data?.message || "Listing created successfully.");
      if (newListing?._id) {
        setListingId(newListing._id);
        setMedia(newListing.media || []);
        return; // stay on the form so the agent can upload media right away
      }

      onSaved();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "We could not save this listing.");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadMedia = async () => {
    if (!listingId || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const response = await axiosInstance.post(`/listings/${listingId}/media`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMedia(response?.data?.data?.media || []);
      setFiles([]);
      toast.success("Media uploaded successfully.");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "We could not upload this media.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    if (!listingId) return;
    try {
      const response = await axiosInstance.delete(`/listings/${listingId}/media/${mediaId}`);
      setMedia(response?.data?.data?.media || []);
      toast.success("Media removed.");
    } catch (err) {
      console.error(err);
      toast.error("We could not remove this media file.");
    }
  };

  if (!isApproved) {
    return (
      <div className="rounded-4xl border border-dashed border-amber-300 bg-amber-50 p-10 text-center text-amber-800 shadow-sm">
        <p className="text-lg font-semibold">Your account is pending admin approval</p>
        <p className="mt-2 text-sm">You will be able to create listings as soon as an admin approves your agent account.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-4xl border border-slate-200 bg-white py-20 shadow-sm">
        <LoaderCircle className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-900">{listingId ? "Edit listing" : "Add a new listing"}</h2>
          {listingId ? (
            <button type="button" onClick={onSaved} className="text-sm font-semibold text-emerald-700 hover:underline">
              Done — back to my listings
            </button>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-600 md:col-span-2">
              <span className="mb-2 block font-medium text-slate-700">Title</span>
              <input name="title" value={form.title} onChange={handleChange} required className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
            </label>

            <label className="text-sm text-slate-600 md:col-span-2">
              <span className="mb-2 block font-medium text-slate-700">Description</span>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={4} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
            </label>

            <label className="text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Property type</span>
              <select name="propertyType" value={form.propertyType} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500">
                {propertyTypeOptions.map((option) => <option key={option} value={option}>{option.replace(/_/g, " ")}</option>)}
              </select>
            </label>

            <label className="text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Listing type</span>
              <select name="listingType" value={form.listingType} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500">
                {listingTypeOptions.map((option) => <option key={option} value={option}>{option.replace(/_/g, " ")}</option>)}
              </select>
            </label>

            <label className="text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Price (GHS)</span>
              <input type="number" min="0" name="price" value={form.price} onChange={handleChange} required className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
            </label>

            <label className="text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Payment terms</span>
              <select name="paymentTerms" value={form.paymentTerms} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500">
                {paymentTermsOptions.map((option) => <option key={option} value={option}>{option.replace(/_/g, " ")}</option>)}
              </select>
            </label>

            <label className="flex items-center gap-3 text-sm text-slate-600">
              <input type="checkbox" name="priceNegotiable" checked={form.priceNegotiable} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
              Price is negotiable
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Region</span>
              <input name="region" value={form.region} onChange={handleChange} required className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
            </label>
            <label className="text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">City</span>
              <input name="city" value={form.city} onChange={handleChange} required className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
            </label>
            <label className="text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Neighborhood</span>
              <input name="neighborhood" value={form.neighborhood} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
            </label>
            <label className="text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Street address</span>
              <input name="streetAddress" value={form.streetAddress} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
            </label>
            <label className="text-sm text-slate-600 md:col-span-2 xl:col-span-4">
              <span className="mb-2 block font-medium text-slate-700">Nearby landmarks</span>
              <input name="nearbyLandmarks" value={form.nearbyLandmarks} onChange={handleChange} placeholder="East Legon Mall, A&C Square" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-6">
            <label className="text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Size (sqm)</span>
              <input type="number" min="0" name="sizeSqm" value={form.sizeSqm} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
            </label>
            <label className="text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Bedrooms</span>
              <input type="number" min="0" name="bedrooms" value={form.bedrooms} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
            </label>
            <label className="text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Bathrooms</span>
              <input type="number" min="0" name="bathrooms" value={form.bathrooms} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
            </label>
            <label className="text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Toilets</span>
              <input type="number" min="0" name="toilets" value={form.toilets} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
            </label>
            <label className="text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Floors</span>
              <input type="number" min="0" name="floors" value={form.floors} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
            </label>
            <label className="text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Year built</span>
              <input type="number" min="1900" name="yearBuilt" value={form.yearBuilt} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Property condition</span>
              <select name="propertyCondition" value={form.propertyCondition} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500">
                {propertyConditionOptions.map((option) => <option key={option} value={option}>{option.replace(/_/g, " ")}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-600">
              <input type="checkbox" name="titleDeedAvailable" checked={form.titleDeedAvailable} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
              Title deed available
            </label>
            <label className="text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Title deed type</span>
              <select name="titleDeedType" value={form.titleDeedType} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500">
                <option value="">Not specified</option>
                {titleDeedTypeOptions.map((option) => <option key={option} value={option}>{option.replace(/_/g, " ")}</option>)}
              </select>
            </label>
            <label className="text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Furnishing</span>
              <select name="furnished" value={form.furnished} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500">
                {furnishedOptions.map((option) => <option key={option} value={option}>{option.replace(/_/g, " ")}</option>)}
              </select>
            </label>
            <label className="text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Parking spaces</span>
              <input type="number" min="0" name="parkingSpaces" value={form.parkingSpaces} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
            </label>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-slate-700">Amenities</p>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {amenityOptions.map((option) => (
                <label key={option.value} className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={Boolean(form.amenities?.[option.value])}
                    onChange={() => handleAmenityToggle(option.value)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {saving ? <LoaderCircle className="animate-spin" size={18} /> : <Save size={18} />}
            {listingId ? "Save changes" : "Create listing"}
          </button>
        </form>
      </div>

      {listingId ? (
        <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h3 className="text-lg font-semibold text-slate-900">Listing media</h3>
          <p className="mt-1 text-sm text-slate-500">Upload photos (and optional videos) to showcase this property. At least one photo is required before it can go live.</p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(event) => setFiles(Array.from(event.target.files || []))}
              className="w-full rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-600"
            />
            <button
              type="button"
              onClick={handleUploadMedia}
              disabled={uploading || files.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? <LoaderCircle className="animate-spin" size={16} /> : <Upload size={16} />}
              Upload
            </button>
          </div>

          {media.length ? (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {media.map((item) => (
                <div key={item._id} className="group relative overflow-hidden rounded-2xl border border-slate-200">
                  {item.type === "video" ? (
                    <video src={item.url} className="h-28 w-full object-cover" />
                  ) : (
                    <img src={item.url} alt={item.caption || "Listing media"} className="h-28 w-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteMedia(item._id)}
                    className="absolute right-2 top-2 rounded-full bg-slate-900/70 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 py-10 text-slate-400">
              <ImagePlus size={28} />
              <p className="text-sm">No media uploaded yet.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-4xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
          Save this listing first to unlock media uploads.
        </div>
      )}
    </div>
  );
}
