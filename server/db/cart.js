const client = require("./client");
const { v4 } = require("uuid");
const uuidv4 = v4;

const fetchLineItems = async (userId) => {
  const SQL = `
  SELECT line_items.*, products.price AS product_price
  FROM line_items
  JOIN orders ON orders.id = line_items.order_id
  JOIN users ON users.id = orders.user_id
  JOIN products ON products.id = line_items.product_id
  WHERE users.id = $1
  ORDER BY product_id
  `;

  const response = await client.query(SQL, [userId]);
  return response.rows;
};

const ensureCart = async (lineItem) => {
  let orderId = lineItem.order_id;
  if (!orderId) {
    const SQL = `
      SELECT order_id 
      FROM line_items 
      WHERE id = $1 
    `;
    const response = await client.query(SQL, [lineItem.id]);
    orderId = response.rows[0].order_id;
  }
  const SQL = `
    SELECT * 
    FROM orders
    WHERE id = $1 and is_cart=true
  `;
  const response = await client.query(SQL, [orderId]);
  if (!response.rows.length) {
    throw Error("An order which has been placed can not be changed");
  }
};
const updateLineItem = async (lineItem) => {
  await ensureCart(lineItem);
  SQL = `
    UPDATE line_items
    SET quantity = $1
    WHERE id = $2
    RETURNING *
  `;
  if (lineItem.quantity <= 0) {
    throw Error("a line item quantity must be greater than 0");
  }
  const response = await client.query(SQL, [lineItem.quantity, lineItem.id]);
  return response.rows[0];
};

// if(lineItem.price.id === lineItem.id)
// return {price.id}

const createLineItem = async (lineItem) => {
  console.log("Creating line item with data:", lineItem);
  await ensureCart(lineItem);
  const SQL = `
  INSERT INTO line_items (product_id, order_id, product_price, id)
  VALUES ($1, $2, (SELECT price FROM products WHERE id = $1), $3)
  RETURNING *
`;
  const response = await client.query(SQL, [
    lineItem.product_id,
    lineItem.order_id,
    uuidv4(),
  ]);
  console.log(response.rows)
  return response.rows[0];
};


const deleteLineItem = async (lineItem) => {
  await ensureCart(lineItem);
  const SQL = `
    DELETE from line_items
    WHERE id = $1
  `;
  await client.query(SQL, [lineItem.id]);
};

const updateOrder = async (order) => {
  const SQL = `
    UPDATE orders SET is_cart = $1 WHERE id = $2 RETURNING *
  `;
  const response = await client.query(SQL, [order.is_cart, order.id]);
  return response.rows[0];
};

const fetchAllOrders = async () => {
  const SQL = `
  SELECT *
  FROM orders
  `;
  const response = await client.query(SQL);
  return response.rows;
}



const fetchOrders = async (userId) => {
  const SQL = `
    SELECT * FROM orders
    WHERE user_id = $1
  `;
  let response = await client.query(SQL, [userId]);
  const cart = response.rows.find((row) => row.is_cart);
  if (!cart) {
    await client.query(
      `
      INSERT INTO orders(is_cart, id, user_id) VALUES(true, $1, $2)
      `,
      [uuidv4(), userId]
    );
    response = await client.query(SQL, [userId]);
    return response.rows;
  }
  return response.rows;
};

const deleteOrder = async (orderId) => {
  const SQL = `
    DELETE FROM orders
    WHERE id = $1
  `;
  await client.query(SQL, [orderId]);
};


module.exports = {
  fetchLineItems,
  createLineItem,
  updateLineItem,
  deleteLineItem,
  updateOrder,
  fetchOrders,
  deleteOrder,
  fetchAllOrders
};
