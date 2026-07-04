import { Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

export default function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return <Navigate to="/login" />;
  }

  return children;
}