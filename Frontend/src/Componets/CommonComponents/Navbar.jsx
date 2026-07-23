import React, { useContext, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../PrivateRouter/AuthContext";
import { StoreContext } from "../../PrivateRouter/StoreContext";
import PageContainer from "./PageContainer";
import { Menu, X, User, Heart, ShoppingCart, Search } from "lucide-react";
import logo from "/images/logo.png";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cart, wishlist } = useContext(StoreContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const cartCount = cart?.length || 0;
  const wishlistCount = wishlist?.length || 0;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <PageContainer>
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-10 w-auto" />
            <span className="text-xl font-bold text-green-800">QTech Solutions</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "text-green-800" : "hover:text-green-800"
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/shop"
              className={({ isActive }) =>
                isActive ? "text-green-800" : "hover:text-green-800"
              }
            >
              Shop
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive ? "text-green-800" : "hover:text-green-800"
              }
            >
              About
            </NavLink>
            <NavLink
              to="/contactus"
              className={({ isActive }) =>
                isActive ? "text-green-800" : "hover:text-green-800"
              }
            >
              Contact
            </NavLink>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2">
              <Search size={18} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search products"
                className="w-64 bg-transparent text-sm outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => navigate("/wishlist")}
              className="relative text-gray-600 hover:text-green-800"
            >
              <Heart size={22} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/cart")}
              className="relative text-gray-600 hover:text-green-800"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] text-white">
                  {cartCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2 text-sm text-gray-700">
              <User size={18} />
              {user ? (
                <button onClick={handleLogout} className="font-semibold hover:text-green-800">
                  Logout
                </button>
              ) : (
                <Link to="/login" className="font-semibold hover:text-green-800">
                  Sign In
                </Link>
              )}
            </div>
          </div>

          <button
            className="md:hidden text-gray-700"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </PageContainer>

      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <div className="flex flex-col gap-2 px-4 py-4 text-sm text-gray-700">
            <NavLink
              to="/"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2 hover:bg-gray-100"
            >
              Home
            </NavLink>
            <NavLink
              to="/shop"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2 hover:bg-gray-100"
            >
              Shop
            </NavLink>
            <NavLink
              to="/about"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2 hover:bg-gray-100"
            >
              About
            </NavLink>
            <NavLink
              to="/contactus"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2 hover:bg-gray-100"
            >
              Contact
            </NavLink>
            <button
              type="button"
              onClick={() => {
                navigate("/wishlist");
                setMobileOpen(false);
              }}
              className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-100"
            >
              <span>Wishlist</span>
              {wishlistCount > 0 && <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] text-white">{wishlistCount}</span>}
            </button>
            <button
              type="button"
              onClick={() => {
                navigate("/cart");
                setMobileOpen(false);
              }}
              className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-100"
            >
              <span>Cart</span>
              {cartCount > 0 && <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] text-white">{cartCount}</span>}
            </button>
            {user ? (
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="rounded-lg bg-green-800 px-3 py-2 text-white"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg bg-green-800 px-3 py-2 text-white text-center"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
