import { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { Scatter } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
    Title
} from 'chart.js';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend, Title);

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

const BUCKET_ORDER = [
    "Engaged High-Value",
    "Engaged Mid-Value",
    "Engaged Low-Value",
    "Moderate High-Value",
    "Moderate Mid-Value",
    "Moderate Low-Value",
    "Disengaged High-Value",
    "Disengaged Mid-Value",
    "Disengaged Low-Value"
];

const BUCKET_COLORS: Record<string, string> = {
    "Engaged High-Value": "#d73027",      // Red
    "Engaged Mid-Value": "#fc8d59",       // Orange-Red
    "Engaged Low-Value": "#fee08b",       // Yellow
    "Moderate High-Value": "#fdae61",     // Orange
    "Moderate Mid-Value": "#ffffbf",      // Light Yellow
    "Moderate Low-Value": "#d9ef8b",      // Yellow-Green
    "Disengaged High-Value": "#91cf60",   // Light Green
    "Disengaged Mid-Value": "#1a9850",    // Green
    "Disengaged Low-Value": "#006837"     // Dark Green
};

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

    // Calculate the offset for the dot radius in data units
    const dotRadiusPx = 7;
    const chartWidthPx = 1200; // matches maxWidth
    const xOffset = dotRadiusPx / chartWidthPx; // data units
    const yOffset = dotRadiusPx / 500; // 500px is the chart height

    // Prepare datasets for each bucket in the specified order
    const datasets = BUCKET_ORDER.map(bucket => ({
        label: bucket,
        data: customers
            .filter(c => c["Bucket Name"] === bucket)
            .map(c => {
                let x = c["Adoption Score"] === 0 ? xOffset : c["Adoption Score"];
                let y = c["MRR Score"];
                if (y === 0) y = yOffset;
                if (y === 1) y = 1 - yOffset;
                return { x, y, rawX: c["Adoption Score"], rawY: c["MRR Score"] };
            }),
        backgroundColor: BUCKET_COLORS[bucket],
        pointRadius: 7,
        pointHoverRadius: 10,
        showLine: false
    }));

    const chartData = { datasets };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
                labels: {
                    color: '#fff',
                    font: { size: 16 }
                }
            },
            title: {
                display: true,
                text: 'Customer Risk Profile - Price Uplift',
                color: '#fff',
                font: { size: 22 }
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        const dataset = context.dataset.data;
                        const point = dataset[context.dataIndex];
                        const customer = customers.find(c =>
                            c["Adoption Score"] === point.rawX &&
                            c["MRR Score"] === point.rawY &&
                            c["Bucket Name"] === context.dataset.label
                        );
                        if (!customer) return '';
                        return [
                            `Account: ${customer["Account Name"]}`,
                            `Adoption Score: ${customer["Adoption Score"]}`,
                            `MRR Score: ${customer["MRR Score"]}`,
                            `Bucket: ${customer["Bucket Name"]}`
                        ];
                    }
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Normalized Product Adoption',
                    color: '#fff',
                    font: { size: 18 }
                },
                min: 0,
                max: 1,
                ticks: { color: '#fff', font: { size: 14 } },
                grid: { color: 'rgba(255,255,255,0.1)' }
            },
            y: {
                title: {
                    display: true,
                    text: 'Normalized MRR Score',
                    color: '#fff',
                    font: { size: 18 }
                },
                min: 0,
                max: 1,
                ticks: { color: '#fff', font: { size: 14 } },
                grid: { color: 'rgba(255,255,255,0.1)' }
            }
        },
        layout: {
            padding: 20
        },
        backgroundColor: '#000',
    };

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
        <div
            style={{
                width: 'calc(100vw - 200px)',
                maxWidth: '1200px',
                marginLeft: '200px',
                marginTop: '90px',
                background: '#000',
                padding: '32px 24px',
                minHeight: '500px',
                boxSizing: 'border-box',
                borderRadius: 12,
                boxShadow: '0 0 24px #0008',
            }}
        >
            <div style={{ height: '500px', width: '100%' }}>
                <Scatter
                    data={chartData}
                    options={{
                        ...chartOptions,
                        maintainAspectRatio: false,
                        responsive: true,
                        scales: {
                            ...chartOptions.scales,
                            x: {
                                ...chartOptions.scales.x,
                                min: 0,
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default SummaryPage; 