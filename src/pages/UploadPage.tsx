import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Button, Form } from "react-bootstrap";

const UploadPage = ({ setData }: { setData: (data: any) => void }) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return alert("Please select a file.");

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://localhost:8080/api/v1/customer/123456/cohorts", {
                method: "POST",
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
        <Container className="mt-4">
            <h2>Upload File</h2>
            <Form>
                <Form.Group>
                    <Form.Control type="file" onChange={handleFileChange} />
                </Form.Group>
                <Button onClick={handleUpload} disabled={loading} className="mt-3">
                    {loading ? "Uploading..." : "Upload"}
                </Button>
            </Form>
        </Container>
    );
};

export default UploadPage;
