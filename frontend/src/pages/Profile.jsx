import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { interviewService } from '../services/interviewService';
import { authService } from '../services/authService';
import {
  FileText,
  Upload,
  Sparkles,
  Save,
  CheckCircle,
  Plus,
  X,
  Briefcase,
  GraduationCap,
  Building,
} from 'lucide-react';

export default function Profile() {
  const { profile, refreshProfile } = useAuth();

  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [targetRole, setTargetRole] = useState('Senior Full Stack Engineer');
  const [targetCompany, setTargetCompany] = useState('Google');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkillName, setNewSkillName] = useState('');

  // Resume state
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeParsedData, setResumeParsedData] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (profile?.profile) {
      setEducation(profile.profile.education || '');
      setExperience(profile.profile.experience || '');
      setTargetRole(profile.profile.target_role || 'Senior Full Stack Engineer');
      setTargetCompany(profile.profile.target_company || 'Google');
      setBio(profile.profile.bio || '');
    }
    if (profile?.skills) {
      setSkills(profile.skills);
    }
  }, [profile]);

  // Load existing resume
  useEffect(() => {
    async function loadResume() {
      try {
        const latest = await interviewService.getLatestResume();
        if (latest) {
          setResumeParsedData(latest);
        }
      } catch (err) {
        console.warn('Could not load latest resume:', err);
      }
    }
    loadResume();
  }, []);

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingResume(true);
      const res = await interviewService.uploadResume(file);
      setResumeParsedData(res);
      await refreshProfile();
      alert('Resume parsed successfully! Detected skills added to your profile.');
    } catch (err) {
      console.error('Resume upload failed:', err);
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingResume(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    if (skills.some((s) => s.skill_name.toLowerCase() === newSkillName.trim().toLowerCase())) {
      setNewSkillName('');
      return;
    }
    setSkills([
      ...skills,
      { skill_name: newSkillName.trim(), proficiency: 'Advanced' },
    ]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (skillName) => {
    setSkills(skills.filter((s) => s.skill_name !== skillName));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await authService.updateProfile({
        education,
        experience,
        target_role: targetRole,
        target_company: targetCompany,
        bio,
        skills,
      });
      await refreshProfile();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Candidate Profile & Resume
        </h1>
        <p className="text-slate-400 text-xs md:text-sm mt-1">
          Upload your resume and customize your background so the AI interviewer creates hyper-realistic questions.
        </p>
      </div>

      {/* Resume Upload & Parsing Section */}
      <div className="bg-[#121522] border border-violet-500/30 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <FileText className="w-4 h-4 text-purple-400" />
            <span>Resume Upload & Skill Extraction</span>
          </div>
          <span className="text-[11px] text-purple-400 bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-500/30">
            PDF / DOCX
          </span>
        </div>

        <div className="p-6 border-2 border-dashed border-slate-700/80 hover:border-purple-500/60 rounded-xl bg-slate-900/50 flex flex-col items-center justify-center text-center transition group">
          <Upload className="w-10 h-10 text-purple-400 group-hover:scale-110 transition mb-2" />
          <p className="text-sm font-semibold text-white">
            {uploadingResume ? 'Parsing document with NLP...' : 'Click or Drag Resume here'}
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            We extract your tech stack, project history, and experience to generate tailored technical scenarios.
          </p>

          <label className="mt-4 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer shadow-md shadow-purple-900/30 transition">
            <span>Browse File</span>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleResumeUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Parsed Resume Details Preview */}
        {resumeParsedData && (
          <div className="mt-4 p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs space-y-2">
            <div className="flex items-center justify-between text-purple-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Active Resume: {resumeParsedData.filename}
              </span>
            </div>
            {resumeParsedData.skills_detected?.length > 0 && (
              <div className="space-y-1">
                <span className="text-slate-400 text-[11px]">Detected Skills:</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {resumeParsedData.skills_detected.map((sk) => (
                    <span
                      key={sk}
                      className="px-2 py-0.5 rounded-md bg-purple-900/40 text-purple-300 text-[10px] border border-purple-500/30"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="bg-[#121522] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <h3 className="text-sm font-bold text-white tracking-wide">Target Goals & Background</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                Target Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-purple-400" />
                Target Dream Company
              </label>
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder="e.g. Google, Meta, Amazon"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
              Education
            </label>
            <input
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="e.g. B.S. in Computer Science"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1.5">
              Experience Summary
            </label>
            <textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              rows={3}
              placeholder="e.g. 3+ years building high-concurrency microservices, React web applications, and Redis caching systems."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-purple-500 resize-none"
            />
          </div>
        </div>

        {/* Skills Selection & Tags */}
        <div className="bg-[#121522] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-wide">
              Skill Selection & Competencies
            </h3>
            <span className="text-xs text-slate-400">{skills.length} skills selected</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="Add skill (e.g. Docker, GraphQL, System Design)..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {skills.map((s) => (
              <span
                key={s.skill_name}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-200"
              >
                <span>{s.skill_name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(s.skill_name)}
                  className="text-slate-500 hover:text-rose-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end gap-3">
          {saveSuccess && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              Profile updated!
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
}

