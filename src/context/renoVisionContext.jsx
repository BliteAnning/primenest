import { createContext, useCallback } from "react";
import axiosInstance from "../axiosInstance";

export const renoVisionContext = createContext(null);

// Centralises every Renovation Vision API call so the feature can be reused
// (listing detail page today, a tenant history page later) without
// duplicating axios logic.

const RenoVisionContextProvider = ({ children }) => {
  const getStyles = useCallback(async () => {
    const response = await axiosInstance.get("/renovation-vision/styles");
    return response?.data?.data?.styles ?? [];
  }, []);

  const generateVision = useCallback(async (payload) => {
    const response = await axiosInstance.post("/renovation-vision/generate", payload);
    return response?.data?.data ?? {};
  }, []);

  const getJobStatus = useCallback(async (jobId) => {
    const response = await axiosInstance.get(`/renovation-vision/status/${jobId}`);
    return response?.data?.data ?? {};
  }, []);

  const renoVisionValue = { getStyles, generateVision, getJobStatus };

  return <renoVisionContext.Provider value={renoVisionValue}>{children}</renoVisionContext.Provider>;
};

export default RenoVisionContextProvider;
