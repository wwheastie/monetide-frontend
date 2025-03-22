import { Nav } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Sidebar = ({ setCustomerId }: { setCustomerId: (id: string | null) => void }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("customerId");
        setCustomerId(null); // Clear state
        navigate("/login", { replace: true });
    };

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

            <button className="sidebar-logout" onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
};

export default Sidebar;
