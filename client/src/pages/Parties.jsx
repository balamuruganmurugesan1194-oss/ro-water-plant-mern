import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import api from "../api/client";
import Table from "../components/Table";
import DeleteButton from "../components/DeleteButton";
import Pagination from "../components/Pagination";

function Parties() {
  const [type, setType] = useState("customer");
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // ==========================================
  // PAGINATION
  // ==========================================

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const initialForm = {
    code: "",
    name: "",
    contactNumber: "",
    address: "",
  };

  const [form, setForm] = useState(initialForm);

  // ==========================================
  // LOAD PARTIES
  // ==========================================

  const load = async () => {
    try {
      const response = await api.get(`/parties?type=${type}`);

      setItems(response.data || []);
    } catch (err) {
      console.error("Failed to load parties:", err);
      setItems([]);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    load();
  }, [type]);

  // ==========================================
  // PAGINATION CALCULATION
  // ==========================================

  const totalItems = items.length;

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const endIndex = startIndex + itemsPerPage;

  const paginatedItems = items.slice(startIndex, endIndex);

  // ==========================================
  // HANDLE CHANGE
  // ==========================================

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // ==========================================
  // VALIDATION
  // ==========================================

  const validate = () => {
    const newErrors = {};

    // ------------------------------------------
    // CODE
    // ------------------------------------------

    const code = form.code.trim();

    if (!code) {
      newErrors.code = "Code is required";
    } else if (code.length < 2) {
      newErrors.code = "Code must be at least 2 characters";
    } else if (code.length > 20) {
      newErrors.code = "Code cannot exceed 20 characters";
    } else if (!/^[A-Za-z0-9_-]+$/.test(code)) {
      newErrors.code = "Code can contain only letters, numbers, _ and -";
    }

    // ------------------------------------------
    // NAME
    // ------------------------------------------

    const name = form.name.trim();

    if (!name) {
      newErrors.name = "Name is required";
    } else if (name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (name.length > 50) {
      newErrors.name = "Name cannot exceed 50 characters";
    } else if (!/^[A-Za-z\s.'-]+$/.test(name)) {
      newErrors.name = "Name can contain only letters, spaces, . ' and -";
    }

    // ------------------------------------------
    // CONTACT NUMBER
    // ------------------------------------------

    const contact = form.contactNumber.trim();

    if (!contact) {
      newErrors.contactNumber = "Contact number is required";
    } else if (!/^[6-9]\d{9}$/.test(contact)) {
      newErrors.contactNumber = "Enter a valid 10-digit mobile number";
    }

    // ------------------------------------------
    // AREA
    // ------------------------------------------

    const address = form.address.trim();

    if (!address) {
      newErrors.address = "Area is required";
    } else if (address.length < 2) {
      newErrors.address = "Area must be at least 2 characters";
    } else if (address.length > 100) {
      newErrors.address = "Area cannot exceed 100 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const submit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);

      await api.post("/parties", {
        code: form.code.trim(),
        name: form.name.trim(),
        contactNumber: form.contactNumber.trim(),
        address: form.address.trim(),
        type,
      });

      // Reset form
      setForm(initialForm);
      setErrors({});

      // Go to first page
      setCurrentPage(1);

      // Reload list
      await load();
    } catch (err) {
      console.error("Failed to save party:", err);

      alert(err?.response?.data?.message || "Failed to save party");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (id) => {
    try {
      await api.delete(`/parties/${id}`);

      await load();

      // Calculate page after deletion
      const remainingItems = items.length - 1;

      const newTotalPages = Math.ceil(remainingItems / itemsPerPage);

      if (newTotalPages > 0 && currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }
    } catch (err) {
      console.error("Failed to delete party:", err);

      alert(err?.response?.data?.message || "Failed to delete party");
    }
  };

  // ==========================================
  // TYPE CHANGE
  // ==========================================

  const handleTypeChange = (newType) => {
    setType(newType);

    setErrors({});

    setForm(initialForm);

    setCurrentPage(1);
  };

  // ==========================================
  // PAGE CHANGE
  // ==========================================

  const handlePageChange = (page) => {
    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // ITEMS PER PAGE CHANGE
  // ==========================================

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);

    setCurrentPage(1);
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="content">
      {/* ==========================================
          ADD CUSTOMER / SUPPLIER
      ========================================== */}

      <section className="panel">
        <div className="panel-head">
          <h3>Directory</h3>

          <div className="tabs">
            {["customer", "supplier"].map((x) => (
              <button
                key={x}
                type="button"
                className={type === x ? "tab active" : "tab"}
                onClick={() => handleTypeChange(x)}
              >
                {x}
              </button>
            ))}
          </div>
        </div>

        <form className="form-grid" onSubmit={submit} noValidate>
          {/* ========================================
              CODE
          ======================================== */}

          <label>
            Code
            <input
              required
              value={form.code}
              maxLength={20}
              placeholder="Enter code"
              className={errors.code ? "input-error" : ""}
              onChange={(e) =>
                handleChange("code", e.target.value.toUpperCase())
              }
            />
            {errors.code && <small className="error-text">{errors.code}</small>}
          </label>

          {/* ========================================
              NAME
          ======================================== */}

          <label>
            Name
            <input
              required
              value={form.name}
              maxLength={50}
              placeholder="Enter name"
              className={errors.name ? "input-error" : ""}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            {errors.name && <small className="error-text">{errors.name}</small>}
          </label>

          {/* ========================================
              CONTACT NUMBER
          ======================================== */}

          <label>
            Contact No
            <input
              required
              type="tel"
              value={form.contactNumber}
              maxLength={10}
              inputMode="numeric"
              placeholder="10-digit mobile number"
              className={errors.contactNumber ? "input-error" : ""}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 10);

                handleChange("contactNumber", value);
              }}
            />
            {errors.contactNumber && (
              <small className="error-text">{errors.contactNumber}</small>
            )}
          </label>

          {/* ========================================
              AREA
          ======================================== */}

          <label>
            Area
            <input
              required
              value={form.address}
              maxLength={100}
              placeholder="Enter area"
              className={errors.address ? "input-error" : ""}
              onChange={(e) => handleChange("address", e.target.value)}
            />
            {errors.address && (
              <small className="error-text">{errors.address}</small>
            )}
          </label>

          {/* ========================================
              SUBMIT BUTTON
          ======================================== */}

          <button className="primary" type="submit" disabled={saving}>
            <Plus size={18} />

            {saving ? "Saving..." : `Add ${type}`}
          </button>
        </form>
      </section>

      {/* ==========================================
          PARTY LIST
      ========================================== */}

      <section className="panel">
        <div className="panel-head">
          <h3>{type === "customer" ? "Customers" : "Suppliers"}</h3>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            No {type === "customer" ? "customers" : "suppliers"} found.
          </div>
        ) : (
          <>
            <Table
              headers={["Code", "Name", "Contact No", "Area", "Actions"]}
              rows={paginatedItems.map((x) => (
                <tr key={x._id}>
                  <td>{x.code}</td>

                  <td>{x.name}</td>

                  <td>{x.contactNumber}</td>

                  <td>{x.address}</td>

                  <td>
                    <div className="table-actions">
                      <DeleteButton
                        onDelete={() => handleDelete(x._id)}
                        itemName={x.name}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            />

            {/* ==================================
                GLOBAL PAGINATION
            ================================== */}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        )}
      </section>
    </div>
  );
}

export default Parties;
