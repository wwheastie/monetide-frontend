import { useState, useEffect, useMemo } from "react";
import { Container, Form, Dropdown, ButtonGroup, Table, Button } from "react-bootstrap";
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ChartOptions
} from 'chart.js';
import { API_BASE_URL } from '../config';
import { useFilterStore } from '../store/customerDataStore';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

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
    "users": number;
    "logins": number;
    [key: string]: string | number;
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

const NOTICE_OPTIONS = [15, 30, 60, 90];

const Forecast = ({ customerId }: { customerId: string }) => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- FILTER STATE ---
    const {
      selectedBuckets, setSelectedBuckets,
      selectedRegions, setSelectedRegions,
      selectedSegments, setSelectedSegments,
      selectedRenewalManagers, setSelectedRenewalManagers,
      selectedRenewalTeams, setSelectedRenewalTeams,
      selectedRenewalDates, setSelectedRenewalDates,
      priceIncrease, setPriceIncrease,
      variableChurnBaseline, setVariableChurnBaseline
    } = useFilterStore();

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
    const uniqueSegments = useMemo(() => {
        const segmentCounts = customers.reduce((acc, customer) => {
            const segment = customer["Segment"];
            if (segment) {
                acc[segment] = (acc[segment] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(segmentCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .map(([segment]) => segment);
    }, [customers]);
    const uniqueRenewalManagers = useMemo(() => Array.from(new Set(customers.map(c => c["Renewal Manager"]))).filter(Boolean), [customers]);
    const uniqueRenewalTeams = useMemo(() => Array.from(new Set(customers.map(c => c["Renewal Team"]))).filter(Boolean), [customers]);
    const uniqueRenewalDates = useMemo(() => {
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
        const seen = new Set();
        const unique = dateObjs.filter(obj => {
            if (seen.has(obj.label)) return false;
            seen.add(obj.label);
            return true;
        });
        unique.sort((a, b) => a.date.getTime() - b.date.getTime());
        return unique.map(obj => obj.label);
    }, [customers]);

    // --- FILTERED CUSTOMERS ---
    const filteredCustomers = useMemo(() => {
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

    // Add effect to log state changes
    useEffect(() => {
        console.log('Price Increase changed:', priceIncrease);
        console.log('Variable Churn changed:', variableChurnBaseline);
    }, [priceIncrease, variableChurnBaseline]);

    // Generate monthly data for the chart
    const monthlyForecastData = useMemo(() => {
        console.log('Recalculating monthly forecast data:', { priceIncrease, variableChurnBaseline });
        
        const months = [
            'Jan-25', 'Feb-25', 'Mar-25', 'Apr-25', 'May-25', 'Jun-25',
            'Jul-25', 'Aug-25', 'Sep-25', 'Oct-25', 'Nov-25', 'Dec-25'
        ];

        // Initialize the data structure to match the spreadsheet format
        const bucketMonthlyData: Record<string, {
            month: string;
            accounts: number;
            mrr: number;
            averageMrr: number;
            priceUplift: number;
            worstCase: number;
            realisticCase: number;
            bestCase: number;
        }[]> = {};

        // Initialize data structure for each bucket
        BUCKET_ORDER.forEach(bucket => {
            bucketMonthlyData[bucket] = months.map(month => ({
                month,
                accounts: 0,
                mrr: 0,
                averageMrr: 0,
                priceUplift: priceIncrease * 100,
                worstCase: 0,
                realisticCase: 0,
                bestCase: 0
            }));
        });

        // Group and calculate data for each bucket and month
        filteredCustomers.forEach(customer => {
            const bucket = customer["Bucket Name"];
            if (!bucket) return;

            const renewalDate = new Date(customer["Managed Renewal Date"]);
            if (isNaN(renewalDate.getTime())) return;

            // Format the date to match the month format (e.g., "Mar-25")
            const monthStr = renewalDate.toLocaleString('en-US', { month: 'short' });
            const yearStr = renewalDate.getFullYear().toString().slice(-2);
            const monthKey = `${monthStr}-${yearStr}`;

            // Find the matching month index
            const monthIndex = months.findIndex(m => m === monthKey);
            if (monthIndex === -1) return;

            const mrr = Number(customer["Monthly Recurring Revenue"]) || 0;
            const monthData = bucketMonthlyData[bucket][monthIndex];
            
            monthData.accounts++;
            monthData.mrr += mrr;
        });

        // Calculate averages and cases for each bucket and month
        BUCKET_ORDER.forEach(bucket => {
            const multipliers = CHURN_MULTIPLIERS[bucket];
            
            bucketMonthlyData[bucket].forEach(monthData => {
                // Calculate average MRR
                monthData.averageMrr = monthData.accounts > 0 
                    ? Math.round((monthData.mrr / monthData.accounts) * 100) / 100 
                    : 0;

                // Calculate the price uplift amount (total potential gain)
                const priceUpliftAmount = monthData.mrr * priceIncrease;

                // Calculate the base churn risk
                const baseChurnRisk = monthData.mrr * variableChurnBaseline;

                // Calculate cases using the multipliers
                // For each case, we take: Price Uplift - (Base Churn * Multiplier)
                monthData.worstCase = Math.round((priceUpliftAmount - (baseChurnRisk * multipliers.worst)) * 100) / 100;
                monthData.realisticCase = Math.round((priceUpliftAmount - (baseChurnRisk * multipliers.realistic)) * 100) / 100;
                monthData.bestCase = Math.round((priceUpliftAmount - (baseChurnRisk * multipliers.best)) * 100) / 100;

                console.log('Monthly calculation for', bucket, monthData.month, {
                    mrr: monthData.mrr,
                    priceUplift: priceUpliftAmount,
                    baseChurn: baseChurnRisk,
                    multipliers,
                    results: {
                        worst: monthData.worstCase,
                        realistic: monthData.realisticCase,
                        best: monthData.bestCase
                    }
                });
            });
        });

        // Aggregate data for each month across all buckets
        const monthlyTotals = months.map((month, index) => {
            const totals = {
                month,
                worstCase: 0,
                realisticCase: 0,
                bestCase: 0
            };

            BUCKET_ORDER.forEach(bucket => {
                const monthData = bucketMonthlyData[bucket][index];
                totals.worstCase += monthData.worstCase;
                totals.realisticCase += monthData.realisticCase;
                totals.bestCase += monthData.bestCase;
            });

            // Round the final values
            totals.worstCase = Math.round(totals.worstCase * 100) / 100;
            totals.realisticCase = Math.round(totals.realisticCase * 100) / 100;
            totals.bestCase = Math.round(totals.bestCase * 100) / 100;

            return totals;
        });

        console.log('Monthly Totals after calculation:', monthlyTotals);
        return monthlyTotals;
    }, [filteredCustomers, priceIncrease, variableChurnBaseline]);

    // Create chart data with force update mechanism
    const [forceUpdate, setForceUpdate] = useState(0);
    useEffect(() => {
        setForceUpdate(prev => prev + 1);
    }, [priceIncrease, variableChurnBaseline]);

    const chartData = useMemo(() => ({
        labels: monthlyForecastData.map(d => d.month),
        datasets: [
            {
                label: 'Worst Case Incremental MRR',
                data: monthlyForecastData.map(d => d.worstCase),
                borderColor: '#d73027',
                backgroundColor: 'rgba(215, 48, 39, 0.1)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Realistic Case Incremental MRR',
                data: monthlyForecastData.map(d => d.realisticCase),
                borderColor: '#28808f',
                backgroundColor: 'rgba(40, 128, 143, 0.1)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Best Case Incremental MRR',
                data: monthlyForecastData.map(d => d.bestCase),
                borderColor: '#006837',
                backgroundColor: 'rgba(0, 104, 55, 0.1)',
                fill: true,
                tension: 0.4
            }
        ]
    }), [monthlyForecastData, forceUpdate]);

    const chartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: '#fff',
                    font: { size: 12 }
                }
            },
            title: {
                display: true,
                text: 'Forecasted Incremental MRR - Price Increase',
                color: '#fff',
                font: { size: 16 }
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#fff'
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#fff',
                    callback: (value) => {
                        if (typeof value === 'number') {
                            return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        }
                        return value;
                    }
                }
            }
        }
    };

    // --- FILTER UI ---
    const renderDropdownCheckboxGroup = (
        label: string,
        options: string[],
        selected: string[],
        setSelected: (v: string[]) => void
    ) => {
        const sortedOptions = label === 'Buckets' 
            ? BUCKET_ORDER.filter(opt => options.includes(opt))
            : options;
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

    // Find unique Month-Year labels in calendar order
    const monthYearOrder = useMemo(() => {
        const dateObjs = filteredCustomers
            .map(c => c["Managed Renewal Date"])
            .filter(Boolean)
            .map(dateStr => {
                const d = new Date(dateStr as string);
                return {
                    label: d.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
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
    }, [filteredCustomers]);

    const [activeTab, setActiveTab] = useState(monthYearOrder[0] || "");
    useEffect(() => {
        if (!activeTab && monthYearOrder.length > 0) setActiveTab(monthYearOrder[0]);
    }, [monthYearOrder, activeTab]);

    const navigate = useNavigate();

    // Add state for Notice Sent Date and Days of Notice
    const [noticeSentDate, setNoticeSentDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
    const [daysOfNotice, setDaysOfNotice] = useState<number>(60);

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
                {renderDropdownCheckboxGroup('Renewal Team', uniqueRenewalTeams, selectedRenewalTeams, setSelectedRenewalTeams)}
                {renderDropdownCheckboxGroup('Renewal Manager', uniqueRenewalManagers, selectedRenewalManagers, setSelectedRenewalManagers)}
            </div>

            {/* Forecast Chart */}
            <div style={{
                width: 'calc(100vw - 200px)',
                maxWidth: '1200px',
                marginLeft: '200px',
                background: '#000',
                padding: '32px 24px',
                minHeight: '500px',
                boxSizing: 'border-box',
                borderRadius: 12,
                boxShadow: '0 0 24px #0008',
                marginBottom: '32px',
            }}>
                <div style={{ height: '500px', width: '100%' }}>
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>

            {/* Summary Table Container */}
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
                {/* Add Notice Sent Date and Days of Notice row */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 24 }}>
                    <Form.Group controlId="noticeDate" style={{ marginBottom: 0, marginRight: 24 }}>
                        <Form.Label style={{ color: '#fff', marginRight: 8, marginBottom: 0 }}>Notice Sent Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={noticeSentDate}
                            onChange={e => setNoticeSentDate(e.target.value)}
                            style={{ width: 170, background: '#111', color: '#fff', border: '1px solid #333' }}
                        />
                    </Form.Group>
                    <Form.Group controlId="daysOfNotice" style={{ marginBottom: 0, marginRight: 24 }}>
                        <Form.Label style={{ color: '#fff', marginRight: 8, marginBottom: 0 }}>Days of Notice</Form.Label>
                        <Form.Select
                            value={daysOfNotice}
                            onChange={e => setDaysOfNotice(Number(e.target.value))}
                            style={{ width: 120, background: '#111', color: '#fff', border: '1px solid #333' }}
                        >
                            {NOTICE_OPTIONS.map(days => (
                                <option key={days} value={days}>{days} days</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    {/* Generate Cohort button, right-aligned */}
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button 
                            variant="primary" 
                            style={{ background: '#28808f', border: '1px solid #333', padding: '8px 16px' }}
                            onClick={() => {
                                const startDate = new Date(noticeSentDate);
                                const targetDate = new Date(startDate);
                                targetDate.setDate(startDate.getDate() + daysOfNotice);
                                // Only include customers whose Managed Renewal Date is equal to or greater than targetDate
                                const filteredByNotice = filteredCustomers.filter(c => {
                                    const renewalDate = new Date(c["Managed Renewal Date"] as string);
                                    return !isNaN(renewalDate.getTime()) && renewalDate >= targetDate;
                                });
                                navigate('/generate', { state: { customers: filteredByNotice } });
                            }}
                        >
                            Generate Cohort
                        </Button>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ color: '#fff', margin: 0 }}>Forecasted Incremental MRR Summary</h3>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <div style={{ color: '#fff' }}>
                            <span style={{ fontWeight: 'bold' }}>Price Increase:</span>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                value={Math.round(priceIncrease * 100)}
                                onChange={(e) => {
                                    const value = Math.min(100, Math.max(0, Number(e.target.value)));
                                    setPriceIncrease(value / 100);
                                }}
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
                                value={Math.round(variableChurnBaseline * 100)}
                                onChange={(e) => {
                                    const value = Math.min(100, Math.max(0, Number(e.target.value)));
                                    setVariableChurnBaseline(value / 100);
                                }}
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
                            <th style={{ background: '#fff', borderColor: '#333', color: '#000', borderLeft: '6px solid #666', paddingLeft: '16px' }}>Worst Case Incremental MRR</th>
                            <th style={{ background: '#fff', borderColor: '#333', color: '#000' }}>Realistic Incremental MRR</th>
                            <th style={{ background: '#fff', borderColor: '#333', color: '#000' }}>Best Case Incremental MRR</th>
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
            </div>
        </>
    );
};

export default Forecast; 