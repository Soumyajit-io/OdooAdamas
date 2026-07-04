import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useHRMS } from '../../context/HRMSContext';
import { User, Phone, MapPin, Mail, Shield, Briefcase, Calendar, DollarSign, Edit, Save, Check, BadgeCheck, CreditCard } from 'lucide-react';

const tabs = ['Resume', 'Private Info', 'Salary Info', 'Security'];

export default function Profile() {
  const { employee, updateProfile } = useHRMS();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(employee?.first_name || '');
  const [lastName, setLastName] = useState(employee?.last_name || '');
  const [phone, setPhone] = useState(employee?.phone || '');
  const [address, setAddress] = useState(employee?.address || '');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const displayName = [employee?.first_name, employee?.last_name].filter(Boolean).join(' ') || employee?.name || 'User';

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
            <p className="text-sm" style={{ color: 'var(--odoo-text-muted)' }}>
              {employee?.job_title || employee?.jobTitle} · {employee?.department}
            </p>
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
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="o-card p-5 space-y-4">
          <h3 className="font-bold text-[15px] border-b pb-3 flex items-center gap-2" style={{ color: 'var(--odoo-text)', borderColor: 'var(--odoo-border-light)' }}>
            <User className="h-4 w-4" style={{ color: 'var(--odoo-purple)' }} /> Personal Information
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--odoo-text-muted)' }}>First Name</label>
                {isEditing ? (
                  <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="o-input" />
                ) : (
                  <p className="text-sm font-medium" style={{ color: 'var(--odoo-text)' }}>{employee?.first_name}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--odoo-text-muted)' }}>Last Name</label>
                {isEditing ? (
                  <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="o-input" />
                ) : (
                  <p className="text-sm font-medium" style={{ color: 'var(--odoo-text)' }}>{employee?.last_name}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--odoo-text-muted)' }}>Email</label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" style={{ color: 'var(--odoo-text-light)' }} />
                <p className="text-sm" style={{ color: 'var(--odoo-text)' }}>{employee?.email}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--odoo-text-muted)' }}>Phone</label>
              {isEditing ? (
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="o-input" />
              ) : (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" style={{ color: 'var(--odoo-text-light)' }} />
                  <p className="text-sm" style={{ color: 'var(--odoo-text)' }}>{employee?.phone}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--odoo-text-muted)' }}>Address</label>
              {isEditing ? (
                <textarea rows="2" required value={address} onChange={(e) => setAddress(e.target.value)} className="o-input" />
              ) : (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" style={{ color: 'var(--odoo-text-light)' }} />
                  <p className="text-sm" style={{ color: 'var(--odoo-text)' }}>{employee?.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Job Info */}
        <div className="o-card p-5 space-y-4">
          <h3 className="font-bold text-[15px] border-b pb-3 flex items-center gap-2" style={{ color: 'var(--odoo-text)', borderColor: 'var(--odoo-border-light)' }}>
            <Briefcase className="h-4 w-4" style={{ color: 'var(--odoo-purple)' }} /> Employment Details
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--odoo-text-muted)' }}>Employee ID</label>
              <p className="text-sm font-mono font-bold" style={{ color: 'var(--odoo-text)' }}>{employee?.employee_id}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--odoo-text-muted)' }}>Status</label>
                <span className="o-badge o-badge-success">
                  <Shield className="h-3 w-3 mr-1" /> Full-time
                </span>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--odoo-text-muted)' }}>Role</label>
                <span className="o-badge o-badge-purple">{employee?.role}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--odoo-text-muted)' }}>Department</label>
                <p className="text-sm font-medium" style={{ color: 'var(--odoo-text)' }}>{employee?.department}</p>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--odoo-text-muted)' }}>Job Title</label>
                <p className="text-sm font-medium" style={{ color: 'var(--odoo-text)' }}>{employee?.job_title || employee?.jobTitle}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--odoo-text-muted)' }}>Join Date</label>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" style={{ color: 'var(--odoo-text-light)' }} />
                  <p className="text-sm" style={{ color: 'var(--odoo-text)' }}>{employee?.joining_date || employee?.joinDate}</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--odoo-text-muted)' }}>Salary</label>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" style={{ color: 'var(--odoo-text-light)' }} />
                  <p className="text-sm font-medium" style={{ color: 'var(--odoo-text)' }}>{(employee?.salary || 0).toLocaleString()}/mo</p>
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
