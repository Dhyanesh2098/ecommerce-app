import React, { useState } from "react";

const PRODUCTS_PER_PAGE = 12;

function Home({
  products,
  cart,
  wishlist,
  orders,
  addToCart,
  toggleWishlist,
  darkMode,
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const totalCost = orders.reduce((total, order) => total + order.total, 0);
  const categories = ["All", ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((product) => {
    return (
      product.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "All" || product.category === category)
    );
  });

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE
  );

  return (
    <>
      <section style={heroStyle(darkMode)}>
        <h1 style={heroTitleStyle}>Dhyanesh E-Commerce Store</h1>
      </section>

      <section style={sectionStyle(darkMode)}>
        <h2>Dashboard</h2>

        <div style={dashboardGridStyle}>
          <DashboardCard title="Orders Placed" value={orders.length} bg="#7c3aed" />
          <DashboardCard title="Total Cost" value={`₹${totalCost}`} bg="#16a34a" />
          <DashboardCard
            title="Cart Items"
            value={cart.reduce((total, item) => total + item.quantity, 0)}
            bg="#2563eb"
          />
          <DashboardCard title="Wishlist Items" value={wishlist.length} bg="#e11d48" />
        </div>
      </section>

      <section style={filterStyle}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          style={inputStyle}
        />

        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setCurrentPage(1);
          }}
          style={inputStyle}
        >
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </section>

      <div style={productGridStyle}>
        {paginatedProducts.map((product) => {
          const wished = wishlist.some((item) => item._id === product._id);

          return (
            <div key={product._id} style={cardStyle(darkMode)}>
              <img src={product.image} alt={product.name} style={imageStyle} />

              <h3>{product.name}</h3>
              <p>{product.description}</p>

              <p>
                <strong>Rating:</strong>{" "}
                ⭐ {product.averageRating ? product.averageRating.toFixed(1) : "0.0"} / 5
              </p>

              <p>
                <strong>Reviews:</strong> {product.totalReviews || 0}
              </p>

              <p><strong>Category:</strong> {product.category}</p>
              <p><strong>Stock:</strong> {product.stock}</p>
              <h2>₹{product.price}</h2>

              <button onClick={() => setSelectedProduct(product)} style={buttonStyle("#111827")}>
                View Details
              </button>

              <button onClick={() => addToCart(product)} style={buttonStyle("#2563eb")}>
                Add to Cart
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                style={buttonStyle(wished ? "#dc2626" : "#f59e0b")}
              >
                {wished ? "Remove Wishlist" : "Add to Wishlist"}
              </button>
            </div>
          );
        })}
      </div>

      <section style={{ textAlign: "center", margin: "25px" }}>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => setCurrentPage(index + 1)}
            style={{
              margin: "5px",
              padding: "10px 15px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              backgroundColor: currentPage === index + 1 ? "#2563eb" : "#d1d5db",
              color: currentPage === index + 1 ? "white" : "black",
            }}
          >
            {index + 1}
          </button>
        ))}
      </section>

      {selectedProduct && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle(darkMode)}>
            <button
              onClick={() => setSelectedProduct(null)}
              style={modalCloseButtonStyle}
            >
              ×
            </button>

            <h2>Product Details</h2>

            <div style={{ display: "flex", gap: "25px", flexWrap: "wrap" }}>
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                style={{
                  width: "300px",
                  height: "250px",
                  objectFit: "cover",
                  borderRadius: "12px",
                }}
              />

              <div style={{ flex: 1 }}>
                <h2>{selectedProduct.name}</h2>
                <p>{selectedProduct.description}</p>
                <p><strong>Category:</strong> {selectedProduct.category}</p>
                <p><strong>Stock:</strong> {selectedProduct.stock}</p>
                <p>
                  <strong>Average Rating:</strong>{" "}
                  ⭐ {selectedProduct.averageRating ? selectedProduct.averageRating.toFixed(1) : "0.0"} / 5
                </p>
                <p><strong>Total Reviews:</strong> {selectedProduct.totalReviews || 0}</p>
                <h2>₹{selectedProduct.price}</h2>

                <button onClick={() => addToCart(selectedProduct)} style={buttonStyle("#2563eb")}>
                  Add to Cart
                </button>
              </div>
            </div>

            <div style={reviewBoxStyle(darkMode)}>
              <h3>Customer Reviews</h3>

              {!selectedProduct.reviews || selectedProduct.reviews.length === 0 ? (
                <p>No reviews yet. Reviews can be added after checkout.</p>
              ) : (
                selectedProduct.reviews.map((review, index) => (
                  <div key={index} style={singleReviewStyle(darkMode)}>
                    <strong>{review.user}</strong>
                    <p>⭐ {review.rating} / 5</p>
                    <p>{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DashboardCard({ title, value, bg }) {
  return (
    <div style={{ ...dashboardCardStyle, background: bg }}>
      <h3>{title}</h3>
      <h2>{value}</h2>
    </div>
  );
}

const heroStyle = (darkMode) => ({
  textAlign: "center",
  padding: "60px 20px",
  background: darkMode
    ? "linear-gradient(135deg, #0f172a, #1e1b4b, #312e81)"
    : "linear-gradient(135deg, #dbeafe, #fdf2f8, #ffedd5)",
});

const heroTitleStyle = {
  fontSize: "36px",
  fontWeight: "bold",
  background: "linear-gradient(135deg, #2563eb, #7c3aed, #e11d48)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const sectionStyle = (darkMode) => ({
  backgroundColor: darkMode ? "#1e293b" : "white",
  color: darkMode ? "white" : "black",
  margin: "40px",
  padding: "25px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
});

const dashboardGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
  marginTop: "20px",
};

const dashboardCardStyle = {
  color: "white",
  padding: "25px",
  borderRadius: "14px",
  textAlign: "center",
};

const filterStyle = {
  display: "flex",
  justifyContent: "center",
  gap: "15px",
  flexWrap: "wrap",
  padding: "25px",
};

const inputStyle = {
  padding: "12px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  width: "250px",
  margin: "8px",
};

const productGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 300px))",
  justifyContent: "center",
  gap: "25px",
  padding: "20px 40px",
};

