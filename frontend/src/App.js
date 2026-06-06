import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import AdminProducts from "./pages/AdminProducts";

const API_URL = "https://ecommerce-backend-3rfp.onrender.com/api";

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("cart")) || []);
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem("wishlist")) || []);
  const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem("orders")) || []);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });

  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const [reviewProductId, setReviewProductId] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const fetchProducts = useCallback(async () => {
    const res = await axios.get(`${API_URL}/products`);
    setProducts(res.data);
  }, []);

  const fetchMyOrders = useCallback(async () => {
    if (!token) return;

    try {
      const res = await axios.get(`${API_URL}/orders/myorders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formattedOrders = res.data.map((order) => ({
        id: order._id,
        date: new Date(order.createdAt).toLocaleString(),
        items: order.products,
        total: order.totalAmount,
        status: order.status,
      }));

      setOrders(formattedOrders);
    } catch (error) {
      console.log(error);
    }
  }, [token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const registerUser = async () => {
    try {
      await axios.post(`${API_URL}/auth/register`, authForm);
      alert("Registration successful. Please login.");
      setAuthMode("login");
      setAuthForm({ name: "", email: "", password: "" });
    } catch (error) {
      alert("Registration failed. User may already exist.");
      console.log(error);
    }
  };

  const loginUser = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email: authForm.email,
        password: authForm.password,
      });

      const loggedUser = res.data.user || {
        name: res.data.name || "User",
        email: res.data.email || authForm.email,
        role: res.data.role || "user",
      };

      setToken(res.data.token);
      setUser(loggedUser);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(loggedUser));

      alert("Login successful!");
      setAuthForm({ name: "", email: "", password: "" });
    } catch (error) {
      alert("Login failed. Check email or password.");
      console.log(error);
    }
  };

  const logoutUser = () => {
    setUser(null);
    setToken("");
    setOrders([]);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("Logged out successfully.");
  };

  const addToCart = (product) => {
    const existing = cart.find((item) => item._id === product._id);

    if (existing) {
      setCart(
        cart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const toggleWishlist = (product) => {
    const exists = wishlist.find((item) => item._id === product._id);

    if (exists) {
      setWishlist(wishlist.filter((item) => item._id !== product._id));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  const increaseQuantity = (id) => {
    setCart(
      cart.map((item) =>
        item._id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart(
      cart
        .map((item) =>
          item._id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const totalAmount = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const checkout = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return false;
    }

    if (!token) {
      alert("Please login before checkout.");
      return false;
    }

    try {
      const orderData = {
        products: cart.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
        })),
        totalAmount,
      };

      const res = await axios.post(`${API_URL}/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const cartCopy = [...cart];

      const newOrder = {
        id: res.data._id,
        date: new Date(res.data.createdAt).toLocaleString(),
        items: cartCopy,
        total: res.data.totalAmount,
        status: res.data.status,
      };

      setOrders([newOrder, ...orders]);
      setPurchasedProducts(cartCopy);
      setReviewProductId(cartCopy[0]?._id || "");
      setCart([]);

      setTimeout(() => {
        setShowReviewPopup(true);
      }, 3000);

      return true;
    } catch (error) {
      alert("Order failed.");
      console.log(error);
      return false;
    }
  };

  const submitReviewFromPopup = async () => {
    if (!reviewProductId) {
      alert("Please select a product.");
      return;
    }

    if (!reviewComment.trim()) {
      alert("Please write your review or close this box if you want to skip.");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/products/${reviewProductId}/reviews`,
        {
          rating: Number(reviewRating),
          comment: reviewComment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Review submitted successfully!");
      setReviewComment("");
      setReviewRating(5);
      setShowReviewPopup(false);
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || "Review submission failed.");
      console.log(error);
    }
  };

  if (!user) {
    return (
      <div style={authPageStyle}>
        <div style={authLeftStyle}>
          <h1 style={{ fontSize: "42px", marginBottom: "10px" }}>ShopSphere</h1>
          <h2>Your One-Stop Shopping Destination</h2>

          <p style={{ fontSize: "18px", lineHeight: "1.8" }}>
            Discover premium products, save your favorite items, enjoy a seamless
            shopping experience, and track your orders with ease.
          </p>

          <div style={authFeatureBoxStyle}>
            <h3>Why Shop With Us?</h3>
            <p>🛍️ Premium Quality Products</p>
            <p>❤️ Save Your Favorites to Wishlist</p>
            <p>🚚 Fast & Reliable Delivery</p>
            <p>🔒 Safe & Secure Shopping</p>
          </div>
        </div>

        <div style={authCardStyle}>
          <h2 style={{ textAlign: "center" }}>
            {authMode === "login" ? "Welcome Back" : "Create Account"}
          </h2>

          {authMode === "register" && (
            <input
              type="text"
              placeholder="Full Name"
              value={authForm.name}
              onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
              style={authInputStyle}
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={authForm.email}
            onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
            style={authInputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            value={authForm.password}
            onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
            style={authInputStyle}
          />

          <button
            onClick={authMode === "login" ? loginUser : registerUser}
            style={authButtonStyle}
          >
            {authMode === "login" ? "Login" : "Register"}
          </button>

          <button
            onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
            style={authSwitchButtonStyle}
          >
            {authMode === "login"
              ? "New user? Create account"
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === "admin";

  return (
    <BrowserRouter>
      <div
        style={{
          fontFamily: "Arial",
          backgroundColor: darkMode ? "#0f172a" : "#f4f6f8",
          color: darkMode ? "white" : "black",
          minHeight: "100vh",
        }}
      >
        <nav style={navStyle}>
          <h2>ShopSphere</h2>

          <div style={{ display: "flex", gap: "18px", flexWrap: "wrap", alignItems: "center" }}>
            <Link to="/" style={linkStyle}>Products</Link>
            <Link to="/orders" style={linkStyle}>Orders</Link>
            <Link to="/cart" style={linkStyle}>Cart</Link>
            <Link to="/wishlist" style={linkStyle}>Wishlist</Link>
            <Link to="/profile" style={linkStyle}>Profile</Link>

            {isAdmin && <Link to="/admin" style={linkStyle}>Admin</Link>}

            <strong>Cart: {cart.reduce((total, item) => total + item.quantity, 0)}</strong>
            <strong>Wishlist: {wishlist.length}</strong>
            <strong>{user.name || "User"}</strong>

            <button
              onClick={() => setDarkMode(!darkMode)}
              style={smallButtonStyle(darkMode ? "#f59e0b" : "#2563eb")}
            >
              {darkMode ? "☀ Light" : "🌙 Dark"}
            </button>

            <button onClick={logoutUser} style={smallButtonStyle("#dc2626")}>
              Logout
            </button>
          </div>
        </nav>

        <Routes>
          <Route
            path="/"
            element={
              <Home
                products={products}
                cart={cart}
                wishlist={wishlist}
                orders={orders}
                addToCart={addToCart}
                toggleWishlist={toggleWishlist}
                darkMode={darkMode}
              />
            }
          />

          <Route
            path="/cart"
            element={
              <Cart
                cart={cart}
                increaseQuantity={increaseQuantity}
                decreaseQuantity={decreaseQuantity}
                checkout={checkout}
                darkMode={darkMode}
              />
            }
          />

          <Route
            path="/wishlist"
            element={
              <Wishlist
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
                addToCart={addToCart}
              />
            }
          />

          <Route path="/orders" element={<Orders orders={orders} />} />

          <Route
            path="/profile"
            element={
              <Profile
                user={user}
                cart={cart}
                wishlist={wishlist}
                orders={orders}
                logoutUser={logoutUser}
              />
            }
          />

          <Route
            path="/admin"
            element={
              isAdmin ? (
                <AdminProducts
                  products={products}
                  fetchProducts={fetchProducts}
                  token={token}
                />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        {showReviewPopup && (
          <div style={popupOverlayStyle}>
            <div style={popupBoxStyle(darkMode)}>
              <button
                onClick={() => setShowReviewPopup(false)}
                style={popupCloseButtonStyle}
              >
                ×
              </button>

              <h2>Rate Your Purchase</h2>
              <p>This is optional. You can close this box if you don’t want to review now.</p>

              <select
                value={reviewProductId}
                onChange={(e) => setReviewProductId(e.target.value)}
                style={popupInputStyle}
              >
                {purchasedProducts.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>

              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(e.target.value)}
                style={popupInputStyle}
              >
                <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
                <option value="4">⭐⭐⭐⭐ 4 - Very Good</option>
                <option value="3">⭐⭐⭐ 3 - Good</option>
                <option value="2">⭐⭐ 2 - Average</option>
                <option value="1">⭐ 1 - Poor</option>
              </select>

              <textarea
                placeholder="Write your review..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                style={popupTextareaStyle}
              />

              <button onClick={submitReviewFromPopup} style={popupSubmitButtonStyle}>
                Submit Review
              </button>

              <button
                onClick={() => setShowReviewPopup(false)}
                style={popupSkipButtonStyle}
              >
                Skip for Now
              </button>
            </div>
          </div>
        )}

        <footer style={footerStyle}>
          <h3>ShopSphere</h3>
          <p>Professional E-Commerce Web Application</p>
          <p>Built by Dhyanesh</p>
          <p>© 2026 Dhyanesh E-Commerce Store. All Rights Reserved.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

const authPageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "40px",
  padding: "30px",
  fontFamily: "Arial",
  background: "linear-gradient(135deg, #2563eb, #7c3aed, #f97316)",
  color: "white",
  flexWrap: "wrap",
};

const authLeftStyle = {
  maxWidth: "480px",
};

const authFeatureBoxStyle = {
  background: "rgba(255,255,255,0.15)",
  padding: "20px",
  borderRadius: "16px",
  marginTop: "25px",
};

const authCardStyle = {
  background: "white",
  color: "#111827",
  width: "360px",
  padding: "30px",
  borderRadius: "20px",
  boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
};

const authInputStyle = {
  width: "100%",
  padding: "14px",
  marginBottom: "14px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  fontSize: "15px",
  boxSizing: "border-box",
};

const authButtonStyle = {
  width: "100%",
  padding: "14px",
  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "16px",
  marginBottom: "10px",
};

const authSwitchButtonStyle = {
  width: "100%",
  padding: "12px",
  background: "#111827",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
};

const navStyle = {
  backgroundColor: "#111827",
  color: "white",
  padding: "18px 40px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  position: "sticky",
  top: 0,
  zIndex: 10,
};

const linkStyle = {
  color: "white",
  textDecoration: "none",
};

const smallButtonStyle = (bg) => ({
  backgroundColor: bg,
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: "6px",
  cursor: "pointer",
});

const popupOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const popupBoxStyle = (darkMode) => ({
  position: "relative",
  width: "420px",
  maxWidth: "90%",
  backgroundColor: darkMode ? "#1e293b" : "white",
  color: darkMode ? "white" : "black",
  padding: "30px",
  borderRadius: "18px",
  boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
});

const popupCloseButtonStyle = {
  position: "absolute",
  top: "12px",
  right: "16px",
  background: "transparent",
  border: "none",
  fontSize: "28px",
  cursor: "pointer",
  color: "#dc2626",
};

const popupInputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  boxSizing: "border-box",
};

const popupTextareaStyle = {
  width: "100%",
  minHeight: "90px",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  boxSizing: "border-box",
};

const popupSubmitButtonStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  marginBottom: "10px",
};

const popupSkipButtonStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#6b7280",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const footerStyle = {
  backgroundColor: "#111827",
  color: "white",
  textAlign: "center",
  padding: "30px",
  marginTop: "40px",
};

export default App;