import { Navigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

export default function AdminRoute({ children }) {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  if (!isAdmin) return <Navigate to="/orders" replace />;
  return children;
}
