import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { UserRole } from '../../types';
import { X, LogIn, Shield, Sparkles, User, Lock, Mail, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onLoginSuccess: (role: UserRole) => void;
  targetPostTitle?: string | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToRegister,
  onLoginSuccess,
  targetPostTitle,
}) => {
  const { roles, allowDevRoleSelector, login } = usePortal();

  const [selectedRole, setSelectedRole] = useState<UserRole>('applicant');
  const [email, setEmail] = useState('applicant@university.edu.in');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email or registration number.');
      return;
    }
    setError('');

    // Call login with selected role
    login(selectedRole, email);
    onLoginSuccess(selectedRole);
    onClose();
  };

  const handleQuickRoleSelect = (roleId: UserRole) => {
    setSelectedRole(roleId);
    if (roleId === 'applicant') setEmail('applicant@university.edu.in');
    else if (roleId === 'super_admin') setEmail('admin@university.edu.in');
    else if (roleId === 'screening_committee') setEmail('screening@university.edu.in');
    else if (roleId === 'doc_verifier') setEmail('dvo@university.edu.in');
    else if (roleId === 'interview_panel') setEmail('panelist@university.edu.in');
    else if (roleId === 'finance_admin') setEmail('finance@university.edu.in');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative text-slate-800 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <LogIn className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <h3 className="text-base font-bold">Portal Sign In</h3>
              <p className="text-xs text-indigo-100">National University Recruitment Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {targetPostTitle && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                Log in to continue your application for <strong>{targetPostTitle}</strong>.
              </span>
            </div>
          )}

          {/* Dev Mode Role Selector */}
          {allowDevRoleSelector && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                <span className="flex items-center gap-1 text-purple-700">
                  <Shield className="w-3.5 h-3.5" />
                  Development Role Selector
                </span>
                <span className="text-[9px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-mono">
                  Dev Mode Active
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Super admin toggle allows selecting login role directly during evaluation.
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Select Role to Authenticate As:
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => handleQuickRoleSelect(e.target.value as UserRole)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — ({r.description})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email / Registration Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address / Registration ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="registered.email@domain.com"
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Dashboard</span>
          </button>

          {/* Footer Switcher */}
          <div className="text-center pt-2 border-t border-slate-200 text-xs text-slate-600">
            <span>Don't have an applicant account? </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToRegister();
              }}
              className="text-indigo-600 font-bold hover:underline"
            >
              Register here
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
