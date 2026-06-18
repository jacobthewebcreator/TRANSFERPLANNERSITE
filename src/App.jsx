"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import {
  BookOpen, Award, BookMarked, Menu, X, Plus, Trash2, ArrowRight, Lock,
  CheckCircle2, AlertCircle, Check, Sparkles, Send, Loader2, MessageSquare,
  ChevronDown, Calendar, Database, CreditCard, Star, Zap, Shield
} from 'lucide-react';
import {
  MAJOR_CATEGORIES, ALL_MAJORS, TAG_CAMPUSES, TAG_REQUIREMENTS, MAJOR_REQUIREMENTS
} from './data/majors.js';

// --- FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyBwVX3hO1qgZQQhtxR8ysxUhWS5bK3oE2Q",
  authDomain: "transferplanner-4b690.firebaseapp.com",
  projectId: "transferplanner-4b690",
  storageBucket: "transferplanner-4b690.firebasestorage.app",
  messagingSenderId: "947959214245",
  appId: "1:947959214245:web:7faa787324d07dbf849d4c",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const APP_ID = 'pathmaker-production';

// --- HELPERS ---
function getMajorCategory(majorName) {
  for (const [cat, majors] of Object.entries(MAJOR_CATEGORIES)) {
    if (majors.includes(majorName)) return cat;
  }
  return 'Humanities / Social Sciences';
}

function getCompletionStats(majorName, courses) {
  const reqs = MAJOR_REQUIREMENTS[majorName];
  if (!reqs) return { completed: 0, inProgress: 0, total: 0, percent: 0 };
  const required = reqs.filter(r => r.required);
  let completed = 0, inProgress = 0;
  required.forEach(req => {
    const match = courses.find(c => c.code.toUpperCase() === req.code.toUpperCase());
    if (match?.status === 'Completed') completed++;
    else if (match?.status === 'In Progress') inProgress++;
  });
  const total = required.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, inProgress, total, percent };
}

