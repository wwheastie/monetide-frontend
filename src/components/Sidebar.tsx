import { Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ onLogout }: { onLogout: () => void }) => {
    const location = useLocation();

    return (
        <div className="sidebar d-flex flex-column">
            <h4 className="sidebar-title mt-5">Menu</h4>

            <div className="sidebar-menu mt-3 flex-grow-1">
                <Nav className="flex-column">
                    <Nav.Link
                        as={Link}
                        to="/"
                        className={`sidebar-link ${location.pathname === "/" ? "active-link" : ""}`}
                    >
                        Upload Data
                    </Nav.Link>
                    <Nav.Link
                        as={Link}
                        to="/summary"
                        className={`sidebar-link ${location.pathname === "/summary" ? "active-link" : ""}`}
                    >
                        Summary
                    </Nav.Link>
                    <Nav.Link
                        as={Link}
                        to="/forecast"
                        className={`sidebar-link ${location.pathname === "/forecast" ? "active-link" : ""}`}
                    >
                        Forecast
                    </Nav.Link>
                    <Nav.Link
                        as={Link}
                        to="/generate"
                        className={`sidebar-link ${location.pathname === "/generate" ? "active-link" : ""}`}
                    >
                        Generate
                    </Nav.Link>
                    <Nav.Link
                        as={Link}
                        to="/reports"
                        className={`sidebar-link ${location.pathname === "/reports" ? "active-link" : ""}`}
                    >
                        Report
                    </Nav.Link>
                </Nav>
            </div>

            <button className="sidebar-logout" onClick={onLogout}>
                Logout
            </button>
        </div>
    );
};

export default Sidebar;
