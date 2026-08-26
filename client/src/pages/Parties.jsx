import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import api from "../api/client";
import { today } from "../utils/helpers";
import Table from "../components/Table";
import DeleteButton from "../components/DeleteButton";
function Parties() {
  const [type, setType] = useState("customer");

  const [items, setItems] = useState([]);

  const [form, setForm] = useState({
    name: "",
    code: "",
    contactNumber: "",
    address: "",
    since: today(),
    notes: "",
  });

  const load = async () => {
    try {
      const response = await api.get(`/parties?type=${type}`);

      setItems(response.data);
    } catch (err) {
      console.error("Failed to load parties:", err);
    }
  };

  useEffect(() => {
    load();
  }, [type]);

  const submit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/parties", {
        ...form,
        type,
      });

      setForm({
        name: "",
        code: "",
        contactNumber: "",
        address: "",
        since: today(),
        notes: "",
      });

      await load();
    } catch (err) {
      console.error("Failed to save party:", err);
    }
  };

  return (
    <div className="content">
      <section className="panel">
        <div className="panel-head">
          <h3>Directory</h3>

          <div className="tabs">
            {["customer", "supplier"].map((x) => (
              <button
                type="button"
                className={type === x ? "tab active" : "tab"}
                onClick={() => setType(x)}
                key={x}
              >
                {x}
              </button>
            ))}
          </div>
        </div>

        <form className="form-grid" onSubmit={submit}>
          <label>
            Name
            <input
              required
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            />
          </label>

          <label>
            Code
            <input
              value={form.code}
              onChange={(e) =>
                setForm({
                  ...form,
                  code: e.target.value,
                })
              }
            />
          </label>

          <label>
            Contact
            <input
              value={form.contactNumber}
              onChange={(e) =>
                setForm({
                  ...form,
                  contactNumber: e.target.value,
                })
              }
            />
          </label>

          <label>
            Address / Area
            <input
              value={form.address}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: e.target.value,
                })
              }
            />
          </label>

          <label>
            Since
            <input
              type="date"
              value={form.since}
              onChange={(e) =>
                setForm({
                  ...form,
                  since: e.target.value,
                })
              }
            />
          </label>

          <button className="primary" type="submit">
            <Plus size={18} />
            Add {type}
          </button>
        </form>
      </section>

      <section className="panel">
        <Table
          headers={["Code", "Name", "Contact", "Address", "Since"]}
          rows={items.map((x) => (
            <tr key={x._id}>
              <td>{x.code || "—"}</td>

              <td>{x.name}</td>

              <td>{x.contactNumber || "—"}</td>

              <td>{x.address || "—"}</td>

              <td>
                {x.since ? new Date(x.since).toLocaleDateString("en-IN") : "—"}
              </td>
            </tr>
          ))}
        />
      </section>
    </div>
  );
}

export default Parties;
