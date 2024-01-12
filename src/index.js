import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
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
import Nav from "./Nav"; //added for nav fileimport SingleProduct from './SingleProduct';

const App = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [lineItems, setLineItems] = useState([]);
  const [auth, setAuth] = useState({});
  
  //review
  //const [reviews, setReview] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [vipProducts, setVipProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [wishList, setWishList] = useState([]); //wishlist state

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
    fetchData().then(() => console.log(products));
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

  const updateOrder = async (order) => {
    await api.updateOrder({ order, setOrders });
  };

  const removeFromCart = async (lineItem) => {
    await api.removeFromCart({ lineItem, lineItems, setLineItems });
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
  
  

  //const handleReviewSubmit = async (review) => {
    
    //await api.createReview({review})

  //}




  const cart = orders.find(order => order.is_cart) || {};

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
  };

//wishlist
const removeFromList = (itemId) => {
  setWishList(currentWishList => currentWishList.filter(item => item.id !== itemId));
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
      />
      <main>
        <Routes>
          <Route path="/" element={<Home auth={auth} />} />
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
                addToWishList={addToWishList}
              />
            }
          />
          <Route path="/products/:id" element={<SingleProduct  auth={auth} products={products} cartItems={cartItems} createLineItem={createLineItem} updateLineItem={updateLineItem} />} />
          <Route
            path="/orders"
            element={
              <Orders
                auth={auth}
                orders={orders}
                products={products}
                lineItems={lineItems}
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
              />
            }
          />
          <Route path="/login" element={<Login login={login} />} />
          <Route path="register" element={<Register />} />
          <Route
            path="/RegistrationComplete"
            element={<RegistrationComplete />}
          />
            <Route path="/wishList" element={<WishList 
            wishList={wishList}
            removeFromWishList={removeFromList}
            products={products}
            updateOrder={updateOrder}
            cart={cart}
            />}/>
          <Route path="/Profile" element={<Profile />} />
        </Routes>
      </main>

      {/*
        auth.id ? (
          <>
            <nav>
              <Link to='/products'>Products ({ products.length })</Link>
              <Link to='/orders'>Orders ({ orders.filter(order => !order.is_cart).length })</Link>
              <Link to='/cart'>Cart ({ cartCount })</Link>
              <span>
                Welcome { auth.username }!
                <button onClick={ logout }>Logout</button>
              </span>
            </nav>
            <main>
              <Products
                auth = { auth }
                products={ products }
                cartItems = { cartItems }
                createLineItem = { createLineItem }
                updateLineItem = { updateLineItem }
              />
              <Cart
                handleDecrement={handleDecrement}
                createLineItem = { createLineItem }
                updateLineItem={updateLineItem}
                cart = { cart }
                lineItems = { lineItems }
                products = { products }
                updateOrder = { updateOrder }
                removeFromCart = { removeFromCart }
              />
              <Orders
                orders = { orders }
                products = { products }
                lineItems = { lineItems }
              />
            </main>
            </>
        ):(
          <div>
            <Login login={ login }/>
            <Products
              products={ products }
              cartItems = { cartItems }
              createLineItem = { createLineItem }
              updateLineItem = { updateLineItem }
              auth = { auth }
            />
          </div>
        )
      */}
    </div>
  );
};

const root = ReactDOM.createRoot(document.querySelector("#root"));
root.render(
  <HashRouter>
    <App />
  </HashRouter>
);
