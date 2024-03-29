import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import {
  HashRouter,
  Routes,
  Route,
  UseNavigate,
  useNavigate,
} from "react-router-dom";
import Products from "./Products";
import Orders from "./Orders";
import Cart from "./Cart";
import Login from "./Login";
import api from "./api";
import WishList from "./wishList";
import Profile from "./Profile";
import Register from "./Register";
import Home from "./Home";
import RegistrationComplete from "./RegistrationComplete";
import Nav from "./Nav"; //added for nav file
import SingleProduct from "./SingleProduct";
import Admin from "./Admin";
import AddProduct from "./AddProductForm";
import AdminUsers from "./AdminUsers";
import EditProducts from "./EditProducts";
import AllOrders from "./AllOrders";
import axios from "axios";
import EditSingleProduct from "./EditSingleProduct";
import Forums from "./Forums";

const App = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [lineItems, setLineItems] = useState([]);
  const [auth, setAuth] = useState({});
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [vipProducts, setVipProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [wishList, setWishList] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const userId = auth.id;
  const [wishlistErrors, setWishlistErrors] = useState({});
  const [wishlistStatus, setWishlistStatus] = useState({});

  const addProductToWishlist = async (product) => {
    try {
      setWishlistErrors({ ...wishlistErrors, [product.id]: "" });

      const response = await axios.post(
        "/api/wishList",
        { productId: product.id },
        api.getHeaders()
      );
      setWishlistStatus({ ...wishlistStatus, [product.id]: true });
    } catch (error) {
      setWishlistErrors({
        ...wishlistErrors,
        [product.id]: "Item is already on your wishlist",
      });
      console.error("Error adding product to wishlist:", error);
    }
  };

  const [shipping, setShipping] = useState({
    user_id: userId,
    street_address: "",
    city: "",
    state: "",
    zip_code: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (auth.id) {
      setShipping((prevShipping) => ({
        ...prevShipping,
        user_id: auth.id,
      }));
    }
  }, [auth.id]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", newMode ? "1" : "0");
    if (newMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  };
  useEffect(() => {
    const isDarkModeEnabled = localStorage.getItem("darkMode") === "1";
    setIsDarkMode(isDarkModeEnabled);

    if (isDarkModeEnabled) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, []);

  const attemptLoginWithToken = async () => {
    await api.attemptLoginWithToken(setAuth);
  };
  useEffect(() => {
    attemptLoginWithToken();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      await api.fetchProducts(setProducts);
    };
    fetchData();
  }, []);
  useEffect(() => {
    if (auth.id) {
      const fetchData = async () => {
        await api.fetchOrders(setOrders);
      };
      fetchData();
    }
  }, [auth]);
  useEffect(() => {
    if (auth.id) {
      const fetchData = async () => {
        await api.fetchLineItems(setLineItems);
      };
      fetchData();
    }
  }, [auth]);

  const createLineItem = async (product) => {
    await api.createLineItem({ product, cart, lineItems, setLineItems });
  };
  const updateLineItem = async (lineItem) => {
    await api.updateLineItem({ lineItem, cart, lineItems, setLineItems });
  };
  const updateDownLineItem = async (lineItem) => {
    await api.updateLineItem({ lineItem, cart, lineItems, setLineItems });
  };

  const updateOrder = async (order) => {
    await api.updateOrder({ order, setOrders });
  };
  const removeFromCart = async (lineItem) => {
    await api.removeFromCart({ lineItem, lineItems, setLineItems });
  };
  const handleShippingAndOrder = async () => {
    try {
      const response = await axios.post(`/api/shippingaddress`, {
        ...shipping,
        user_id: userId,
      });

      await updateOrder({ ...cart, is_cart: false, status: "Processing" });

      setShipping({
        user_id: userId,
        street_address: "",
        city: "",
        state: "",
        zip_code: "",
      });
      navigate("/orders");
    } catch (error) {
      setError(error.message);
    }
  };
  const handleShippingChange = (e) => {
    const { id, value } = e.target;
    setShipping({ ...shipping, [id]: value });
  };

  const handleDecrement = async (lineItem) => {
    if (lineItem.quantity > 1) {
      const updatedQuantity = lineItem.quantity - 2;
      const updatedLineItem = { ...lineItem, quantity: updatedQuantity };
      updateLineItem(updatedLineItem);
    } else {
      await api.removeFromCart({ lineItem, lineItems, setLineItems });
    }
  };
  const formatPrice = (price) => {
    return `$${(price / 100).toFixed(2)}`;
  };
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  const handleSearchClick = () => {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  };
  const handleShowAllClick = () => {
    if (auth.is_vip) {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter((product) => !product.vip_only));
    }
    setSearchQuery("");
  };
  useEffect(() => {
    const filtered = products.filter((product) => {
      if (!auth.is_vip && product.vip_only) {
        return false;
      }
      if (searchQuery) {
        return product.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
    setFilteredProducts(filtered);
  }, [products, auth, searchQuery]);
  const cart = orders.find((order) => order.is_cart) || {};
  const cartItems = lineItems.filter(
    (lineItem) => lineItem.order_id === cart.id
  );
  const cartCount = cartItems.reduce((acc, item) => {
    return (acc += item.quantity);
  }, 0);
  const login = async (credentials) => {
    await api.login({ credentials, setAuth });
  };
  const logout = () => {
    api.logout(setAuth);
    navigate("/");
  };
  const removeFromList = (itemId) => {
    setWishList((currentWishList) =>
      currentWishList.filter((item) => item.id !== itemId)
    );
  };
  const addToWishList = (product) => {
    setWishList((currentWishList) => [...currentWishList, product]);
  };
  return (
    <div>
      <Nav
        auth={auth}
        products={products}
        orders={orders}
        cartCount={cartCount}
        logout={logout}
        toggleDarkMode={toggleDarkMode}
        isDarkMode={isDarkMode}
      />
      <main>
        <Routes>
          <Route
            path="/"
            element={<Home auth={auth} isDarkMode={isDarkMode} />}
          />
          <Route path="/Forums" element={<Forums auth={auth} />} />
          <Route
            path="/products"
            element={
              <Products
                auth={auth}
                products={products}
                cartItems={cartItems}
                createLineItem={createLineItem}
                updateLineItem={updateLineItem}
                filteredProducts={filteredProducts}
                setFilteredProducts={setFilteredProducts}
                searchQuery={searchQuery}
                vipProducts={vipProducts}
                handleSearchChange={handleSearchChange}
                handleSearchClick={handleSearchClick}
                handleShowAllClick={handleShowAllClick}
                formatPrice={formatPrice}
                addProductToWishlist={addProductToWishlist}
                wishlistErrors={wishlistErrors}
                wishlistStatus={wishlistStatus}
                isDarkMode={isDarkMode}
              />
            }
          />
          <Route
            path="/products/:id"
            element={
              <SingleProduct
                auth={auth}
                products={products}
                lineItem={lineItems}
                cartItems={cartItems}
                createLineItem={createLineItem}
                handleDecrement={handleDecrement}
                updateDownLineItem={updateDownLineItem}
                updateLineItem={updateLineItem}
                addProductToWishlist={addProductToWishlist}
                wishlistErrors={wishlistErrors}
                wishlistStatus={wishlistStatus}
              />
            }
          />
          <Route
            path="/orders"
            element={
              <Orders
                auth={auth}
                orders={orders}
                products={products}
                lineItems={lineItems}
                shipping={shipping}
                error={error}
                setError={setError}
              />
            }
          />
          <Route
            path="/cart"
            element={
              <Cart
                cart={cart}
                lineItems={lineItems}
                products={products}
                updateOrder={updateOrder}
                removeFromCart={removeFromCart}
                handleDecrement={handleDecrement}
                updateLineItem={updateLineItem}
                auth={auth}
                handleShippingAndOrder={handleShippingAndOrder}
                shipping={shipping}
                handleShippingChange={handleShippingChange}
              />
            }
          />
          <Route path="/login" element={<Login login={login} />} />
          <Route path="register" element={<Register />} />
          <Route
            path="/RegistrationComplete"
            element={<RegistrationComplete />}
          />
          <Route
            path="/wishList"
            element={
              <WishList
                wishList={wishList}
                removeFromWishList={removeFromList}
                products={products}
                updateCart={createLineItem}
                cart={cart}
                auth={auth}
                lineItems={lineItems}
                updateLineItem={updateLineItem}
                setLineItems={setLineItems}
              />
            }
          />

          <Route
            path="/wishList"
            element={
              <WishList
                wishList={wishList}
                removeFromWishList={removeFromList}
                products={products}
                updateOrder={updateOrder}
                cart={cart}
              />
            }
          />
          <Route path="/Profile" element={<Profile auth={auth} />} />

          <Route path="/Admin" element={<Admin />} />
          <Route path="/addproduct" element={<AddProduct />} />
          <Route path="/allusers" element={<AdminUsers auth={auth} />} />
          <Route
            path="/editproducts"
            element={
              <EditProducts products={products} formatPrice={formatPrice} />
            }
          />
          <Route
            path="/edit-single-product/:productId"
            element={<EditSingleProduct formatPrice={formatPrice} />}
          />

          <Route path="allorders" element={<AllOrders orders={orders} />} />
        </Routes>
      </main>
    </div>
  );
};
const root = ReactDOM.createRoot(document.querySelector("#root"));
root.render(
  <HashRouter>
    <App />
  </HashRouter>
);