// --- PROGRESS RING ---
function ProgressRing({ percent, size = 56, stroke = 5, color = '#6366f1' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('landing');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSaving, setIsSaving] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isAiWidgetExpanded, setIsAiWidgetExpanded] = useState(false);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);

  // User data
  const [isPremium, setIsPremium] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [subscriptionId, setSubscriptionId] = useState(null);
  const [trialEnd, setTrialEnd] = useState(null);
  const [selectedMajor, setSelectedMajor] = useState('Computer Science B.S.');
  const [aiApiKey, setAiApiKey] = useState('');

  const [courses, setCourses] = useState([
    { id: 1, code: 'ENGL 1A', name: 'Reading and Comp', units: 4, grade: 'A', status: 'Completed', term: 'Fall 2024' },
    { id: 2, code: 'MATH 1A', name: 'Calculus I', units: 5, grade: 'B', status: 'Completed', term: 'Fall 2024' },
    { id: 3, code: 'MATH 1B', name: 'Calculus II', units: 5, grade: 'A', status: 'Completed', term: 'Spring 2025' },
    { id: 4, code: 'CS 61A', name: 'Structure of Computer Programs', units: 4, grade: 'IP', status: 'In Progress', term: 'Fall 2025' },
  ]);

  const [newCourse, setNewCourse] = useState({ code: '', name: '', units: '', grade: 'A', term: 'Fall 2024' });

  // AI Chat
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: "Hey! I'm your PathMaker advisor. I've analyzed your transcript. Ask me what courses you need next, or about your TAG eligibility!" }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setCurrentView(u ? 'app' : 'landing');
    });
    return unsub;
  }, []);

  // Firestore sync
  useEffect(() => {
    if (!user) return;
    const ref = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'settings', 'profile');
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        if (d.courses) setCourses(d.courses);
        if (d.isPremium !== undefined) setIsPremium(d.isPremium);
        if (d.selectedMajor) setSelectedMajor(d.selectedMajor);
        if (d.aiApiKey) setAiApiKey(d.aiApiKey);
        if (d.subscriptionStatus) setSubscriptionStatus(d.subscriptionStatus);
        if (d.subscriptionId) setSubscriptionId(d.subscriptionId);
        if (d.trialEnd) setTrialEnd(d.trialEnd);
      }
    });
    return unsub;
  }, [user]);

  // Check for Stripe success redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      window.history.replaceState({}, '', window.location.pathname);
      if (user) setCurrentView('app');
    }
  }, [user]);

  const saveUserData = async (fields) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const ref = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'settings', 'profile');
      await setDoc(ref, fields, { merge: true });
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  // --- COMPUTED ---
  const majorCategory = useMemo(() => getMajorCategory(selectedMajor), [selectedMajor]);

  const calculatedMetrics = useMemo(() => {
    let totalPoints = 0, gradedUnits = 0, completedUnits = 0, inProgressUnits = 0;
    const gp = { A: 4, B: 3, C: 2, D: 1, F: 0 };
    courses.forEach(c => {
      if (c.status === 'Completed') {
        completedUnits += c.units;
        if (gp[c.grade] !== undefined) { gradedUnits += c.units; totalPoints += gp[c.grade] * c.units; }
      } else if (c.status === 'In Progress') inProgressUnits += c.units;
    });
    const gpa = gradedUnits > 0 ? parseFloat((totalPoints / gradedUnits).toFixed(2)) : 0;
    return { transferGPA: gpa, completedUnits, inProgressUnits, totalTrackedUnits: completedUnits + inProgressUnits };
  }, [courses]);

  const completionStats = useMemo(() => getCompletionStats(selectedMajor, courses), [selectedMajor, courses]);

  const coursesByTerm = useMemo(() => {
    const order = ['Fall 2024','Winter 2025','Spring 2025','Summer 2025','Fall 2025','Winter 2026','Spring 2026'];
    const groups = {};
    order.forEach(t => { groups[t] = []; });
    courses.forEach(c => { if (!groups[c.term]) groups[c.term] = []; groups[c.term].push(c); });
    return groups;
  }, [courses]);

  const tagEvaluations = useMemo(() => {
    return TAG_CAMPUSES.map(campus => {
      const reqs = TAG_REQUIREMENTS[campus]?.[majorCategory] || { minGpa: 3.0, notes: '' };
      const stats = completionStats;
      const isGpaEligible = calculatedMetrics.transferGPA >= reqs.minGpa;
      const isEligible = isGpaEligible && calculatedMetrics.totalTrackedUnits >= 30;
      return { campus, minGpa: reqs.minGpa, notes: reqs.notes, isEligible, isGpaEligible, completionPercent: stats.percent };
    });
  }, [majorCategory, calculatedMetrics, completionStats]);

  // --- STRIPE CHECKOUT ---
  const handleStartTrial = async () => {
    if (!user) { setCurrentView('auth'); return; }
    setIsLoadingCheckout(true);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, email: user.email }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert('Could not start checkout. Please try again.');
    } catch (e) {
      console.error(e);
      alert('Checkout error. Please try again.');
    } finally {
      setIsLoadingCheckout(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscriptionId) return;
    if (!confirm('Cancel your subscription? You keep access until the end of your billing period.')) return;
    try {
      await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId }),
      });
      alert('Subscription canceled. Access continues until period end.');
    } catch (e) {
      alert('Error canceling. Please contact support.');
    }
  };

  // --- AI CHAT ---
  const handleWidgetChatSubmit = async (text) => {
    if (!text.trim()) return;
    const history = [...chatMessages, { role: 'user', text }];
    setChatMessages(history);
    setCurrentInput('');
    setIsAiResponding(true);
    const reqs = MAJOR_REQUIREMENTS[selectedMajor] || [];
    const missing = reqs.filter(r => r.required && !courses.find(c => c.code.toUpperCase() === r.code.toUpperCase())).map(r => r.code);
    const ctx = `You are a UC transfer advisor inside PathMaker. Student data: Major: ${selectedMajor} (${majorCategory}). GPA: ${calculatedMetrics.transferGPA}. Completed units: ${calculatedMetrics.completedUnits}. Major prereq completion: ${completionStats.percent}% (${completionStats.completed}/${completionStats.total} required courses done). Missing required courses: ${missing.join(', ') || 'none'}. Courses taken: ${courses.map(c => `${c.code} (${c.grade})`).join(', ')}. Be concise, use bullet points, reference specific courses.`;
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${aiApiKey || ''}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: `${ctx}\n\nStudent: ${text}` }] }] }) }
      );
      const out = await res.json();
      const reply = out.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to respond. Check your Gemini API key in Settings.';
      setChatMessages([...history, { role: 'assistant', text: reply }]);
    } catch {
      setChatMessages([...history, { role: 'assistant', text: 'Connection error. Please check your API key in Settings.' }]);
    } finally {
      setIsAiResponding(false);
    }
  };

  // --- COURSE ACTIONS ---
  const handleAddCourse = (e) => {
    e.preventDefault();
    if (!newCourse.code || !newCourse.units) return;
    const updated = [...courses, {
      id: Date.now(),
      code: newCourse.code.toUpperCase().trim(),
      name: newCourse.name.trim() || 'General Education',
      units: parseFloat(newCourse.units),
      grade: newCourse.grade,
      status: newCourse.grade === 'IP' ? 'In Progress' : 'Completed',
      term: newCourse.term,
    }];
    setCourses(updated);
    saveUserData({ courses: updated });
    setNewCourse({ code: '', name: '', units: '', grade: 'A', term: newCourse.term });
  };

  const handleDeleteCourse = (id) => {
    const updated = courses.filter(c => c.id !== id);
    setCourses(updated);
    saveUserData({ courses: updated });
  };

  const handleMajorChange = (major) => {
    setSelectedMajor(major);
    saveUserData({ selectedMajor: major });
  };

  const triggerGoogleLogin = async () => {
    setAuthError('');
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch (e) { setAuthError(e.message); }
  };

  const triggerGuestLogin = async () => {
    try { await signInAnonymously(auth); }
    catch (e) { setAuthError(e.message); }
  };

  const executeLogout = async () => {
    await signOut(auth);
    setCurrentView('landing');
  };

  const trialDaysLeft = trialEnd
    ? Math.max(0, Math.ceil((new Date(trialEnd) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden antialiased">
      {isMobileMenuOpen && <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />}

      {/* ── LANDING ── */}
      {currentView === 'landing' && (
        <div className="flex flex-col w-full h-full overflow-y-auto bg-white">
          <header className="max-w-7xl mx-auto w-full px-6 py-5 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2 text-indigo-600 font-black text-2xl"><BookMarked className="w-8 h-8" /><span>PathMaker</span></div>
            <button onClick={() => setCurrentView('auth')} className="bg-indigo-50 text-indigo-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-indigo-100 transition-all">Sign In</button>
          </header>

          <main className="max-w-6xl mx-auto w-full px-6 flex-1 flex flex-col items-center justify-center gap-16 py-16">
            <div className="text-center space-y-6 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-4 h-4 text-indigo-500" /> UC Transfer Planner for California CC Students
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight">
                Plan Term by Term.<br />
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Secure Your UC Spot.</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-xl mx-auto">
                Track your transcript, see exactly which prerequisites you're missing for 30+ majors, and verify TAG eligibility across all 6 participating UC campuses.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => setCurrentView('auth')} className="bg-indigo-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2 text-base">
                  Start Free 3-Day Trial <ArrowRight className="w-5 h-5" />
                </button>
                <button onClick={() => setCurrentView('auth')} className="bg-white text-slate-700 border border-slate-200 font-bold px-8 py-4 rounded-2xl hover:bg-slate-50 transition-all text-base shadow-sm">
                  Explore as Guest
                </button>
              </div>
              <p className="text-xs text-slate-400">3 days free, then $7/month. Cancel anytime.</p>
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
              {[
                { icon: <Database className="w-6 h-6 text-indigo-500" />, title: '30+ Major Prereq Lists', desc: 'Every required course for CS, Biology, Business, and more — automatically checked against your transcript.' },
                { icon: <Award className="w-6 h-6 text-emerald-500" />, title: 'Live TAG Eligibility', desc: 'Real-time GPA and unit tracking against all 6 TAG-participating UC campuses.' },
                { icon: <Sparkles className="w-6 h-6 text-purple-500" />, title: 'AI Transfer Advisor', desc: 'Ask your built-in AI advisor exactly which classes to take next based on your transcript.' },
              ].map((f, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">{f.icon}</div>
                  <h3 className="font-bold text-slate-800">{f.title}</h3>
                  <p className="text-sm text-slate-500">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white text-center max-w-md w-full space-y-4 shadow-xl">
              <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold"><Star className="w-3.5 h-3.5" /> PathMaker Pro</div>
              <div><span className="text-5xl font-black">$7</span><span className="text-white/70">/month</span></div>
              <p className="text-white/80 text-sm">Start with a <strong className="text-white">3-day free trial</strong>. No charge until trial ends.</p>
              <button onClick={() => setCurrentView('auth')} className="w-full bg-white text-indigo-700 font-black py-3.5 rounded-2xl hover:bg-indigo-50 transition-all">
                Start Free Trial
              </button>
              <p className="text-white/50 text-xs">Cancel anytime from your account settings.</p>
            </div>
          </main>
        </div>
      )}

      {/* ── AUTH ── */}
      {currentView === 'auth' && (
        <div className="flex justify-center items-center w-full h-full bg-slate-50 p-6">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6 text-center">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-indigo-600 font-black text-3xl"><BookMarked className="w-9 h-9" /><span>PathMaker</span></div>
              <h2 className="text-2xl font-extrabold text-slate-900">Create Your Account</h2>
              <p className="text-sm text-slate-400">Sign in to save your transcript and track your progress across sessions.</p>
            </div>
            <div className="space-y-3">
              <button onClick={triggerGoogleLogin} className="w-full py-3.5 px-4 border border-slate-200 rounded-2xl font-bold text-slate-700 bg-white hover:bg-slate-50 flex items-center justify-center gap-3 transition-all shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
              <button onClick={triggerGuestLogin} className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all text-sm">
                Explore as Guest (no save)
              </button>
            </div>
            {authError && <p className="text-xs text-rose-500 bg-rose-50 p-2.5 rounded-lg font-medium">{authError}</p>}
            <button onClick={() => setCurrentView('landing')} className="text-xs text-slate-400 font-bold hover:underline">&larr; Back</button>
          </div>
        </div>
      )}

      {/* ── APP ── */}
      {currentView === 'app' && (
        <div className="flex w-full h-full overflow-hidden">

          {/* Sidebar */}
          <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="h-16 border-b border-slate-100 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-xl"><BookMarked className="w-6 h-6" /><span>PathMaker</span></div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400"><X className="w-5 h-5" /></button>
            </div>

            {/* Major selector */}
            <div className="p-4 border-b border-slate-100">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Target Major</label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedMajor}
                onChange={(e) => handleMajorChange(e.target.value)}
              >
                {Object.entries(MAJOR_CATEGORIES).map(([cat, majors]) => (
                  <optgroup key={cat} label={cat}>
                    {majors.map(m => <option key={m} value={m}>{m}</option>)}
                  </optgroup>
                ))}
              </select>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${completionStats.percent}%` }} />
                </div>
                <span className="text-[10px] font-black text-indigo-600">{completionStats.percent}%</span>
              </div>
            </div>

            <nav className="p-4 flex-1 space-y-1">
              {['Dashboard', 'My Transcript', 'Prerequisites', 'TAG Eligibility', 'Settings'].map(item => (
                <button key={item} onClick={() => { setActiveTab(item); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === item ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                  {item}
                </button>
              ))}
            </nav>

            {/* Trial / Premium badge */}
            {!isPremium && (
              <div className="mx-4 mb-2 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                <p className="text-xs font-bold text-indigo-700">Unlock Full Access</p>
                <p className="text-[10px] text-indigo-500 mt-0.5">3-day free trial, then $7/mo</p>
                <button onClick={handleStartTrial} disabled={isLoadingCheckout}
                  className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-70">
                  {isLoadingCheckout ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  Start Free Trial
                </button>
              </div>
            )}

            {isPremium && subscriptionStatus === 'trialing' && trialDaysLeft !== null && (
              <div className="mx-4 mb-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                <p className="text-xs font-bold text-emerald-700 flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Pro Trial Active</p>
                <p className="text-[10px] text-emerald-600 mt-0.5">{trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} remaining</p>
              </div>
            )}

            {isPremium && subscriptionStatus === 'active' && (
              <div className="mx-4 mb-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                <p className="text-xs font-bold text-emerald-700 flex items-center gap-1"><Star className="w-3.5 h-3.5" /> Pro Member</p>
              </div>
            )}

            <div className="p-4 border-t border-slate-100">
              <div className="flex items-center justify-between p-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate text-slate-800">{user?.email || 'Guest'}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{isPremium ? 'PRO' : 'Free'}</p>
                </div>
                <button onClick={executeLogout} className="text-[10px] bg-slate-100 hover:bg-rose-50 text-rose-600 px-2 py-1 rounded font-bold">Out</button>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 flex flex-col h-full overflow-hidden relative">
            <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-slate-400"><Menu className="w-6 h-6" /></button>
                <h2 className="text-lg font-black text-slate-800">{activeTab}</h2>
              </div>
              {isSaving && <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Check className="w-4 h-4 text-emerald-500" />Saved</span>}
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* ── DASHBOARD ── */}
              {activeTab === 'Dashboard' && (
                <div className="space-y-6">
                  {/* Stats row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Transfer GPA', value: calculatedMetrics.transferGPA.toFixed(2), color: 'text-indigo-600', bg: 'bg-indigo-50' },
                      { label: 'Units Completed', value: calculatedMetrics.completedUnits, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { label: 'Units In Progress', value: calculatedMetrics.inProgressUnits, color: 'text-amber-600', bg: 'bg-amber-50' },
                      { label: 'Prereqs Done', value: `${completionStats.completed}/${completionStats.total}`, color: 'text-purple-600', bg: 'bg-purple-50' },
                    ].map((s, i) => (
                      <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase">{s.label}</p>
                        <p className={`text-3xl font-black mt-1 ${s.color}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Major progress card */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-extrabold text-slate-800">{selectedMajor}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{majorCategory}</p>
                      </div>
                      <div className="relative flex items-center justify-center">
                        <ProgressRing percent={completionStats.percent} size={64} stroke={6} />
                        <span className="absolute text-xs font-black text-indigo-700">{completionStats.percent}%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-emerald-50 rounded-xl p-3">
                        <p className="text-xl font-black text-emerald-700">{completionStats.completed}</p>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase">Done</p>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-3">
                        <p className="text-xl font-black text-amber-700">{completionStats.inProgress}</p>
                        <p className="text-[10px] font-bold text-amber-600 uppercase">In Progress</p>
                      </div>
                      <div className="bg-slate-100 rounded-xl p-3">
                        <p className="text-xl font-black text-slate-700">{completionStats.total - completionStats.completed - completionStats.inProgress}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Remaining</p>
                      </div>
                    </div>
                  </div>

                  {/* TAG Summary */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-extrabold text-slate-800 mb-4">TAG Eligibility Summary</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {tagEvaluations.map(t => (
                        <div key={t.campus} className={`rounded-xl p-3 border ${t.isEligible ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black text-slate-600 uppercase">{t.campus.replace('UC ', '')}</span>
                            {t.isEligible ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 text-slate-400" />}
                          </div>
                          <p className={`text-xs font-bold ${t.isEligible ? 'text-emerald-700' : 'text-slate-500'}`}>
                            {t.isEligible ? 'Eligible' : `Need ${t.minGpa} GPA`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-extrabold text-slate-800 mb-4">Course Timeline</h3>
                    <div className="space-y-3">
                      {Object.keys(coursesByTerm).map(term => {
                        const items = coursesByTerm[term];
                        if (!items.length) return null;
                        return (
                          <div key={term} className="border-l-2 border-indigo-400 pl-4 space-y-1.5">
                            <span className="text-xs font-black text-indigo-600 block">{term}</span>
                            <div className="flex flex-wrap gap-2">
                              {items.map(c => (
                                <div key={c.id} className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
                                  {c.code} <span className="text-slate-400">({c.grade})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ── MY TRANSCRIPT ── */}
              {activeTab === 'My Transcript' && (
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-base font-bold text-slate-800 mb-4">Log a Course</h3>
                    <form onSubmit={handleAddCourse} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Term</label>
                        <select className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold" value={newCourse.term} onChange={e => setNewCourse({...newCourse, term: e.target.value})}>
                          {['Fall 2024','Winter 2025','Spring 2025','Summer 2025','Fall 2025','Winter 2026','Spring 2026'].map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Course Code</label>
                        <input required placeholder="e.g. MATH 1A" className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold" value={newCourse.code} onChange={e => setNewCourse({...newCourse, code: e.target.value})} />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Title (optional)</label>
                        <input placeholder="Calculus I" className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold" value={newCourse.name} onChange={e => setNewCourse({...newCourse, name: e.target.value})} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Units</label>
                        <input required type="number" step="0.5" placeholder="4" className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold" value={newCourse.units} onChange={e => setNewCourse({...newCourse, units: e.target.value})} />
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Grade</label>
                        <select className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold" value={newCourse.grade} onChange={e => setNewCourse({...newCourse, grade: e.target.value})}>
                          {['A','B','C','D','F','IP','W'].map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      <div className="md:col-span-1">
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl"><Plus className="w-4 h-4 mx-auto" /></button>
                      </div>
                    </form>
                  </div>

                  {Object.keys(coursesByTerm).map(termKey => {
                    const list = coursesByTerm[termKey];
                    if (!list.length) return null;
                    return (
                      <div key={termKey} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                          <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-indigo-500" />{termKey}</span>
                        </div>
                        <table className="w-full text-left text-xs">
                          <tbody className="divide-y divide-slate-100">
                            {list.map(c => (
                              <tr key={c.id} className="hover:bg-slate-50/50">
                                <td className="px-5 py-3 font-bold text-slate-800 w-1/4">{c.code}</td>
                                <td className="px-5 py-3 text-slate-500">{c.name}</td>
                                <td className="px-5 py-3 text-slate-600">{c.units}u</td>
                                <td className="px-5 py-3">
                                  <span className={`px-2 py-0.5 rounded font-bold ${c.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{c.grade}</span>
                                </td>
                                <td className="px-5 py-3 text-right">
                                  <button onClick={() => handleDeleteCourse(c.id)} className="text-slate-300 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── PREREQUISITES ── */}
              {activeTab === 'Prerequisites' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-lg text-slate-800">{selectedMajor}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{completionStats.completed} of {completionStats.total} required courses complete</p>
                    </div>
                    <div className="relative flex items-center justify-center">
                      <ProgressRing percent={completionStats.percent} size={72} stroke={7} />
                      <span className="absolute text-sm font-black text-indigo-700">{completionStats.percent}%</span>
                    </div>
                  </div>

                  {MAJOR_REQUIREMENTS[selectedMajor] ? (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                      {['Math Core','CS Core','Science','Chemistry','Biology','Physics','Engineering Core','Business Core','Economics','Accounting','Statistics','Psychology','Sociology','History','Philosophy','Linguistics','Data Science Core','General Ed'].map(cat => {
                        const catReqs = MAJOR_REQUIREMENTS[selectedMajor].filter(r => r.category === cat);
                        if (!catReqs.length) return null;
                        return (
                          <div key={cat}>
                            <div className="px-5 py-2 bg-slate-50 border-b border-slate-100">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{cat}</span>
                            </div>
                            {catReqs.map((req, idx) => {
                              const match = courses.find(c => c.code.toUpperCase() === req.code.toUpperCase());
                              const done = match?.status === 'Completed';
                              const inProg = match?.status === 'In Progress';
                              return (
                                <div key={idx} className={`px-5 py-4 border-b border-slate-50 flex items-center justify-between gap-4 ${done ? 'bg-emerald-50/30' : ''}`}>
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-emerald-500' : inProg ? 'bg-amber-400' : 'bg-slate-200'}`}>
                                      {done ? <Check className="w-3.5 h-3.5 text-white" /> : inProg ? <Loader2 className="w-3 h-3 text-white animate-spin" /> : null}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-slate-800">{req.code}</span>
                                        {!req.required && <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">Recommended</span>}
                                      </div>
                                      <p className="text-xs text-slate-500 truncate">{req.title}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 shrink-0">
                                    <span className="text-xs text-slate-400">{req.units}u</span>
                                    <span className={`text-xs font-bold ${done ? 'text-emerald-600' : inProg ? 'text-amber-600' : 'text-slate-400'}`}>
                                      {done ? 'Complete' : inProg ? 'In Progress' : 'Pending'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-white border border-slate-200 rounded-2xl text-sm text-slate-500">
                      No requirements found for "{selectedMajor}". Select a different major from the sidebar.
                    </div>
                  )}
                </div>
              )}

              {/* ── TAG ELIGIBILITY ── */}
              {activeTab === 'TAG Eligibility' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-800">TAG Eligibility — {selectedMajor}</h3>
                    <p className="text-xs text-slate-400 mt-1">Your GPA: <strong>{calculatedMetrics.transferGPA.toFixed(2)}</strong> · Units: <strong>{calculatedMetrics.totalTrackedUnits}</strong> · Major prereqs: <strong>{completionStats.percent}% complete</strong></p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tagEvaluations.map(tag => (
                      <div key={tag.campus} className={`bg-white border rounded-2xl p-5 shadow-sm space-y-4 ${tag.isEligible ? 'border-emerald-200' : 'border-slate-200'}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-black text-slate-800">{tag.campus}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">{majorCategory}</p>
                          </div>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tag.isEligible ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                            {tag.isEligible ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-slate-400" />}
                          </div>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Min GPA Required</span>
                            <span className="font-bold text-slate-800">{tag.minGpa.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Your GPA</span>
                            <span className={`font-bold ${tag.isGpaEligible ? 'text-emerald-600' : 'text-rose-600'}`}>{calculatedMetrics.transferGPA.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Min 30 Units</span>
                            <span className={`font-bold ${calculatedMetrics.totalTrackedUnits >= 30 ? 'text-emerald-600' : 'text-rose-600'}`}>{calculatedMetrics.totalTrackedUnits} units</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Major Prereqs</span>
                            <span className="font-bold text-slate-800">{completionStats.percent}%</span>
                          </div>
                        </div>

                        {tag.notes ? <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5">{tag.notes}</p> : null}

                        <div className={`p-2.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 ${tag.isEligible ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                          {tag.isEligible ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                          {tag.isEligible ? 'GPA & Units Eligible' : tag.isGpaEligible ? 'Need 30+ units' : `Need ${(tag.minGpa - calculatedMetrics.transferGPA).toFixed(2)} more GPA points`}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 font-medium">
                    <strong>Note:</strong> TAG guarantees admission to the campus, not necessarily the specific major. Always verify current requirements at assist.org and each UC's admissions website. Requirements change each application cycle.
                  </div>
                </div>
              )}

              {/* ── SETTINGS ── */}
              {activeTab === 'Settings' && (
                <div className="space-y-6 max-w-lg">
                  {/* Subscription */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Subscription</h3>
                    {isPremium ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <Shield className="w-4 h-4 text-emerald-600" />
                          <div>
                            <p className="text-xs font-bold text-emerald-800">
                              {subscriptionStatus === 'trialing' ? `Pro Trial — ${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} left` : 'PathMaker Pro — Active'}
                            </p>
                            <p className="text-[10px] text-emerald-600">$7/month after trial</p>
                          </div>
                        </div>
                        {subscriptionId && (
                          <button onClick={handleCancelSubscription} className="text-xs text-rose-500 hover:text-rose-700 font-bold">
                            Cancel subscription
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-slate-500">You're on the free plan. Upgrade to unlock all 30+ major prereq checklists and AI advisor.</p>
                        <button onClick={handleStartTrial} disabled={isLoadingCheckout}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70">
                          {isLoadingCheckout ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                          Start 3-Day Free Trial — then $7/mo
                        </button>
                      </div>
                    )}
                  </div>

                  {/* AI Key */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI Advisor</h3>
                    <p className="text-xs text-slate-400">Add your Gemini API key to enable the AI chat advisor. Get one free at <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">aistudio.google.com</a></p>
                    <input type="password" placeholder="AIzaSy..." className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={aiApiKey}
                      onChange={e => { setAiApiKey(e.target.value); saveUserData({ aiApiKey: e.target.value }); }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── AI CHAT WIDGET ── */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3">
              {isAiWidgetExpanded && (
                <div className="w-80 h-96 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                  <div className="bg-slate-900 text-white p-3.5 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                      <span className="text-xs font-extrabold">PathMaker AI Advisor</span>
                    </div>
                    <button onClick={() => setIsAiWidgetExpanded(false)} className="text-slate-400 hover:text-white"><ChevronDown className="w-4 h-4" /></button>
                  </div>
                  <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-slate-50 text-[11px] leading-relaxed">
                    {chatMessages.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-2.5 max-w-[85%] rounded-xl ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'}`}>
                          <p className="whitespace-pre-wrap">{m.text}</p>
                        </div>
                      </div>
                    ))}
                    {isAiResponding && <span className="text-[10px] text-slate-400 animate-pulse">Thinking...</span>}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="p-2.5 border-t border-slate-100 bg-white flex gap-1.5 shrink-0">
                    <input type="text" placeholder="Ask about your next steps..." className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={currentInput}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleWidgetChatSubmit(currentInput); }}}
                      onChange={e => setCurrentInput(e.target.value)}
                    />
                    <button onClick={() => handleWidgetChatSubmit(currentInput)} className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"><Send className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              )}
              <button onClick={() => setIsAiWidgetExpanded(!isAiWidgetExpanded)}
                className="w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl hover:scale-105 transition-all flex items-center justify-center relative">
                {isAiWidgetExpanded ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-indigo-500 rounded-full border-2 border-white animate-bounce"></span>
              </button>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}