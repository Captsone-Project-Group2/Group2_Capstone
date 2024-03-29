const express = require("express");
const app = express.Router();
const { isLoggedIn, isAdmin } = require("./middleware");
const { createReview, fetchReviews } = require("../db/products");

app.get("/", async (req, res, next) => {
  try {
    res.send(await fetchReviews());
  } catch (ex) {
    next(ex);
  }
});

app.post("/", async (req, res, next) => {
  try {
    const reviewData = req.body;
    const createdReview = await createReview(reviewData);

    res.status(201).json(createdReview);
  } catch (error) {
    next(error);
  }
});

module.exports = app;
