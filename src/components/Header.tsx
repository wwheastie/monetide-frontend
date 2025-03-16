import { Container } from "react-bootstrap";

const Header = () => {
    return (
        <div className="header-banner">
            <Container className="text-center">
                <img
                    src="/monetide-full.png"  /* Update path as needed */
                    alt="Company Logo"
                    className="header-logo"
                />
            </Container>
        </div>
    );
};

export default Header;
