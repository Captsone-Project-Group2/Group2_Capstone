const client = require('./client');
const { v4 } = require('uuid');
const uuidv4 = v4;

const fetchProducts = async()=> {
  const SQL = `
    SELECT *
    FROM products
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchReviews = async()=> {
  const SQL = `
    SELECT *
    FROM review
  `;
  const response = await client.query(SQL);
  return response.rows;
};


const createProduct = async(product)=> {
  const SQL = `
    INSERT INTO products (id, name, price, image, description) 
    VALUES($1, $2, $3, $4, $5) 
    RETURNING *
  `;
  
  const response = await client.query(SQL, [ uuidv4(), product.name, product.price, product.image, product.description]);
  return response.rows[0];
};

const createReview = async(reviewP)=> {
  const SQL = `
    INSERT INTO review  (product_id, review, user_id) 
    VALUES($1, $2, $3) 
    RETURNING *
  `;
  
  const response = await client.query(SQL, [ uuidv4(), reviewP.product_id, reviewP.review, reviewP.user_id]);
  return response.rows[0];
};


module.exports = {
  fetchProducts,
  fetchReviews,
  createProduct,
  createReview
};
