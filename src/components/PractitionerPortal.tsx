import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, FileText, Search, Filter, Calendar, Mail, Phone, MapPin, ChevronRight, Trash2, X, AlertCircle, RefreshCw, CheckCircle2, ShieldCheck, LogOut, ArrowLeft, Sparkles, Award, Download, Printer, Cloud } from 'lucide-react';
import { Submission } from '../types';
import { getSubmissionsFromFirestore, deleteSubmissionFromFirestore, clearAllSubmissionsFromFirestore, googleSignIn, getAccessToken } from '../lib/firebase';

interface PractitionerPortalProps {
  onExit: () => void;
}

export default function PractitionerPortal({ onExit }: PractitionerPortalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Filtering & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [struggleFilter, setStruggleFilter] = useState<string>('');
  const [transformationFilter, setTransformationFilter] = useState<string>('');

  // HTML dossier generator for printing, Word exporting, or Google Doc saving
  const generateDossierHTML = (sub: Submission) => {
    const profile = sub.formData.personalProfile;
    const booking = sub.booking;
    const struggles = sub.formData.challengesAndValues?.primaryStruggle || [];
    const priorExp = sub.formData.challengesAndValues?.priorExperience || [];
    const impediments = sub.formData.challengesAndValues?.currentImpediments || [];
    const areas = sub.formData.goals?.transformationAreas || [];
    const vision = sub.formData.goals?.breakthroughVision || "Client declined to provide a written narrative.";

    return `
      <div style="font-family: 'Georgia', serif; color: #1c1917; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 24px; border-bottom: 2px solid #ca8a04; padding-bottom: 12px; margin-top: 0; text-transform: uppercase; letter-spacing: 2px; color: #ca8a04; display: inline-block; width: 100%;">
            The Breakthrough Experience
          </h1>
          <div style="font-family: monospace; font-size: 11px; color: #78716c; margin-top: 10px; line-height: 1.5;">
            CONFIDENTIAL CLIENT DOSSIER &bull; SECURITY ID: ${sub.id}<br>
            GENERATED RECORD DATE: ${new Date(sub.createdAt).toLocaleString()}
          </div>
        </div>
        
        <h2 style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px solid #e7e5e4; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; color: #44403c; font-weight: bold;">
          I. Biographical Core Ledger
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
          <tr>
            <td style="width: 50%; padding: 8px 12px; border: 1px solid #e7e5e4; vertical-align: top;">
              <span style="font-family: monospace; font-size: 9px; text-transform: uppercase; color: #78716c; display: block; margin-bottom: 4px; font-weight: bold;">Client Full Name</span>
              <strong style="font-size: 14px; color: #1c1917;">${profile.firstName} ${profile.lastName}</strong>
            </td>
            <td style="width: 50%; padding: 8px 12px; border: 1px solid #e7e5e4; vertical-align: top;">
              <span style="font-family: monospace; font-size: 9px; text-transform: uppercase; color: #78716c; display: block; margin-bottom: 4px; font-weight: bold;">Confidential Email</span>
              <strong style="font-size: 14px; color: #1c1917;">${profile.email}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #e7e5e4; vertical-align: top;">
              <span style="font-family: monospace; font-size: 9px; text-transform: uppercase; color: #78716c; display: block; margin-bottom: 4px; font-weight: bold;">Secure Mobile Line</span>
              <strong style="font-size: 14px; color: #1c1917;">${profile.phone}</strong>
            </td>
            <td style="padding: 8px 12px; border: 1px solid #e7e5e4; vertical-align: top;">
              <span style="font-family: monospace; font-size: 9px; text-transform: uppercase; color: #78716c; display: block; margin-bottom: 4px; font-weight: bold;">Physical Base Location</span>
              <strong style="font-size: 14px; color: #1c1917;">${profile.city}, ${profile.state}</strong>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 8px 12px; border: 1px solid #e7e5e4; vertical-align: top;">
              <span style="font-family: monospace; font-size: 9px; text-transform: uppercase; color: #78716c; display: block; margin-bottom: 4px; font-weight: bold;">Preferred Communication Channel</span>
              <strong style="font-size: 14px; color: #1c1917;">${profile.preferredCommunication || 'Not Specified'}</strong>
            </td>
          </tr>
        </table>

        <h2 style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px solid #e7e5e4; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; color: #44403c; font-weight: bold;">
          II. Life Bottlenecks & Friction Indicators
        </h2>
        <div style="margin-bottom: 20px;">
          <span style="font-family: monospace; font-size: 9px; text-transform: uppercase; color: #78716c; display: block; margin-bottom: 8px; font-weight: bold;">Primary Overriding Struggles</span>
          <div>
            ${struggles.map(s => `<span style="display: inline-block; background: #fafaf9; border: 1px solid #d6d3d1; color: #44403c; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-right: 8px; margin-bottom: 8px; font-family: 'Helvetica Neue', Arial, sans-serif;">${s}</span>`).join('') || '<em style="color:#78716c; font-size: 13px;">None selected</em>'}
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 25px;">
          <tr>
            <td style="width: 50%; padding-right: 15px; vertical-align: top;">
              <span style="font-family: monospace; font-size: 9px; text-transform: uppercase; color: #78716c; display: block; margin-bottom: 8px; font-weight: bold;">Previous Inner Frameworks Studied</span>
              ${priorExp.map(exp => `<div style="margin-bottom: 6px; font-size: 13px; color: #292524;">&bull; ${exp}</div>`).join('') || '<em style="color:#78716c; font-size: 13px;">None logged</em>'}
            </td>
            <td style="width: 50%; vertical-align: top;">
              <span style="font-family: monospace; font-size: 9px; text-transform: uppercase; color: #78716c; display: block; margin-bottom: 8px; font-weight: bold;">Documented Behavioral & Mental Impediments</span>
              ${impediments.map(imp => `<div style="margin-bottom: 6px; font-size: 13px; color: #292524;">&bull; ${imp}</div>`).join('') || '<em style="color:#78716c; font-size: 13px;">None logged</em>'}
            </td>
          </tr>
        </table>

        <h2 style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px solid #e7e5e4; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; color: #44403c; font-weight: bold;">
          III. Life Transformation Vector Mapping
        </h2>
        <div style="margin-bottom: 20px;">
          <span style="font-family: monospace; font-size: 9px; text-transform: uppercase; color: #78716c; display: block; margin-bottom: 8px; font-weight: bold;">Core Selected 7 Areas of Life Targets</span>
          <div>
            ${areas.map(area => `<span style="display: inline-block; background: #ca8a04; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-right: 8px; margin-bottom: 8px; font-family: 'Helvetica Neue', Arial, sans-serif; text-transform: uppercase; letter-spacing: 1px;">${area}</span>`).join('') || '<em style="color:#78716c; font-size: 13px;">None selected</em>'}
          </div>
        </div>
        
        <div style="margin-top: 15px; margin-bottom: 25px;">
          <span style="font-family: monospace; font-size: 9px; text-transform: uppercase; color: #78716c; display: block; margin-bottom: 8px; font-weight: bold;">Breakthrough Vision Transcript</span>
          <div style="background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 8px; padding: 18px; font-style: italic; white-space: pre-wrap; font-size: 13px; color: #292524; border-left: 4px solid #ca8a04;">${vision}</div>
        </div>

        <h2 style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px solid #e7e5e4; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; color: #44403c; font-weight: bold;">
          IV. Consultation Alignment
        </h2>
        ${booking ? `
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 18px;">
            <span style="font-family: monospace; font-size: 9px; text-transform: uppercase; color: #166534; display: block; margin-bottom: 4px; font-weight: bold;">Scheduled Session Time slot</span>
            <strong style="color: #14532d; font-size: 16px;">${booking.date} at ${booking.timeSlot}</strong>
          </div>
        ` : `
          <div style="background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 8px; padding: 18px; color: #78716c; font-size: 13px;">
            <strong>Appointment Pending</strong><br>
            Form submission captured; user has not reserved calendar slot yet.
          </div>
        `}
      </div>
    `;
  };

  // Download Markdown (.md)
  const downloadMarkdown = (sub: Submission) => {
    const profile = sub.formData.personalProfile;
    const booking = sub.booking;
    
    let md = `# THE BREAKTHROUGH EXPERIENCE: CONFIDENTIAL CLIENT DOSSIER\n`;
    md += `===================================================================\n\n`;
    md += `**Dossier Security ID:** ${sub.id}\n`;
    md += `**Generated Record Date:** ${new Date(sub.createdAt).toLocaleString()}\n\n`;
    
    md += `## I. BIOGRAPHICAL CORE LEDGER\n`;
    md += `--------------------------------\n`;
    md += `- **Full Name:** ${profile.firstName} ${profile.lastName}\n`;
    md += `- **Confidential Email:** ${profile.email}\n`;
    md += `- **Secure Mobile Line:** ${profile.phone}\n`;
    md += `- **Physical Base Location:** ${profile.city}, ${profile.state}\n`;
    md += `- **Preferred Communication Channel:** ${profile.preferredCommunication || "Not Specified"}\n\n`;
    
    md += `## II. LIFE BOTTLENECKS & FRICTION INDICATORS\n`;
    md += `----------------------------------------------\n`;
    md += `### Primary Overriding Struggles:\n`;
    const struggles = sub.formData.challengesAndValues?.primaryStruggle || [];
    if (struggles.length === 0) {
      md += `*None selected*\n`;
    } else {
      struggles.forEach((s, idx) => {
        md += `${idx + 1}. ${s}\n`;
      });
    }
    md += `\n`;
    
    md += `### Previous Inner Frameworks Studied:\n`;
    const priorExp = sub.formData.challengesAndValues?.priorExperience || [];
    if (priorExp.length === 0) {
      md += `*None logged*\n`;
    } else {
      priorExp.forEach(e => {
        md += `- ${e}\n`;
      });
    }
    md += `\n`;
    
    md += `### Documented Behavioral & Mental Impediments:\n`;
    const impediments = sub.formData.challengesAndValues?.currentImpediments || [];
    if (impediments.length === 0) {
      md += `*None logged*\n`;
    } else {
      impediments.forEach(imp => {
        md += `- ${imp}\n`;
      });
    }
    md += `\n\n`;
    
    md += `## III. LIFE TRANSFORMATION VECTOR MAPPING\n`;
    md += `-------------------------------------------\n`;
    md += `### Core Selected 7 Areas of Life Targets:\n`;
    const areas = sub.formData.goals?.transformationAreas || [];
    if (areas.length === 0) {
      md += `*None selected*\n`;
    } else {
      areas.forEach(area => {
        md += `- ${area}\n`;
      });
    }
    md += `\n`;
    
    md += `### Breakthrough Vision Transcript:\n`;
    md += `${sub.formData.goals?.breakthroughVision || "Client declined to provide a written narrative."}\n\n`;
    
    md += `## IV. CONSULTATION ALIGNMENT\n`;
    md += `-----------------------------\n`;
    if (booking) {
      md += `- **Session Status:** Reserved\n`;
      md += `- **Scheduled Session:** ${booking.date} at ${booking.timeSlot}\n`;
    } else {
      md += `- **Session Status:** Appointment Pending\n`;
      md += `Form submission captured; user has not reserved calendar slot yet.\n`;
    }
    
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Dossier_${profile.lastName}_${profile.firstName}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download Microsoft Word (.doc)
  const downloadWordDoc = (sub: Submission) => {
    const profile = sub.formData.personalProfile;
    const htmlContent = generateDossierHTML(sub);
    
    const documentTemplate = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Dossier_${profile.lastName}_${profile.firstName}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
          </w:WordDocument>
        </xml>
        <![endif]-->
      </head>
      <body style="background-color: white;">
        ${htmlContent}
      </body>
      </html>
    `;
    
    const blob = new Blob([documentTemplate], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Dossier_${profile.lastName}_${profile.firstName}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Print Dossier / Save as PDF
  const printDossier = (sub: Submission) => {
    const htmlContent = generateDossierHTML(sub);
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      alert("Please allow pop-up windows to print or save the dossier as PDF.");
      return;
    }
    
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.write('<script>window.onload = function() { window.print(); window.close(); }</script>');
    printWindow.document.close();
  };

  // Load submissions from localStorage and Firestore on mount/authentication
  useEffect(() => {
    if (isAuthenticated) {
      loadSubmissions();
    }
  }, [isAuthenticated]);

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch from Firestore
      const firestoreList = await getSubmissionsFromFirestore();
      
      // 2. Fetch from localStorage
      const stored = localStorage.getItem('onboarding_submissions');
      const localList: Submission[] = stored ? JSON.parse(stored) : [];
      
      // 3. Merge submissions by ID to avoid duplicates (preferring firestore)
      const mergedMap = new Map<string, Submission>();
      localList.forEach(item => mergedMap.set(item.id, item));
      firestoreList.forEach(item => mergedMap.set(item.id, item));
      
      const mergedList = Array.from(mergedMap.values());
      
      // Sort by newest first
      mergedList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setSubmissions(mergedList);
      if (mergedList.length > 0) {
        setSelectedSubmission(mergedList[0]);
      } else {
        setSelectedSubmission(null);
      }
      
      // Sync localStorage with merged state
      localStorage.setItem('onboarding_submissions', JSON.stringify(mergedList));
    } catch (e) {
      console.error('Error loading submissions:', e);
      // Fallback to local storage if Firestore fails
      try {
        const stored = localStorage.getItem('onboarding_submissions');
        if (stored) {
          const parsed: Submission[] = JSON.parse(stored);
          parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setSubmissions(parsed);
          if (parsed.length > 0) {
            setSelectedSubmission(parsed[0]);
          }
        }
      } catch (err) {
        console.error('Error in fallback load:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (passcode === 'admin123' || passcode === 'breakthrough!') {
      setIsAuthenticated(true);
      setPasscode('');
    } else {
      setAuthError('Unauthorized breakthrough secure key. Access denied.');
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const result = await googleSignIn();
      if (result) {
        const email = result.user.email?.toLowerCase();
        if (email === 'frankmondeose@gmail.com' || email === 'davidmiranda512@gmail.com') {
          setIsAuthenticated(true);
        } else {
          setAuthError(`Access Denied: ${result.user.email} is not authorized to access the Facilitator Terminal.`);
        }
      }
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setAuthError(`Google authentication failed: ${err.message || String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteIndividual = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to permanently delete this breakthrough client dossier? This action is irreversible.");
    if (!confirmed) return;

    setIsLoading(true);
    try {
      // 1. Delete from Firestore
      await deleteSubmissionFromFirestore(id);
      
      // 2. Delete from local state and localStorage
      const filtered = submissions.filter(item => item.id !== id);
      localStorage.setItem('onboarding_submissions', JSON.stringify(filtered));
      setSubmissions(filtered);
      
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(filtered.length > 0 ? filtered[0] : null);
      }
    } catch (e) {
      console.error('Error deleting dossier:', e);
      // Fallback
      const filtered = submissions.filter(item => item.id !== id);
      localStorage.setItem('onboarding_submissions', JSON.stringify(filtered));
      setSubmissions(filtered);
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(filtered.length > 0 ? filtered[0] : null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = async () => {
    const confirmed = window.confirm("CRITICAL: You are about to wipe all breakthrough client dossiers from both the cloud database and this local terminal. Are you absolutely sure?");
    if (!confirmed) return;

    setIsLoading(true);
    try {
      // 1. Clear from Firestore
      await clearAllSubmissionsFromFirestore(submissions);
      
      // 2. Clear from local state and localStorage
      localStorage.removeItem('onboarding_submissions');
      setSubmissions([]);
      setSelectedSubmission(null);
    } catch (e) {
      console.error('Error clearing storage:', e);
      // Fallback
      localStorage.removeItem('onboarding_submissions');
      setSubmissions([]);
      setSelectedSubmission(null);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const fullName = `${sub.formData.personalProfile.firstName} ${sub.formData.personalProfile.lastName}`.toLowerCase();
    const email = sub.formData.personalProfile.email.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesQuery = fullName.includes(query) || email.includes(query);

    const matchesStruggle = struggleFilter === '' || sub.formData.challengesAndValues.primaryStruggle === struggleFilter;
    
    // Check if the transformationAreas includes the filter substring
    const matchesTransformation = transformationFilter === '' || 
      sub.formData.goals.transformationAreas.some(area => area.toLowerCase().includes(transformationFilter.toLowerCase()));

    return matchesQuery && matchesStruggle && matchesTransformation;
  });

  if (!isAuthenticated) {
    return (
      <div id="practitioner-lock-view" className="min-h-screen bg-stone-950 flex flex-col justify-center items-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-stone-900 p-8 rounded-2xl border border-stone-800 shadow-xl space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-xl bg-stone-800 flex items-center justify-center border border-stone-700">
              <Lock className="w-5 h-5 text-stone-300" />
            </div>
            <h2 className="text-xl font-display font-bold text-white tracking-widest uppercase">Facilitator Terminal</h2>
            <p className="text-xs text-stone-400 font-sans font-light">Enter secure key to access sensitive client breakthrough profiles.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="passcode-input" className="block text-xs font-mono uppercase tracking-wider text-stone-300 mb-2 font-semibold">Security Passcode</label>
              <input
                id="passcode-input"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode"
                className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-stone-700 focus:border-stone-600 transition-all text-center text-sm font-mono placeholder-stone-500"
                autoFocus
              />
            </div>

            {authError && (
              <div id="auth-error-banner" className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl text-xs text-red-300 flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{authError}</span>
              </div>
            )}

            <button
              id="practitioner-auth-btn"
              type="submit"
              className="w-full py-3 bg-stone-100 hover:bg-white text-stone-950 font-display text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-md cursor-pointer font-semibold"
            >
              Authorize Secure Ledger
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-stone-800"></div>
            <span className="flex-shrink mx-4 text-[10px] font-mono uppercase tracking-wider text-stone-500">or</span>
            <div className="flex-grow border-t border-stone-800"></div>
          </div>

          <div className="space-y-2">
            <button
              id="practitioner-google-auth-btn"
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 font-display text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-md cursor-pointer font-semibold flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Cloud className="w-3.5 h-3.5 text-yellow-500" />
              )}
              <span>Sign In with Google</span>
            </button>
            <p className="text-[10px] text-center text-stone-500 font-mono">
              Authorized Facilitator Email: <span className="text-stone-400">frankmondeose@gmail.com</span>
            </p>
          </div>

          <div className="pt-4 border-t border-stone-850 text-center">
            <button
              id="exit-portal-btn"
              onClick={onExit}
              className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition-colors cursor-pointer font-mono font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Onboarding View
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div id="practitioner-dashboard" className="min-h-screen bg-stone-950 text-stone-100 font-sans flex flex-col">
      {/* Top Bar Navigation */}
      <header className="bg-stone-900 border-b border-stone-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-stone-100 rounded-xl flex items-center justify-center font-display font-black text-stone-900 text-lg">
            B
          </div>
          <div>
            <h1 className="text-sm font-display font-bold text-white tracking-widest uppercase">Facilitator Dossier Registry</h1>
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-400">
              <ShieldCheck className="w-3 h-3" /> Encrypted Session Active
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="practitioner-refresh-btn"
            onClick={loadSubmissions}
            className="p-2 bg-stone-950 hover:bg-stone-800 border border-stone-800 rounded-xl text-stone-300 hover:text-white transition-all cursor-pointer"
            title="Refresh submissions"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            id="practitioner-clear-btn"
            onClick={handleClearAll}
            disabled={submissions.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-950 hover:bg-red-950/20 border border-stone-800 hover:border-red-900/50 rounded-full text-xs font-mono text-stone-400 hover:text-red-200 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Terminal
          </button>

          <button
            id="practitioner-logout-btn"
            onClick={() => setIsAuthenticated(false)}
            className="flex items-center gap-1 px-3 py-2 bg-stone-800 text-stone-100 font-mono text-xs font-bold rounded-full hover:bg-stone-700 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Lock Ledger
          </button>

          <button
            id="portal-back-to-client-btn"
            onClick={onExit}
            className="flex items-center gap-1 px-3 py-2 border border-stone-800 hover:border-stone-600 bg-transparent text-stone-300 hover:text-white font-mono text-xs font-semibold rounded-full transition-all cursor-pointer"
          >
            Intake Screen
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar Dossiers List */}
        <aside className="w-full md:w-[380px] bg-stone-900 border-r border-stone-850 flex flex-col overflow-y-auto shrink-0">
          <div className="p-4 border-b border-stone-850 space-y-3 shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-stone-500" />
              <input
                id="portal-search-input"
                type="text"
                placeholder="Search Client Name or Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-stone-700 focus:border-stone-600 placeholder-stone-500"
              />
            </div>

            {/* Filter selectors */}
            <div className="grid grid-cols-2 gap-2">
              <select
                id="portal-filter-struggle"
                value={struggleFilter}
                onChange={(e) => setStruggleFilter(e.target.value)}
                className="p-2 bg-stone-950 border border-stone-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-stone-600 cursor-pointer"
              >
                <option value="">All Primary Struggles</option>
                <option value="Lack of Vision & Purpose">Vision/Purpose</option>
                <option value="Relationship & Family Conflicts">Relationships</option>
                <option value="Career & Business Stagnation">Career</option>
                <option value="Financial Blockages & Debt">Financial</option>
                <option value="Emotional Baggage, Guilt or Resentment">Emotional</option>
                <option value="Physical Health & Vitality Lows">Vitality</option>
                <option value="Spiritual Void or Disconnection">Spiritual</option>
              </select>

              <select
                id="portal-filter-transformation"
                value={transformationFilter}
                onChange={(e) => setTransformationFilter(e.target.value)}
                className="p-2 bg-stone-950 border border-stone-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-stone-600 cursor-pointer"
              >
                <option value="">All 7 Areas of Life</option>
                <option value="Vocational">Vocational</option>
                <option value="Financial">Financial</option>
                <option value="Physical">Physical</option>
                <option value="Mental">Mental</option>
                <option value="Spiritual">Spiritual</option>
                <option value="Family">Family</option>
                <option value="Social">Social</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-stone-850">
            {filteredSubmissions.length === 0 ? (
              <div className="p-8 text-center text-stone-500 text-xs font-mono font-light">
                No active breakthrough records discovered.
              </div>
            ) : (
              filteredSubmissions.map((sub) => {
                const isSelected = selectedSubmission?.id === sub.id;
                const profile = sub.formData.personalProfile;
                const dateObj = new Date(sub.createdAt);
                const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div
                    key={sub.id}
                    id={`portal-item-${sub.id}`}
                    onClick={() => setSelectedSubmission(sub)}
                    className={`w-full p-4 text-left flex items-start justify-between gap-3 transition-colors cursor-pointer border-b border-stone-900/60 ${
                      isSelected ? 'bg-stone-800 border-l-4 border-stone-100' : 'hover:bg-stone-800/40'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="font-display font-semibold text-sm text-white uppercase tracking-wider">
                        {profile.lastName}, {profile.firstName}
                      </div>
                      <div className="text-xs text-stone-300 font-mono truncate max-w-[200px]">
                        {profile.email}
                      </div>
                      <div className="text-xs font-mono text-stone-400">
                        Date: {formattedDate}
                      </div>

                      {sub.booking ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/40 text-xs text-emerald-300 font-medium font-mono border border-emerald-900/30">
                          Slot: {sub.booking.date} @ {sub.booking.timeSlot}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-950 text-xs text-stone-400 font-medium font-mono border border-stone-800">
                          Awaiting Call Slot
                        </span>
                      )}
                    </div>

                    <button
                      id={`portal-delete-btn-${sub.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteIndividual(sub.id);
                      }}
                      className="p-1.5 hover:bg-red-950/20 text-stone-600 hover:text-red-400 rounded-full transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Selected Dossier Detail View */}
        <main className="flex-1 bg-stone-950 p-6 md:p-8 overflow-y-auto">
          {selectedSubmission ? (
            <div id="portal-detail-view" className="max-w-3xl mx-auto space-y-6">
              {/* Detail Header */}
              <div className="bg-stone-900 p-6 rounded-2xl border border-stone-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-xs font-mono text-stone-400 uppercase tracking-widest block font-bold">Breakthrough Profile Ledger: {selectedSubmission.id}</span>
                  <h2 className="text-xl font-display font-bold text-white tracking-widest mt-1 uppercase">
                    {selectedSubmission.formData.personalProfile.firstName} {selectedSubmission.formData.personalProfile.lastName}
                  </h2>
                  <p className="text-sm text-stone-400 mt-1">Submitted: {new Date(selectedSubmission.createdAt).toLocaleString()}</p>
                </div>

                <div>
                  {selectedSubmission.booking ? (
                    <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-2xl text-right">
                      <span className="text-[10px] font-mono text-emerald-400 block uppercase font-bold tracking-wider">Scheduled Session</span>
                      <span className="text-sm font-display font-semibold text-emerald-100 block mt-0.5">{selectedSubmission.booking.date}</span>
                      <span className="text-xs text-emerald-300 font-mono block">{selectedSubmission.booking.timeSlot}</span>
                      {selectedSubmission.syncedToGoogleCalendar && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono mt-1 font-semibold">
                          ✓ Synced to Google Calendar
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl text-right">
                      <span className="text-[10px] font-mono text-stone-400 block uppercase font-bold tracking-wider">Appointment Pending</span>
                      <span className="text-xs text-stone-300 block mt-1 leading-relaxed">Form submission captured; user has not reserved calendar slot.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Export & Download Ledger Tools */}
              <div id="portal-export-panel" className="bg-stone-900/40 p-4 rounded-2xl border border-stone-850 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  <span className="text-xs font-mono uppercase tracking-wider text-stone-300 font-bold">Dossier Export Ledger Control</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                  {/* Download MD */}
                  <button
                    id="export-btn-md"
                    onClick={() => downloadMarkdown(selectedSubmission)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-950 hover:bg-stone-800 border border-stone-800 rounded-lg text-xs font-mono text-stone-300 transition-colors"
                    title="Download as Markdown"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Markdown (.md)</span>
                  </button>

                  {/* Download DOC */}
                  <button
                    id="export-btn-doc"
                    onClick={() => downloadWordDoc(selectedSubmission)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-950 hover:bg-stone-800 border border-stone-800 rounded-lg text-xs font-mono text-stone-300 transition-colors"
                    title="Download as MS Word Document"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Word (.doc)</span>
                  </button>

                  {/* Print / Save as PDF */}
                  <button
                    id="export-btn-pdf"
                    onClick={() => printDossier(selectedSubmission)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-950 hover:bg-stone-800 border border-stone-800 rounded-lg text-xs font-mono text-stone-300 transition-colors"
                    title="Print dossier or save as PDF"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / PDF</span>
                  </button>

                </div>
              </div>

              {/* Bio & Contact Card */}
              <div className="bg-stone-900 p-6 rounded-2xl border border-stone-850 space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-widest text-stone-400 border-b border-stone-800 pb-2 flex items-center gap-1.5 font-bold">
                  I. Biographical Core Ledger
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-stone-300 uppercase block font-semibold">Confidential Contact Email</span>
                    <a href={`mailto:${selectedSubmission.formData.personalProfile.email}`} className="text-sm font-semibold text-white hover:text-white flex items-center gap-1.5 truncate">
                      <Mail className="w-4 h-4 shrink-0 text-stone-400" /> {selectedSubmission.formData.personalProfile.email}
                    </a>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-stone-300 uppercase block font-semibold">Secure Mobile Line</span>
                    <a href={`tel:${selectedSubmission.formData.personalProfile.phone}`} className="text-sm font-semibold text-white hover:text-white flex items-center gap-1.5">
                      <Phone className="w-4 h-4 shrink-0 text-stone-400" /> {selectedSubmission.formData.personalProfile.phone}
                    </a>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-stone-300 uppercase block font-semibold">Physical Base Location</span>
                    <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 shrink-0 text-stone-400" /> {selectedSubmission.formData.personalProfile.city}, {selectedSubmission.formData.personalProfile.state}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-stone-300 uppercase block font-semibold">Preferred Comm</span>
                    <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-stone-400 shrink-0" /> {selectedSubmission.formData.personalProfile.preferredCommunication || 'Not Specified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Struggles & Impediments */}
              <div className="bg-stone-900 p-6 rounded-2xl border border-stone-850 space-y-5">
                <h3 className="text-xs font-mono uppercase tracking-widest text-stone-400 border-b border-stone-800 pb-2 flex items-center gap-1.5 font-bold">
                  II. Life Bottlenecks & Friction Indicators
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <span className="text-xs text-stone-300 uppercase block font-semibold">Primary Overriding Struggles</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {Array.isArray(selectedSubmission.formData.challengesAndValues.primaryStruggle) ? (
                        selectedSubmission.formData.challengesAndValues.primaryStruggle.length === 0 ? (
                           <span className="text-xs text-stone-400 italic">None selected</span>
                        ) : (
                          selectedSubmission.formData.challengesAndValues.primaryStruggle.map((struggle, idx) => (
                            <span key={struggle} className="px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-full text-xs font-semibold text-stone-200 flex items-center gap-1.5">
                              <span className="font-mono text-stone-500 font-bold">#{idx + 1}</span> {struggle}
                            </span>
                          ))
                        )
                      ) : (
                        <span className="px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-full text-xs font-semibold text-stone-200 block">
                          {selectedSubmission.formData.challengesAndValues.primaryStruggle || 'Not Specified'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <span className="text-xs text-stone-300 uppercase block font-semibold">Previous Inner Frameworks Studied</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSubmission.formData.challengesAndValues.priorExperience.length === 0 ? (
                        <span className="text-xs text-stone-400 italic">None logged</span>
                      ) : (
                        selectedSubmission.formData.challengesAndValues.priorExperience.map(exp => (
                          <span key={exp} className="px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-full text-xs font-semibold text-stone-200">
                            {exp}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    <span className="text-xs text-stone-300 uppercase block font-semibold">Documented Behavioral & Mental Impediments</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedSubmission.formData.challengesAndValues.currentImpediments.length === 0 ? (
                        <span className="text-xs text-stone-400 italic col-span-2">No active behavioral barriers submitted.</span>
                      ) : (
                        selectedSubmission.formData.challengesAndValues.currentImpediments.map(imp => (
                          <div key={imp} className="flex items-center gap-2 p-3 bg-stone-950 rounded-lg border border-stone-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0" />
                            <span className="text-sm text-stone-200">{imp}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Transformation Objectives & Narrative */}
              <div className="bg-stone-900 p-6 rounded-2xl border border-stone-850 space-y-5">
                <h3 className="text-xs font-mono uppercase tracking-widest text-stone-400 border-b border-stone-800 pb-2 flex items-center gap-1.5 font-bold">
                  III. Life Transformation Vector Mapping
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-xs text-stone-300 uppercase block font-semibold">Core Selected 7 Areas of Life Targets</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSubmission.formData.goals.transformationAreas.map(area => (
                        <span key={area} className="px-3.5 py-1.5 bg-stone-800 border border-stone-700 rounded-full text-white text-xs font-bold font-display uppercase tracking-wider">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs text-stone-300 uppercase block font-semibold">Facilitator-facing Breakthrough Vision Transcript</span>
                    <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 text-sm text-stone-200 leading-relaxed font-sans font-light whitespace-pre-line">
                      {selectedSubmission.formData.goals.breakthroughVision || "Client declined to provide a written narrative."}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="min-h-[400px] flex flex-col justify-center items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-stone-400">No Ledgers Discovered</h3>
              <p className="text-xs text-stone-500 max-w-sm font-sans font-light">There are no client onboarding registrations on this storage node. Submit a client form to view details here.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
