import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import axios from "axios";

axios.defaults.timeout = 15000;
axios.interceptors.response.use(
  (response) => response,
  (error) => { console.error('API Error:', error); return Promise.reject(error); }
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<React.StrictMode><App /></React.StrictMode>);
