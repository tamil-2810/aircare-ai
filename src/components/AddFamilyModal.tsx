import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserCheck, Heart, Activity } from 'lucide-react';
import { FamilyMember, HealthSensitivity, ActivityType } from '../types';

interface AddFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (member: FamilyMember) => void;
  onUpdateMember?: (member: FamilyMember) => void;
  memberToEdit?: FamilyMember | null;
}

export const AddFamilyModal: React.FC<AddFamilyModalProps> = ({
  isOpen,
  onClose,
  onAddMember,
  onUpdateMember,
  memberToEdit,
}) => {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Parent');
  const [age, setAge] = useState<number>(45);
  const [sensitivity, setSensitivity] = useState<HealthSensitivity>('moderate');
  const [preferredActivity, setPreferredActivity] = useState<ActivityType>('Walking');
  const [customNotes, setCustomNotes] = useState('');

  const colorPool = [
    'bg-purple-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-rose-500',
    'bg-amber-500',
    'bg-blue-500',
    'bg-emerald-500',
    'bg-indigo-500',
  ];

  // Sync state when modal opens or memberToEdit changes
  useEffect(() => {
    if (memberToEdit) {
      setName(memberToEdit.name);
      setRelationship(memberToEdit.relationship || 'Other');
      setAge(memberToEdit.age);
      setSensitivity(memberToEdit.sensitivity);
      setPreferredActivity(memberToEdit.preferredActivity || 'Walking');
      setCustomNotes(memberToEdit.customNotes || '');
    } else {
      setName('');
      setRelationship('Parent');
      setAge(45);
      setSensitivity('moderate');
      setPreferredActivity('Walking');
      setCustomNotes('');
    }
  }, [memberToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (memberToEdit && onUpdateMember) {
      const updatedMember: FamilyMember = {
        ...memberToEdit,
        name: name.trim(),
        relationship,
        age: Number(age) || 30,
        sensitivity,
        preferredActivity,
        riskStatus:
          sensitivity === 'high'
            ? 'High Risk'
            : sensitivity === 'moderate'
            ? 'Moderate Risk'
            : sensitivity === 'mild'
            ? 'Mild Risk'
            : 'Safe',
        customNotes: customNotes.trim() || undefined,
      };
      onUpdateMember(updatedMember);
    } else {
      const newMember: FamilyMember = {
        id: `fam-${Date.now()}`,
        name: name.trim(),
        relationship,
        age: Number(age) || 30,
        sensitivity,
        preferredActivity,
        riskStatus:
          sensitivity === 'high'
            ? 'High Risk'
            : sensitivity === 'moderate'
            ? 'Moderate Risk'
            : sensitivity === 'mild'
            ? 'Mild Risk'
            : 'Safe',
        avatarColor: colorPool[Math.floor(Math.random() * colorPool.length)],
        customNotes: customNotes.trim() || undefined,
      };
      onAddMember(newMember);
    }

    onClose();
  };

  return (
    <div 
      id="family-member-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div 
        id="family-member-modal-container"
        className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-8 text-left space-y-6 animate-in fade-in zoom-in-95 duration-200"
      >
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              {memberToEdit ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {memberToEdit ? 'Edit Family Member' : 'Add Family Member'}
              </h2>
              <span className="text-xs text-slate-500">
                {memberToEdit ? 'Update air-quality sensitivity profile' : 'Track air-quality sensitivity for household members'}
              </span>
            </div>
          </div>

          <button
            id="family-modal-close-btn"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="family-member-name-input" className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Name
            </label>
            <input
              id="family-member-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mother, Grandfather, Sarah"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="family-member-relationship-select" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Relationship
              </label>
              <select
                id="family-member-relationship-select"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm text-slate-900 bg-white"
              >
                <option value="Parent">Parent</option>
                <option value="Spouse">Spouse</option>
                <option value="Child">Child</option>
                <option value="Sibling">Sibling</option>
                <option value="Grandparent">Grandparent</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="family-member-age-input" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Age
              </label>
              <input
                id="family-member-age-input"
                type="number"
                required
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Health Sensitivity
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['none', 'mild', 'moderate', 'high'] as HealthSensitivity[]).map((sens) => (
                <button
                  type="button"
                  key={sens}
                  id={`family-sensitivity-${sens}-btn`}
                  onClick={() => setSensitivity(sens)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                    sensitivity === sens
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {sens}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="family-member-routine-select" className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Preferred Outdoor Routine
            </label>
            <select
              id="family-member-routine-select"
              value={preferredActivity}
              onChange={(e) => setPreferredActivity(e.target.value as ActivityType)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm text-slate-900 bg-white"
            >
              <option value="Walking">Walking</option>
              <option value="Running">Running</option>
              <option value="Cycling">Cycling</option>
              <option value="Outdoor Exercise">Outdoor Exercise</option>
              <option value="Travel">Travel / Commute</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="family-member-notes-input" className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Medical / Activity Notes (Optional)
            </label>
            <input
              id="family-member-notes-input"
              type="text"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. Mild asthma, wears mask in traffic"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm text-slate-900"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="family-member-submit-btn"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
            >
              {memberToEdit ? 'Save Changes' : 'Add Member'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
