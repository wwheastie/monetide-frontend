import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Alert } from "react-bootstrap";
import {API_BASE_URL} from "../config.ts";

const LoginPage = ({ setCustomerId }: { setCustomerId: (id: string) => void }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {           
            const response = await fetch(`${API_BASE_URL}/api/v1/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) throw new Error("Invalid credentials");

            // const data = await response.json();
            // const token = data.token;
            const customerId = "22d24fe6-494b-4d38-b08e-0ad81dc70fec";

            if (!customerId) throw new Error("Customer ID missing in response");

            // Store token and customerId
            // localStorage.setItem("token", token);
            localStorage.setItem("customerId", customerId);
            setCustomerId(customerId);

            // // Redirect to Upload Page
            navigate("/", { replace: true });
        } catch {
            setError("Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Logo Above the Login Box */}
                <img src="/monetide-full.png" alt="Company Logo" className="login-logo" />

                <div className="login-content">
                    <h2 className="login-title">Login</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleLogin}>
                        <Form.Group controlId="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="password" className="mt-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>

                        {/* Styled Button with Aqua Color */}
                        <Button type="submit" className="mt-3 login-button" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </Button>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
