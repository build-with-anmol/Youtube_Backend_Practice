import dotenv from "dotenv";
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";

import connectDB from "./db/index.js";
import app from "./app.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("MONGO DB connection failed ... ! ", error);
  });

dotenv.config({
  path: "./env",
});

/*
import express from "express";
const app = express();

(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);  // connect to database

    app.on("error", ( error ) => {
      console.error("Server error"); 
      throw error;
    });  

    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    })
  } catch (error) {
    console.error("Error: ", error);
    throw error;
  }
})();
*/
