import { useState } from "react";
import { Table, Container, Button, Form, OverlayTrigger, Tooltip, Tabs, Tab } from "react-bootstrap";
import { InfoCircle } from "react-bootstrap-icons";

interface Customer {
    monthlyRecurringRevenue: number;
    previousMonthlyRecurringRevenue: number;
    initialSubscriptionDate: string;
    logins: number;
    accountName: string;
    engagementCostRatio: number;
}

interface Cohort {
    name: string;
    description?: string;
    customers: Customer[];
}

const DEFAULT_PAGE_SIZE = 5;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const DataPage = ({ data }: { data: { cohorts: Cohort[] } }) => {
    if (!data || !data.cohorts || data.cohorts.length === 0) {
        return (
            <Container className="mt-4">
                <h2>No Data Available</h2>
                <p>Upload a file first to see the data.</p>
            </Container>
        );
    }

    const [pagination, setPagination] = useState<{ [key: number]: { page: number; pageSize: number } }>(
        Object.fromEntries(data.cohorts.map((_, index) => [index, { page: 1, pageSize: DEFAULT_PAGE_SIZE }]))
    );

    const [activeTab, setActiveTab] = useState(data.cohorts[0]?.name || ""); // Default to first cohort

    const handlePageChange = (cohortIndex: number, newPage: number) => {
        setPagination((prev) => ({
            ...prev,
            [cohortIndex]: { ...prev[cohortIndex], page: newPage },
        }));
    };

    const handlePageSizeChange = (cohortIndex: number, newPageSize: number) => {
        setPagination((prev) => ({
            ...prev,
            [cohortIndex]: { page: 1, pageSize: newPageSize },
        }));
    };

    return (
        <Container className="mt-4">
            <h2>Uploaded Data</h2>

            {/* Tab Navigation */}
            <Tabs
                id="cohort-tabs"
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k || "")}
                className="mb-3"
            >
                {data.cohorts.map((cohort, cohortIndex) => {
                    const { page, pageSize } = pagination[cohortIndex];
                    const totalPages = Math.ceil(cohort.customers.length / pageSize);
                    const startIndex = (page - 1) * pageSize;
                    const displayedCustomers = cohort.customers.slice(startIndex, startIndex + pageSize);

                    return (
                        <Tab key={cohort.name} eventKey={cohort.name} title={cohort.name}>
                            <div key={cohortIndex} className="mb-4">
                                {/* Table Header Section */}
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <div className="d-flex align-items-center">
                                        <h3 className="me-2">{cohort.name}</h3>
                                        {cohort.description && (
                                            <OverlayTrigger
                                                placement="right"
                                                overlay={<Tooltip id={`tooltip-${cohortIndex}`}>{cohort.description}</Tooltip>}
                                            >
                                                <InfoCircle size={20} className="text-primary" style={{ cursor: "pointer" }} />
                                            </OverlayTrigger>
                                        )}
                                    </div>
                                </div>

                                {cohort.customers.length > 0 ? (
                                    <>
                                        {/* Page Size Selector & Total Count in the Same Row */}
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <Form.Group className="d-flex align-items-center">
                                                <Form.Label className="me-2">Rows per page:</Form.Label>
                                                <Form.Select
                                                    value={pageSize}
                                                    onChange={(e) => handlePageSizeChange(cohortIndex, parseInt(e.target.value))}
                                                    style={{ width: "100px" }}
                                                >
                                                    {PAGE_SIZE_OPTIONS.map((size) => (
                                                        <option key={size} value={size}>
                                                            {size}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                            {/* Total Customers Count on the Same Line */}
                                            <span className="text-muted">Total: {cohort.customers.length} customers</span>
                                        </div>

                                        <Table striped bordered hover>
                                            <thead>
                                            <tr>
                                                {Object.keys(cohort.customers[0]).map((key) => (
                                                    <th key={key}>{key}</th>
                                                ))}
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {displayedCustomers.map((customer, customerIndex) => (
                                                <tr key={customerIndex}>
                                                    {Object.values(customer).map((value, colIndex) => (
                                                        <td key={colIndex}>
                                                            {typeof value === "number"
                                                                ? value.toFixed(2)
                                                                : value}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                            </tbody>
                                        </Table>

                                        {/* Pagination Controls */}
                                        {totalPages > 1 && (
                                            <div className="d-flex justify-content-between align-items-center">
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => handlePageChange(cohortIndex, page - 1)}
                                                    disabled={page === 1}
                                                >
                                                    Previous
                                                </Button>
                                                <span>
                                                    Page {page} of {totalPages}
                                                </span>
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => handlePageChange(cohortIndex, page + 1)}
                                                    disabled={page === totalPages}
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p>No customers in this cohort.</p>
                                )}
                            </div>
                        </Tab>
                    );
                })}
            </Tabs>
        </Container>
    );
};

export default DataPage;
