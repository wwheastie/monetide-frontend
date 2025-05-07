import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Table, Container, Button, Nav } from 'react-bootstrap';
import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";

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

const Generate = () => {
    const location = useLocation();
    const customers: Record<string, string | number>[] = location.state?.customers || [];

    // Group by Month-Year
    const monthYearOrder = useMemo(() => {
        const dateObjs = customers
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
        const seen = new Set();
        const unique = dateObjs.filter(obj => {
            if (seen.has(obj.label)) return false;
            seen.add(obj.label);
            return true;
        });
        unique.sort((a, b) => a.date.getTime() - b.date.getTime());
        return unique.map(obj => obj.label);
    }, [customers]);

    const customersByMonthYear = useMemo(() => {
        const groups: Record<string, typeof customers> = {};
        customers.forEach(c => {
            const d = new Date(c["Managed Renewal Date"] as string);
            if (isNaN(d.getTime())) return;
            const label = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
            if (!groups[label]) groups[label] = [];
            groups[label].push(c);
        });
        return groups;
    }, [customers]);

    // Tab, search, and pagination state
    const [activeTab, setActiveTab] = useState(monthYearOrder[0] || "");
    const [searchQuery, setSearchQuery] = useState('');
    const [tabPage, setTabPage] = useState<Record<string, number>>({});
    const [tabPageSize, setTabPageSize] = useState<Record<string, number>>({});
    const getPage = (tab: string) => tabPage[tab] || 1;
    const getPageSize = (tab: string) => tabPageSize[tab] || 10;
    const setPage = (tab: string, page: number) => setTabPage(prev => ({ ...prev, [tab]: page }));
    const setPageSize = (tab: string, size: number) => setTabPageSize(prev => ({ ...prev, [tab]: size }));

    // Scroll arrows
    const [scrollLeft] = useState(false);
    const [scrollRight] = useState(false);
    const scrollTabs = (direction: 'left' | 'right') => {
        const activeIndex = monthYearOrder.indexOf(activeTab);
        if (direction === 'left') {
            if (activeIndex > 0) setActiveTab(monthYearOrder[activeIndex - 1]);
        } else if (direction === 'right') {
            if (activeIndex < monthYearOrder.length - 1) setActiveTab(monthYearOrder[activeIndex + 1]);
        }
    };

    // Search and pagination logic
    const filteredTabCustomers = useMemo(() => {
        if (!searchQuery) return customersByMonthYear[activeTab] || [];
        const query = searchQuery.toLowerCase();
        return (customersByMonthYear[activeTab] || []).filter(customer =>
            Object.values(customer).some(value => String(value).toLowerCase().includes(query))
        );
    }, [customersByMonthYear, activeTab, searchQuery]);

    const paginatedTabCustomers = useMemo(() => {
        const page = getPage(activeTab);
        const pageSize = getPageSize(activeTab);
        return filteredTabCustomers.slice((page - 1) * pageSize, page * pageSize);
    }, [filteredTabCustomers, activeTab, getPage, getPageSize]);

    // CSV Export logic
    const exportToCSV = () => {
        if (!customers.length) return;
        const fields = customerFields;
        const csvRows = [fields.join(",")];
        customers.forEach(customer => {
            const row = fields.map(field => {
                let val = customer[field];
                if (typeof val === 'string') {
                    val = '"' + val.replace(/"/g, '""') + '"';
                }
                return val;
            });
            csvRows.push(row.join(","));
        });
        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'generated_cohort.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <Container className="mt-5 pt-5">
            <h2>Generated Cohort</h2>
            {/* Export button above the chart, right-aligned */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <Button variant="primary" onClick={exportToCSV} style={{ background: '#28808f', color: '#fff', border: '1px solid #333' }}>
                    Export CSV
                </Button>
            </div>
            {monthYearOrder.length === 0 ? (
                <p>No customers to display. Please generate a cohort from the Forecast page.</p>
            ) : (
                <div style={{
                    marginTop: 40,
                    width: '100%',
                    maxWidth: '1200px',
                    overflowX: 'auto',
                    background: '#000',
                    padding: '24px',
                    borderRadius: 12,
                    boxShadow: '0 0 24px #0008',
                }}>
                    <div className="d-flex align-items-center position-relative mb-3">
                        {scrollLeft && (
                            <ChevronLeft className="tab-arrow left position-absolute start-0 z-3" onClick={() => scrollTabs("left")} />
                        )}
                        <div className="forecast-tab-wrapper flex-grow-1 mx-5 overflow-hidden" style={{ minWidth: 0, width: '100%' }}>
                            <Nav
                                variant="tabs"
                                activeKey={activeTab}
                                onSelect={k => setActiveTab(k || "")}
                                style={{ display: 'flex', width: '100%' }}
                            >
                                {monthYearOrder.map(monthYear => (
                                    <Nav.Item key={monthYear} style={{ flex: 1, minWidth: 0 }}>
                                        <Nav.Link eventKey={monthYear} style={{ width: '100%', textAlign: 'center', whiteSpace: 'normal', overflow: 'visible' }}>
                                            {monthYear}
                                        </Nav.Link>
                                    </Nav.Item>
                                ))}
                            </Nav>
                        </div>
                        {scrollRight && (
                            <ChevronRight className="tab-arrow right position-absolute end-0 z-3" onClick={() => scrollTabs("right")} />
                        )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Search customers..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        border: '1px solid #333',
                                        background: '#111',
                                        color: '#fff',
                                        width: '300px'
                                    }}
                                />
                            </div>
                            <span style={{ fontWeight: 500, color: '#fff' }}>
                                Showing {Math.min((getPage(activeTab) - 1) * getPageSize(activeTab) + 1, filteredTabCustomers.length)} - {Math.min(getPage(activeTab) * getPageSize(activeTab), filteredTabCustomers.length)} of {filteredTabCustomers.length} customers
                            </span>
                        </div>
                        <div>
                            <label style={{ marginRight: 8, color: '#fff' }}>Rows per page:</label>
                            <select
                                value={getPageSize(activeTab)}
                                onChange={e => { setPageSize(activeTab, Number(e.target.value)); setPage(activeTab, 1); }}
                                style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    border: '1px solid #333',
                                    background: '#111',
                                    color: '#fff'
                                }}
                            >
                                {[10, 20, 50, 100].map(size => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <Table striped bordered hover size="sm" style={{ width: '100%', color: '#fff', background: '#111' }}>
                        <thead>
                            <tr>
                                {customerFields.map(field => (
                                    <th key={field} style={{ 
                                        background: '#fff',
                                        color: '#000',
                                        borderColor: '#333'
                                    }}>
                                        {field}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedTabCustomers.map((customer: Record<string, string | number>, idx: number) => (
                                <tr key={idx}>
                                    <td style={{ borderColor: '#333' }}>{customer["Account Name"]}</td>
                                    <td style={{ borderColor: '#333' }}>${Number(customer["Monthly Recurring Revenue"]).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td style={{ borderColor: '#333' }}>{customer["Segment"]}</td>
                                    <td style={{ borderColor: '#333' }}>{customer["Renewal Manager"]}</td>
                                    <td style={{ borderColor: '#333' }}>{customer["Renewal Team"]}</td>
                                    <td style={{ borderColor: '#333' }}>{new Date(customer["Managed Renewal Date"] as string).toLocaleDateString()}</td>
                                    <td style={{ borderColor: '#333' }}>{customer["Region"]}</td>
                                    <td style={{ borderColor: '#333' }}>{Number(customer["Adoption Score"]).toFixed(2)}</td>
                                    <td style={{ borderColor: '#333' }}>{Number(customer["MRR Score"]).toFixed(2)}</td>
                                    <td style={{ borderColor: '#333' }}>{customer["Bucket Name"]}</td>
                                    <td style={{ borderColor: '#333' }}>{customer["Initial Subscription"]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16, gap: '8px' }}>
                        <Button
                            variant="secondary"
                            onClick={() => setPage(activeTab, 1)}
                            disabled={getPage(activeTab) === 1}
                            style={{ background: '#222', borderColor: '#333' }}
                        >
                            «
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setPage(activeTab, Math.max(1, getPage(activeTab) - 1))}
                            disabled={getPage(activeTab) === 1}
                            style={{ background: '#222', borderColor: '#333' }}
                        >
                            ‹
                        </Button>
                        {Array.from({ length: Math.min(5, Math.ceil((customersByMonthYear[activeTab]?.length || 0) / getPageSize(activeTab))) }, (_, i) => {
                            let pageNum;
                            const totalPages = Math.ceil((customersByMonthYear[activeTab]?.length || 0) / getPageSize(activeTab));
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (getPage(activeTab) <= 3) {
                                pageNum = i + 1;
                            } else if (getPage(activeTab) >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = getPage(activeTab) - 2 + i;
                            }
                            return (
                                <Button
                                    key={i}
                                    variant={getPage(activeTab) === pageNum ? "primary" : "secondary"}
                                    onClick={() => setPage(activeTab, pageNum)}
                                    style={getPage(activeTab) === pageNum ? 
                                        { background: '#28808f', borderColor: '#333' } : 
                                        { background: '#222', borderColor: '#333' }}
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}
                        <Button
                            variant="secondary"
                            onClick={() => setPage(activeTab, Math.min(Math.ceil((customersByMonthYear[activeTab]?.length || 0) / getPageSize(activeTab)), getPage(activeTab) + 1))}
                            disabled={getPage(activeTab) === Math.ceil((customersByMonthYear[activeTab]?.length || 0) / getPageSize(activeTab))}
                            style={{ background: '#222', borderColor: '#333' }}
                        >
                            ›
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setPage(activeTab, Math.ceil((customersByMonthYear[activeTab]?.length || 0) / getPageSize(activeTab)))}
                            disabled={getPage(activeTab) === Math.ceil((customersByMonthYear[activeTab]?.length || 0) / getPageSize(activeTab))}
                            style={{ background: '#222', borderColor: '#333' }}
                        >
                            »
                        </Button>
                    </div>
                </div>
            )}
        </Container>
    );
};

export default Generate; 