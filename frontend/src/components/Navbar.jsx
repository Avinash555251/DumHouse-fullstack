import { Link, useNavigate } from "react-router-dom";

import logo from "../assets/logo.png";

import {
  Home,
  UtensilsCrossed,
  ShoppingCart,
  User,
} from "lucide-react";

import "./Navbar.css";

function Navbar({cartCount,isLoggedIn,customer,onLogout}) {

  const navigate = useNavigate();

  return (
    <nav className="navbar">

      {/* LOGO */}

      <div
        className="nav-logo"
        onClick={() => navigate("/")}
      >

        <div className="logo-image">
          <img
            src={logo}
            alt="Dum House Logo"
          />
        </div>

        <div className="logo-content">
          <h2>Dum House</h2>
          <span>Authentic Biryani</span>
        </div>

      </div>


      {/* HOME + MENU */}

      <div className="nav-links">

        <Link
          to="/"
          className="nav-link"
        >
          <Home size={19} />
          <span>Home</span>
        </Link>

        <Link
          to="/menu"
          className="nav-link"
        >
          <UtensilsCrossed size={19} />
          <span>Menu</span>
        </Link>

      </div>


      {/* RIGHT */}

      <div className="nav-right">

        <Link
          to="/cart"
          className="cart-btn"
        >

          <ShoppingCart size={20} />

          <span>Cart</span>

          {cartCount > 0 && (
            <span className="cart-count">
              {cartCount}
            </span>
          )}

        </Link>


        {isLoggedIn ? (

          <Link
            to="/profile"
            className="profile-btn"
          >

            <User size={20} />

            <span>
              {customer?.name || "Profile"}
            </span>

          </Link>

        ) : (

          <Link
            to="/login"
            className="login-btn"
          >
            Login
          </Link>

        )}

      </div>

    </nav>
  );
}

export default Navbar;