import React from 'react';
import { Link } from 'react-router-dom';
import { Nav } from 'react-bootstrap';

const Menu: React.FC = () => {
  return (
    <Nav className="mr-auto">
      <Nav.Link as={Link} to="/summary" className="nav-link">
        Summary
      </Nav.Link>
      <Nav.Link as={Link} to="/forecast" className="nav-link">
        Forecast
      </Nav.Link>
      <Nav.Link as={Link} to="/generate" className="nav-link">
        Generate
      </Nav.Link>
    </Nav>
  );
};

export default Menu; 