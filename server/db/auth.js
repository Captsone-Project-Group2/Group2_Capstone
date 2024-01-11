const client = require('./client');
const { v4 } = require('uuid');
const uuidv4 = v4;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const findUserByToken = async(token) => {
  try {
    const payload = await jwt.verify(token, process.env.JWT);
    const SQL = `
      SELECT id, username, is_admin
      FROM users
      WHERE id = $1
    `;
    const response = await client.query(SQL, [payload.id]);
    if(!response.rows.length){
      const error = Error('bad credentials');
      error.status = 401;
      throw error;
    }

    return response.rows[0];
  }
  catch(ex){
    console.log(ex);
    const error = Error('bad credentials');
    error.status = 401;
    throw error;
  }
}

const authenticate = async(credentials)=> {
  const SQL = `
    SELECT id, password
    FROM users
    WHERE username = $1
  `;
  const response = await client.query(SQL, [credentials.username]);
  if(!response.rows.length){
    const error = Error('bad credentials');
    error.status = 401;
    throw error;
  }
  const valid = await bcrypt.compare(credentials.password, response.rows[0].password);
  if(!valid){
    const error = Error('bad credentials');
    error.status = 401;
    throw error;
  }

  return jwt.sign({ id: response.rows[0].id }, process.env.JWT);
};

const createUser = async(user)=> {
  if(!user.username.trim() || !user.password.trim()){
    throw Error('must have username and password');
  } try {

  user.password = await bcrypt.hash(user.password, 5);
  const SQL = `
    INSERT INTO users (id, username, password, Fname, Lname, email, phone, is_admin, is_vip) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
  `;
  const response = await client.query(SQL, [ uuidv4(), user.username, user.password, user.Fname, user.Lname, user.email, user.phone, false ]);

  return response.rows[0];
} catch (error) {
  if (error.code === '23505') {
    if (error.detail.includes("username")) {
      throw Error('Username already exsists')
    }
    if (error.detail.includes("email")) {
      throw Error('Email already exsists');
    }
  }
  throw error;
  }
};

module.exports = {
  createUser,
  authenticate,
  findUserByToken
};
