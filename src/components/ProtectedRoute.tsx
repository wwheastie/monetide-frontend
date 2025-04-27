import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    customerId: string | null;
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ customerId, children }) => {
    if (!customerId) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}; 