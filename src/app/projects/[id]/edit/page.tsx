'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  MapPin,
  Coins,
  Sparkles,
} from 'lucide-react';

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

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = (params?.id as string) || 'proj-1';

  const { currentUser } = useAuth();
  const userEmail = currentUser?.email || 'applicant@udyogsathi.gov.in';
  const userRole = currentUser?.role || 'APPLICANT';

  const isAuthorized = WorkflowStore.checkResourceOwnership(userEmail, userRole, 'project', projectId);

  const [currentLang, setCurrentLang] = useState('en');
  const [project, setProject] = useState<IndustrialProject | null>(null);

  // Form State
  const [projectName, setProjectName] = useState('');
  const [sector, setSector] = useState(SECTORS[0]);
  const [subSector, setSubSector] = useState('');
  const [district, setDistrict] = useState('Pune');
  const [taluka, setTaluka] = useState('Khed');
  const [locationType, setLocationType] = useState<'MIDC' | 'NON_MIDC' | 'COOP_ESTATE'>('MIDC');
  const [plotNumber, setPlotNumber] = useState('');
  const [investmentInrLakhs, setInvestmentInrLakhs] = useState<number>(450);
  const [workforceCount, setWorkforceCount] = useState<number>(75);
  const [environmentalCategory, setEnvironmentalCategory] = useState<'WHITE' | 'GREEN' | 'ORANGE' | 'RED'>('ORANGE');
  const [projectStage, setProjectStage] = useState<'PROPOSED' | 'LAND_ALLOTTED' | 'CIVIL_SETUP' | 'OPERATIONAL'>('PROPOSED');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const userProjects = WorkflowStore.getProjects(userEmail);
    const proj = userProjects.find((p) => p.id === projectId);
    if (proj) {
      setProject(proj);
      setProjectName(proj.name);
      setSector(proj.sector);
      setSubSector(proj.subSector);
      setDistrict(proj.district);
      setTaluka(proj.taluka);
      setLocationType(proj.locationType);
      setPlotNumber(proj.plotNumber);
      setInvestmentInrLakhs(Math.round(proj.investmentAmountINR / 100000));
      setWorkforceCount(proj.workforceCount);
      setEnvironmentalCategory(proj.environmentalCategory);
      setProjectStage(proj.projectStage);
    }
  }, [projectId, userEmail]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    setIsSubmitting(true);
    const updatedProject: IndustrialProject = {
      ...project,
      name: projectName.trim() || project.name,
      sector,
      subSector: subSector.trim() || project.subSector,
      district,
      taluka: taluka.trim() || project.taluka,
      locationType,
      plotNumber: plotNumber.trim() || project.plotNumber,
      investmentAmountINR: (investmentInrLakhs || 100) * 100000,
      workforceCount: Number(workforceCount) || project.workforceCount,
      environmentalCategory,
      projectStage,
    };

    WorkflowStore.saveProject(updatedProject, userEmail);

    WorkflowStore.addAuditLog({
      id: `audit-proj-edit-${Date.now()}`,
      eventType: 'project_updated',
      description: `Industrial project '${updatedProject.name}' updated.`,
      actorUserId: currentUser?.id || userEmail,
      actorRole: 'applicant',
      timestamp: new Date().toISOString(),
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setToastMsg('Project details updated successfully.');
      setTimeout(() => {
        router.push(`/projects/${projectId}`);
      }, 1000);
    }, 500);
  };

  if (!isAuthorized) {
    return (
      <ProtectedRoute>
        <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans">
          <TopUtilityBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
          <OfficialHeader currentLang={currentLang} />
          <DisclaimerBanner lang={currentLang} />
          <main className="flex-1 py-12 px-4 max-w-2xl mx-auto w-full text-center space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-200 space-y-4 text-xs">
              <AlertTriangle className="w-12 h-12 text-red-600 mx-auto" />
              <h2 className="text-xl font-bold text-govBlue">Project Access Restricted</h2>
              <p className="text-govMuted">You do not have permission to edit this project record.</p>
              <Link href="/projects" className="bg-govBlue text-white font-bold px-4 py-2 rounded-xl inline-block">
                Return to My Projects
              </Link>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans">
        <TopUtilityBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
        <OfficialHeader currentLang={currentLang} />
        <DisclaimerBanner lang={currentLang} />

        <main id="main-content" className="flex-1 py-8 px-4 max-w-4xl mx-auto w-full space-y-6 text-xs">
          {toastMsg && (
            <div className="bg-green-50 text-green-900 border border-green-300 p-4 rounded-xl shadow font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span>{toastMsg}</span>
            </div>
          )}

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-govBorder flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-govBlue">Edit Industrial Project</h1>
              <p className="text-govMuted mt-0.5">Update project specifications and parameters.</p>
            </div>
            <Link href={`/projects/${projectId}`} className="text-govBlue font-bold underline flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Return to Workspace
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-govBorder space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Primary Industrial Sector *</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  {SECTORS.map((sec) => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">District *</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Taluka / MIDC *</label>
                <input
                  type="text"
                  required
                  value={taluka}
                  onChange={(e) => setTaluka(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Investment (in ₹ Lakhs) *</label>
                <input
                  type="number"
                  required
                  value={investmentInrLakhs}
                  onChange={(e) => setInvestmentInrLakhs(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Workforce Count *</label>
                <input
                  type="number"
                  required
                  value={workforceCount}
                  onChange={(e) => setWorkforceCount(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Link href={`/projects/${projectId}`} className="px-5 py-2.5 border border-slate-300 rounded-xl font-bold">
                Cancel
              </Link>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving Changes...' : 'Save Project Details'}
              </Button>
            </div>
          </form>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
