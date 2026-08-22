import { Route, Routes } from "react-router-dom"
import Home from "./page/landing"
import Register from "./page/register"
import Login from "./page/login"
import Onboarding from "./page/onboarding"
import Listings from "./page/listings"
import ListingDetail from "./page/listingDetail"
import ForgotPassword from "./page/forgotPassword"
import VerifyEmail from "./page/VerifyEmail"
import VerifyEmailInfoPage from "./page/verifyEmailInfoPage"
import {Toaster} from "react-hot-toast";
import Navbar from "./component/Navbar"
import TenantDashboard from "./page/tenantDashboard"
import AgentDashboard from "./page/agent/agentDashboard"
import AdminDashboard from "./page/admin/AdminDashboard"
import Footer from "./component/Footer"

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Navbar/>
    <Routes>
      
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/listings" element={<Listings />} />
      <Route path="/listings/:id" element={<ListingDetail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/verify-email-info" element={<VerifyEmailInfoPage />} />
      <Route path="/my-dashboard-t/" element={<TenantDashboard />} />
      <Route path="/my-dashboard-a" element={<AgentDashboard />} />
      <Route path="/my-dashboard-admin" element={<AdminDashboard />} />
    </Routes>
      <Footer />
    </>
  )
}

export default App
