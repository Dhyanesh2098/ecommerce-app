import React from "react";

function Wishlist({ wishlist, toggleWishlist, addToCart }) {
  return (
    <section style={sectionStyle}>
      <h2>Wishlist</h2>

      {wishlist.length === 0 ? (
        <p>No wishlist items.</p>
      ) : (
        wishlist.map((item) => (
          <div key={item._id} style={cartRowStyle}>
            <div>
              <strong>{item.name}</strong>
              <p>₹{item.price}</p>
            </div>

            <div>
              <button onClick={() => addToCart(item)} style={smallButtonStyle("#2563eb")}>
                Add to Cart
              </button>

              <button onClick={() => toggleWishlist(item)} style={smallButtonStyle("#dc2626")}>
                Remove
              </button>
            </div>
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

const cartRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #ddd",
  padding: "12px 0",
  flexWrap: "wrap",
  gap: "10px",
};

const smallButtonStyle = (bg) => ({
  backgroundColor: bg,
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  marginRight: "8px",
});

export default Wishlist;