import { LEAD_SOURCES, REQUIREMENT_TYPES, INDIAN_STATES, BUSINESS_TYPES } from '../../utils/helpers';

const LeadForm = ({ form, setForm, users = [], onSubmit, loading, submitLabel = 'Save Lead', isEdit = false }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1.5">{isEdit ? 'Lead Person Name *' : 'Emp Name *'}</label>
        <input type="text" required value={form.leadName || ''} onChange={(e) => setForm({ ...form, leadName: e.target.value })} className="input-field" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Company Name *</label>
        <input type="text" required value={form.companyName || ''} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="input-field" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Business Type</label>
        <select value={form.businessType || 'Other'} onChange={(e) => setForm({ ...form, businessType: e.target.value })} className="input-field">
          {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      {isEdit && (
        <div>
          <label className="block text-sm font-medium mb-1.5">Contact Person *</label>
          <input type="text" required value={form.contactPerson || ''} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} className="input-field" />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium mb-1.5">Mobile Number *</label>
        <input type="tel" required value={form.mobileNumber || ''} onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })} className="input-field" />
      </div>
      {isEdit && (
        <div>
          <label className="block text-sm font-medium mb-1.5">Email *</label>
          <input type="email" required value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium mb-1.5">City</label>
        <input type="text" value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">State</label>
        <select value={form.state || ''} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input-field">
          <option value="">Select state</option>
          {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Lead Source</label>
        <select value={form.leadSource || 'Website'} onChange={(e) => setForm({ ...form, leadSource: e.target.value })} className="input-field">
          {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Requirement Type</label>
        <select value={form.requirementType || 'Web Development'} onChange={(e) => setForm({ ...form, requirementType: e.target.value })} className="input-field">
          {REQUIREMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      {isEdit && users.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1.5">Assigned To</label>
          <select value={form.assignedTo || ''} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} className="input-field">
            <option value="">Select user</option>
            {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
        </div>
      )}
      {isEdit && (
        <div>
          <label className="block text-sm font-medium mb-1.5">Revenue (₹)</label>
          <input type="number" value={form.revenue || ''} onChange={(e) => setForm({ ...form, revenue: Number(e.target.value) })} className="input-field" />
        </div>
      )}
    </div>
    <div>
      <label className="block text-sm font-medium mb-1.5">Notes</label>
      <textarea rows={3} value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field resize-none" />
    </div>
    <div className="flex justify-end gap-3 pt-2">
      <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : submitLabel}</button>
    </div>
  </form>
);

export default LeadForm;
