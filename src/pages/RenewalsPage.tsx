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

const NOTICE_OPTIONS = [15, 30, 60, 90];

const RenewalsPage = ({ customerId }: { customerId: string }) => {
    const [cohorts, setCohorts] = useState<RenewalCohort[]>([]);
    const [activeTab, setActiveTab] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [scrollLeft, setScrollLeft] = useState(false);
    const [scrollRight, setScrollRight] = useState(false);
    const [noticeSentDate, setNoticeSentDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
    const [daysOfNotice, setDaysOfNotice] = useState<number>(60);
    const [generated, setGenerated] = useState(false);
    const [percentIncrease, setPercentIncrease] = useState<number>(0);
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

    const handleGenerate = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/v1/customer/${customerId}/renewals`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    noticeSentDate,
                    daysOfNotice,
                }),
            });

            if (response.status === 400) {
                setError("Uploaded data is needed to display renewals.");
                return;
            }

            if (!response.ok) throw new Error("Failed to fetch renewal data.");
            const json = await response.json();
            setCohorts(json.renewalCohorts || []);
            setActiveTab(json.renewalCohorts?.[0]?.name || "");
            setError(null);
            setGenerated(true);
        } catch {
            setError("An error occurred while loading renewals.");
        }
    };

    const allCustomers = cohorts.flatMap((c) => c.customers);

    const calculateCurrentMRR = (): number => {
        return allCustomers.reduce((sum, customer) => {
            const mrr = Number(customer.MRR);
            return sum + (isNaN(mrr) ? 0 : mrr);
        }, 0);
    };

    const formatCurrency = (amount: number): string => {
        return amount.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
        });
    };

    const currentMRR = calculateCurrentMRR();
    const projectedMRR = currentMRR * (1 + percentIncrease / 100);
    const increaseAmount = projectedMRR - currentMRR;

    const activeCohort = cohorts.find((c) => c.name === activeTab);

    return (
        <Container className="data-page mt-4">
            <h2 className="mb-4">Uplift Forecasts</h2>

            <Form className="mb-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-end gap-3">
                    <div className="d-flex flex-column flex-md-row align-items-md-end gap-3">
                        <Form.Group controlId="noticeDate">
                            <Form.Label>Notice Sent Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={noticeSentDate}
                                onChange={(e) => setNoticeSentDate(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group controlId="daysOfNotice">
                            <Form.Label>Days of Notice</Form.Label>
                            <Form.Select
                                value={daysOfNotice}
                                onChange={(e) => setDaysOfNotice(Number(e.target.value))}
                            >
                                {NOTICE_OPTIONS.map((days) => (
                                    <option key={days} value={days}>{days} days</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Button
                            variant="primary"
                            className="mt-2 mt-md-0"
                            onClick={handleGenerate}
                            disabled={false}
                        >
                            Generate
                        </Button>
                    </div>

                    {generated && (
                        <div className="d-flex flex-column flex-md-row align-items-md-end gap-3">
                            <Form.Group controlId="percentIncrease">
                                <Form.Label>Target % Increase</Form.Label>
                                <Form.Control
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={percentIncrease}
                                    onChange={(e) => setPercentIncrease(Number(e.target.value))}
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Current MRR</Form.Label>
                                <Form.Control type="text" readOnly value={formatCurrency(currentMRR)} style={{ pointerEvents: "none" }} />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Projected MRR</Form.Label>
                                <Form.Control type="text" readOnly value={formatCurrency(projectedMRR)} style={{ pointerEvents: "none" }} />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Gross MRR Increase</Form.Label>
                                <Form.Control type="text" readOnly value={formatCurrency(increaseAmount)} style={{ pointerEvents: "none" }} />
                            </Form.Group>
                        </div>
                    )}
                </div>
            </Form>

            {error ? (
                <Alert variant="warning">{error}</Alert>
            ) : (
                generated && (
                    <>
                        <div className="d-flex align-items-center position-relative mb-3">
                            {scrollLeft && (
                                <ChevronLeft className="tab-arrow left position-absolute start-0 z-3" onClick={() => scrollTabs("left")} />
                            )}

                            <div className="renewals-tab-wrapper flex-grow-1 mx-5 overflow-hidden">
                                <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k || "")}
                                     className="flex-nowrap">
                                    {cohorts.map((cohort) => (
                                        <Nav.Item key={cohort.name}>
                                            <Nav.Link eventKey={cohort.name}>{cohort.name}</Nav.Link>
                                        </Nav.Item>
                                    ))}
                                </Nav>
                            </div>

                            {scrollRight && (
                                <ChevronRight className="tab-arrow right position-absolute end-0 z-3" onClick={() => scrollTabs("right")} />
                            )}
                        </div>

                        {activeCohort && (
                            <Table striped bordered hover responsive>
                                <thead>
                                <tr>
                                    {Object.keys(activeCohort.customers[0] || {}).map((key) => (
                                        <th key={key}>{key}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {activeCohort.customers.map((customer, idx) => (
                                    <tr key={idx}>
                                        {Object.values(customer).map((value, i) => (
                                            <td key={i}>{typeof value === "number" ? value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value}</td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        )}
                    </>
                )
            )}
        </Container>
    );
};

export default RenewalsPage;
