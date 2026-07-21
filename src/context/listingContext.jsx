import { createContext, useCallback, useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";

export const listingContext = createContext(null);

const ListingContextProvider = ({ children }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentListing, setCurrentListing] = useState(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [detailError, setDetailError] = useState("");

  const getListings = useCallback(async (params = {}) => {
    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.get("/listings", { params });
      const items = response?.data?.data?.listings ?? [];
      setListings(items);
      return items;
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError("We could not load properties right now. Please try again.");
      setListings([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getListingDetails = useCallback(async (id) => {
    setDetailLoading(true);
    setDetailError("");

    try {
      const response = await axiosInstance.get(`/listings/${id}`);
      const item = response?.data?.data?.listing || null;
      setCurrentListing(item);
      return item;
    } catch (err) {
      console.error("Error fetching listing details:", err);
      setDetailError("We could not load this listing right now.");
      setCurrentListing(null);
      return null;
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const fetchSavedListings = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/users/me/saved-listings");
      return response?.data?.data?.listings ?? [];
    } catch (err) {
      console.error("Error fetching saved listings:", err);
      return [];
    }
  }, []);

  const toggleSavedListing = useCallback(async (listingId) => {
    try {
      const response = await axiosInstance.post(`/users/me/saved-listings/${listingId}`);
      return response?.data?.data ?? null;
    } catch (err) {
      console.error("Error updating saved listings:", err);
      throw err;
    }
  }, []);

  useEffect(() => {
    getListings();
  }, [getListings]);

  const listingValue = {
    listings,
    loading,
    error,
    currentListing,
    detailLoading,
    detailError,
    getListings,
    getListingDetails,
    fetchSavedListings,
    toggleSavedListing,
  };

  return <listingContext.Provider value={listingValue}>{children}</listingContext.Provider>;
};

export default ListingContextProvider;