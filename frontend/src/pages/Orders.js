import React, { useEffect, useState } from "react";

function Orders({ orders }) {
  const [, setTimeTick] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTick(Date.now());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getOrderTime = (dateString) => {
    if (!dateString) return null;

    const [datePart, timePart] = dateString.split(",");
    if (!datePart || !timePart) return null;

    const [day, month, year] = datePart.trim().split("/");
    const [hours, minutes, seconds] = timePart.trim().split(":");

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hours),
      Number(minutes),
      Number(seconds || 0)
    );
  };

  const getLiveStatus = (order) => {
    const orderTime = getOrderTime(order.date);
    if (!orderTime) return order.status || "Processing";

    const minutesPassed = Math.floor((Date.now() - orderTime.getTime()) / 60000);

    if (minutesPassed >= 30) return "Delivered";
    if (minutesPassed >= 10) return "Shipped";
    return "Processing";
  };

  const getRemainingTime = (order) => {
    const orderTime = getOrderTime(order.date);
    if (!orderTime) return "30 minutes";

    const minutesPassed = Math.floor((Date.now() - orderTime.getTime()) / 60000);
    const remaining = 30 - minutesPassed;

    if (remaining <= 0) return "Delivered";
    return `${remaining} minutes remaining`;
  };

  return (
    <section style={sectionStyle}>
      <h2>Order History</h2>

      {orders.length === 0 ? (
        <p>No orders placed yet.</p>
      ) : (
        orders.map((order) => {
          const liveStatus = getLiveStatus(order);

          return (
            <div key={order.id} style={orderCardStyle}>
              <h3>Order ID: {order.id}</h3>

              <p>
                <strong>Date:</strong> {order.date}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <span style={statusBadgeStyle(liveStatus)}>
                  {liveStatus}
                </span>
              </p>

              <p>
                <strong>Estimated Delivery:</strong> 30 minutes
              </p>

              <p>
                <strong>Delivery Time Left:</strong> {getRemainingTime(order)}
              </p>

              <div style={trackerStyle}>
                <span style={stepStyle(true)}>✓ Processing</span>
                <span style={stepStyle(liveStatus === "Shipped" || liveStatus === "Delivered")}>
                  ✓ Shipped
                </span>
                <span style={stepStyle(liveStatus === "Delivered")}>
                  ✓ Delivered
                </span>
              </div>

              <p>
                <strong>Total:</strong> ₹{order.total}
              </p>

              {order.items.map((item, index) => (
                <p key={index}>
                  {item.name || item.productId?.name || item.product?.name || "Product"} — Quantity:{" "}
                  {item.quantity}
                </p>
              ))}
            </div>
          );
        })
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

const statusBadgeStyle = (status) => ({
  backgroundColor:
    status === "Delivered"
      ? "#16a34a"
      : status === "Shipped"
      ? "#2563eb"
      : "#f59e0b",
  color: "white",
  padding: "6px 12px",
  borderRadius: "20px",
  fontWeight: "bold",
});

const trackerStyle = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  margin: "15px 0",
};

const stepStyle = (active) => ({
  padding: "8px 12px",
  borderRadius: "20px",
  backgroundColor: active ? "#16a34a" : "#d1d5db",
  color: active ? "white" : "black",
  fontWeight: "bold",
});

export default Orders;