import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import api from "../../api/client";
import { fetchProducts } from "../../app/resourceSlice";
import SearchableSelect from "../../components/common/SearchableSelect";
import Loading from "../../components/common/Loading";
import { today } from "../../utils/helpers";

export default function Production() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.data);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ date: today(), output: "", outputQuantity: "", inputs: [{ product: "", quantity: "" }] });
  const load = async () => { setLoading(true); try { const response = await api.get("/production"); setRows(response.data || []); } catch { setRows([]); } finally { setLoading(false); } };
  useEffect(() => { dispatch(fetchProducts({ active: true })); load(); }, [dispatch]);
  const options = products.map((product) => ({ value: product._id, label: `${product.name} (${product.code})` }));
  const getInputOptions = (index) => {
    const selected = form.inputs
      .filter((_, itemIndex) => itemIndex !== index)
      .map((item) => item.product)
      .filter(Boolean);

    return options.filter((option) => !selected.includes(option.value));
  };
  const updateInput = (index, field, value) => setForm((current) => ({ ...current, inputs: current.inputs.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) }));
  const submit = async (event) => { event.preventDefault(); setSaving(true); try { await api.post("/production", { date: form.date, output: { product: form.output, quantity: Number(form.outputQuantity) }, inputs: form.inputs.map((item) => ({ product: item.product, quantity: Number(item.quantity) })) }); setForm({ date: today(), output: "", outputQuantity: "", inputs: [{ product: "", quantity: "" }] }); await load(); alert("Production saved successfully"); } catch (error) { alert(error?.response?.data?.message || "Failed to save production"); } finally { setSaving(false); } };
  if (loading) return <Loading />;
  return <div className="content"><section className="panel"><div className="panel-head"><h3>New Production</h3></div><form className="form-grid" onSubmit={submit}><label>Date<input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} required /></label><label>Output Product<SearchableSelect value={form.output} onChange={(value) => setForm((current) => ({ ...current, output: value }))} options={options} placeholder="Select output" /></label><label>Output Quantity<input type="number" min="0.01" step="0.01" value={form.outputQuantity} onChange={(event) => setForm((current) => ({ ...current, outputQuantity: event.target.value }))} required /></label><div className="sale-items-wrapper full-width"><div className="sale-items-header"><h4>Input Materials</h4><button type="button" className="secondary" disabled={form.inputs.length >= products.length} onClick={() => setForm((current) => ({ ...current, inputs: [...current.inputs, { product: "", quantity: "" }] }))}><Plus size={16} /> Add Input</button></div>{form.inputs.map((item, index) => <div className="sale-item-row" key={index}><label className="sale-item-product">Input Product<SearchableSelect value={item.product} onChange={(value) => updateInput(index, "product", value)} options={getInputOptions(index)} placeholder="Select input" /></label><label>Quantity<input type="number" min="0.01" step="0.01" value={item.quantity} onChange={(event) => updateInput(index, "quantity", event.target.value)} required /></label><button type="button" className="icon danger" title="Remove input" aria-label="Remove input" onClick={() => setForm((current) => ({ ...current, inputs: current.inputs.length > 1 ? current.inputs.filter((_, itemIndex) => itemIndex !== index) : current.inputs }))}><Trash2 size={16} /></button></div>)}</div><button className="primary" disabled={saving}>Save Production</button></form></section><section className="panel"><div className="panel-head"><h3>Production Register</h3></div><div className="table-wrapper"><table className="table"><thead><tr><th>Number</th><th>Date</th><th>Output</th><th>Quantity</th></tr></thead><tbody>{rows.map((row) => <tr key={row._id}><td>{row.productionNumber}</td><td>{new Date(row.date).toLocaleDateString("en-IN")}</td><td>{row.output?.product?.name}</td><td>{row.output?.quantity}</td></tr>)}</tbody></table></div></section></div>;
}
