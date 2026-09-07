import { configureStore } from "@reduxjs/toolkit";

import roleReducer from "../features/roles/roleSlice";

// Keep your existing reducers
// import productReducer from "../features/products/productSlice";
// import salesReducer from "../features/sales/saleSlice";
// import expenseReducer from "../features/expenses/expenseSlice";
// import partyReducer from "../features/parties/partySlice";

const store = configureStore({
  reducer: {
    roles: roleReducer,

    // Keep your existing reducers here
    // products: productReducer,
    // sales: salesReducer,
    // expenses: expenseReducer,
    // parties: partyReducer,
  },
});

export default store;
