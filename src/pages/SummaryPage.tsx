import { useState, useEffect, useMemo } from "react";
import { Container, Form, Dropdown, ButtonGroup, Table, Pagination, Button } from "react-bootstrap";
import { Scatter } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
    Title
} from 'chart.js';
import { API_BASE_URL } from '../config';

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
    [key: string]: string | number; // Add index signature for table rendering
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
    "Engaged High-Value": "#006837",      // Dark Green
    "Engaged Mid-Value": "#1a9850",       // Green
    "Engaged Low-Value": "#91cf60",       // Light Green
    "Moderate High-Value": "#ffffbf",     // Light Yellow
    "Moderate Mid-Value": "#d9ef8b",      // Yellow-Green
    "Moderate Low-Value": "#fee08b",      // Yellow
    "Disengaged High-Value": "#fc8d59",   // Orange-Red
    "Disengaged Mid-Value": "#d73027",    // Red
    "Disengaged Low-Value": "#a50026"     // Dark Red
};

const CHURN_MULTIPLIERS: Record<string, { worst: number; realistic: number; best: number }> = {
    "Engaged High-Value": { worst: 0.8, realistic: 0.5, best: 0.2 },
    "Engaged Mid-Value": { worst: 1, realistic: 0.625, best: 0.25 },
    "Engaged Low-Value": { worst: 1.25, realistic: 0.78125, best: 0.3125 },
    "Moderate High-Value": { worst: 1.563, realistic: 0.9765625, best: 0.390625 },
    "Moderate Mid-Value": { worst: 1.954, realistic: 1.220703125, best: 0.48828125 },
    "Moderate Low-Value": { worst: 2.442, realistic: 1.525878906, best: 0.6103515625 },
    "Disengaged High-Value": { worst: 3.051, realistic: 1.907348633, best: 0.7629394531 },
    "Disengaged Mid-Value": { worst: 3.814, realistic: 2.384185791, best: 0.9536743164 },
    "Disengaged Low-Value": { worst: 4.768, realistic: 2.980232239, best: 1.192092896 }
};

