import { useState, useEffect, useMemo } from "react";
import { Container, Form, Dropdown, ButtonGroup, Table, Pagination } from "react-bootstrap";
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

    // --- FILTER STATE ---
    const [selectedBuckets, setSelectedBuckets] = useState<string[]>(BUCKET_ORDER);
    const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
    const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
    const [selectedRenewalManagers, setSelectedRenewalManagers] = useState<string[]>([]);
    const [selectedRenewalTeams, setSelectedRenewalTeams] = useState<string[]>([]);
    const [selectedRenewalDates, setSelectedRenewalDates] = useState<string[]>([]);

    // --- UNIQUE VALUES FOR FILTERS ---
    const uniqueBuckets = useMemo(() => Array.from(new Set(customers.map(c => c["Bucket Name"]))).filter(Boolean), [customers]);
    const uniqueRegions = useMemo(() => Array.from(new Set(customers.map(c => c["Region"]))).filter(Boolean), [customers]);
    const uniqueSegments = useMemo(() => Array.from(new Set(customers.map(c => c["Segment"]))).filter(Boolean), [customers]);
    const uniqueRenewalManagers = useMemo(() => Array.from(new Set(customers.map(c => c["Renewal Manager"]))).filter(Boolean), [customers]);
    const uniqueRenewalTeams = useMemo(() => Array.from(new Set(customers.map(c => c["Renewal Team"]))).filter(Boolean), [customers]);
    const uniqueRenewalDates = useMemo(() => {
        const format = (dateStr: string) => {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return '';
            return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        };
        // Map to { label, date } for sorting
        const dateObjs = customers
            .map(c => c["Managed Renewal Date"])
            .filter(Boolean)
            .map(dateStr => {
                const d = new Date(dateStr);
                return {
                    label: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
                    date: d
                };
            })
            .filter(obj => !isNaN(obj.date.getTime()));
        // Remove duplicates by label
        const seen = new Set();
        const unique = dateObjs.filter(obj => {
            if (seen.has(obj.label)) return false;
            seen.add(obj.label);
            return true;
        });
        // Sort by date
        unique.sort((a, b) => a.date.getTime() - b.date.getTime());
        return unique.map(obj => obj.label);
    }, [customers]);

    // --- FILTERED CUSTOMERS ---
    const filteredCustomers = useMemo(() =>
        customers.filter(c =>
            (selectedBuckets.length === 0 || selectedBuckets.includes(c["Bucket Name"])) &&
            (selectedRegions.length === 0 || selectedRegions.includes(c["Region"])) &&
            (selectedSegments.length === 0 || selectedSegments.includes(c["Segment"])) &&
            (selectedRenewalManagers.length === 0 || selectedRenewalManagers.includes(c["Renewal Manager"])) &&
            (selectedRenewalTeams.length === 0 || selectedRenewalTeams.includes(c["Renewal Team"])) &&
            (selectedRenewalDates.length === 0 || selectedRenewalDates.includes((() => {
                const d = new Date(c["Managed Renewal Date"]);
                if (isNaN(d.getTime())) return '';
                return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
            })()))
        ),
        [customers, selectedBuckets, selectedRegions, selectedSegments, selectedRenewalManagers, selectedRenewalTeams, selectedRenewalDates]
    );

    // --- PAGINATION STATE ---
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const totalRows = filteredCustomers.length;
    const totalPages = Math.ceil(totalRows / pageSize);
    const paginatedCustomers = filteredCustomers.slice((page - 1) * pageSize, page * pageSize);

    // Reset to first page if filters change and current page is out of range
    useEffect(() => {
        if (page > totalPages) setPage(1);
    }, [filteredCustomers, totalPages]);

    // --- FILTER UI ---
    const renderDropdownCheckboxGroup = (label: string, options: string[], selected: string[], setSelected: (v: string[]) => void) => (
        <Dropdown as={ButtonGroup} className="me-2 mb-2" autoClose="outside">
            <Dropdown.Toggle variant="secondary" style={{ minWidth: 180, textAlign: 'left', background: '#222', border: '1px solid #333' }}>
                <b>{label}</b>
            </Dropdown.Toggle>
            <Dropdown.Menu style={{ maxHeight: 220, overflowY: 'auto', background: '#111', color: '#fff', minWidth: 220 }}>
                {options.map(opt => (
                    <Form.Check
                        key={opt}
                        type="checkbox"
                        id={`${label}-${opt}`}
                        label={opt}
                        checked={selected.includes(opt)}
                        onChange={e => {
                            if (e.target.checked) setSelected([...selected, opt]);
                            else setSelected(selected.filter(v => v !== opt));
                        }}
                        style={{ color: '#fff', marginLeft: 8, marginBottom: 4 }}
                    />
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );

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
        data: filteredCustomers
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

    // --- TABLE FIELDS ---
    const customerFields = [
        "Account Name",
        "Monthly Recurring Revenue",
        "Segment",
        "Renewal Manager",
        "Renewal Team",
        "Managed Renewal Date",
        "Region",
        "Adoption Score",
        "MRR Score",
        "Bucket Name",
        "Initial Subscription"
    ];

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
        <>
            <div style={{
                display: 'flex',
                flexWrap: 'nowrap',
                gap: 8,
                marginLeft: '200px',
                marginTop: '90px',
                marginBottom: 32,
                width: 'calc(100vw - 200px)',
                maxWidth: '1800px',
                minWidth: '1400px',
            }}>
                {renderDropdownCheckboxGroup('Buckets', uniqueBuckets, selectedBuckets, setSelectedBuckets)}
                {renderDropdownCheckboxGroup('Region', uniqueRegions, selectedRegions, setSelectedRegions)}
                {renderDropdownCheckboxGroup('Segment', uniqueSegments, selectedSegments, setSelectedSegments)}
                {renderDropdownCheckboxGroup('Managed Renewal Dates', uniqueRenewalDates, selectedRenewalDates, setSelectedRenewalDates)}
                {renderDropdownCheckboxGroup('Renewal Manager', uniqueRenewalManagers, selectedRenewalManagers, setSelectedRenewalManagers)}
                {renderDropdownCheckboxGroup('Renewal Team', uniqueRenewalTeams, selectedRenewalTeams, setSelectedRenewalTeams)}
            </div>
            <div
                style={{
                    width: 'calc(100vw - 200px)',
                    maxWidth: '1200px',
                    marginLeft: '200px',
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
            {/* Customer Table outside chart area */}
            <div style={{ marginTop: 40, marginLeft: '200px', width: 'calc(100vw - 200px)', maxWidth: '1200px', overflowX: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 500 }}>Showing {Math.min((page - 1) * pageSize + 1, totalRows)} - {Math.min(page * pageSize, totalRows)} of {totalRows} customers</span>
                    <div>
                        <label style={{ marginRight: 8 }}>Rows per page:</label>
                        <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
                            {[10, 20, 50, 100].map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <Table striped bordered hover size="sm" responsive style={{ background: '#fff', minWidth: 900 }}>
                    <thead>
                        <tr>
                            {customerFields.map(field => (
                                <th key={field}>{field}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedCustomers.map((customer, idx) => (
                            <tr key={idx}>
                                {customerFields.map(field => (
                                    <td key={field}>{(customer as any)[field]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </Table>
                {/* Pagination Controls */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                    <Pagination>
                        <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
                        <Pagination.Prev onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} />
                        {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2)).map(pn => (
                            <Pagination.Item key={pn} active={pn === page} onClick={() => setPage(pn)}>{pn}</Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} />
                        <Pagination.Last onClick={() => setPage(totalPages)} disabled={page === totalPages} />
                    </Pagination>
                </div>
            </div>
        </>
    );
};

export default SummaryPage; 