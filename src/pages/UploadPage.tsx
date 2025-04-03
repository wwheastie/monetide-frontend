import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Button, Form } from "react-bootstrap";

const UploadPage = ({ setData, customerId }: { setData: (data: any) => void; customerId: string }) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    // Handle file selection
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0]);
        }
    };

    // Handle drag & drop
    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            setFile(event.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    // Handle Upload
    const handleUpload = async () => {
        if (!file) return alert("Please select a file.");

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${BASE_URL}/api/v1/customer/${customerId}/cohorts`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) throw new Error("Upload failed");

            const data = await response.json();
            setData(data); // Cache data
            navigate("/data"); // Redirect to Data Page
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Error uploading file");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="upload-page">
            <div className="upload-content">
                <h2 className="upload-title">Upload File</h2>

                {/* Drag and Drop Area */}
                <div
                    className="drop-zone"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <p className="drop-text">
                        {file ? `Selected File: ${file.name}` : "Drag & Drop or Click to Upload"}
                    </p>
                </div>

                {/* Hidden File Input */}
                <Form.Control
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                />

                {/* Upload Button */}
                <Button onClick={handleUpload} disabled={loading || !file} className="mt-3">
                    {loading ? "Uploading..." : "Upload"}
                </Button>
            </div>
        </Container>
    );
};

export default UploadPage;