const cardStyle = (darkMode) => ({
  backgroundColor: darkMode ? "#1e293b" : "white",
  color: darkMode ? "white" : "black",
  borderRadius: "12px",
  padding: "18px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
});

const imageStyle = {
  width: "100%",
  height: "200px",
  objectFit: "cover",
  borderRadius: "10px",
};

const reviewBoxStyle = (darkMode) => ({
  marginTop: "25px",
  padding: "20px",
  borderRadius: "12px",
  backgroundColor: darkMode ? "#0f172a" : "#f9fafb",
  border: darkMode ? "1px solid #334155" : "1px solid #e5e7eb",
});

const singleReviewStyle = (darkMode) => ({
  padding: "12px",
  marginBottom: "10px",
  borderRadius: "8px",
  backgroundColor: darkMode ? "#1e293b" : "white",
  border: darkMode ? "1px solid #334155" : "1px solid #e5e7eb",
});

const modalOverlayStyle = {
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

const modalBoxStyle = (darkMode) => ({
  position: "relative",
  width: "850px",
  maxWidth: "92%",
  maxHeight: "85vh",
  overflowY: "auto",
  backgroundColor: darkMode ? "#1e293b" : "white",
  color: darkMode ? "white" : "black",
  padding: "30px",
  borderRadius: "18px",
  boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
});

const modalCloseButtonStyle = {
  position: "absolute",
  top: "12px",
  right: "18px",
  background: "transparent",
  border: "none",
  color: "#dc2626",
  fontSize: "30px",
  cursor: "pointer",
};

const buttonStyle = (bg) => ({
  backgroundColor: bg,
  color: "white",
  border: "none",
  padding: "12px",
  borderRadius: "8px",
  cursor: "pointer",
  width: "100%",
  marginBottom: "8px",
});

export default Home;