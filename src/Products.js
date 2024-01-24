import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import api from "./api/index";

const Products = ({
  products,
  cartItems,
  createLineItem,
  updateLineItem,
  setFilteredProducts,
  auth,
  handleSearchChange,
  handleSearchClick,
  handleShowAllClick,
  filteredProducts,
  vipProducts,
  searchQuery,
  formatPrice,
  addToWishList,
  isDarkMode
}) => {
  const [selectedClass, setSelectedClass] = useState("All");
  const [showVipOnly, setShowVipOnly] = useState(false);
  const [wishlistErrors, setWishlistErrors] = useState({});
  const [wishlistStatus, setWishlistStatus] = useState({});

  const addProductToWishlist = async (product) => {
    try {
        setWishlistErrors({ ...wishlistErrors, [product.id]: '' });

        const response = await axios.post(
            "/api/wishList",
            { productId: product.id },
            api.getHeaders()
        );
        setWishlistStatus({ ...wishlistStatus, [product.id]: true });
    } catch (error) {
        setWishlistErrors({
            ...wishlistErrors,
            [product.id]: 'Item is already on your wishlist'
        });
        console.error("Error adding product to wishlist:", error);
    }
};


  const filterProductsByClass = (selectedClass) => {
    if (selectedClass === "All") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) => product.class === selectedClass
      );
      setFilteredProducts(filtered);
    }
  };

  useEffect(() => {
    let updatedFilteredProducts = products;

    if (selectedClass !== "All") {
      updatedFilteredProducts = updatedFilteredProducts.filter(
        (product) => product.class === selectedClass
      );
    }

    if (!auth.is_vip) {
      updatedFilteredProducts = updatedFilteredProducts.filter(
        (product) => !product.vip_only
      );
    } else if (showVipOnly) {
      updatedFilteredProducts = updatedFilteredProducts.filter(
        (product) => product.vip_only
      );
    }

    setFilteredProducts(updatedFilteredProducts);
  }, [selectedClass, showVipOnly, products, auth]);


  const handleVipCheckboxChange = () => {
    setShowVipOnly(!showVipOnly);
    if (!showVipOnly) {
      const vipFilteredProducts = products.filter(
        (product) => product.vip_only
      );
      setFilteredProducts(vipFilteredProducts);
    } else {
      filterProductsByClass(selectedClass);
    }
  };

  useEffect(() => {
    if (!showVipOnly) {
      filterProductsByClass(selectedClass);
    }
  }, [selectedClass, showVipOnly, products]);
  return (
    <div className="product-container">
      <h2>Products</h2>

      <div className="product-search">
        <input
          type="text"
          placeholder="Search Products"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <button onClick={handleShowAllClick}>Show All</button>
      </div>

      <div className="product-filter">
        <label>Filter by Class:</label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="All">All</option>
          <option value="suit">Suit</option>
          <option value="vehicle">Vehicle</option>
          <option value="mystic">Mystic</option>
          <option value="tech">Tech</option>
          <option value="weapon">Weapon</option>
          {isDarkMode && <option value="villain">Villain</option>}
        </select>
        <br></br>

        {auth.is_vip ? (
          <label>
            <input
              type="checkbox"
              checked={showVipOnly}
              onChange={handleVipCheckboxChange}
            />
            Show VIP Items Only
          </label>
        ) : null }
              </div>

              <ul className="product-list">
        {filteredProducts.map((product) => {
          if ((!auth.id || (product.vip_only && !auth.is_vip)) || (!isDarkMode && product.class === "villain")) {
            return null;
          }
          const cartItem = cartItems.find(
            (lineItem) => lineItem.product_id === product.id
          );
          return (
            <li key={product.id}>
              <Link to={`/products/${product.id}`} className="product-link">
                <div className="product-name">
                  {product.vip_only ? `VIP Item!` : ""}
                </div>
                <img
                  className="productImage"
                  src={product.image}
                  alt={product.name}
                />
              </Link>
              <div className="product-description">
                <Link to={`/products/${product.id}`}>{product.name}</Link><br /><br />
                {formatPrice(product.price)}<br />  {product.description}
              </div>
              <div className="product-actions">
              {auth.id ? (
    cartItem ? (
      <div className="button-group">
        <Link to={`/cart`}>View Cart</Link>
        <button onClick={() => updateLineItem(cartItem)}>
          Add Another
        </button>
      </div>
    ) : (
      <div>
        <div className="button-group">
          <button
            className="add-to-cart"
            onClick={() => createLineItem(product)}
          >
            Add to Cart
          </button>
          {wishlistStatus[product.id] ? (
            <div className="wishlist-added">
              Added to Wishlist
            </div>
          ) : (
            <button
              className="add-to-wishlist"
              onClick={() => addProductToWishlist(product)}
            >
              Add to Wishlist
            </button>
          )}
        </div>
        {wishlistErrors && wishlistErrors[product.id] && (
          <div className="wishlist-error">
            {wishlistErrors[product.id]}
          </div>
        )}
      </div>
    )
  ) : null}              
     </div>

            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Products;
