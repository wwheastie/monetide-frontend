import { Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

const Sidebar = () => {
    return (
        <div className="d-flex flex-column p-3 bg-light" style={{ height: "100vh", width: "200px" }}>
            <h4>Menu</h4>
            <Nav className="flex-column">
                <Nav.Link as={Link} to="/">Upload File</Nav.Link>
                <Nav.Link as={Link} to="/data">View Data</Nav.Link>
            </Nav>
        </div>
    );
};

export default Sidebar;
