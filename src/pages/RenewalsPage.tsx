import { useEffect, useState } from "react";
import {
    Container,
    Table,
    Alert,
    Nav,
    Form,
    Button,
} from "react-bootstrap";
import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";

interface CustomerData {
    [key: string]: string | number;
}

interface RenewalCohort {
    name: string;
    customers: CustomerData[];
}

const DEFAULT_PAGE_SIZE = 5;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const RenewalsPage = ({ customerId }: { customerId: string }) => {
    const [cohorts, setCohorts] = useState<RenewalCohort[]>([]);
    const [activeTab, setActiveTab] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [scrollLeft, setScrollLeft] = useState(false);
    const [scrollRight, setScrollRight] = useState(false);
    const [pagination, setPagination] = useState<{
        [key: string]: { page: number; pageSize: number };
    }>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/v1/customer/${customerId}/renewals`, {
                    method: "POST",
                });
                if (response.status === 400) {
                    setError("Uploaded data is needed to display renewals.");
                    return;
                }
                if (!response.ok) throw new Error("Failed to fetch renewal data.");
                const json = await response.json();
                const fetchedCohorts = json.renewalCohorts || [];
                setCohorts(fetchedCohorts);
                setActiveTab(fetchedCohorts?.[0]?.name || "");

                const initialPagination = Object.fromEntries(
                    fetchedCohorts.map((cohort: RenewalCohort) => [
                        cohort.name,
                        { page: 1, pageSize: DEFAULT_PAGE_SIZE },
                    ])
                );
                setPagination(initialPagination);
            } catch (err) {
                setError("An error occurred while loading renewals.");
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const tabWrapper = document.querySelector(".renewals-tab-wrapper");
        if (tabWrapper) {
            const updateArrows = () => {
                setScrollLeft(tabWrapper.scrollLeft > 0);
                setScrollRight(
                    tabWrapper.scrollWidth > tabWrapper.clientWidth + tabWrapper.scrollLeft
                );
            };
            tabWrapper.addEventListener("scroll", updateArrows);
            updateArrows();
            return () => tabWrapper.removeEventListener("scroll", updateArrows);
        }
    }, [cohorts]);

    const scrollTabs = (dir: "left" | "right") => {
        const tabWrapper = document.querySelector(".renewals-tab-wrapper");
        if (tabWrapper) {
            tabWrapper.scrollBy({
                left: dir === "left" ? -150 : 150,
                behavior: "smooth",
            });
        }
    };

    const handlePageChange = (tabName: string, newPage: number) => {
        setPagination((prev) => ({
            ...prev,
            [tabName]: { ...prev[tabName], page: newPage },
        }));
    };

    const handlePageSizeChange = (tabName: string, newSize: number) => {
        setPagination((prev) => ({
            ...prev,
            [tabName]: { page: 1, pageSize: newSize },
        }));
    };

    const activeCohort = cohorts.find((c) => c.name === activeTab);
    const currentPagination = pagination[activeTab] || { page: 1, pageSize: DEFAULT_PAGE_SIZE };
    const totalPages = activeCohort
        ? Math.ceil(activeCohort.customers.length / currentPagination.pageSize)
        : 1;
    const startIndex = (currentPagination.page - 1) * currentPagination.pageSize;
    const paginatedCustomers = activeCohort?.customers.slice(
        startIndex,
        startIndex + currentPagination.pageSize
    );

    return (
        <Container className="data-page">
            <h2>Renewals</h2>

            {error ? (
                <Alert variant="warning">{error}</Alert>
            ) : (
                <>
                    {/* Tabs */}
                    <div className="d-flex align-items-center position-relative mb-3">
                        {scrollLeft && (
                            <ChevronLeft className="tab-arrow left" onClick={() => scrollTabs("left")} />
                        )}
                        <div className="renewals-tab-wrapper flex-grow-1 mx-3">
                            <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k || "")}>
                                {cohorts.map((cohort) => (
                                    <Nav.Item key={cohort.name}>
                                        <Nav.Link eventKey={cohort.name}>{cohort.name}</Nav.Link>
                                    </Nav.Item>
                                ))}
                            </Nav>
                        </div>
                        {scrollRight && (
                            <ChevronRight className="tab-arrow right" onClick={() => scrollTabs("right")} />
                        )}
                    </div>

                    {/* Table */}
                    {activeCohort && (
                        <>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                {/* Rows per page selector */}
                                <Form.Group className="d-flex align-items-center">
                                    <Form.Label className="me-2 mb-0">Rows per page:</Form.Label>
                                    <Form.Select
                                        value={currentPagination.pageSize}
                                        onChange={(e) => handlePageSizeChange(activeTab, parseInt(e.target.value))}
                                        style={{ width: "100px" }}
                                    >
                                        {PAGE_SIZE_OPTIONS.map((size) => (
                                            <option key={size} value={size}>
                                                {size}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                {/* Total count */}
                                <span className="text-muted">Total: {activeCohort.customers.length} customers</span>
                            </div>

                            <Table striped bordered hover responsive>
                                <thead>
                                <tr>
                                    {Object.keys(activeCohort.customers[0] || {}).map((key) => (
                                        <th key={key}>{key}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {paginatedCustomers?.map((customer, idx) => (
                                    <tr key={idx}>
                                        {Object.values(customer).map((value, i) => (
                                            <td key={i}>{typeof value === "number" ? value.toFixed(2) : value}</td>
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
                                        onClick={() => handlePageChange(activeTab, currentPagination.page - 1)}
                                        disabled={currentPagination.page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <span>
                    Page {currentPagination.page} of {totalPages}
                  </span>
                                    <Button
                                        variant="secondary"
                                        onClick={() => handlePageChange(activeTab, currentPagination.page + 1)}
                                        disabled={currentPagination.page === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </Container>
    );
};

export default RenewalsPage;
