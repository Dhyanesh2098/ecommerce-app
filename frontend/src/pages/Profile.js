import React from "react";

function Profile({ user, cart, wishlist, orders, logoutUser }) {
  return (
    <section style={sectionStyle}>
      <h2>User Profile</h2>

      <div style={profileCardStyle}>
        <h3>{user?.name || "User"}</h3>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> {user?.role || "user"}</p>
        <p><strong>Cart Items:</strong> {cart.reduce((total, item) => total + item.quantity, 0)}</p>
        <p><strong>Wishlist Items:</strong> {wishlist.length}</p>
        <p><strong>Total Orders:</strong> {orders.length}</p>

        <button onClick={logoutUser} style={buttonStyle("#dc2626")}>
          Logout
        </button>
      </div>
    </section>
  );
}

const sectionStyle = {
  backgroundColor: "white",
  margin: "40px",
  padding: "25px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

const profileCardStyle = {
  maxWidth: "500px",
  padding: "25px",
  borderRadius: "12px",
  backgroundColor: "#f9fafb",
  border: "1px solid #ddd",
};

const buttonStyle = (bg) => ({
  backgroundColor: bg,
  color: "white",
  border: "none",
  padding: "12px",
  borderRadius: "8px",
  cursor: "pointer",
  width: "100%",
  marginTop: "15px",
});

export default Profile;