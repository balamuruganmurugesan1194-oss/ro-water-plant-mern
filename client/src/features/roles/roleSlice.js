import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "../../api/client";

/* =========================================================
   FETCH ACTIVE ROLES
========================================================= */

export const fetchActiveRoles = createAsyncThunk(
  "roles/fetchActiveRoles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/settings/roles/active");

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load active roles",
      );
    }
  },
);

/* =========================================================
   FETCH ALL ROLES
========================================================= */

export const fetchRoles = createAsyncThunk(
  "roles/fetchRoles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/settings/roles");

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load roles",
      );
    }
  },
);

/* =========================================================
   FETCH PERMISSIONS
========================================================= */

export const fetchPermissions = createAsyncThunk(
  "roles/fetchPermissions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/settings/permissions");

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load permissions",
      );
    }
  },
);

/* =========================================================
   CREATE ROLE
========================================================= */

export const createRole = createAsyncThunk(
  "roles/createRole",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/settings/roles", payload);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to create role",
      );
    }
  },
);

/* =========================================================
   UPDATE ROLE
========================================================= */

export const updateRole = createAsyncThunk(
  "roles/updateRole",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/settings/roles/${id}`, data);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update role",
      );
    }
  },
);

/* =========================================================
   DELETE ROLE
========================================================= */

export const deleteRole = createAsyncThunk(
  "roles/deleteRole",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/settings/roles/${id}`);

      return id;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to delete role",
      );
    }
  },
);

/* =========================================================
   SLICE
========================================================= */

const roleSlice = createSlice({
  name: "roles",

  initialState: {
    roles: [],
    activeRoles: [],
    permissions: [],

    loading: false,
    activeRolesLoading: false,

    error: null,
    activeRolesError: null,
  },

  reducers: {
    clearRoleError: (state) => {
      state.error = null;
      state.activeRolesError = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* =========================================
         ALL ROLES
      ========================================= */

      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })

      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* =========================================
         ACTIVE ROLES
      ========================================= */

      .addCase(fetchActiveRoles.pending, (state) => {
        state.activeRolesLoading = true;
        state.activeRolesError = null;
      })

      .addCase(fetchActiveRoles.fulfilled, (state, action) => {
        state.activeRolesLoading = false;

        state.activeRoles = action.payload;
      })

      .addCase(fetchActiveRoles.rejected, (state, action) => {
        state.activeRolesLoading = false;

        state.activeRolesError = action.payload;
      })

      /* =========================================
         PERMISSIONS
      ========================================= */

      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.permissions = action.payload;
      })

      /* =========================================
         CREATE ROLE
      ========================================= */

      .addCase(createRole.fulfilled, (state, action) => {
        state.roles.push(action.payload);

        if (action.payload.isActive) {
          state.activeRoles.push(action.payload);
        }

        state.roles.sort((a, b) => a.name.localeCompare(b.name));

        state.activeRoles.sort((a, b) => a.name.localeCompare(b.name));
      })

      /* =========================================
         UPDATE ROLE
      ========================================= */

      .addCase(updateRole.fulfilled, (state, action) => {
        const updated = action.payload;

        const index = state.roles.findIndex((role) => role._id === updated._id);

        if (index !== -1) {
          state.roles[index] = updated;
        }

        /*
         * Keep activeRoles synchronized
         */

        const activeIndex = state.activeRoles.findIndex(
          (role) => role._id === updated._id,
        );

        if (updated.isActive) {
          if (activeIndex === -1) {
            state.activeRoles.push(updated);
          } else {
            state.activeRoles[activeIndex] = updated;
          }
        } else if (activeIndex !== -1) {
          state.activeRoles = state.activeRoles.filter(
            (role) => role._id !== updated._id,
          );
        }
      })

      /* =========================================
         DELETE ROLE
      ========================================= */

      .addCase(deleteRole.fulfilled, (state, action) => {
        const id = action.payload;

        state.roles = state.roles.filter((role) => role._id !== id);

        state.activeRoles = state.activeRoles.filter((role) => role._id !== id);
      });
  },
});

export const { clearRoleError } = roleSlice.actions;

export default roleSlice.reducer;
