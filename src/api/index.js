import axios from "axios";

const getHeaders = () => {
  return {
    headers: {
      authorization: window.localStorage.getItem("token"),
    },
  };
};

const fetchProducts = async (setProducts) => {
  const response = await axios.get("/api/products");
  setProducts(response.data);
};

const fetchShippingAddress = async (setShipping) => {
  const response = await axios.get("/api/shippingaddress", getHeaders());
  setShipping(response.data);
};

const fetchEditProducts = async (setEditProducts) => {
  const response = await axios.get("/api/products/edit");
  setEditProducts(response.data);
};

const fetchOrders = async (setOrders) => {
  const response = await axios.get("/api/orders", getHeaders());
  setOrders(response.data);
};

const fetchAllOrders = async (setAllOrders) => {
  const response = await axios.get("/api/orders/all", getHeaders());
  console.log(response.data);
  setAllOrders(response.data);
};

const fetchLineItems = async (setLineItems) => {
  const response = await axios.get("/api/lineItems", getHeaders());
  setLineItems(response.data);
};

const fetchReviews = async (setReviews) => {
  const response = await axios.get("/api/reviews");
  setReviews(response.data);
};

const createLineItem = async ({ product, cart, lineItems, setLineItems }) => {
  const response = await axios.post(
    "/api/lineItems",
    {
      order_id: cart.id,
      product_id: product.id,
    },
    getHeaders()
  );
  setLineItems([...lineItems, response.data]);
};

const createReview = async (productId, review, setReview) => {
  const response = await axios.post(
    "/api/reviews",
    {
      name: review.name,
      product_id: productId,
      review_title: review.review_title,
      reviewText: review.reviewText,
      rating: review.rating,
    },
    getHeaders()
  );
  setReview(response.data);
};

const createShippingAddress = async (shipping, street_address, setShipping) => {
  const response = await axios.post(
    "/api/shippingaddress",
    {
      street_address: street_address,
      city: shipping.city,
      state: shipping.state,
      zip_code: shipping.zip_code,
    },
    getHeaders()
  );
};

const updateLineItem = async ({ lineItem, cart, lineItems, setLineItems }) => {
  const response = await axios.put(
    `/api/lineItems/${lineItem.id}`,
    {
      quantity: lineItem.quantity + 1,
      order_id: cart.id,
    },
    getHeaders()
  );
  setLineItems(
    lineItems.map((lineItem) =>
      lineItem.id == response.data.id ? response.data : lineItem
    )
  );
};

const updateDownLineItem = async ({
  lineItem,
  cart,
  lineItems,
  setLineItems,
}) => {
  lineItem.quantity = lineItem.quantity - 1;

  const response = await axios.put(
    `/api/lineItems/${lineItem.id}`,
    {
      quantity: lineItem.quantity,
      order_id: cart.id,
    },
    getHeaders()
  );

  setLineItems(
    lineItems.map((item) =>
      item.id === response.data.id ? response.data : item
    )
  );
};

const updateOrder = async ({ order, setOrders }) => {
  await axios.put(`/api/orders/${order.id}`, order, getHeaders());
  const response = await axios.get("/api/orders", getHeaders());
  setOrders(response.data);
};

const removeFromCart = async ({ lineItem, lineItems, setLineItems }) => {
  const response = await axios.delete(
    `/api/lineItems/${lineItem.id}`,
    getHeaders()
  );
  setLineItems(lineItems.filter((_lineItem) => _lineItem.id !== lineItem.id));
};

const attemptLoginWithToken = async (setAuth) => {
  const token = window.localStorage.getItem("token");
  if (token) {
    try {
      const response = await axios.get("/api/me", getHeaders());
      setAuth(response.data);
    } catch (ex) {
      if (ex.response.status === 401) {
        window.localStorage.removeItem("token");
      }
    }
  }
};
const deleteProduct = async (productId) => {
  try {
    await axios.delete(`/api/products/${productId}`, getHeaders());
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

const updateOrderStatus = async (orderId, newStatus) => {
  try {
    await axios.put(
      `/api/orders/status/${orderId}`,
      { status: newStatus },
      getHeaders()
    );
  } catch (error) {
    console.error("Error updating status:", error);
    throw error;
  }
};

const login = async ({ credentials, setAuth }) => {
  const response = await axios.post("/api/login", credentials);
  const { token } = response.data;
  window.localStorage.setItem("token", token);
  attemptLoginWithToken(setAuth);
};

const logout = (setAuth) => {
  window.localStorage.removeItem("token");
  setAuth({});
};

const api = {
  login,
  logout,
  fetchProducts,
  fetchOrders,
  fetchLineItems,
  createLineItem,
  updateLineItem,
  updateOrder,
  updateDownLineItem,
  removeFromCart,
  attemptLoginWithToken,
  createShippingAddress,
  createReview,
  fetchReviews,
  fetchShippingAddress,
  getHeaders,
  deleteProduct,
  updateOrderStatus,
  fetchAllOrders,
  fetchEditProducts,
};

export default api;