const SummaryPage = ({ customerId }: { customerId: string }) => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- FILTER STATE ---
    const [selectedBuckets, setSelectedBuckets] = useState<string[]>([]);
    const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
    const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
    const [selectedRenewalManagers, setSelectedRenewalManagers] = useState<string[]>([]);
    const [selectedRenewalTeams, setSelectedRenewalTeams] = useState<string[]>([]);
    const [selectedRenewalDates, setSelectedRenewalDates] = useState<string[]>([]);

    // --- CHURN CALCULATION STATE ---
    const [priceIncrease, setPriceIncrease] = useState(0.17); // 17%
    const [variableChurnBaseline, setVariableChurnBaseline] = useState(0.10); // 10%

    // --- UNIQUE VALUES FOR FILTERS ---
    const uniqueBuckets = useMemo(() => Array.from(new Set(customers.map(c => c["Bucket Name"]))).filter(Boolean), [customers]);
    const uniqueRegions = useMemo(() => {
        const regionCounts = customers.reduce((acc, customer) => {
            const region = customer["Region"];
            if (region) {
                acc[region] = (acc[region] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(regionCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .map(([region]) => region);
    }, [customers]);
    const uniqueSegments = useMemo(() => Array.from(new Set(customers.map(c => c["Segment"]))).filter(Boolean), [customers]);
    const uniqueRenewalManagers = useMemo(() => Array.from(new Set(customers.map(c => c["Renewal Manager"]))).filter(Boolean), [customers]);
    const uniqueRenewalTeams = useMemo(() => Array.from(new Set(customers.map(c => c["Renewal Team"]))).filter(Boolean), [customers]);
    const uniqueRenewalDates = useMemo(() => {
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
    const filteredCustomers = useMemo(() => {
        // If no filters are selected, return all customers
        if (
            selectedBuckets.length === 0 &&
            selectedRegions.length === 0 &&
            selectedSegments.length === 0 &&
            selectedRenewalManagers.length === 0 &&
            selectedRenewalTeams.length === 0 &&
            selectedRenewalDates.length === 0
        ) {
            return customers;
        }
        return customers.filter(c =>
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
        );
    }, [customers, selectedBuckets, selectedRegions, selectedSegments, selectedRenewalManagers, selectedRenewalTeams, selectedRenewalDates]);

    // --- PAGINATION STATE ---
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const totalRows = filteredCustomers.length;
    const totalPages = Math.ceil(totalRows / pageSize);
    const paginatedCustomers = filteredCustomers.slice((page - 1) * pageSize, page * pageSize);

    // Reset to first page if filters change and current page is out of range
    useEffect(() => {
        if (page > totalPages) setPage(1);
    }, [filteredCustomers, totalPages, page]);

    // --- FILTER UI ---
    const renderDropdownCheckboxGroup = (
        label: string,
        options: string[],
        selected: string[],
        setSelected: (v: string[]) => void
    ) => {
        const sortedOptions = label === 'Buckets' 
            ? BUCKET_ORDER.filter(opt => options.includes(opt))
            : options; // Use the pre-sorted options for regions
        return (
            <Dropdown as={ButtonGroup} className="me-2 mb-2" autoClose="outside">
                <Dropdown.Toggle variant="secondary" style={{ minWidth: 180, textAlign: 'left', background: '#222', border: '1px solid #333' }}>
                    <b>{label}</b>
                </Dropdown.Toggle>
                <Dropdown.Menu style={{ maxHeight: 220, overflowY: 'auto', background: '#111', color: '#fff', minWidth: 220 }}>
                    {sortedOptions.map(opt => (
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
    };

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/v1/customer/${customerId}/customers`, {
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
                const x = c["Adoption Score"] === 0 ? xOffset : c["Adoption Score"];
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
                    label: function(context: import('chart.js').TooltipItem<'scatter'>) {
                        const dataset = context.dataset.data;
                        const point = dataset[context.dataIndex] as unknown as { rawX: number; rawY: number };
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

    // Calculate churn risk summary
    const churnRiskSummary = useMemo(() => {
        const summary: Record<string, { 
            count: number; 
            totalMRR: number;
            averageMRR: number;
            worstCase: number; 
            realisticCase: number; 
            bestCase: number;
        }> = {};

        // Initialize all buckets in order
        BUCKET_ORDER.forEach(bucket => {
            summary[bucket] = {
                count: 0,
                totalMRR: 0,
                averageMRR: 0,
                worstCase: 0,
                realisticCase: 0,
                bestCase: 0
            };
        });

        filteredCustomers.forEach(customer => {
            const bucket = customer["Bucket Name"];
            if (!bucket) return;

            const mrr = Number(customer["Monthly Recurring Revenue"]) || 0;
            
            summary[bucket].count++;
            summary[bucket].totalMRR += mrr;
        });

        // Calculate average MRR and churn risk for each bucket
        BUCKET_ORDER.forEach(bucket => {
            const data = summary[bucket];
            data.averageMRR = data.count > 0 ? Math.round((data.totalMRR / data.count) * 100) / 100 : 0;
            
            const multipliers = CHURN_MULTIPLIERS[bucket];
            const priceIncreaseImpact = Math.round((data.totalMRR * priceIncrease) * 100) / 100;
            const baseChurnRisk = Math.round((data.count * variableChurnBaseline * data.averageMRR) * 100) / 100;
            
            data.worstCase = Math.round((priceIncreaseImpact - (baseChurnRisk * multipliers.worst)) * 100) / 100;
            data.realisticCase = Math.round((priceIncreaseImpact - (baseChurnRisk * multipliers.realistic)) * 100) / 100;
            data.bestCase = Math.round((priceIncreaseImpact - (baseChurnRisk * multipliers.best)) * 100) / 100;
        });

        return summary;
    }, [filteredCustomers, priceIncrease, variableChurnBaseline]);

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

            {/* Churn Risk Summary Table */}
            <div style={{
                width: 'calc(100vw - 200px)',
                maxWidth: '1200px',
                marginLeft: '200px',
                background: '#000',
                padding: '24px',
                marginBottom: '32px',
                borderRadius: 12,
                boxShadow: '0 0 24px #0008',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ color: '#fff', margin: 0 }}>Incremental MRR Increase Risk Summary</h3>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <div style={{ color: '#fff' }}>
                            <span style={{ fontWeight: 'bold' }}>Price Increase:</span>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                value={Math.round(priceIncrease * 100)}
                                onChange={(e) => setPriceIncrease(Number(e.target.value) / 100)}
                                style={{
                                    marginLeft: '8px',
                                    width: '60px',
                                    padding: '4px',
                                    background: '#111',
                                    color: '#fff',
                                    border: '1px solid #333',
                                    borderRadius: '4px'
                                }}
                            />%
                        </div>
                        <div style={{ color: '#fff' }}>
                            <span style={{ fontWeight: 'bold' }}>Variable Churn Baseline:</span>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                value={variableChurnBaseline * 100}
                                onChange={(e) => setVariableChurnBaseline(Number(e.target.value) / 100)}
                                style={{
                                    marginLeft: '8px',
                                    width: '60px',
                                    padding: '4px',
                                    background: '#111',
                                    color: '#fff',
                                    border: '1px solid #333',
                                    borderRadius: '4px'
                                }}
                            />%
                        </div>
                    </div>
                </div>
                <Table striped bordered hover size="sm" responsive style={{ background: '#111', color: '#fff' }}>
                    <thead>
                        <tr>
                            <th style={{ background: '#fff', borderColor: '#333', color: '#000' }}>Bucket</th>
                            <th style={{ background: '#fff', borderColor: '#333', color: '#000' }}>Customer Count</th>
                            <th style={{ background: '#fff', borderColor: '#333', color: '#000' }}>Total MRR</th>
                            <th style={{ background: '#fff', borderColor: '#333', color: '#000' }}>Average MRR</th>
                            <th style={{ background: '#fff', borderColor: '#333', color: '#000', borderLeft: '6px solid #666', paddingLeft: '16px' }}>Worst Case</th>
                            <th style={{ background: '#fff', borderColor: '#333', color: '#000' }}>Realistic Case</th>
                            <th style={{ background: '#fff', borderColor: '#333', color: '#000' }}>Best Case</th>
                        </tr>
                    </thead>
                    <tbody>
                        {BUCKET_ORDER.map(bucket => {
                            const data = churnRiskSummary[bucket];
                            if (data.count === 0) return null;
                            return (
                                <tr key={bucket}>
                                    <td style={{ borderColor: '#333' }}>{bucket}</td>
                                    <td style={{ borderColor: '#333' }}>{data.count}</td>
                                    <td style={{ borderColor: '#333' }}>${data.totalMRR.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td style={{ borderColor: '#333' }}>${data.averageMRR.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td style={{ borderColor: '#333', borderLeft: '6px solid #666', paddingLeft: '16px' }}>${data.worstCase.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td style={{ borderColor: '#333' }}>${data.realisticCase.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td style={{ borderColor: '#333' }}>${data.bestCase.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                            );
                        })}
                        <tr style={{ background: '#222', fontWeight: 'bold' }}>
                            <td style={{ borderColor: '#333' }}>Total</td>
                            <td style={{ borderColor: '#333' }}>
                                {BUCKET_ORDER.reduce((sum, bucket) => sum + churnRiskSummary[bucket].count, 0)}
                            </td>
                            <td style={{ borderColor: '#333' }}>
                                ${BUCKET_ORDER.reduce((sum, bucket) => sum + churnRiskSummary[bucket].totalMRR, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td style={{ borderColor: '#333' }}>
                                ${(Math.round((BUCKET_ORDER.reduce((sum, bucket) => sum + churnRiskSummary[bucket].totalMRR, 0) / 
                                   Math.max(1, BUCKET_ORDER.reduce((sum, bucket) => sum + churnRiskSummary[bucket].count, 0))) * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td style={{ borderColor: '#333', borderLeft: '6px solid #666', paddingLeft: '16px' }}>
                                ${BUCKET_ORDER.reduce((sum, bucket) => sum + churnRiskSummary[bucket].worstCase, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td style={{ borderColor: '#333' }}>
                                ${BUCKET_ORDER.reduce((sum, bucket) => sum + churnRiskSummary[bucket].realisticCase, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td style={{ borderColor: '#333' }}>
                                ${BUCKET_ORDER.reduce((sum, bucket) => sum + churnRiskSummary[bucket].bestCase, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                        </tr>
                    </tbody>
                </Table>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <Button variant="primary" style={{ background: '#28808f', border: '1px solid #333', padding: '8px 16px' }}>
                        Generate Cohort
                    </Button>
                </div>
            </div>

            {/* Chart Container */}
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
                                    <td key={field}>{customer[field]}</td>
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