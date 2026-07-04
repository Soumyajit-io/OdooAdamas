import { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import {
  User, Phone, MapPin, Mail, Shield,
  Briefcase, Calendar, DollarSign,
  Edit, Save, Check, BadgeCheck, CreditCard
} from 'lucide-react';

const tabs = ['Resume', 'Private Info', 'Salary Info', 'Security'];

export default function Profile() {
  const { employee, updateProfile } = useHRMS();

  const [activeTab, setActiveTab] = useState('Resume');
  const [isEditing, setIsEditing] = useState(false);

  const [firstName, setFirstName] = useState(employee?.first_name || '');
  const [lastName, setLastName] = useState(employee?.last_name || '');
  const [phone, setPhone] = useState(employee?.phone || '');
  const [address, setAddress] = useState(employee?.address || '');

  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const isOwnProfile = true; // replace later with auth check if needed

  const displayName =
    [employee?.first_name, employee?.last_name].filter(Boolean).join(' ') ||
    employee?.name ||
    'User';

  const handleSave = (e) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);

    setTimeout(() => {
      const res = updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone,
        address
      });

      setLoading(false);

      if (res?.success) {
        setIsEditing(false);
        setMsg('Profile updated successfully.');
        setTimeout(() => setMsg(''), 2500);
      }
    }, 500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 odoo-fade-in">

      {/* Header */}
      <div className="o-card overflow-hidden">
        <div className="h-24" style={{ background: 'linear-gradient(135deg, var(--odoo-purple), var(--odoo-purple-light))' }} />

        <div className="px-6 pb-5 flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-8 relative">
          <div className="h-20 w-20 rounded-xl bg-white p-1 shadow-md">
            <div className="h-full w-full rounded-lg flex items-center justify-center font-bold text-2xl text-white"
              style={{ background: 'var(--odoo-purple)' }}>
              {displayName.charAt(0)}
            </div>
          </div>

          <div className="text-center sm:text-left flex-1">
            <h2 className="text-lg font-bold">{displayName}</h2>
            <p className="text-sm" style={{ color: 'var(--odoo-text-muted)' }}>
              {employee?.job_title} · {employee?.department}
            </p>
          </div>

          {isOwnProfile && (
            <div>
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

      {/* Message */}
      {msg && (
        <div className="p-3 rounded border text-sm o-badge-success flex items-center gap-2">
          <Check className="h-4 w-4" /> {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="o-card p-4">
        <div className="o-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`o-tab ${activeTab === tab ? 'o-tab--active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* PERSONAL INFO */}
        <div className="o-card p-5 space-y-4">
          <h3 className="font-bold text-[15px] border-b pb-3 flex items-center gap-2">
            <User className="h-4 w-4" /> Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs">First Name</label>
              {isEditing ? (
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="o-input" />
              ) : (
                <p>{employee?.first_name}</p>
              )}
            </div>

            <div>
              <label className="text-xs">Last Name</label>
              {isEditing ? (
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="o-input" />
              ) : (
                <p>{employee?.last_name}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs">Email</label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <p>{employee?.email}</p>
            </div>
          </div>

          <div>
            <label className="text-xs">Phone</label>
            {isEditing ? (
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="o-input" />
            ) : (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <p>{employee?.phone}</p>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs">Address</label>
            {isEditing ? (
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="o-input" />
            ) : (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1" />
                <p>{employee?.address}</p>
              </div>
            )}
          </div>
        </div>

        {/* JOB INFO */}
        <div className="o-card p-5 space-y-4">
          <h3 className="font-bold text-[15px] border-b pb-3 flex items-center gap-2">
            <Briefcase className="h-4 w-4" /> Employment Details
          </h3>

          <p>Employee ID: {employee?.employee_id}</p>
          <p>Role: {employee?.role}</p>
          <p>Department: {employee?.department}</p>
          <p>Job Title: {employee?.job_title}</p>

          <div className="flex gap-2 items-center">
            <DollarSign className="h-4 w-4" />
            <p>{(employee?.salary || 0).toLocaleString()}/mo</p>
          </div>
        </div>

        {/* SECURITY */}
        {activeTab === 'Security' && (
          <div className="o-card p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <BadgeCheck className="h-4 w-4" />
              Two-factor authentication enabled
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4" />
              Password updated recently
            </div>
          </div>
        )}

        {/* SALARY */}
        {activeTab === 'Salary Info' && (
          <div className="o-card p-4">
            {employee?.role?.toUpperCase() === 'ADMIN' ? (
              <p>Salary: {employee?.salary}</p>
            ) : (
              <p>Salary info restricted</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}