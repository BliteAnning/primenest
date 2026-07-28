import { createContext, useCallback } from "react";
import axiosInstance from "../axiosInstance";

export const engagementContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
// Centralises every inquiry/viewing API call so any component (tenant or agent
// side) can reach them without duplicating axios logic. Nothing is auto-fetched
// on mount here — each consuming page decides when to load its own data.

const EngagementContextProvider = ({ children }) => {
  // ── Inquiries ────────────────────────────────────────────────────────────

  const sendInquiry = useCallback(async (payload) => {
    const response = await axiosInstance.post("/inquiries", payload);
    return response?.data?.data?.inquiry ?? null;
  }, []);

  const fetchMyInquiries = useCallback(async (params = {}) => {
    const response = await axiosInstance.get("/inquiries/my", { params });
    return response?.data?.data?.inquiries ?? [];
  }, []);

  const fetchReceivedInquiries = useCallback(async (params = {}) => {
    const response = await axiosInstance.get("/inquiries/received", { params });
    return response?.data?.data?.inquiries ?? [];
  }, []);

  const respondToInquiry = useCallback(async (inquiryId, message) => {
    const response = await axiosInstance.patch(`/inquiries/${inquiryId}/respond`, { message });
    return response?.data?.data?.inquiry ?? null;
  }, []);

  const closeInquiry = useCallback(async (inquiryId) => {
    const response = await axiosInstance.patch(`/inquiries/${inquiryId}/close`);
    return response?.data?.data?.inquiry ?? null;
  }, []);

  // ── Viewings ─────────────────────────────────────────────────────────────

  const requestViewing = useCallback(async (payload) => {
    const response = await axiosInstance.post("/viewings", payload);
    return response?.data?.data?.viewing ?? null;
  }, []);

  const fetchMyViewings = useCallback(async (params = {}) => {
    const response = await axiosInstance.get("/viewings/my", { params });
    return response?.data?.data?.viewings ?? [];
  }, []);

  const fetchAgentViewings = useCallback(async (params = {}) => {
    const response = await axiosInstance.get("/viewings/agent", { params });
    return response?.data?.data?.viewings ?? [];
  }, []);

  const confirmViewing = useCallback(async (viewingId, payload = {}) => {
    const response = await axiosInstance.patch(`/viewings/${viewingId}/confirm`, payload);
    return response?.data?.data?.viewing ?? null;
  }, []);

  const declineViewing = useCallback(async (viewingId, reason) => {
    const response = await axiosInstance.patch(`/viewings/${viewingId}/decline`, { reason });
    return response?.data?.data?.viewing ?? null;
  }, []);

  const cancelViewing = useCallback(async (viewingId, reason) => {
    const response = await axiosInstance.patch(`/viewings/${viewingId}/cancel`, { reason });
    return response?.data?.data?.viewing ?? null;
  }, []);

  const completeViewing = useCallback(async (viewingId) => {
    const response = await axiosInstance.patch(`/viewings/${viewingId}/complete`);
    return response?.data?.data?.viewing ?? null;
  }, []);

  const engagementValue = {
    sendInquiry,
    fetchMyInquiries,
    fetchReceivedInquiries,
    respondToInquiry,
    closeInquiry,
    requestViewing,
    fetchMyViewings,
    fetchAgentViewings,
    confirmViewing,
    declineViewing,
    cancelViewing,
    completeViewing,
  };

  return <engagementContext.Provider value={engagementValue}>{children}</engagementContext.Provider>;
};

export default EngagementContextProvider;
