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
  signInWithCustomToken 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  LayoutDashboard, BookOpen, GraduationCap, Settings, TrendingUp, Award, BookMarked, 
  Bell, Menu, X, Plus, Trash2, ShieldCheck, ArrowRight, Lock, Mail, CheckCircle2, 
  XCircle, AlertCircle, CreditCard, Check, Sparkles, Send, Loader2, Key, MessageSquare, ChevronDown, Calendar, Database
} from 'lucide-react';

// --- FIREBASE CLIENT CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyBwVX3hO1qgZQQhtxR8ysxUhWS5bK3oE2Q",
  authDomain: "transferplanner-4b690.firebaseapp.com",
  projectId: "transferplanner-4b690",
  storageBucket: "transferplanner-4b690.firebasestorage.app",
  messagingSenderId: "947959214245",
  appId: "1:947959214245:web:7faa787324d07dbf849d4c",
  measurementId: "G-41HQEEQWF9"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'pathmaker-production';

// --- EXPANDED COURSE REQUIREMENTS DATABASE ---
// In a real app, this would be fetched from Firestore or a university API (like ASSIST.org)
const majorRequirementsDB: Record<string, {code: string, title: string, category: string}[]> = {
  'Computer Science B.S.': [
    { code: 'MATH 1A', title: 'Calculus I', category: 'Math Core' },
    { code: 'MATH 1B', title: 'Calculus II', category: 'Math Core' },
    { code: 'MATH 54', title: 'Linear Algebra & Diff Equations', category: 'Math Core' },
    { code: 'CS 61A', title: 'Structure of Computer Programs', category: 'CS Core' },
    { code: 'CS 61B', title: 'Data Structures', category: 'CS Core' },
    { code: 'CS 61C', title: 'Machine Structures', category: 'CS Core' },
    { code: 'PHYS 7A', title: 'Physics for Scientists', category: 'Science' },
  ],
  'Business Administration': [
    { code: 'ECON 1', title: 'Intro to Economics', category: 'Core' },
    { code: 'MATH 16A', title: 'Analytic Geometry & Calculus', category: 'Math Core' },
    { code: 'MATH 16B', title: 'Analytic Geometry & Calculus II', category: 'Math Core' },
    { code: 'UGBA 10', title: 'Principles of Business', category: 'Business Core' },
    { code: 'STAT 20', title: 'Intro to Probability and Stats', category: 'Core' }
  ],
  'Biology B.S.': [
    { code: 'BIO 1A', title: 'General Biology Lecture', category: 'Core' },
    { code: 'BIO 1AL', title: 'General Biology Lab', category: 'Core' },
    { code: 'CHEM 1A', title: 'General Chemistry', category: 'Science' },
    { code: 'CHEM 3A', title: 'Chemical Structure', category: 'Science' },
    { code: 'MATH 10A', title: 'Methods of Math: Calculus', category: 'Math Core' },
  ]
};

