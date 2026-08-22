import { Link } from "react-router-dom";

const VerifyEmailInfoPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h1 className="text-2xl font-bold mb-4 text-center">Email Verification</h1>
            <p className="text-gray-700 mb-6 text-center">
                Please check your email for a verification link. Click the link to verify your email address and complete the registration process.
            </p>
            <div className="flex justify-center">
                <Link to="/login" className="bg-lime-500 text-white px-4 py-2 rounded hover:bg-lime-600 transition duration-300">
                    Go to Login
                </Link>
            </div>
        </div>
    </div>
  );
}

export default VerifyEmailInfoPage;