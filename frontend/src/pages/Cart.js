import React, { useState } from "react";

function Cart({ cart, increaseQuantity, decreaseQuantity, checkout, darkMode }) {
  const [showPaymentBox, setShowPaymentBox] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Paytm");

  const totalAmount = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const confirmPayment = () => {
    alert(`Payment successful using ${paymentMethod}`);
    setShowPaymentBox(false);
    checkout();
  };

  return (
    <section style={sectionStyle(darkMode)}>
      <h2>Shopping Cart</h2>

      {cart.length === 0 ? (
        <p>No items in cart.</p>
      ) : (
        cart.map((item) => (
          <div key={item._id} style={cartRowStyle(darkMode)}>
            <div>
              <strong>{item.name}</strong>
              <p>₹{item.price} × {item.quantity}</p>
            </div>

            <div>
              <button onClick={() => decreaseQuantity(item._id)} style={qtyButtonStyle}>
                -
              </button>
              <button onClick={() => increaseQuantity(item._id)} style={qtyButtonStyle}>
                +
              </button>
            </div>
          </div>
        ))
      )}

      <h2>Total Amount: ₹{totalAmount}</h2>

      <button
        onClick={() => {
          if (cart.length === 0) {
            alert("Your cart is empty.");
            return;
          }
          setShowPaymentBox(true);
        }}
        style={buttonStyle}
      >
        Proceed to Payment
      </button>

      {showPaymentBox && (
        <div style={paymentOverlayStyle}>
          <div style={paymentBoxStyle(darkMode)}>
            <button
              onClick={() => setShowPaymentBox(false)}
              style={closeButtonStyle}
            >
              ×
            </button>

            <h2>Select Payment Method</h2>
            <p>Total Payable: ₹{totalAmount}</p>

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={inputStyle}
            >
              <option value="Paytm">Paytm</option>
              <option value="PhonePe">PhonePe</option>
              <option value="Google Pay">Google Pay</option>
              <option value="Credit/Debit Card">Credit/Debit Card</option>
              <option value="Cash on Delivery">Cash on Delivery</option>
            </select>

            <button onClick={confirmPayment} style={payButtonStyle}>
              Confirm Payment
            </button>

            <button
              onClick={() => setShowPaymentBox(false)}
              style={cancelButtonStyle}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

const sectionStyle = (darkMode) => ({
  backgroundColor: darkMode ? "#1e293b" : "white",
  color: darkMode ? "white" : "black",
  margin: "40px",
  padding: "25px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
});

const cartRowStyle = (darkMode) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: darkMode ? "1px solid #475569" : "1px solid #ddd",
  padding: "12px 0",
  flexWrap: "wrap",
  gap: "10px",
});

const qtyButtonStyle = {
  padding: "8px 14px",
  marginLeft: "8px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  backgroundColor: "#2563eb",
  color: "white",
};

const buttonStyle = {
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  padding: "12px",
  borderRadius: "8px",
  cursor: "pointer",
  width: "100%",
  marginBottom: "8px",
};

const paymentOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.65)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const paymentBoxStyle = (darkMode) => ({
  position: "relative",
  width: "420px",
  maxWidth: "90%",
  backgroundColor: darkMode ? "#1e293b" : "white",
  color: darkMode ? "white" : "black",
  padding: "30px",
  borderRadius: "18px",
  boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
});

const closeButtonStyle = {
  position: "absolute",
  top: "12px",
  right: "16px",
  background: "transparent",
  border: "none",
  fontSize: "28px",
  cursor: "pointer",
  color: "#dc2626",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  boxSizing: "border-box",
};

const payButtonStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  marginBottom: "10px",
};

const cancelButtonStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#6b7280",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

export default Cart;