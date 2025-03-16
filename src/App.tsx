import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import UploadPage from "./pages/UploadPage";
import DataPage from "./pages/DataPage";
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
    const [data, setData] = useState<any>(() => {
        const cachedData = localStorage.getItem("cachedData");
        return cachedData ? JSON.parse(cachedData) : null;
    });

    const updateData = (newData: any) => {
        localStorage.setItem("cachedData", JSON.stringify(newData));
        setData(newData);
    };

    return (
        <Router>
            <div className="d-flex">
                <Sidebar />
                <div className="p-4 flex-grow-1">
                    <Routes>
                        <Route path="/" element={<UploadPage setData={updateData} />} />
                        <Route path="/data" element={<DataPage data={data} />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;
