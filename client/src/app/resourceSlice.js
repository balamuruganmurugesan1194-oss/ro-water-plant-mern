import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/client";

const CACHE_TTL = 30_000;

export const createResourceSlice = ({ name, endpoint }) => {
  const fetchResource = createAsyncThunk(
    `${name}/fetch`,
    async (params = {}, { rejectWithValue }) => {
      try {
        const response = await api.get(endpoint, { params });
        const payload = response.data;

        return {
          key: JSON.stringify(params),
          data: Array.isArray(payload) ? payload : payload.data || [],
          pagination: Array.isArray(payload) ? null : payload.pagination || null,
        };
      } catch (error) {
        return rejectWithValue(
          error?.response?.data?.message || `Failed to load ${name}`,
        );
      }
    },
    {
      condition: (params = {}, { getState }) => {
        const key = JSON.stringify(params);
        const cached = getState()[name]?.cache[key];

        return !cached || Date.now() - cached.fetchedAt > CACHE_TTL;
      },
    },
  );

  const slice = createSlice({
    name,
    initialState: {
      data: [],
      pagination: null,
      loading: false,
      error: null,
      cache: {},
    },
    reducers: {
      setData: (state, action) => {
        state.data = action.payload;
      },
      clearResource: (state) => {
        state.data = [];
        state.pagination = null;
        state.error = null;
        state.cache = {};
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchResource.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchResource.fulfilled, (state, action) => {
          const { key, data, pagination } = action.payload;

          state.loading = false;
          state.data = data;
          state.pagination = pagination;
          state.cache[key] = {
            data,
            pagination,
            fetchedAt: Date.now(),
          };
        })
        .addCase(fetchResource.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        });
    },
  });

  return {
    reducer: slice.reducer,
    actions: slice.actions,
    fetch: fetchResource,
  };
};

export const productsResource = createResourceSlice({
  name: "products",
  endpoint: "/products",
});

export const partiesResource = createResourceSlice({
  name: "parties",
  endpoint: "/parties",
});

export const salesResource = createResourceSlice({
  name: "sales",
  endpoint: "/sales",
});

export const expensesResource = createResourceSlice({
  name: "expenses",
  endpoint: "/expenses",
});

export const usersResource = createResourceSlice({
  name: "users",
  endpoint: "/settings/users",
});

export const {
  fetch: fetchProducts,
  actions: productActions,
} = productsResource;
export const { fetch: fetchParties, actions: partyActions } = partiesResource;
export const { fetch: fetchSales, actions: saleActions } = salesResource;
export const {
  fetch: fetchExpenses,
  actions: expenseActions,
} = expensesResource;
export const { fetch: fetchUsers, actions: userActions } = usersResource;
