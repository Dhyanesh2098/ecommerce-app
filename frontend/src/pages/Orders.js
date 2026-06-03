import React from "react";

function Orders({ orders }) {
  return (
    <section style={sectionStyle}>
      <h2>Order History</h2>

      {orders.length === 0 ? (
        <p>No orders placed yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} style={orderCardStyle}>
            <h3>Order ID: {order.id}</h3>
            <p><strong>Date:</strong> {order.date}</p>
            <p><strong>Status:</strong> {order.status || "Pending"}</p>
            <p><strong>Total:</strong> ₹{order.total}</p>

            {order.items.map((item, index) => (
              <p key={index}>
                {item.name || item.productId?.name || "Product"} — Quantity: {item.quantity}
              </p>
            ))}
          </div>
        ))
      )}
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

const orderCardStyle = {
  border: "1px solid #ddd",
  padding: "18px",
  borderRadius: "10px",
  marginBottom: "15px",
  backgroundColor: "#f9fafb",
};

export default Orders;