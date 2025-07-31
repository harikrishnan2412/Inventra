import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();

  const statsData = [
    { title: 'Total Sales', value: '$45,231.89', change: '+20.1%', icon: '💰' },
    { title: 'Orders', value: '127', change: '+15%', icon: '🛒' },
    { title: 'Products', value: '1,234', change: '+5', icon: '📦' },
    { title: 'Low Stock Alert', value: '3', change: 'Items need restocking', icon: '⚠️' }
  ];

  const topProducts = [
    { name: "iPhone 14", sold: 45, revenue: "$45,000" },
    { name: "Samsung Galaxy S23", sold: 32, revenue: "$28,800" },
    { name: "MacBook Pro", sold: 18, revenue: "$36,000" },
    { name: "AirPods Pro", sold: 67, revenue: "$16,750" }
  ];

  const lowStockItems = [
    { name: "iPhone 14", current: 5, minimum: 10 },
    { name: "Gaming Headset", current: 2, minimum: 8 },
    { name: "Wireless Charger", current: 3, minimum: 15 }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {user.name}! Here's your business overview.</p>
        </div>
        <button className="generate-report-btn">Generate Report</button>
      </div>

      <div className="stats-grid">
        {statsData.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <span className="stat-title">{stat.title}</span>
              <span className="stat-icon">{stat.icon}</span>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-change">{stat.change}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Top Selling Products</h3>
            <p>Best performers this month</p>
          </div>
          <div className="card-content">
            {topProducts.map((product, index) => (
              <div key={index} className="product-item">
                <div className="product-info">
                  <div className="product-name">{product.name}</div>
                  <div className="product-sold">{product.sold} units sold</div>
                </div>
                <div className="product-revenue">{product.revenue}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>⚠️ Low Stock Alerts</h3>
            <p>Items that need immediate attention</p>
          </div>
          <div className="card-content">
            {lowStockItems.map((item, index) => (
              <div key={index} className="stock-item">
                <div className="stock-info">
                  <div className="stock-name">{item.name}</div>
                  <div className="stock-details">Current: {item.current} | Min: {item.minimum}</div>
                </div>
                <div className="stock-badge">{item.current}/{item.minimum}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;