export default function App() {
  // --- LAYOUT & NAVIGATION STATE ---
  const [user, setUser] = useState<any>(null);
  const [currentView, setCurrentView] = useState('landing'); // landing | auth | checkout | app
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSaving, setIsSaving] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isAiWidgetExpanded, setIsAiWidgetExpanded] = useState(false);

  // --- UPGRADED USER DATA STATE (CLOUD-BACKED) ---
  const [isPremium, setIsPremium] = useState(false);
  const [majorCategory, setMajorCategory] = useState('Engineering / Computer Science');
  const [customMajorName, setCustomMajorName] = useState('Computer Science B.S.');
  const [aiApiKey, setAiApiKey] = useState('');
  
  // Structured Course Objects containing term fields
  const [courses, setCourses] = useState([
    { id: 1, code: 'ENGL 1A', name: 'Reading and Comp', units: 4, grade: 'A', status: 'Completed', term: 'Fall 2024' },
    { id: 2, code: 'MATH 1A', name: 'Calculus I', units: 5, grade: 'B', status: 'Completed', term: 'Fall 2024' },
    { id: 3, code: 'MATH 1B', name: 'Calculus II', units: 5, grade: 'A', status: 'Completed', term: 'Spring 2025' },
    { id: 4, code: 'CS 61A', name: 'Structure of Computer Programs', units: 4, grade: 'IP', status: 'In Progress', term: 'Fall 2025' }
  ]);

  // Form Input States
  const [newCourse, setNewCourse] = useState({ code: '', name: '', units: '', grade: 'A', term: 'Fall 2024' });

  // --- FLOATING AI TRANSCRIPT CHAT WIDGET STATE ---
  const [chatMessages, setChatMessages] = useState<any[]>([
    { role: 'assistant', text: "Hey! I'm your integrated advisor. I've automatically analyzed your transcript. Ask me what classes you need next or check your TAG eligibility requirements!" }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // --- AUTH LISTENERS & CUSTOM TOKENS ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setCurrentView('app');
      } else {
        setCurrentView('landing');
      }
    });
    return () => unsubscribe();
  }, []);

  // --- CLOUD FIRESTORE PER-USER REAL-TIME RETRIEVAL ---
  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile');

    const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        if (cloudData.courses) setCourses(cloudData.courses);
        if (cloudData.isPremium !== undefined) setIsPremium(cloudData.isPremium);
        if (cloudData.majorCategory) setMajorCategory(cloudData.majorCategory);
        if (cloudData.customMajorName) setCustomMajorName(cloudData.customMajorName);
        if (cloudData.aiApiKey) setAiApiKey(cloudData.aiApiKey);
      }
    }, (error) => {
      console.error("Cloud document sync exception: ", error);
    });

    return () => unsubscribeSnapshot();
  }, [user]);

  const saveUserData = async (updatedFields: any) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile');
      await setDoc(userDocRef, updatedFields, { merge: true });
    } catch (e) {
      console.error("Cloud snapshot sync rejected: ", e);
    } finally {
      setTimeout(() => setIsSaving(false), 400);
    }
  };

  // --- DYNAMIC TERM ENGINE TRANSCRIPT MATHEMATICS ---
  const calculatedMetrics = useMemo(() => {
    let totalPoints = 0; let gradedUnits = 0; let completedUnits = 0; let inProgressUnits = 0;
    const gradePoints: { [key: string]: number } = { 'A': 4, 'B': 3, 'C': 2, 'D': 1, 'F': 0 };

    courses.forEach(course => {
      if (course.status === 'Completed') {
        completedUnits += course.units;
        if (gradePoints[course.grade] !== undefined) {
          gradedUnits += course.units;
          totalPoints += (gradePoints[course.grade] * course.units);
        }
      } else if (course.status === 'In Progress') {
        inProgressUnits += course.units;
      }
    });

    const gpa = gradedUnits > 0 ? (totalPoints / gradedUnits).toFixed(2) : '0.00';
    return {
      transferGPA: parseFloat(gpa),
      completedUnits,
      inProgressUnits,
      totalTrackedUnits: completedUnits + inProgressUnits,
      requiredUnits: 60
    };
  }, [courses]);

  // Group terms dynamically for organized display
  const coursesByTerm = useMemo(() => {
    const order = ['Fall 2024', 'Winter 2025', 'Spring 2025', 'Summer 2025', 'Fall 2025', 'Winter 2026', 'Spring 2026'];
    const groups: { [key: string]: any[] } = {};
    order.forEach(t => { groups[t] = []; });
    
    courses.forEach(c => {
      if (!groups[c.term]) groups[c.term] = [];
      groups[c.term].push(c);
    });
    return groups;
  }, [courses]);

  // --- DYNAMIC UC TAG MATRIX CALCULATION (2026-2027 MATRIX PATHWAY) ---
  const tagEvaluations = useMemo(() => {
    const isCSorEng = majorCategory === 'Engineering / Computer Science';
    const isNatSci = majorCategory === 'Natural / Biological Sciences';

    return [
      { campus: 'UC Davis', minGpa: isCSorEng ? 3.5 : 3.2, requiredUnits: 30 },
      { campus: 'UC Irvine', minGpa: 3.4, requiredUnits: 30 },
      { campus: 'UC Merced', minGpa: isCSorEng ? 3.0 : isNatSci ? 2.9 : 2.8, requiredUnits: 30 },
      { campus: 'UC Riverside', minGpa: isCSorEng ? 3.0 : 2.8, requiredUnits: 30, note: isCSorEng ? 'CS requires a 3.6 GPA' : '' },
      { campus: 'UC Santa Barbara', minGpa: 3.4, requiredUnits: 30 },
      { campus: 'UC Santa Cruz', minGpa: 3.0, requiredUnits: 30 }
    ];
  }, [majorCategory]);

  // --- FLOATING AI ASSISTANT CONTEXT ADVISOR ---
  const handleWidgetChatSubmit = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const currentHistory = [...chatMessages, { role: 'user', text: textToSend }];
    setChatMessages(currentHistory);
    setCurrentInput('');
    setIsAiResponding(true);

    const contextInstruction = `You are the built-in advisor for PathMaker. Give crisp guidance based on the student's live dataset. 
    Broad Major Category: ${majorCategory}. Target specific major: ${customMajorName}. 
    Current Calculated UC Transfer GPA: ${calculatedMetrics.transferGPA}. Total Units logged: ${calculatedMetrics.totalTrackedUnits}. 
    Transcript history split by terms: ${JSON.stringify(courses.map(c => `${c.term}: ${c.code} (Grade: ${c.grade})`))}. 
    Keep responses short, bulleted, and informative. Reference specific terms if relevant.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${aiApiKey || ""}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `System Guide: ${contextInstruction}\n\nStudent message: ${textToSend}` }] }]
          })
        }
      );
      const outputData = await response.json();
      const textResponse = outputData.candidates?.[0]?.content?.parts?.[0]?.text || "I was unable to complete this analysis. Please check your setup parameters.";
      setChatMessages([...currentHistory, { role: 'assistant', text: textResponse }]);
    } catch (err) {
      setChatMessages([...currentHistory, { role: 'assistant', text: "Connection issue encountered. Free-tier system advisor endpoints are busy." }]);
    } finally {
      setIsAiResponding(false);
    }
  };

  // --- ACTIONS & HANDLERS ---
  const handleAddNewCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.code || !newCourse.units) return;

    const status = newCourse.grade === 'IP' ? 'In Progress' : 'Completed';
    const courseObj = {
      id: Date.now(),
      code: newCourse.code.toUpperCase().trim(),
      name: newCourse.name.trim() || 'General Education Requirement',
      units: parseFloat(newCourse.units),
      grade: newCourse.grade,
      status,
      term: newCourse.term
    };

    const updated = [...courses, courseObj];
    setCourses(updated);
    saveUserData({ courses: updated });
    setNewCourse({ code: '', name: '', units: '', grade: 'A', term: newCourse.term });
  };

  const handleDeleteCourse = (id: number) => {
    const updated = courses.filter(c => c.id !== id);
    setCourses(updated);
    saveUserData({ courses: updated });
  };

  const triggerGoogleLogin = async () => {
    setAuthError('');
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err: any) { setAuthError(err.message || "Interrupted login process."); }
  };

  const triggerGuestLogin = async () => {
    try { await signInAnonymously(auth); } catch (e: any) { setAuthError(e.message); }
  };

  const executeLogout = async () => {
    try {
      await signOut(auth);
      setCurrentView('landing');
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const triggerSubscriptionSuccess = () => {
    setIsPremium(true);
    if (user) {
      saveUserData({ isPremium: true });
    }
    setCurrentView('app');
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden antialiased">
      {/* Mobile Sidebar overlay shield */}
      {isMobileMenuOpen && <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />}

      {/* --- VIEW 1: MARKETING LANDING HOME PAGE --- */}
      {currentView === 'landing' && (
        <div className="flex flex-col w-full h-full overflow-y-auto bg-white">
          <header className="max-w-7xl mx-auto w-full px-6 py-5 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2 text-indigo-600 font-black text-2xl tracking-tight">
              <BookMarked className="w-8 h-8" /> <span>PathMaker</span>
            </div>
            <button onClick={() => setCurrentView('auth')} className="bg-indigo-50 text-indigo-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-indigo-100 transition-all">Sign In</button>
          </header>

          <main className="max-w-6xl mx-auto w-full px-6 flex-1 flex flex-col md:flex-row items-center justify-center gap-12 py-16">
            <div className="flex-1 space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-4 h-4 text-indigo-500" /> <span>Structured Academic Multi-Term Planner</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight">
                Plan Term by Term. <br />
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Secure Admission.</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-xl">
                The full tracking matrix wrapper around ASSIST.org datasets. Sort your scheduled curriculum by semester cycles, calculate transferable GPA blocks, and predict UC admissions guarantee bounds seamlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button onClick={() => setCurrentView('auth')} className="bg-indigo-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2 text-base">
                  Get Started Free <ArrowRight className="w-5 h-5" />
                </button>
                <button onClick={() => setCurrentView('checkout')} className="bg-white text-slate-800 border border-slate-200 font-bold px-8 py-4 rounded-2xl hover:bg-slate-50 transition-all text-base shadow-sm">
                  View Premium Features ($5)
                </button>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* --- VIEW 2: COMPREHENSIVE AUTH PAGE --- */}
      {currentView === 'auth' && (
        <div className="flex justify-center items-center w-full h-full bg-slate-50 p-6">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6 text-center">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-indigo-600 font-black text-3xl"><BookMarked className="w-9 h-9" /><span>PathMaker</span></div>
              <h2 className="text-2xl font-extrabold text-slate-900">Sync with the Cloud</h2>
              <p className="text-sm text-slate-400">Save and group your transcript schedules permanently under your personal secure profile.</p>
            </div>

            <div className="space-y-4">
              <button onClick={triggerGoogleLogin} className="w-full py-3.5 px-4 border border-slate-200 rounded-2xl font-bold text-slate-700 bg-white hover:bg-slate-50 flex items-center justify-center gap-3 transition-all shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button onClick={triggerGuestLogin} className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-sm transition-all text-sm">
                Explore as Sandbox Guest
              </button>
            </div>
            {authError && <p className="text-xs text-rose-500 bg-rose-50 p-2.5 rounded-lg font-medium">{authError}</p>}
            <button onClick={() => setCurrentView('landing')} className="text-xs text-slate-400 font-bold hover:underline">&larr; Back to Home</button>
          </div>
        </div>
      )}

      {/* --- VIEW 3: MOCK STRIPE SUBSCRIPTION GATE --- */}
      {currentView === 'checkout' && (
        <div className="flex justify-center items-center w-full h-full bg-slate-50 p-6 overflow-y-auto">
          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <button onClick={() => user ? setCurrentView('app') : setCurrentView('landing')} className="text-sm font-bold text-indigo-600 hover:underline">&larr; Back to Workspace</button>
              <h2 className="text-4xl font-black text-slate-900 leading-tight">Plan with Premium Intelligence.</h2>
              <p className="text-slate-600">Activate permanent cloud sync, multi-term validation logic against ASSIST requirements, and the personalized AI advisory chat box widget.</p>
              <div className="space-y-2.5">
                {['Term-by-term checklist grouping options', 'Direct premium automated major requirements checklist', 'Floating AI Transfer Advisor assistant module', 'Real-time database backup synchronization patterns'].map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-xs font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>This is a simulated Sandbox checkout environment. No real Stripe connection is active. Clicking Subscribe will grant Pro access for testing purposes.</p>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div><h3 className="font-extrabold text-slate-800">Pro Subscription</h3><p className="text-xs text-slate-400">Cancel anytime, fully secured.</p></div>
                <div><span className="text-3xl font-black">$5</span><span className="text-xs text-slate-400">/mo</span></div>
              </div>
              <div className="space-y-4 opacity-75">
                <input type="text" disabled placeholder="Card Number (4242 4242 4242 4242)" className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm font-semibold focus:outline-none" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" disabled placeholder="MM / YY" className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm font-semibold focus:outline-none" />
                  <input type="text" disabled placeholder="CVC" className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm font-semibold focus:outline-none" />
                </div>
              </div>
              <button onClick={triggerSubscriptionSuccess} className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" /> <span>Bypass & Save Account as Pro</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- VIEW 4: CORE APPLICATION PLATFORM INTERFACE --- */}
      {currentView === 'app' && (
        <div className="flex w-full h-full overflow-hidden">
          {/* Main App Sidebar */}
          <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="h-16 border-b border-slate-100 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-xl"><BookMarked className="w-6 h-6" /><span>PathMaker</span></div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400"><X className="w-5 h-5" /></button>
            </div>

            <nav className="p-4 flex-1 space-y-1">
              {['Dashboard', 'My Transcript', 'TAG Eligibility', 'Target Schools', 'Settings'].map((item) => {
                const isActive = activeTab === item;
                return (
                  <button key={item} onClick={() => { setActiveTab(item); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <span>{item}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-100">
              <div className="flex items-center justify-between p-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate text-slate-800">{user?.email || "Guest Account"}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{isPremium ? 'PRO Tier' : 'Free Tier'}</p>
                </div>
                <button onClick={executeLogout} className="text-[10px] bg-slate-100 hover:bg-rose-50 text-rose-600 px-2 py-1 rounded font-bold">Sign Out</button>
              </div>
            </div>
          </aside>

          {/* Center Display Panel */}
          <main className="flex-1 flex flex-col h-full overflow-hidden relative">
            <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-slate-400"><Menu className="w-6 h-6" /></button>
                <h2 className="text-lg font-black text-slate-800">{activeTab}</h2>
              </div>
              {isSaving && <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Check className="w-4 h-4 text-emerald-500" /> Saved to Cloud</span>}
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* TAB 1: ACCELERATED DASHBOARD VIEW */}
              {activeTab === 'Dashboard' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg"><Award /></div>
                      <div><span className="text-xs font-bold text-slate-400 block uppercase">UC Prerequisite GPA</span><p className="text-3xl font-black text-slate-800">{calculatedMetrics.transferGPA.toFixed(2)}</p></div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg"><BookOpen /></div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase"><span>Total Semester Units</span><span>{calculatedMetrics.totalTrackedUnits} / 60</span></div>
                        <p className="text-2xl font-black text-slate-800 mt-1">{calculatedMetrics.completedUnits} <span className="text-xs text-slate-400 font-normal">Completed</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Term Timeline Summary View */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-slate-800">Your Structured Transfer Timeline</h3>
                    <div className="space-y-4">
                      {Object.keys(coursesByTerm).map(term => {
                        const items = coursesByTerm[term];
                        if (items.length === 0) return null;
                        return (
                          <div key={term} className="border-l-2 border-indigo-500 pl-4 space-y-1.5">
                            <span className="text-xs font-black text-indigo-600 block bg-indigo-50 px-2 py-0.5 rounded w-max">{term}</span>
                            <div className="flex flex-wrap gap-2">
                              {items.map(c => (
                                <div key={c.id} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2">
                                  <span>{c.code}</span> <span className="text-slate-400 font-medium">({c.units}u • {c.grade})</span>
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

              {/* TAB 2: ADVANCED MULTI-TERM TRANSCRIPT MANAGEMENT */}
              {activeTab === 'My Transcript' && (
                <div className="space-y-6">
                  {/* Upgraded Form incorporating Term Dropdown selection values */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-base font-bold text-slate-800 mb-4">Log Completed or Planned Course</h3>
                    <form onSubmit={handleAddNewCourse} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Academic Cycle</label>
                        <select className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold" value={newCourse.term} onChange={(e) => setNewCourse({...newCourse, term: e.target.value})}>
                          <option>Fall 2024</option><option>Winter 2025</option><option>Spring 2025</option><option>Summer 2025</option>
                          <option>Fall 2025</option><option>Winter 2026</option><option>Spring 2026</option>
                        </select>
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Course Code</label>
                        <input type="text" required placeholder="e.g. MATH 2A" className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold" value={newCourse.code} onChange={(e) => setNewCourse({...newCourse, code: e.target.value})} />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Description (Optional)</label>
                        <input type="text" placeholder="Calculus II" className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold" value={newCourse.name} onChange={(e) => setNewCourse({...newCourse, name: e.target.value})} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Units</label>
                        <input type="number" required placeholder="5" step="0.5" className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold" value={newCourse.units} onChange={(e) => setNewCourse({...newCourse, units: e.target.value})} />
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Grade</label>
                        <select className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold" value={newCourse.grade} onChange={(e) => setNewCourse({...newCourse, grade: e.target.value})}>
                          <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option><option value="F">F</option><option value="IP">In Progress (IP)</option><option value="W">Withdrawn (W)</option>
                        </select>
                      </div>
                      <div className="md:col-span-1"><button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs"><Plus className="w-4 h-4 mx-auto" /></button></div>
                    </form>
                  </div>

                  {/* Segmented Table Display grouped by specific terms */}
                  <div className="space-y-4">
                    {Object.keys(coursesByTerm).map(termKey => {
                      const list = coursesByTerm[termKey];
                      if (list.length === 0) return null;
                      return (
                        <div key={termKey} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-indigo-500" /> {termKey} Portfolio</span>
                          </div>
                          <table className="w-full text-left border-collapse text-xs">
                            <tbody className="divide-y divide-slate-100">
                              {list.map(c => (
                                <tr key={c.id} className="hover:bg-slate-50/50">
                                  <td className="px-6 py-3.5 font-bold text-slate-800 w-1/4">{c.code}</td>
                                  <td className="px-6 py-3.5 text-slate-500 w-2/5">{c.name}</td>
                                  <td className="px-6 py-3.5 text-slate-600 font-medium">{c.units} Semester Units</td>
                                  <td className="px-6 py-3.5 font-bold"><span className={`px-2 py-0.5 rounded ${c.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{c.grade}</span></td>
                                  <td className="px-6 py-3.5 text-right"><button onClick={() => handleDeleteCourse(c.id)} className="text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: TAG ELIGIBILITY EVALUATOR */}
              {activeTab === 'TAG Eligibility' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div><h3 className="font-extrabold text-lg text-slate-800">Guaranteed System Matrix Validation</h3><p className="text-xs text-slate-400 mt-1">Cross-referencing your live {calculatedMetrics.transferGPA.toFixed(2)} GPA against the 2026-2027 parameters.</p></div>
                    <select className="px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-700 focus:outline-none" value={majorCategory} onChange={(e) => { setMajorCategory(e.target.value); saveUserData({ majorCategory: e.target.value }); }}>
                      <option>General / Humanities / Social Sciences</option><option>Engineering / Computer Science</option><option>Business / Economics</option><option>Natural / Biological Sciences</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tagEvaluations.map(tag => {
                      const isEligible = calculatedMetrics.transferGPA >= tag.minGpa;
                      return (
                        <div key={tag.campus} className={`bg-white border rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between ${isEligible ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200'}`}>
                          <div className="space-y-2">
                            <h4 className="font-black text-slate-800">{tag.campus}</h4>
                            <div className="flex justify-between text-xs font-bold"><span>Required: {tag.minGpa.toFixed(2)}</span><span className={isEligible ? 'text-emerald-600' : 'text-indigo-600'}>Current: {calculatedMetrics.transferGPA.toFixed(2)}</span></div>
                          </div>
                          <div className={`p-2.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 ${isEligible ? 'bg-emerald-100/60 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                            {isEligible ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />} <span>{isEligible ? 'Eligible Baseline' : 'Requirements Unmet'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: MOCK ASSIST MAJOR ARTICULATION CHECKLIST */}
              {activeTab === 'Target Schools' && (
                <div className="space-y-6">
                  {!isPremium ? (
                    <div className="max-w-md mx-auto text-center p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
                      <Lock className="w-10 h-10 text-slate-300 mx-auto" />
                      <h4 className="text-lg font-bold text-slate-800">Major Core Verification Restricted</h4>
                      <p className="text-xs text-slate-400">Unlock automatic key checklist articulation verification algorithms matching your transcripts directly against ASSIST targets.</p>
                      <button onClick={() => setCurrentView('checkout')} className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs">Unlock Pro Access</button>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <Database className="w-5 h-5 text-indigo-500" />
                        <div>
                          <h3 className="font-extrabold text-slate-800">Dynamic ASSIST Prerequisites Checker</h3>
                          <p className="text-xs text-slate-400">Evaluating required prerequisite lines for <strong>{customMajorName}</strong>.</p>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {/* Dynamic Rendering of Course Requirements based on the selected major */}
                        {majorRequirementsDB[customMajorName] ? (
                          majorRequirementsDB[customMajorName].map((req, idx) => {
                            // Check if user has completed or is IP for this required course
                            const transcriptMatch = courses.find(c => c.code.toUpperCase() === req.code.toUpperCase());
                            const isMet = transcriptMatch && transcriptMatch.status === 'Completed';
                            const isIP = transcriptMatch && transcriptMatch.status === 'In Progress';
                            
                            return (
                              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold gap-2">
                                <div>
                                  <span className="text-slate-800 mr-2">{req.code}</span>
                                  <span className="text-slate-500 font-medium hidden sm:inline-block">- {req.title}</span>
                                  <span className="ml-2 px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded text-[9px] uppercase">{req.category}</span>
                                </div>
                                
                                <span className={
                                  isMet ? 'text-emerald-600 flex items-center gap-1' : 
                                  isIP ? 'text-amber-600 flex items-center gap-1' : 'text-slate-400'
                                }>
                                  {isMet ? <><Check className="w-4 h-4" /> Completed</> : 
                                   isIP ? <><Loader2 className="w-4 h-4 animate-spin" /> In Progress</> : 'Pending'}
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-sm text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
                            No exact requirement map found for "{customMajorName}". Try changing your major in Settings to <strong>Computer Science B.S.</strong>, <strong>Business Administration</strong>, or <strong>Biology B.S.</strong> to see the dynamic database in action.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: BACKEND PROFILE CONNECTIONS & SETTINGS */}
              {activeTab === 'Settings' && (
                <div className="max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800">Workspace Customization</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Major Descriptor (Try "Business Administration")</label>
                      <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold" value={customMajorName} onChange={(e) => { setCustomMajorName(e.target.value); saveUserData({ customMajorName: e.target.value }); }} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Private Developer Gemini Assistant API Token</label>
                      <input type="password" placeholder="AIzaSy..." className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-mono" value={aiApiKey} onChange={(e) => { setAiApiKey(e.target.value); saveUserData({ aiApiKey: e.target.value }); }} />
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* --- FLOATING ACCELERATED INTERACTIVE CHIP ACTION ADVISOR (THE WIDGET CIRCLE) --- */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3">
              {isAiWidgetExpanded && (
                <div className="w-80 h-96 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-200 animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-slate-900 text-white p-3.5 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" /><span className="text-xs font-extrabold tracking-wide">PathMaker AI Assistant</span></div>
                    <button onClick={() => setIsAiWidgetExpanded(false)} className="text-slate-400 hover:text-white"><ChevronDown className="w-4 h-4" /></button>
                  </div>

                  {/* Chat feed container */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-slate-50 text-[11px] font-medium leading-relaxed">
                    {chatMessages.map((m, idx) => (
                      <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-2.5 max-w-[85%] rounded-xl ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'}`}>
                          <p className="whitespace-pre-wrap">{m.text}</p>
                        </div>
                      </div>
                    ))}
                    {isAiResponding && <span className="text-[10px] text-slate-400 block animate-pulse">Assistant compiling response parameters...</span>}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Messaging submission field */}
                  <div className="p-2.5 border-t border-slate-100 bg-white flex gap-1.5 shrink-0">
                    <input type="text" placeholder="Ask advisor about next courses..." className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500" value={currentInput} onKeyDown={(e) => { if(e.key==='Enter') { e.preventDefault(); handleWidgetChatSubmit(currentInput); }}} onChange={(e) => setCurrentInput(e.target.value)} />
                    <button onClick={() => handleWidgetChatSubmit(currentInput)} className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"><Send className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              )}

              {/* The clickable circle bubble container button triggers overlay display */}
              <button 
                onClick={() => setIsAiWidgetExpanded(!isAiWidgetExpanded)}
                className="w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl hover:scale-105 transition-all flex items-center justify-center relative group"
              >
                {isAiWidgetExpanded ? <X className="w-6 h-6 animate-in spin-in-12" /> : <MessageSquare className="w-6 h-6 animate-in zoom-in-50" />}
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-indigo-500 rounded-full border-2 border-white animate-bounce"></span>
              </button>
            </div>

          </main>
        </div>
      )}
    </div>
  );
}