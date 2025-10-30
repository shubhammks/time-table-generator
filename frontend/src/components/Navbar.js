import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={{ padding: "10px", background: "#eee" }}>
      <Link to="/dashboard" style={{ margin: "0 10px" }}>Dashboard</Link>
      <Link to="/departments" style={{ margin: "0 10px" }}>Departments</Link>
      <Link to="/teachers" style={{ margin: "0 10px" }}>Teachers</Link>
      <Link to="/classes" style={{ margin: "0 10px" }}>Classes</Link>
      <Link to="/logout" style={{ margin: "0 10px" }}>Logout</Link>
    </nav>
  );
};

export default Navbar;
