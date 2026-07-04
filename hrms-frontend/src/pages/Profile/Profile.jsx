import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useHRMS } from '../../context/HRMSContext';
import { User, Phone, MapPin, Mail, Shield, Briefcase, Calendar, DollarSign, Edit, Save, Check, BadgeCheck, CreditCard } from 'lucide-react';

const tabs = ['Resume', 'Private Info', 'Salary Info', 'Security'];

export default function Profile() {
  const { currentUser, employees, updateProfile } = useHRMS();
  const { employeeId } = useParams();
  const [activeTab, setActiveTab] = useState('Resume');
  const [isEditing, setIsEditing] = useState(false);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: currentUser?.first_name || '',
    last_name: currentUser?.last_name || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    about: currentUser?.about || '',
    job_love: currentUser?.job_love || '',
    interests: currentUser?.interests || '',
    dob: currentUser?.dob || '',
    nationality: currentUser?.nationality || '',
    personal_email: currentUser?.personal_email || '',
    gender: currentUser?.gender || '',
    marital_status: currentUser?.marital_status || '',
    bank_account: currentUser?.bank_account || '',
    bank_name: currentUser?.bank_name || '',
    ifsc: currentUser?.ifsc || '',
    pan_no: currentUser?.pan_no || '',
  });

  const isOwnProfile = !employeeId || employeeId === currentUser?.employee_id;
  const profileUser = useMemo(() => (
    employees.find((employee) => employee.employee_id === employeeId) || currentUser
  ), [currentUser, employeeId, employees]);

  useEffect(() => {
    setForm({
      first_name: profileUser?.first_name || '',
      last_name: profileUser?.last_name || '',
      phone: profileUser?.phone || '',
      address: profileUser?.address || '',
      about: profileUser?.about || '',
      job_love: profileUser?.job_love || '',
      interests: profileUser?.interests || '',
      dob: profileUser?.dob || '',
      nationality: profileUser?.nationality || '',
      personal_email: profileUser?.personal_email || '',
      gender: profileUser?.gender || '',
      marital_status: profileUser?.marital_status || '',
      bank_account: profileUser?.bank_account || '',
      bank_name: profileUser?.bank_name || '',
      ifsc: profileUser?.ifsc || '',
      pan_no: profileUser?.pan_no || '',
    });
  }, [profileUser]);

  const displayName = [profileUser?.first_name, profileUser?.last_name].filter(Boolean).join(' ') || profileUser?.name || 'User';

  const handleSave = (event) => {
    event.preventDefault();
    setMsg('');
    setLoading(true);
    setTimeout(() => {
      const res = updateProfile({ ...form });
      setLoading(false);
      if (res.success) {
        setIsEditing(false);
        setMsg('Profile updated successfully.');
        setTimeout(() => setMsg(''), 2500);
      }
    }, 500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 odoo-fade-in">
      <div className="o-card overflow-hidden">
        <div className="h-24" style={{ background: 'linear-gradient(135deg, var(--odoo-purple), var(--odoo-purple-light))' }}></div>
        <div className="px-6 pb-5 flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-8 relative">
          <div className="h-20 w-20 rounded-xl bg-white p-1 shadow-md shrink-0">
            <div className="h-full w-full rounded-lg flex items-center justify-center font-bold text-2xl text-white" style={{ background: 'var(--odoo-purple)' }}>{displayName.charAt(0)}</div>
          </div>
          <div className="text-center sm:text-left flex-1 sm:mb-1">
            <h2 className="text-lg font-bold" style={{ color: 'var(--odoo-text)' }}>{displayName}</h2>
            <p className="text-sm" style={{ color: 'var(--odoo-text-muted)' }}>{profileUser?.job_title || profileUser?.jobTitle} · {profileUser?.department}</p>
          </div>
          {isOwnProfile && (
            <div className="sm:mb-1">
              {isEditing ? (
                <button onClick={handleSave} disabled={loading} className="o-btn-primary text-sm">
                  {loading ? 'Saving…' : <><Save className="h-3.5 w-3.5" /> Save</>}
                </button>
              ) : (
                <button onClick={() => setIsEditing(true)} className="o-btn-secondary text-sm">
                  <Edit className="h-3.5 w-3.5" /> Edit
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {msg && <div className="p-3 rounded border text-sm o-badge-success flex items-center gap-2"><Check className="h-4 w-4" /> {msg}</div>}

      <div className="o-card p-4">
        <div className="o-tabs">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`o-tab ${activeTab === tab ? 'o-tab--active' : ''}`}>{tab}</button>
          ))}
        </div>

        {activeTab === 'Resume' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="o-card p-4">
                <h3 className="font-semibold mb-3" style={{ color: 'var(--odoo-text)' }}>About</h3>
                {isEditing && isOwnProfile ? <textarea rows="4" value={form.about} onChange={(event) => setForm((value) => ({ ...value, about: event.target.value }))} className="o-input" /> : <p className="text-sm" style={{ color: 'var(--odoo-text-muted)' }}>{profileUser?.about || 'No summary added yet.'}</p>}
              </div>
              <div className="o-card p-4">
                <h3 className="font-semibold mb-3" style={{ color: 'var(--odoo-text)' }}>What I love about my job</h3>
                {isEditing && isOwnProfile ? <textarea rows="4" value={form.job_love} onChange={(event) => setForm((value) => ({ ...value, job_love: event.target.value }))} className="o-input" /> : <p className="text-sm" style={{ color: 'var(--odoo-text-muted)' }}>{profileUser?.job_love || 'No notes added yet.'}</p>}
              </div>
              <div className="o-card p-4">
                <h3 className="font-semibold mb-3" style={{ color: 'var(--odoo-text)' }}>Interests & Hobbies</h3>
                {isEditing && isOwnProfile ? <textarea rows="3" value={form.interests} onChange={(event) => setForm((value) => ({ ...value, interests: event.target.value }))} className="o-input" /> : <p className="text-sm" style={{ color: 'var(--odoo-text-muted)' }}>{profileUser?.interests || 'No interests added yet.'}</p>}
              </div>
            </div>
            <div className="space-y-4">
              <div className="o-card p-4">
                <h3 className="font-semibold mb-3" style={{ color: 'var(--odoo-text)' }}>Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {(profileUser?.skills || []).map((skill) => <span key={skill} className="o-badge o-badge-purple">{skill}</span>)}
                  {!profileUser?.skills?.length && <span className="text-sm" style={{ color: 'var(--odoo-text-muted)' }}>No skills listed.</span>}
                </div>
              </div>
              <div className="o-card p-4">
                <h3 className="font-semibold mb-3" style={{ color: 'var(--odoo-text)' }}>Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  {(profileUser?.certifications || []).map((cert) => <span key={cert} className="o-badge o-badge-info">{cert}</span>)}
                  {!profileUser?.certifications?.length && <span className="text-sm" style={{ color: 'var(--odoo-text-muted)' }}>No certifications listed.</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Private Info' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="o-card p-4">
                <h3 className="font-semibold mb-3" style={{ color: 'var(--odoo-text)' }}>Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="o-field-label">First Name</label>
                    {isEditing && isOwnProfile ? <input value={form.first_name} onChange={(event) => setForm((value) => ({ ...value, first_name: event.target.value }))} className="o-input" /> : <p className="o-field-value">{profileUser?.first_name || '—'}</p>}
                  </div>
                  <div>
                    <label className="o-field-label">Last Name</label>
                    {isEditing && isOwnProfile ? <input value={form.last_name} onChange={(event) => setForm((value) => ({ ...value, last_name: event.target.value }))} className="o-input" /> : <p className="o-field-value">{profileUser?.last_name || '—'}</p>}
                  </div>
                  <div>
                    <label className="o-field-label">Date of Birth</label>
                    {isEditing && isOwnProfile ? <input type="date" value={form.dob} onChange={(event) => setForm((value) => ({ ...value, dob: event.target.value }))} className="o-input" /> : <p className="o-field-value">{profileUser?.dob || '—'}</p>}
                  </div>
                  <div>
                    <label className="o-field-label">Nationality</label>
                    {isEditing && isOwnProfile ? <input value={form.nationality} onChange={(event) => setForm((value) => ({ ...value, nationality: event.target.value }))} className="o-input" /> : <p className="o-field-value">{profileUser?.nationality || '—'}</p>}
                  </div>
                  <div>
                    <label className="o-field-label">Personal Email</label>
                    {isEditing && isOwnProfile ? <input value={form.personal_email} onChange={(event) => setForm((value) => ({ ...value, personal_email: event.target.value }))} className="o-input" /> : <p className="o-field-value">{profileUser?.personal_email || '—'}</p>}
                  </div>
                  <div>
                    <label className="o-field-label">Gender</label>
                    {isEditing && isOwnProfile ? <input value={form.gender} onChange={(event) => setForm((value) => ({ ...value, gender: event.target.value }))} className="o-input" /> : <p className="o-field-value">{profileUser?.gender || '—'}</p>}
                  </div>
                  <div>
                    <label className="o-field-label">Marital Status</label>
                    {isEditing && isOwnProfile ? <input value={form.marital_status} onChange={(event) => setForm((value) => ({ ...value, marital_status: event.target.value }))} className="o-input" /> : <p className="o-field-value">{profileUser?.marital_status || '—'}</p>}
                  </div>
                  <div>
                    <label className="o-field-label">Date of Joining</label>
                    <p className="o-field-value">{profileUser?.joining_date || profileUser?.joinDate || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="o-card p-4">
                <h3 className="font-semibold mb-3" style={{ color: 'var(--odoo-text)' }}>Contact & Address</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 mt-0.5" style={{ color: 'var(--odoo-text-muted)' }} />
                    <div>
                      <p className="o-field-label">Work Email</p>
                      <p className="o-field-value">{profileUser?.email || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 mt-0.5" style={{ color: 'var(--odoo-text-muted)' }} />
                    <div>
                      <p className="o-field-label">Phone</p>
                      {isEditing && isOwnProfile ? <input value={form.phone} onChange={(event) => setForm((value) => ({ ...value, phone: event.target.value }))} className="o-input" /> : <p className="o-field-value">{profileUser?.phone || '—'}</p>}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5" style={{ color: 'var(--odoo-text-muted)' }} />
                    <div>
                      <p className="o-field-label">Residing Address</p>
                      {isEditing && isOwnProfile ? <textarea rows="3" value={form.address} onChange={(event) => setForm((value) => ({ ...value, address: event.target.value }))} className="o-input" /> : <p className="o-field-value">{profileUser?.address || '—'}</p>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="o-card p-4">
                <h3 className="font-semibold mb-3" style={{ color: 'var(--odoo-text)' }}>Bank Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="o-field-label">Account Number</label>
                    {isEditing && isOwnProfile ? <input value={form.bank_account} onChange={(event) => setForm((value) => ({ ...value, bank_account: event.target.value }))} className="o-input" /> : <p className="o-field-value">{profileUser?.bank_account || '—'}</p>}
                  </div>
                  <div>
                    <label className="o-field-label">Bank Name</label>
                    {isEditing && isOwnProfile ? <input value={form.bank_name} onChange={(event) => setForm((value) => ({ ...value, bank_name: event.target.value }))} className="o-input" /> : <p className="o-field-value">{profileUser?.bank_name || '—'}</p>}
                  </div>
                  <div>
                    <label className="o-field-label">IFSC Code</label>
                    {isEditing && isOwnProfile ? <input value={form.ifsc} onChange={(event) => setForm((value) => ({ ...value, ifsc: event.target.value }))} className="o-input" /> : <p className="o-field-value">{profileUser?.ifsc || '—'}</p>}
                  </div>
                  <div>
                    <label className="o-field-label">PAN No</label>
                    {isEditing && isOwnProfile ? <input value={form.pan_no} onChange={(event) => setForm((value) => ({ ...value, pan_no: event.target.value }))} className="o-input" /> : <p className="o-field-value">{profileUser?.pan_no || '—'}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Salary Info' && (
          <div className="o-card p-4 space-y-4">
            {currentUser?.role?.toUpperCase() === 'ADMIN' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="o-field-label">Wage Type</label>
                    <p className="o-field-value">{profileUser?.wage_type || 'Fixed'}</p>
                  </div>
                  <div>
                    <label className="o-field-label">Month / Yearly Wage</label>
                    <p className="o-field-value">₹{(profileUser?.monthly_wage || profileUser?.salary || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="o-field-label">Working Days / Week</label>
                    <p className="o-field-value">{profileUser?.working_days_per_week || 5}</p>
                  </div>
                  <div>
                    <label className="o-field-label">Break Time</label>
                    <p className="o-field-value">{profileUser?.break_time || 60} mins</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3" style={{ color: 'var(--odoo-text)' }}>Salary Components</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(profileUser?.salary_components || []).map((component) => (
                      <div key={component.name} className="rounded-lg border p-3" style={{ borderColor: 'var(--odoo-border-light)' }}>
                        <p className="font-medium text-sm" style={{ color: 'var(--odoo-text)' }}>{component.name}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--odoo-text-muted)' }}>{component.type === 'percent' ? `${component.value}% of wage` : `Fixed ₹${component.value}`}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 rounded-lg border text-center" style={{ borderColor: 'var(--odoo-border-light)', color: 'var(--odoo-text-muted)' }}>
                <Shield className="h-8 w-8 mx-auto mb-2" />
                Salary information is visible only to admins and HR officers.
              </div>
            )}
          </div>
        )}

        {activeTab === 'Security' && (
          <div className="o-card p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--odoo-text-muted)' }}><BadgeCheck className="h-4 w-4" style={{ color: 'var(--odoo-teal)' }} /> Two-factor authentication is enabled.</div>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--odoo-text-muted)' }}><CreditCard className="h-4 w-4" style={{ color: 'var(--odoo-purple)' }} /> Password last updated 15 days ago.</div>
            <div className="text-sm" style={{ color: 'var(--odoo-text-muted)' }}>Security settings can be expanded for policy controls in a later iteration.</div>
          </div>
        )}
      </div>
    </div>
  );
}
