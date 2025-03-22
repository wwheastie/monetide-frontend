import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import UploadPage from "./pages/UploadPage";
import DataPage from "./pages/DataPage";
import LoginPage from "./pages/LoginPage";
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
    const [data, setData] = useState<any>(() => {
        const cachedData = localStorage.getItem("cachedData");
        return cachedData ? JSON.parse(cachedData) : null;
    });

    const [customerId, setCustomerId] = useState<string | null>(localStorage.getItem("customerId"));

    useEffect(() => {
        // Check if user is authenticated
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
            {/* Protected Layout - Show Sidebar & Header if logged in */}
            {customerId && (
                <>
                    <Header />
                    <div className="d-flex">
                        <Sidebar setCustomerId={setCustomerId}/>
                        <div className="p-4 flex-grow-1">
                            <Routes>
                                <Route path="/" element={<UploadPage setData={updateData} customerId={customerId} />} />
                                <Route path="/data" element={<DataPage data={data} />} />
                                <Route path="*" element={<Navigate to="/" replace />} /> {/* Catch-all redirect */}
                            </Routes>
                        </div>
                    </div>
                </>
            )}

            {/* Routes */}
            <Routes>
                <Route path="/login" element={<LoginPage setCustomerId={setCustomerId} />} />
                {!customerId && <Route path="*" element={<Navigate to="/login" replace />} />}
            </Routes>
        </Router>
    );
};

export default App;
