import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import App from "./App";
import store from "./app/store";

import "./style/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />

        {/* ==========================================
            COMMON APPLICATION TOAST
        ========================================== */}

        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 3000,

            style: {
              borderRadius: "8px",
              padding: "12px 16px",
              fontSize: "14px",
              fontWeight: "500",
              maxWidth: "420px",
            },

            success: {
              duration: 3000,
            },

            error: {
              duration: 4000,
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
