import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../../api/client";
import { fetchParties } from "../../app/resourceSlice";
import SearchableSelect from "../../components/common/SearchableSelect";
import Loading from "../../components/common/Loading";
import { today } from "../../utils/helpers";

export default function EmptyJars() {
  const dispatch = useDispatch();
  const customers = useSelector((state) => state.parties.data.filter((party) => party.type === "customer"));
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ date: today(), customer: "", type: "issued", quantity: "" });
  const load = async () => { setLoading(true); try { const response = await api.get("/operations/jars"); setRows(response.data || []); } catch { setRows([]); } finally { setLoading(false); } };
  useEffect(() => { dispatch(fetchParties({})); load(); }, [dispatch]);
  const customerOptions = customers.map((customer) => ({ value: customer._id, label: `${customer.name} (${customer.code})` }));
  const submit = async (event) => { event.preventDefault(); setSaving(true); try { await api.post("/operations/jars", { ...form, quantity: Number(form.quantity) }); setForm({ date: today(), customer: "", type: "issued", quantity: "" }); await load(); alert("Jar movement saved successfully"); } catch (error) { alert(error?.response?.data?.message || "Failed to save jar movement"); } finally { setSaving(false); } };
  if (loading) return <Loading />;
  return <div className="content"><section className="panel"><div className="panel-head"><h3>New Empty Jar Movement</h3></div><form className="form-grid" onSubmit={submit}><label>Date<input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} required /></label><label>Customer<SearchableSelect value={form.customer} onChange={(value) => setForm((current) => ({ ...current, customer: value }))} options={customerOptions} placeholder="Select customer" /></label><label>Movement<select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}><option value="issued">Issued</option><option value="returned">Returned</option><option value="lost">Lost</option><option value="damaged">Damaged</option></select></label><label>Quantity<input type="number" min="1" step="1" value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))} required /></label><button className="primary" disabled={saving}>Save Jar Movement</button></form></section><section className="panel"><div className="panel-head"><h3>Empty Jar Register</h3></div><div className="table-wrapper"><table className="table"><thead><tr><th>Customer</th><th>Date</th><th>Movement</th><th>Quantity</th></tr></thead><tbody>{rows.map((row) => <tr key={row._id}><td>{row.customer?.name || row.customer}</td><td>{new Date(row.date).toLocaleDateString("en-IN")}</td><td>{row.type}</td><td>{row.quantity}</td></tr>)}</tbody></table></div></section></div>;
}
