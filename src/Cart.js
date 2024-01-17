import axios from 'axios';
import React, { useEffect,useState } from 'react';
import { Link, useParams } from 'react-router-dom'


const Cart = ({
  updateOrder,
  removeFromCart,
  lineItems,
  cart,
  products,
  updateLineItem,
  handleDecrement,
}) => {
  
  const params = useParams();
  const street_address = params.id;
  const [shipping, setShipping] = useState({
    street_address: street_address,
    city: "",
    state: "",
    zip_code: "",
  });
  const [shippingAddress, setShippingAddress] = useState([]);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchShippingAddress = async () => {
      try {
        const response = await axios.get(`./api/shippingAddress?street_address=${street_address}`);
        setShippingAddress(response.data);
      } catch (error) {
        setError(error.message);
      }
    };

    // fetchShippingAddress();
  }, [street_address]);

  const handleShippingAddress = async (event) => {
    event.preventDefault();
    try {
        const response = await axios.post("./api/shippingaddress",street_address, shipping);
        console.log("Shipping address created", response);
        setShipping({
            street_address:"",
            city:"",
            state:"",
            zip_code:"",
        });
    } catch (error) {
        setError(error.message)
    }
};

  const formatPrice = (price) => {
    return `$${(price / 100).toFixed(2)}`;
  };

  // Filter line items to consider only the items in the current cart
  const cartLineItems = lineItems.filter(
    (lineItem) => lineItem.order_id === cart.id
  );

  return (
    <div className="cart-container">
      <h2 className="cart-title">Cart</h2>
      <ul className="cart-list">
        {cartLineItems.map((lineItem) => {
          const product =
            products.find((product) => product.id === lineItem.product_id) ||
            {};
          const totalPrice = lineItem.quantity * lineItem.product_price; // Calculate total price
          return (
            <li key={lineItem.id}>
              {product.name} ({lineItem.quantity}) - Total:{" "}
              {formatPrice(totalPrice)}
              <div className="cart-actions">
                <button onClick={() => updateLineItem(lineItem)}>+</button>
                <button onClick={() => handleDecrement(lineItem)}>-</button>
                <button onClick={() => removeFromCart(lineItem)}>
                  Remove From Cart
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {cartLineItems.length ? (
        <div className="cart-actions">
          
          {/* shipping address form  */}
          <p>Please fill in your shipping address below </p>
          <br/>

          <p>***Valued customer please note that the shipping function is currently experiencing some technical difficulties and is not working.****</p>
          <br/>

          <p> All orders are to be picked up under your alias in the Walgreens pharmacy next to Wayne enterprice HQ in Gotham within 24h of order being made. Alfred, how do you stop speach to write .. Alfreeeed!...oh press this butto.</p>
          <form >
            <p>Street Address</p>
            <input  
            type='text'
            id='streetAddress'
            placeholder="Street Address"
            value={shipping.street_address}
            onChange={(e) => setShipping({ ...shipping, street_address: e.target.value })}
            required 
            />
            <p>City</p>
            <input  
            type='text'
            id='city'
            placeholder="City"
            value={shipping.city}
            onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
            required
            />
            <p>State</p>
            <input  
            type='text'  
            id='state'          
            placeholder="State"
            value={shipping.state}
            onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
            required 
            />
            <p>Zip Code</p>
            <input  
            type='number'
            id='zipCode'
            placeholder="Zip Code"
            value={shipping.zip_code}
            onChange={(e) => setShipping({ ...shipping, zip_code: e.target.value })}
            required />
          </form>
          {/* shipping address form  */}
          <button type="submit"
            onSubmit={handleShippingAddress}
            onClick={() => {
              updateOrder({ ...cart, is_cart: false });
              
            }}
          >
            Create Order
          </button>
          <p className="cart-total">
            Total Price:{" "}
            {formatPrice(
              cartLineItems.reduce(
                (total, lineItem) =>
                  total + lineItem.quantity * lineItem.product_price,
                0
              )
            )}
          </p>
        </div>
      ) : (
        <p>Cart is empty.</p>
      )}
    </div>
  );
};

export default Cart;
