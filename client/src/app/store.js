import { configureStore } from "@reduxjs/toolkit";

import roleReducer from "../features/roles/roleSlice";
import {
  expensesResource,
  partiesResource,
  productsResource,
  salesResource,
  usersResource,
} from "./resourceSlice";

// Keep your existing reducers
// import productReducer from "../features/products/productSlice";
// import salesReducer from "../features/sales/saleSlice";
// import expenseReducer from "../features/expenses/expenseSlice";
// import partyReducer from "../features/parties/partySlice";

const store = configureStore({
  reducer: {
    roles: roleReducer,
    products: productsResource.reducer,
    parties: partiesResource.reducer,
    sales: salesResource.reducer,
    expenses: expensesResource.reducer,
    users: usersResource.reducer,
  },
});

export default store;
