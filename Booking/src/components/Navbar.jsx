import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { UserContext } from "./UserContext";
const Navbar = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  
  function handleLogout() {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
    setShowDropdown(false);
  }
  return (
    <nav className="navbar">
      <h1>Hotel Booking</h1>
      <ul>
        <li>
          <Link to="">Home</Link>
        </li>
        <li>
          <Link to="all-rooms">All Rooms</Link>
        </li>
        {user == null ? null : (
          <li>
            <Link to="my-bookings">My Bookings</Link>
          </li>
        )}
        {user == null ? (
          <li>
            <Link to="auth">Login</Link>
          </li>
        ) : (
          <li className="user-dropdown">
            <button 
              className="user-button"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {user.user.full_name || user.user.username || user.user.email}
            </button>
            {showDropdown && (
              <div className="dropdown-menu">
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
