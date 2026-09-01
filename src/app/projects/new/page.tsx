'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { OfficialHeader } from '@/components/layout/OfficialHeader';
import { Footer } from '@/components/layout/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { WorkflowStore } from '@/lib/workflow-store';
import { IndustrialProject } from '@/lib/workflow-engine';
import { ROUTES } from '@/lib/routes';
import {
  Building2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  MapPin,
  Coins,
  Users,
  Sparkles,
  Layers,
} from 'lucide-react';
import { getTranslation } from '@/lib/i18n';

const SECTORS = [
  'Automotive & Heavy Engineering',
  'Chemicals & Petrochemicals',
  'Food Processing & Agribusiness',
  'Textiles & Apparel',
  'Information Technology & Data Centers',
  'Pharmaceuticals & Medical Devices',
  'Renewable Energy & Electronics',
  'General Manufacturing',
];

const MAHARASHTRA_DISTRICTS = [
  'Pune',
  'Raigad',
  'Thane',
  'Nagpur',
  'Nashik',
  'Chhatrapati Sambhajinagar',
  'Kolhapur',
  'Solapur',
  'Amravati',
  'Palghar',
  'Satara',
  'Ratnagiri',
];

export default function CreateNewProjectPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [currentLang, setCurrentLang] = useState('en');

  const userEmail = currentUser?.email || 'applicant@udyogsathi.gov.in';

  // Form State
  const [projectName, setProjectName] = useState('');
  const [organisationName, setOrganisationName] = useState(
    currentUser?.name ? `${currentUser.name} Industrial Solutions Pvt. Ltd.` : 'My Industrial Unit'
  );
  const [sector, setSector] = useState(SECTORS[0]);
  const [subSector, setSubSector] = useState('');
  const [district, setDistrict] = useState(MAHARASHTRA_DISTRICTS[0]);
  const [taluka, setTaluka] = useState('Chakan MIDC');
  const [locationType, setLocationType] = useState<'MIDC' | 'NON_MIDC' | 'COOP_ESTATE'>('MIDC');
  const [plotNumber, setPlotNumber] = useState('Plot C-18');
  const [investmentInrLakhs, setInvestmentInrLakhs] = useState<number>(450); // ₹4.5 Cr
  const [workforceCount, setWorkforceCount] = useState<number>(75);
  const [environmentalCategory, setEnvironmentalCategory] = useState<'WHITE' | 'GREEN' | 'ORANGE' | 'RED'>('ORANGE');
  const [projectStage, setProjectStage] = useState<'PROPOSED' | 'LAND_ALLOTTED' | 'CIVIL_SETUP' | 'OPERATIONAL'>('PROPOSED');
  const [consentAccepted, setConsentAccepted] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!projectName.trim()) {
      setErrorMessage('Please enter a valid project title.');
      return;
    }

    if (!consentAccepted) {
      setErrorMessage('Please confirm accuracy of the information to proceed.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newProjectId = `proj-${Date.now()}`;
      const investmentAmountINR = (investmentInrLakhs || 100) * 100000;

      const newProject: IndustrialProject = {
        id: newProjectId,
        name: projectName.trim(),
        promoterName: currentUser?.name || 'Applicant',
        sector,
        subSector: subSector.trim() || `${sector} Manufacturing Unit`,
        district,
        taluka: taluka.trim() || 'Industrial Estate',
        locationType,
        plotNumber: plotNumber.trim() || 'Plot 1',
        investmentAmountINR,
        workforceCount: Number(workforceCount) || 50,
        environmentalCategory,
        projectStage,
        createdAt: new Date().toISOString(),
        totalApprovalsRequired: environmentalCategory === 'RED' ? 8 : environmentalCategory === 'ORANGE' ? 5 : 3,
        currentStageNumber: 1,
      };

      // 1. Persist to User-Scoped Storage
      WorkflowStore.saveProject(newProject, userEmail);

      // 2. Dispatch In-App Notification
      WorkflowStore.addNotification({
        id: `notif-proj-create-${Date.now()}`,
        recipientUserId: currentUser?.id || userEmail,
        recipientEmail: userEmail,
        recipientRole: 'applicant',
        type: 'welcome',
        title: 'Project Created Successfully!',
        message: `Your project '${newProject.name}' has been created. Start your statutory approval roadmap to identify necessary clearances.`,
        route: `/projects/${newProjectId}`,
        priority: 'high',
        deliveryStatus: 'delivered_in_app',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      // 3. Create Audit Log
      WorkflowStore.addAuditLog({
        id: `audit-proj-create-${Date.now()}`,
        eventType: 'project_created',
        description: `Industrial Project '${newProject.name}' created by ${currentUser?.name || userEmail}.`,
        actorUserId: currentUser?.id || userEmail,
        actorRole: 'applicant',
        timestamp: new Date().toISOString(),
        metadata: { projectId: newProjectId, district, sector },
      });

      setTimeout(() => {
        setIsSubmitting(false);
        router.push(`/projects/${newProjectId}`);
      }, 600);
    } catch (err: any) {
      console.error('Project creation error:', err);
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Failed to save project. Please try again.');
    }
  };

  return (
    <ProtectedRoute>
      <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans">
        <TopUtilityBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
        <OfficialHeader currentLang={currentLang} />
        <DisclaimerBanner lang={currentLang} />

        <main id="main-content" className="flex-1 py-8 px-4 max-w-4xl mx-auto w-full space-y-6">
          {/* Top Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-govMuted">
            <Link href={ROUTES.dashboard} className="hover:text-govBlue">Workspace</Link>
            <span>/</span>
            <Link href={ROUTES.projects} className="hover:text-govBlue">Projects</Link>
            <span>/</span>
            <span className="font-semibold text-govBlue">Create New Project</span>
          </div>

          {/* Page Heading Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-govBorder space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-saffron" />
              <h1 className="text-xl font-bold text-govBlue">Create a New Industrial Project</h1>
            </div>
            <p className="text-xs text-govMuted leading-relaxed">
              Add the essential details of your proposed industrial project. UdyogSathi will use these details to identify likely approvals, documents, inspections, compliance requirements, and relevant government schemes.
            </p>
          </div>

          {/* Error Summary Banner */}
          {errorMessage && (
            <div className="bg-red-50 text-red-900 border border-red-300 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Project Creation Form */}
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-govBorder space-y-6 text-xs">
            {/* Section 1: Basic Enterprise Identity */}
            <div className="space-y-4">
              <h3 className="font-bold text-govBlue text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-saffron" /> 1. Project & Enterprise Identity
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Project Name / Unit Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. Sahyadri Auto Components Unit 2"
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-saffron text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Promoter / Organisation Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={organisationName}
                    onChange={(e) => setOrganisationName(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-saffron text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Sector & Location */}
            <div className="space-y-4">
              <h3 className="font-bold text-govBlue text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-saffron" /> 2. Sector & Location Classification
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Primary Industrial Sector *</label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-saffron text-xs bg-white"
                  >
                    {SECTORS.map((sec) => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Sub-Sector Activity</label>
                  <input
                    type="text"
                    value={subSector}
                    onChange={(e) => setSubSector(e.target.value)}
                    placeholder="e.g. EV Battery Packs & Chassis Machining"
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-saffron text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Maharashtra District *</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-saffron text-xs bg-white"
                  >
                    {MAHARASHTRA_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Taluka / MIDC Area *</label>
                  <input
                    type="text"
                    required
                    value={taluka}
                    onChange={(e) => setTaluka(e.target.value)}
                    placeholder="e.g. Khed / Chakan MIDC"
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-saffron text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Location Zone Type *</label>
                  <select
                    value={locationType}
                    onChange={(e) => setLocationType(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-saffron text-xs bg-white"
                  >
                    <option value="MIDC">MIDC Industrial Area</option>
                    <option value="NON_MIDC">Non-MIDC / Private Land</option>
                    <option value="COOP_ESTATE">Cooperative Industrial Estate</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Plot / Survey Number</label>
                  <input
                    type="text"
                    value={plotNumber}
                    onChange={(e) => setPlotNumber(e.target.value)}
                    placeholder="e.g. Plot C-18, MIDC Phase II"
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-saffron text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Financial & Environmental Details */}
            <div className="space-y-4">
              <h3 className="font-bold text-govBlue text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
                <Coins className="w-4 h-4 text-saffron" /> 3. Investment & Environmental Scale
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Estimated Investment (in ₹ Lakhs) *
                  </label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={100000}
                    value={investmentInrLakhs}
                    onChange={(e) => setInvestmentInrLakhs(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-saffron text-xs font-mono"
                  />
                  <span className="text-[10px] text-govMuted mt-0.5 block">
                    Equivalent to ₹{(investmentInrLakhs / 100).toFixed(2)} Crore
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Expected Workforce Count *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={10000}
                    value={workforceCount}
                    onChange={(e) => setWorkforceCount(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-saffron text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Pollution Category (MPCB Classification) *
                  </label>
                  <select
                    value={environmentalCategory}
                    onChange={(e) => setEnvironmentalCategory(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-saffron text-xs bg-white font-bold"
                  >
                    <option value="WHITE">WHITE (Non-polluting / Exemption List)</option>
                    <option value="GREEN">GREEN (Low Pollution Index 11-20)</option>
                    <option value="ORANGE">ORANGE (Medium Pollution Index 21-40)</option>
                    <option value="RED">RED (High Pollution Index 41-100)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Current Project Stage *</label>
                  <select
                    value={projectStage}
                    onChange={(e) => setProjectStage(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-saffron text-xs bg-white"
                  >
                    <option value="PROPOSED">Proposed / Concept Phase</option>
                    <option value="LAND_ALLOTTED">Land Allotted / Leased</option>
                    <option value="CIVIL_SETUP">Civil Construction Underway</option>
                    <option value="OPERATIONAL">Operational / Expansion Phase</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Declaration & Submission */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentAccepted}
                  onChange={(e) => setConsentAccepted(e.target.checked)}
                  className="mt-0.5 rounded text-saffron focus:ring-saffron"
                />
                <span className="text-slate-700 text-[11px] leading-relaxed">
                  I confirm that the industrial project information provided is accurate for this demo single-window approval workflow.
                </span>
              </label>

              <div className="flex items-center justify-end gap-3">
                <Link
                  href={ROUTES.projects}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 transition-all text-xs"
                >
                  Cancel
                </Link>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  leftIcon={<Building2 className="w-4 h-4 text-saffron" />}
                >
                  {isSubmitting ? 'Creating Project...' : 'Create Project & Generate Roadmap'}
                </Button>
              </div>
            </div>
          </form>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
