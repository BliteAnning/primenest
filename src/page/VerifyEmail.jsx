import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, LoaderCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../axiosInstance';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email address...');
  const requestedTokenRef = useRef(null);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Verification link is missing.');
        return;
      }

      // Avoid firing the request twice for the same token (e.g. StrictMode re-run in dev).
      if (requestedTokenRef.current === token) return;
      requestedTokenRef.current = token;

      try {
        const response = await axiosInstance.get(`/users/verify-email/${token}`);

        if (response.data?.status === 'success') {
          //const accessToken = response.data?.accessToken;
          //const user = response.data?.data?.user;

          //setAuthSession(accessToken, user);

          setStatus('success');
          setMessage('Your email has been verified successfully.');
          toast.success('Email verified successfully.');

          setTimeout(() => {
            navigate('/login');
          }, 1600);
        } else {
          throw new Error(response.data?.message || 'Verification failed');
        }
      } catch (error) {
        console.log(error);
        setStatus('error');
        setMessage(error?.response?.data?.message || 'We could not verify your email. The link may be expired or invalid.');
        toast.error('Verification failed. Please request a new link.');
      }
    };

    verify();
  }, [navigate, token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#f7fff9_0%,#ffffff_45%,#f0fdf4_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-2xl">
        {status === 'verifying' && (
          <>
            <LoaderCircle className="mx-auto mb-4 h-12 w-12 animate-spin text-emerald-600" />
            <h2 className="text-2xl font-bold text-slate-900">Checking your verification link</h2>
            <p className="mt-3 text-slate-600">Please wait while we confirm your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-600" />
            <h2 className="text-2xl font-bold text-slate-900">Email verified</h2>
            <p className="mt-3 text-slate-600">{message}</p>
            <p className="mt-2 text-sm text-slate-500">You’ll be redirected to onboarding shortly.</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="mx-auto mb-4 h-12 w-12 text-rose-500" />
            <h2 className="text-2xl font-bold text-slate-900">Verification issue</h2>
            <p className="mt-3 text-slate-600">{message}</p>
            <Link to="/register" className="mt-6 inline-flex text-sm font-semibold text-emerald-600 hover:underline">
              Go back to registration
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
