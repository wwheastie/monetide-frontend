import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import UploadPage from "./pages/UploadPage";
import DataPage from "./pages/DataPage";
import LoginPage from "./pages/LoginPage";
import RenewalsPage from "./pages/RenewalsPage";
import SummaryPage from "./pages/SummaryPage";
import Forecast from "./pages/Forecast";
import Generate from "./pages/Generate";
import "bootstrap/dist/css/bootstrap.min.css";
import { ProtectedRoute } from './components/ProtectedRoute';

// Define a type for the cached data
interface Customer {
    monthlyRecurringRevenue: number;
    previousMonthlyRecurringRevenue: number;
    initialSubscriptionDate: string;
    logins: number;
    accountName: string;
    engagementCostRatio: number;
}
interface Cohort {
    name: string;
    description?: string;
    shortDescription?: string;
    customers: Customer[];
    uniqueCustomerCount: number;
}
interface CohortData {
    cohorts: Cohort[];
}

const App = () => {
    const [data, setData] = useState<CohortData | null>(() => {
        const cachedData = localStorage.getItem("cachedData");
        return cachedData ? JSON.parse(cachedData) : null;
    });

    const [customerId, setCustomerId] = useState<string | null>(() => localStorage.getItem("customerId"));

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedCustomerId = localStorage.getItem("customerId");

        if (token && storedCustomerId) {
            setCustomerId(storedCustomerId);
        } else {
            setCustomerId(null);
        }
    }, []);

    const updateData = (newData: CohortData) => {
        localStorage.setItem("cachedData", JSON.stringify(newData));
        setData(newData);
    };

    return (
        <Router>
            <Routes>
                {/* Login Page - No Sidebar/Header */}
                <Route path="/login" element={<LoginPage setCustomerId={setCustomerId} />} />

                {/* Protected Routes */}
                <Route
                    path="/*"
                    element={
                        customerId ? (
                            <>
                                <Header />
                                <div className="d-flex">
                                    <Sidebar
                                        onLogout={() => {
                                            localStorage.clear();
                                            setCustomerId(null);
                                            setData(null);
                                        }}
                                    />
                                    <div className="main-content">
                                        <Routes>
                                            <Route path="/" element={<UploadPage setData={updateData} customerId={customerId} />} />
                                            <Route
                                                path="/summary"
                                                element={
                                                    <ProtectedRoute customerId={customerId}>
                                                        <SummaryPage customerId={customerId} />
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path="/forecast"
                                                element={
                                                    <ProtectedRoute customerId={customerId}>
                                                        <Forecast customerId={customerId} />
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path="/generate"
                                                element={
                                                    <ProtectedRoute customerId={customerId}>
                                                        <Generate />
                                                    </ProtectedRoute>
                                                }
                                            />
                                            {data && <Route path="/data" element={<DataPage data={data} />} />}
                                            <Route path="/renewals" element={<RenewalsPage customerId={customerId} />} />
                                            <Route path="*" element={<Navigate to="/" replace />} />
                                        </Routes>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />
            </Routes>
        </Router>
    );
};

export default App;
