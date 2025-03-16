import { Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
    const location = useLocation(); // Get the current route

    return (
        <div className="sidebar d-flex flex-column">
            {/* Sidebar Title - Left Aligned */}
            <h4 className="sidebar-title mt-5">Menu</h4>

            {/* Navigation Menu */}
            <div className="sidebar-menu mt-3">
                <Nav className="flex-column">
                    <Nav.Link
                        as={Link}
                        to="/"
                        className={`sidebar-link ${location.pathname === "/" ? "active-link" : ""}`}
                    >
                        Upload File
                    </Nav.Link>
                    <Nav.Link
                        as={Link}
                        to="/data"
                        className={`sidebar-link ${location.pathname === "/data" ? "active-link" : ""}`}
                    >
                        View Data
                    </Nav.Link>
                </Nav>
            </div>
        </div>
    );
};

export default Sidebar;
