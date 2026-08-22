import { createContext, useCallback } from "react";
import axiosInstance from "../axiosInstance";

export const adminContext = createContext(null);

const AdminContextProvider = ({ children }) => {
  // ── Overview ─────────────────────────────────────────────────────────────

  const getOverview = useCallback(async () => {
    const response = await axiosInstance.get("/admin/overview");
    return response?.data?.data ?? null;
  }, []);

  // ── Agents ───────────────────────────────────────────────────────────────

  const getAgents = useCallback(async (params = {}) => {
    const response = await axiosInstance.get("/admin/agents", { params });
    return response?.data ?? null;
  }, []);

  const getAgentDetail = useCallback(async (agentId) => {
    const response = await axiosInstance.get(`/admin/agents/${agentId}`);
    return response?.data?.data ?? null;
  }, []);

  const approveAgent = useCallback(async (userId) => {
    const response = await axiosInstance.patch(`/users/${userId}/approve-agent`);
    return response?.data?.data?.user ?? null;
  }, []);

  const rejectAgent = useCallback(async (userId, reason) => {
    const response = await axiosInstance.patch(`/users/${userId}/reject-agent`, { reason });
    return response?.data?.data?.user ?? null;
  }, []);

  const verifyAgent = useCallback(async (userId) => {
    const response = await axiosInstance.patch(`/users/${userId}/verify-agent`);
    return response?.data?.data?.user ?? null;
  }, []);

  const declineAgentVerification = useCallback(async (userId, reason) => {
    const response = await axiosInstance.patch(`/users/${userId}/decline-verification`, { reason });
    return response?.data?.data?.user ?? null;
  }, []);

  const suspendUser = useCallback(async (userId, reason) => {
    const response = await axiosInstance.patch(`/users/${userId}/suspend`, { reason });
    return response?.data ?? null;
  }, []);

  const unsuspendUser = useCallback(async (userId) => {
    const response = await axiosInstance.patch(`/users/${userId}/unsuspend`);
    return response?.data ?? null;
  }, []);

  // ── Tenants / Buyers ─────────────────────────────────────────────────────

  const getTenants = useCallback(async (params = {}) => {
    const response = await axiosInstance.get("/admin/tenants", { params });
    return response?.data ?? null;
  }, []);

  const getTenantDetail = useCallback(async (tenantId) => {
    const response = await axiosInstance.get(`/admin/tenants/${tenantId}`);
    return response?.data?.data ?? null;
  }, []);

  // ── Transactions ─────────────────────────────────────────────────────────

  const getTransactions = useCallback(async (params = {}) => {
    const response = await axiosInstance.get("/admin/transactions", { params });
    return response?.data ?? null;
  }, []);

  // ── Listings ─────────────────────────────────────────────────────────────

  const getAllListingsAdmin = useCallback(async (params = {}) => {
    const response = await axiosInstance.get("/listings/admin/all", { params });
    return response?.data ?? null;
  }, []);

  const reviewListing = useCallback(async (listingId, decision, reason) => {
    const response = await axiosInstance.patch(`/listings/admin/${listingId}/review`, { decision, reason });
    return response?.data?.data?.listing ?? null;
  }, []);

  const verifyListingAdmin = useCallback(async (listingId, notes) => {
    const response = await axiosInstance.patch(`/listings/admin/${listingId}/verify`, { notes });
    return response?.data?.data?.listing ?? null;
  }, []);

  const featureListing = useCallback(async (listingId, days) => {
    const response = await axiosInstance.patch(`/listings/admin/${listingId}/feature`, { days });
    return response?.data?.data?.listing ?? null;
  }, []);

  // ── Risk Zones ───────────────────────────────────────────────────────────

  const getRiskZones = useCallback(async (params = {}) => {
    const response = await axiosInstance.get("/risk-zones", { params });
    return response?.data ?? null;
  }, []);

  const createRiskZone = useCallback(async (payload) => {
    const response = await axiosInstance.post("/risk-zones", payload);
    return response?.data?.data?.zone ?? null;
  }, []);

  const updateRiskZone = useCallback(async (zoneId, payload) => {
    const response = await axiosInstance.patch(`/risk-zones/${zoneId}`, payload);
    return response?.data?.data?.zone ?? null;
  }, []);

  const deactivateRiskZone = useCallback(async (zoneId) => {
    const response = await axiosInstance.delete(`/risk-zones/${zoneId}`);
    return response?.data ?? null;
  }, []);

  // ── Risk Alert Disputes ──────────────────────────────────────────────────

  const getRiskDisputes = useCallback(async (params = {}) => {
    const response = await axiosInstance.get("/admin/risk-disputes", { params });
    return response?.data ?? null;
  }, []);

  const getAllRiskAlerts = useCallback(async (params = {}) => {
    const response = await axiosInstance.get("/admin/risk-alerts", { params });
    return response?.data ?? null;
  }, []);

  const resolveDispute = useCallback(async (listingId, alertId, decision, adminNote) => {
    const response = await axiosInstance.patch(
      `/risk-zones/listing/${listingId}/alerts/${alertId}/resolve`,
      { decision, adminNote }
    );
    return response?.data?.data?.listing ?? null;
  }, []);

  const adminValue = {
    getOverview,
    getAgents,
    getAgentDetail,
    approveAgent,
    rejectAgent,
    verifyAgent,
    declineAgentVerification,
    suspendUser,
    unsuspendUser,
    getTenants,
    getTenantDetail,
    getTransactions,
    getAllListingsAdmin,
    reviewListing,
    verifyListingAdmin,
    featureListing,
    getRiskZones,
    createRiskZone,
    updateRiskZone,
    deactivateRiskZone,
    getRiskDisputes,
    getAllRiskAlerts,
    resolveDispute,
  };

  return <adminContext.Provider value={adminValue}>{children}</adminContext.Provider>;
};

export default AdminContextProvider;
