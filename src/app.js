import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express(); 

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",  // origin from where we are accepting the request like frontend
        credentials: true
    }    
));
 
app.use(express.json({ limit: "50mb" }));  // limiting the size of the request for json  
app.use(express.urlencoded({ limit: "50mb", extended: true }));  // limiting the size of the request for urlencoded ( URL )

app.use(express.static("public"));  // serving static files like pdf,images, css, js etc. 

app.use(cookieParser());  // Using this we can access the cookies and use this cookies in our backend 

// By using this we will define the origin from where we are accepting the request
// var corsOptions = {
//   origin: 'http://example.com',
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// }


export default app;
