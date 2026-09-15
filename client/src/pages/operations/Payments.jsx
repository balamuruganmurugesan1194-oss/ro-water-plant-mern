import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../../api/client";
import { fetchParties } from "../../app/resourceSlice";
import SearchableSelect from "../../components/common/SearchableSelect";
import Loading from "../../components/common/Loading";
import { today } from "../../utils/helpers";

const createBlankForm = () => ({
  date: today(),
  party: "",
  direction: "received",
  amount: "",
  mode: "Cash",
  reference: "",
  notes: "",
});

function Payments() {
  const dispatch = useDispatch();
  const parties = useSelector((state) => state.parties.data);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(createBlankForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const response = await api.get("/operations/payments");
      setRows(response.data || []);
    } catch (error) {
      setRows([]);
      alert(error?.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchParties({}));
    loadPayments();
  }, [dispatch]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post("/operations/payments", {
        ...form,
        amount: Number(form.amount),
      });
      setForm(createBlankForm());
      await loadPayments();
      alert("Payment saved successfully");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to save payment");
    } finally {
      setSaving(false);
    }
  };

  const partyOptions = parties.map((party) => ({
    value: party._id,
    label: `${party.name} (${party.code})`,
  }));

  if (loading) return <Loading />;

  return (
    <div className="content">
      <section className="panel">
        <div className="panel-head"><h3>New Payment</h3></div>
        <form className="form-grid" onSubmit={submit}>
          <label>Date<input type="date" value={form.date} onChange={(event) => updateForm("date", event.target.value)} required /></label>
          <label>Party<SearchableSelect value={form.party} onChange={(value) => updateForm("party", value)} options={partyOptions} placeholder="Select party" /></label>
          <label>Direction<select value={form.direction} onChange={(event) => updateForm("direction", event.target.value)}><option value="received">Received</option><option value="paid">Paid</option></select></label>
          <label>Amount<input type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => updateForm("amount", event.target.value)} required /></label>
          <label>Payment Mode<select value={form.mode} onChange={(event) => updateForm("mode", event.target.value)}><option value="Cash">Cash</option><option value="Bank">Bank</option><option value="UPI">UPI</option><option value="Cheque">Cheque</option></select></label>
          <label>Reference<input value={form.reference} onChange={(event) => updateForm("reference", event.target.value)} /></label>
          <label className="full-width">Notes<textarea value={form.notes} onChange={(event) => updateForm("notes", event.target.value)} /></label>
          <button className="primary" type="submit" disabled={saving}>Save Payment</button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-head"><h3>Payment Register</h3></div>
        {rows.length === 0 ? <div className="empty-state">No payments found.</div> : <div className="table-wrapper"><table className="table"><thead><tr><th>Number</th><th>Date</th><th>Party</th><th>Direction</th><th>Amount</th><th>Mode</th><th>Reference</th></tr></thead><tbody>{rows.map((payment) => <tr key={payment._id}><td>{payment.paymentNumber}</td><td>{new Date(payment.date).toLocaleDateString("en-IN")}</td><td>{payment.party?.name || "-"}</td><td>{payment.direction}</td><td>{payment.amount}</td><td>{payment.mode}</td><td>{payment.reference || "-"}</td></tr>)}</tbody></table></div>}
      </section>
    </div>
  );
}

export default Payments;
