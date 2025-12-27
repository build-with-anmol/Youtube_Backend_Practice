import mongoose from "mongoose";     
import { DB_NAME } from "../constants.js"; 


const connectDB = async () => {
    try {
        const connectionIn = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);  // connect to database

        console.log(`\n MONGODB CONNECTED !!! \n HOST: ${connectionIn.connection.host}\n`); 

    } catch (error) {
        console.log("MONGODB CONNECTION ERROR: ", error); 
        process.exit(1);
    }
};

export default connectDB;