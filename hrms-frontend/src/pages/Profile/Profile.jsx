import { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { User, Phone, MapPin, Mail, Shield, Briefcase, Calendar, DollarSign, Edit, Save, Check } from 'lucide-react';

export default function Profile() {
  const { currentUser, updateProfile } = useHRMS();
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit Form Fields
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);

    setTimeout(() => {
      const res = updateProfile({ name, phone, address });
      setLoading(false);
      if (res.success) {
        setIsEditing(false);
        setMsg('Profile updated successfully!');
        setTimeout(() => setMsg(''), 3000);
      }
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Cover Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-indigo-800"></div>
        <div className="px-6 pb-6 relative flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-10">
          <div className="h-24 w-24 rounded-2xl bg-white p-1 shadow-lg shrink-0">
            <div className="h-full w-full rounded-xl bg-indigo-650 bg-indigo-600 flex items-center justify-center font-bold text-3xl text-white uppercase">
              {currentUser?.name.charAt(0)}
            </div>
          </div>
          <div className="text-center sm:text-left flex-1 space-y-1 sm:mb-2">
            <h2 className="text-xl font-bold text-slate-800">{currentUser?.name}</h2>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{currentUser?.jobTitle}</p>
          </div>
          <div className="sm:mb-2">
            {isEditing ? (
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-xl text-xs shadow-md transition-all"
              >
                {loading ? 'Saving...' : <><Save className="h-3.5 w-3.5" /> Save Changes</>}
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-slate-600 font-semibold py-2 px-4 rounded-xl text-xs border border-slate-200 transition-all"
              >
                <Edit className="h-3.5 w-3.5" /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-semibold flex items-center gap-2 animate-bounce-short">
          <Check className="h-5 w-5" /> {msg}
        </div>
      )}

      {/* Details Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Personal Details */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
          <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <User className="h-4 w-4 text-indigo-600" /> Personal Information
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              ) : (
                <p className="mt-1 text-sm font-medium text-slate-800">{currentUser?.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase">Email Address</label>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4 text-slate-400" />
                <p className="text-sm font-medium text-slate-800">{currentUser?.email}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase">Contact Phone</label>
              {isEditing ? (
                <div className="mt-1.5 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <p className="text-sm font-medium text-slate-800">{currentUser?.phone}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase">Residential Address</label>
              {isEditing ? (
                <div className="mt-1.5 relative">
                  <div className="absolute top-3 left-3 pointer-events-none text-slate-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <textarea
                    rows="3"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              ) : (
                <div className="flex items-start gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-slate-800 leading-relaxed">{currentUser?.address}</p>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Job/Professional Details */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
          <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-indigo-600" /> Job Information
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase">Employee ID</label>
              <p className="mt-1 text-sm font-mono font-bold text-slate-900">{currentUser?.id}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase">Employment Status</label>
                <span className="inline-flex mt-1 items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">
                  <Shield className="h-3 w-3" /> Full-time
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase">Role Type</label>
                <p className="mt-1 text-sm font-semibold text-slate-800">{currentUser?.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase">Department</label>
                <p className="mt-1 text-sm font-medium text-slate-800">{currentUser?.department}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase">Job Title</label>
                <p className="mt-1 text-sm font-medium text-slate-800">{currentUser?.jobTitle}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase">Date of Joining</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <p className="text-sm font-medium text-slate-800">{currentUser?.joinDate}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase">Base Salary</label>
                <div className="flex items-center gap-1 mt-1 font-semibold text-slate-800">
                  <DollarSign className="h-4 w-4 text-slate-400 -mr-0.5" />
                  <span>{currentUser?.salary.toLocaleString()}/mo</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
