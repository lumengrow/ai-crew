```javascript
import React, { useState } from 'react';

const PlantShopApp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [formSubmitted, setFormSubmitted] = useState(false);

  const products = [
    {
      id: 1,
      name: 'Monstera Deliciosa',
      price: '$45.99',
      image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 250"%3E%3Crect fill="%23f0f0f0" width="200" height="250"/%3E%3Cellipse cx="100" cy="80" rx="35" ry="45" fill="%2327ae60"/%3E%3Cpath d="M 100 80 Q 130 100 120 140 Q 100 160 80 140 Q 70 100 100 80" fill="%2329b870"/%3E%3Ccircle cx="95" cy="70" r="8" fill="%23229954"/%3E%3Ccircle cx="105" cy="70" r="8" fill="%23229954"/%3E%3Crect x="95" y="125" width="10" height="80" fill="%238b7355"/%3E%3C/svg%3E',
      category: 'Indoor'
    },
    {
      id: 2,
      name: 'Pothos Golden',
      price: '$32.99',
      image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 250"%3E%3Crect fill="%23f0f0f0" width="200" height="250"/%3E%3Cellipse cx="100" cy="100" rx="40" ry="50" fill="%23f4d03f"/%3E%3Cpath d="M 70 120 Q 60 140 70 160 Q 90 175 110 160" fill="%23f9e79f"/%3E%3Cpath d="M 130 120 Q 140 140 130 160 Q 110 175 90 160" fill="%23f9e79f"/%3E%3Crect x="95" y="150" width="10" height="70" fill="%238b7355"/%3E%3C/svg%3E',
      category: 'Hanging'
    },
    {
      id: 3,
      name: 'Snake Plant',
      price: '$38.99',
      image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 250"%3E%3Crect fill="%23f0f0f0" width="200" height="250"/%3E%3Cpath d="M 95 50 L 100 100 L 90 150 L 100 200" stroke="%23186a3b" stroke-width="8" fill="none"/%3E%3Cpath d="M 105 50 L 100 100 L 110 150 L 100 200" stroke="%231e8449" stroke-width="8" fill="none"/%3E%3Cpath d="M 100 80 L 95 120 L 105 160" stroke="%23229954" stroke-width="6" fill="none"/%3E%3Ccircle cx="100" cy="220" r="15" fill="%238b7355"/%3E%3C/svg%3E',
      category: 'Low Maintenance'
    },
    {
      id: 4,
      name: 'Fiddle Leaf Fig',
      price: '$62.99',
      image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 250"%3E%3Crect fill="%23f0f0f0" width="200" height="250"/%3E%3Cellipse cx="70" cy="80" rx="20" ry="35" fill="%232d5016"/%3E%3Cellipse cx="130" cy="100" rx="22" ry="40" fill="%233a6b35"/%3E%3Cellipse cx="100" cy="140" rx="24" ry="45" fill="%23186a3b"/%3E%3Cellipse cx="80" cy="180" rx="20" ry="35" fill="%231e8449"/%3E%3Crect x="95" y="170" width="10" height="60" fill="%238b7355"/%3E%3C/svg%3E',
      category: 'Statement'
    },
    {
      id: 5,
      name: 'Peace Lily',
      price: '$29.99',
      image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 250"%3E%3Crect fill="%23f0f0f0" width="200" height="250"/%3E%3Cpath d="M 100 40 Q 95 80 100 120 Q 105 80 100 40" fill="%23ffffff" stroke="%23ecf0f1" stroke-width="1"/%3E%3Cpath d="M 85 60 Q 80 90 85 130 Q 90 95 85 60" fill="%23ecf0f1"/%3E%3Cpath d="M 115 60 Q 120 90 115 130 Q 110 95 115 60" fill="%23ecf0f1"/%3E%3Cellipse cx="100" cy="145" rx="35" ry="45" fill="%23145a32"/%3E%3Crect x="95" y="155" width="10" height="70" fill="%238b7355"/%3E%3C/svg%3E',
      category: 'Flowering'
    },
    {
      id: 6,
      name: 'ZZ Plant',
      price: '$41.99',
      image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 250"%3E%3Crect fill="%23f0f0f0" width="200" height="250"/%3E%3Cpath d="M 100 50 L 85 90 L 100 110 L 115 90 Z" fill="%231e8449"/%3E%3Cpath d="M 100 110 L 80 150 L 100 170 L 120 150 Z" fill="%23229954"/%3E%3Cpath d="M 100 170 L 85 210 L 100 220 L 115 210 Z" fill="%233a6b35"/%3E%3Ccircle cx="100" cy="225" r="15" fill="%238b7355"/%3E%3C/svg%3E',
      category: 'Succulent'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setFormSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setFormSubmitted(false), 5000);
    }
  };

  return (
    <div className="app">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
          background-color: #fafafa;
        }

        .app {
          width: 100%;
          overflow-x: hidden;
        }

        /* Header Navigation */
        header {
          background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
          color: white;
          padding: 1.5rem 0;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        nav {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 1.8rem;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        nav ul {
          list-style: none;
          display: flex;
          gap: 2rem;
        }

        nav a {
          color: white;
          text-decoration: none;
          font-weight: 500;
          transition: opacity 0.3s ease;
        }

        nav a:hover {
          opacity: 0.8;
        }

        /* Hero Section */
        .hero {
          background: linear-gradient(135deg, rgba(39, 174, 96, 0.8) 0%, rgba(34, 153, 84, 0.8) 100%),
                      url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23f0f0f0;stop-opacity:0.1" /%3E%3Cstop offset="100%25" style="stop-color:%23ffffff;stop-opacity:0.2" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="1200" height="600" fill="url(%23grad)"/%3E%3C/svg%3E');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          color: white;
          padding: 8rem 2rem;
          text-align: center;
          min-height: 600px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .hero h1 {
          font-size: 4rem;
          margin-bottom: 1rem;
          font-weight: 800;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
          letter-spacing: -1px;
        }

        .hero p {
          font-size: 1.5rem;
          margin-bottom: 3rem;
          opacity: 0.95;
          max-width: 600px;
        }

        .cta-button {
          background: white;
          color: #27ae60;
          padding: 1rem 3rem;
          font-size: 1.1rem;
          font-weight: 600;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
          background: #f9f9f9;
        }

        .cta-button:active {
          transform: translateY(-1px);
        }

        /* Products Section */
        .products-section {
          max-width: 1200px;
          margin: 4rem auto;
          padding: 0 2rem;
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-header h2 {
          font-size: 2.5rem;
          color: #27ae60;
          margin-bottom: 1rem;
          position: relative;
          display: inline-block;
        }

        .section-header h2::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 4px;
          background: linear-gradient(90deg, #27ae60, #229954);
          border-radius: 2px;
        }

        .section-header p {
          color: #666;
          font-size: 1.1rem;
          margin-top: 2rem;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 4rem;
        }

        .product-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .product-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(39, 174, 96, 0.15);
        }

        .product-image {
          width: 100%;
          height: 250px;
          background: linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .product-card:hover .product-image img {
          transform: scale(1.08);
        }

        .product-info {
          padding: 1.5rem;
        }

        .product-category {
          color: #27ae60;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.5rem;
        }

        .product-name {
          font-size: 1.3rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .product-price {
          font-size: 1.5rem;
          color: #27ae60;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .add-to-cart {
          width: 100%;
          padding: 0.8rem;
          background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer