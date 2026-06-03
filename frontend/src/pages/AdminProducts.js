import React, { useState } from "react";
import axios from "axios";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const API_URL = "http://localhost:5000/api";

function AdminProducts({ products, fetchProducts, token }) {
  const emptyForm = {
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    stock: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const categoryCounts = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});

  const topStockProducts = [...products]
    .sort((a, b) => Number(b.stock || 0) - Number(a.stock || 0))
    .slice(0, 10);

  const topPriceProducts = [...products]
    .sort((a, b) => Number(b.price || 0) - Number(a.price || 0))
    .slice(0, 10);

  const totalStock = products.reduce(
    (total, product) => total + Number(product.stock || 0),
    0
  );

  const inventoryValue = products.reduce(
    (total, product) =>
      total + Number(product.price || 0) * Number(product.stock || 0),
    0
  );

  const categoryChartData = {
    labels: Object.keys(categoryCounts),
    datasets: [
      {
        label: "Products by Category",
        data: Object.values(categoryCounts),
        backgroundColor: [
          "#2563eb",
          "#16a34a",
          "#f59e0b",
          "#dc2626",
          "#7c3aed",
          "#0891b2",
          "#e11d48",
          "#65a30d",
          "#9333ea",
          "#ea580c",
        ],
      },
    ],
  };

  const stockChartData = {
    labels: topStockProducts.map((p) => p.name),
    datasets: [
      {
        label: "Stock Quantity",
        data: topStockProducts.map((p) => Number(p.stock || 0)),
        backgroundColor: "#2563eb",
      },
    ],
  };

  const priceChartData = {
    labels: topPriceProducts.map((p) => p.name),
    datasets: [
      {
        label: "Product Price",
        data: topPriceProducts.map((p) => Number(p.price || 0)),
        backgroundColor: "#16a34a",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addProduct = async () => {
    try {
      await axios.post(`${API_URL}/products`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Product added successfully");
      setForm(emptyForm);
      fetchProducts();
    } catch (error) {
      alert("Add product failed");
      console.log(error);
    }
  };

  const startEdit = (product) => {
    setEditId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
      stock: product.stock,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateProduct = async () => {
    try {
      await axios.put(`${API_URL}/products/${editId}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Product updated successfully");
      setEditId(null);
      setForm(emptyForm);
      fetchProducts();
    } catch (error) {
      alert("Update failed");
      console.log(error);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(`${API_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      alert("Delete failed");
      console.log(error);
    }
  };

  return (
    <section style={sectionStyle}>
      <h2>Admin Product Management</h2>

      <div style={statsGridStyle}>
        <StatCard title="Total Products" value={products.length} bg="#2563eb" />
        <StatCard title="Total Stock" value={totalStock} bg="#16a34a" />
        <StatCard
          title="Categories"
          value={Object.keys(categoryCounts).length}
          bg="#7c3aed"
        />
        <StatCard
          title="Inventory Value"
          value={`₹${inventoryValue}`}
          bg="#e11d48"
        />
      </div>

      <div style={chartsGridStyle}>
        <div style={chartCardStyle}>
          <h3>Products by Category</h3>
          <Pie data={categoryChartData} options={chartOptions} />
        </div>

        <div style={chartCardStyle}>
          <h3>Top 10 Stock Products</h3>
          <Bar data={stockChartData} options={chartOptions} />
        </div>

        <div style={chartCardStyle}>
          <h3>Top 10 Expensive Products</h3>
          <Bar data={priceChartData} options={chartOptions} />
        </div>
      </div>

      <h2>Add / Edit Product</h2>

      <div style={formGridStyle}>
        {Object.keys(form).map((field) => (
          <input
            key={field}
            name={field}
            type={field === "price" || field === "stock" ? "number" : "text"}
            placeholder={field}
            value={form[field]}
            onChange={handleChange}
            style={inputStyle}
          />
        ))}
      </div>

      {editId ? (
        <>
          <button onClick={updateProduct} style={buttonStyle("#2563eb")}>
            Update Product
          </button>
          <button
            onClick={() => {
              setEditId(null);
              setForm(emptyForm);
            }}
            style={buttonStyle("#6b7280")}
          >
            Cancel Edit
          </button>
        </>
      ) : (
        <button onClick={addProduct} style={buttonStyle("#16a34a")}>
          Add Product
        </button>
      )}

      <h3>Total Products: {products.length}</h3>

      <div style={productGridStyle}>
        {products.map((product) => (
          <div key={product._id} style={cardStyle}>
            <img src={product.image} alt={product.name} style={imageStyle} />
            <h3>{product.name}</h3>
            <p>{product.category}</p>
            <p>Stock: {product.stock}</p>
            <h3>₹{product.price}</h3>

            <button onClick={() => startEdit(product)} style={buttonStyle("#f59e0b")}>
              Edit
            </button>

            <button onClick={() => deleteProduct(product._id)} style={buttonStyle("#dc2626")}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatCard({ title, value, bg }) {
  return (
    <div style={{ ...statCardStyle, backgroundColor: bg }}>
      <h3>{title}</h3>
      <h2>{value}</h2>
    </div>
  );
}

const sectionStyle = {
  backgroundColor: "white",
  margin: "40px",
  padding: "25px",
  borderRadius: "12px",
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
  marginBottom: "25px",
};

const statCardStyle = {
  color: "white",
  padding: "22px",
  borderRadius: "14px",
  textAlign: "center",
};

const chartsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "25px",
  marginBottom: "35px",
};

const chartCardStyle = {
  backgroundColor: "#f9fafb",
  padding: "20px",
  borderRadius: "14px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

const formGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "12px",
  marginBottom: "15px",
};

const inputStyle = {
  padding: "12px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const productGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 280px))",
  gap: "20px",
  marginTop: "25px",
};

const cardStyle = {
  backgroundColor: "#f9fafb",
  padding: "15px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

const imageStyle = {
  width: "100%",
  height: "170px",
  objectFit: "cover",
  borderRadius: "10px",
};

const buttonStyle = (bg) => ({
  backgroundColor: bg,
  color: "white",
  border: "none",
  padding: "10px",
  borderRadius: "8px",
  cursor: "pointer",
  width: "100%",
  marginBottom: "8px",
});

export default AdminProducts;