import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import UploadPage from "./pages/UploadPage";
import DataPage from "./pages/DataPage";
import LoginPage from "./pages/LoginPage";
import RenewalsPage from "./pages/RenewalsPage";
import SummaryPage from "./pages/SummaryPage";
import "bootstrap/dist/css/bootstrap.min.css";
import { ProtectedRoute } from './components/ProtectedRoute';

const App = () => {
    const [data, setData] = useState<any>(() => {
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

    const updateData = (newData: any) => {
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
                                            <Route path="/data" element={<DataPage data={data} />} />
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
