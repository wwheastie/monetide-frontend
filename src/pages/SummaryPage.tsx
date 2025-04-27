import { useState, useEffect } from "react";
import { Container } from "react-bootstrap";

interface Customer {
    "Account Name": string;
    "Monthly Recurring Revenue": number;
    "Segment": string;
    "Renewal Manager": string;
    "Renewal Team": string;
    "Managed Renewal Date": string;
    "Region": string;
    "Adoption Score": number;
    "MRR Score": number;
    "Bucket Name": string;
    "Initial Subscription": string;
}

const SummaryPage = ({ customerId }: { customerId: string }) => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/v1/customer/${customerId}/customers`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ customerId })
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch customers');
                }
                const data = await response.json();
                setCustomers(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (customerId) {
            fetchCustomers();
        }
    }, [customerId]);

    if (loading) {
        return (
            <Container className="mt-5 pt-5">
                <h2>Loading...</h2>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5 pt-5">
                <h2>Error</h2>
                <p>{error}</p>
            </Container>
        );
    }

    return (
        <Container className="mt-5 pt-5">
            <h2>Summary Dashboard</h2>
            <pre>{JSON.stringify(customers, null, 2)}</pre>
        </Container>
    );
};

export default SummaryPage; 