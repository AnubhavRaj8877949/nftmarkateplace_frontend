import { ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isConnected, isConnecting } = useAccount();

    if (isConnecting) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!isConnected) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
