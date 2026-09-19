'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { OfficialHeader } from '@/components/layout/OfficialHeader';
import { Footer } from '@/components/layout/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CameraModal } from '@/components/inspection/CameraModal';
import { GeolocationPicker } from '@/components/inspection/GeolocationPicker';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Camera,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  Download,
  Calendar,
  Clock,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  Filter,
  Layers,
  FileText,
  X,
  Info,
} from 'lucide-react';

import { RoleProtectedRoute } from '@/components/auth/RoleProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { getTranslation } from '@/lib/i18n';

interface InspectorSummaryData {
  assignedInspections: number;
  scheduledToday: number;
  upcomingInspections: number;
  inProgressInspections: number;
  reportsAwaitingSubmission: number;
  completedThisMonth: number;
  highRiskInspections: number;
  activeInspections: Array<{
    _id: string;
    inspectionReference: string;
    department?: string;
    status: string;
    scheduledDate: string;
    slotTime?: string;
    locationAddress?: string;
    riskLevel?: string;
    instructions?: string;
    unitName?: string;
    title?: string;
    venue?: string;
    projectId?: { _id: string; name: string };
    applicationId?: { _id: string; applicationNumber: string; approvalName: string; status: string };
    inspectionResult?: string;
    recommendation?: string;
    reportSummary?: string;
    submittedAt?: string;
  }>;
  cancelledInspections: Array<{
    _id: string;
    inspectionReference: string;
    title?: string;
    unitName?: string;
    cancellationReason?: string;
    venue?: string;
    inspectorName?: string;
  }>;
}

export default function InspectorDashboardPage() {
  const { currentUser } = useAuth();
  const [currentLang, setCurrentLang] = useState('en');
  const [summaryData, setSummaryData] = useState<InspectorSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'active' | 'cancelled'>('active');

  const [cameraOpen, setCameraOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [gpsCoords, setGpsCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const [checklistItems, setChecklistItems] = useState([
    {
      id: 'chk-1',
      title: 'Fire Hydrant Pressure Test (Min 3.5 kg/cm2)',
      status: 'PASSED',
      notes: 'Hydrant pressure measured at 4.1 kg/cm2 with continuous flow.',
    },
    {
      id: 'chk-2',
      title: 'Emergency Exit Door Signage & Minimum 2.0 Meter Width',
      status: 'PASSED',
      notes: 'All 4 egress routes verified clear of obstruction with photo-luminescent signage.',
    },
    {
      id: 'chk-3',
      title: 'Structural Steel Fireproofing Thermal Coating Certificate',
      status: 'PASSED',
      notes: 'Third-party NABL test certificate verified on site.',
    },
  ]);

  // Form State
  const [selectedResult, setSelectedResult] = useState<'PASSED' | 'FAILED' | 'NEEDS_CORRECTION' | null>('PASSED');
  const [selectedRecommendation, setSelectedRecommendation] = useState<'RECOMMEND_APPROVAL' | 'RECOMMEND_REJECTION' | 'REQUIRE_CLARIFICATION' | null>('RECOMMEND_APPROVAL');
  const [reportSummaryText, setReportSummaryText] = useState('All statutory safety equipment verified and found compliant with applicable site requirements.');
  
  // Validation & Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ result?: string; recommendation?: string; summary?: string }>({});
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
  const [reportSubmissionSuccess, setReportSubmissionSuccess] = useState<string | null>(null);

  // Persisted Submission Result State
  const [persistedReport, setPersistedReport] = useState<{
    inspectionId: string;
    inspectionReference: string;
    inspectionResult: string;
    recommendation: string;
    reportSummary: string;
    submittedAt: string;
    applicationStatus: string;
    applicationNumber?: string;
  } | null>(null);

  // Modal State for Read-only Application Summary
  const [showApplicationSummaryModal, setShowApplicationSummaryModal] = useState(false);

  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const resultFieldRef = useRef<HTMLDivElement>(null);
  const recommendationFieldRef = useRef<HTMLDivElement>(null);
  const summaryFieldRef = useRef<HTMLTextAreaElement>(null);

  const t = (key: string) => getTranslation(currentLang, key);

  const fetchInspectorSummary = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/dashboard/inspector-summary');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSummaryData(json.data);
          
          // Check if active inspection is already completed
          const firstInsp = json.data.activeInspections?.[0];
          if (firstInsp && firstInsp.status === 'COMPLETED' && firstInsp.inspectionResult) {
            setPersistedReport({
              inspectionId: firstInsp._id,
              inspectionReference: firstInsp.inspectionReference,
              inspectionResult: firstInsp.inspectionResult,
              recommendation: firstInsp.recommendation || 'RECOMMEND_APPROVAL',
              reportSummary: firstInsp.reportSummary || 'Inspection report completed.',
              submittedAt: firstInsp.submittedAt || new Date().toISOString(),
              applicationStatus: 'Awaiting Department Decision',
              applicationNumber: firstInsp.applicationId?.applicationNumber,
            });
          }
        }
      } else {
        setFetchError('Unable to load assigned inspection summary');
      }
    } catch (err: any) {
      console.error('Inspector summary fetch error:', err);
      setFetchError('Database connection error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInspectorSummary();
  }, []);

  useEffect(() => {
    if (persistedReport && successHeadingRef.current) {
      successHeadingRef.current.focus();
    }
  }, [persistedReport]);

  const handleChecklistChange = (id: string, status: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const validateForm = () => {
    const errors: { result?: string; recommendation?: string; summary?: string } = {};

    if (!selectedResult) {
      errors.result = 'Select an inspection result before submitting.';
    }

    if (!selectedRecommendation) {
      errors.recommendation = 'Select an inspector recommendation before submitting.';
    }

    if (!reportSummaryText || !reportSummaryText.trim()) {
      errors.summary = 'Enter report summary remarks before submitting.';
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      setFormErrorMessage('Please resolve the errors highlighted below before submitting.');
      
      // Auto-focus first invalid control
      setTimeout(() => {
        if (errors.result && resultFieldRef.current) {
          resultFieldRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (errors.recommendation && recommendationFieldRef.current) {
          recommendationFieldRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (errors.summary && summaryFieldRef.current) {
          summaryFieldRef.current.focus();
        } else if (errorSummaryRef.current) {
          errorSummaryRef.current.focus();
        }
      }, 100);

      return false;
    }

    setFormErrorMessage(null);
    return true;
  };

  const handleSubmitReportForInspection = async (inspId: string, inspRef: string) => {
    if (isSubmitting) return;

    if (!validateForm()) return;

    setIsSubmitting(true);
    setFormErrorMessage(null);
    setReportSubmissionSuccess(null);

    try {
      // 1. Primary endpoint POST /api/inspections/[id]/submit-report
      let res = await fetch(`/api/inspections/${inspId}/submit-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspectionResult: selectedResult,
          recommendation: selectedRecommendation,
          reportSummary: reportSummaryText.trim(),
          checklistItems,
        }),
      });

      // Fallback to PATCH if route not found
      if (res.status === 404) {
        res = await fetch(`/api/inspections/${inspId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'COMPLETED',
            inspectionResult: selectedResult,
            recommendation: selectedRecommendation,
            reportSummary: reportSummaryText.trim(),
            checklistItems,
          }),
        });
      }

      const json = await res.json();

      if (res.ok && json.success) {
        const submittedDate = json.data?.submittedAt || new Date().toISOString();
        setPersistedReport({
          inspectionId: inspId,
          inspectionReference: inspRef,
          inspectionResult: selectedResult!,
          recommendation: selectedRecommendation!,
          reportSummary: reportSummaryText.trim(),
          submittedAt: submittedDate,
          applicationStatus: 'Awaiting Department Decision',
          applicationNumber: json.data?.applicationNumber,
        });

        setReportSubmissionSuccess(
          `Inspection Report Submitted Successfully for ${inspRef}! Linked application updated to Awaiting Department Decision.`
        );

        fetchInspectorSummary();
      } else if (res.status === 409 || json.alreadySubmitted) {
        // Conflict / Duplicate submission guard response
        setFormErrorMessage(json.error || 'Inspection report has already been submitted.');
        if (json.data) {
          setPersistedReport({
            inspectionId: inspId,
            inspectionReference: inspRef,
            inspectionResult: json.data.inspectionResult || selectedResult || 'PASSED',
            recommendation: json.data.recommendation || selectedRecommendation || 'RECOMMEND_APPROVAL',
            reportSummary: json.data.reportSummary || reportSummaryText,
            submittedAt: json.data.submittedAt || new Date().toISOString(),
            applicationStatus: 'Awaiting Department Decision',
          });
        }
      } else {
        setFormErrorMessage(json.error || 'Unable to submit inspection report. Please try again.');
      }
    } catch (err: any) {
      console.error('Inspection submit error:', err);
      setFormErrorMessage('Unable to submit inspection report due to a network connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadReportPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(18, 59, 102);
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('UdyogSathi - Field Inspection Report', 14, 15);

    doc.setTextColor(23, 32, 51);
    doc.setFontSize(12);
    doc.text(`Inspection Reference: ${persistedReport?.inspectionReference || summaryData?.activeInspections?.[0]?.inspectionReference || 'INSP-2026-901'}`, 14, 35);
    doc.text(`Inspector: ${currentUser?.name || 'Anand Shinde'}`, 14, 42);
    doc.text(`Inspection Result: ${persistedReport?.inspectionResult || selectedResult || 'PASSED'}`, 14, 49);
    doc.text(`Recommendation: ${persistedReport?.recommendation || selectedRecommendation || 'RECOMMEND_APPROVAL'}`, 14, 56);
    doc.text(`Date Submitted: ${persistedReport ? new Date(persistedReport.submittedAt).toLocaleString() : new Date().toLocaleString()}`, 14, 63);

    if (gpsCoords) {
      doc.text(`GPS Tag: Lat ${gpsCoords.latitude}, Lon ${gpsCoords.longitude}`, 14, 70);
    }

    const rows = checklistItems.map((item, idx) => [
      (idx + 1).toString(),
      item.title,
      item.status,
      item.notes || 'No remarks',
    ]);

    autoTable(doc, {
      startY: gpsCoords ? 78 : 71,
      head: [['#', 'Safety Verification Item', 'Status', 'Inspector Remarks']],
      body: rows,
      headStyles: { fillColor: [18, 59, 102] },
    });

    const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 120;
    doc.setFontSize(11);
    doc.text('Report Summary Remarks:', 14, finalY);
    doc.setFontSize(10);
    doc.text(persistedReport?.reportSummary || reportSummaryText || 'N/A', 14, finalY + 7);

    doc.save(`UdyogSathi_Inspection_Report_${persistedReport?.inspectionReference || summaryData?.activeInspections?.[0]?.inspectionReference || 'Export'}.pdf`);
  };

  const activeInspection = summaryData?.activeInspections?.[0] || {
    _id: 'insp-demo-1',
    inspectionReference: 'INSP-2026-901',
    department: 'Directorate of Industrial Safety and Health (DISH)',
    status: 'SCHEDULED',
    scheduledDate: '2026-09-11',
    unitName: 'Chakan Food Processing & Cold Chain Unit',
    locationAddress: 'Plot C-14, Chakan MIDC Phase II, Pune',
    venue: 'Plot C-14, Chakan MIDC Phase II, Pune',
  };

  return (
    <RoleProtectedRoute allowedRoles={['inspector', 'INSPECTOR', 'administrator', 'ADMIN']}>
      <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans">
        <TopUtilityBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
        <OfficialHeader currentLang={currentLang} />
        <DisclaimerBanner lang={currentLang} />

        <main id="main-content" className="flex-1 py-8 px-4 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-govBorder flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-saffron" />
                <h1 className="text-xl font-bold text-govBlue">Field Inspector Camera & Audit Portal</h1>
              </div>
              <p className="text-xs text-govMuted mt-1">
                Authorised DISH/MPCB Inspector Portal for capturing geotagged site photo evidence, conducting checklists, and submitting statutory reports.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-purple-50 text-purple-900 border border-purple-200 px-3.5 py-1.5 rounded-full text-xs font-bold">
                {currentUser?.name || 'Senior Factory Inspector'}
              </div>
              <button
                onClick={fetchInspectorSummary}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Refresh Assigned Work"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Form Error Banner */}
          {formErrorMessage && (
            <div
              ref={errorSummaryRef}
              tabIndex={-1}
              role="alert"
              aria-live="assertive"
              className="bg-red-50 border-2 border-red-500 text-red-950 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold shadow-sm animate-fade-in"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                <span>{formErrorMessage}</span>
              </div>
              <button
                onClick={() => setFormErrorMessage(null)}
                className="text-red-800 hover:text-red-950 text-xs font-bold underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* SECTION: Assigned Inspection Work Overview */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-govBorder space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-govBlue flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-saffron" /> Assigned Inspection Work Queue
                </h2>
                <p className="text-xs text-govMuted mt-0.5">
                  Real-time assigned field audits and geotagged evidence status.
                </p>
              </div>
              <Badge variant="blue">MongoDB Inspector Work Queue</Badge>
            </div>

            {/* KPI Summary Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-slate-100 h-24 rounded-2xl" />
                ))}
              </div>
            ) : fetchError ? (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                <span>{fetchError}</span>
                <button onClick={fetchInspectorSummary} className="font-bold underline text-govBlue">
                  Retry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-2xl border border-govBorder shadow-sm space-y-1">
                  <span className="text-slate-500 font-medium block">Total Assigned Audits</span>
                  <div className="text-2xl font-extrabold text-govBlue">
                    {summaryData?.assignedInspections ?? 1}
                  </div>
                  <span className="text-[10px] text-govSuccess font-bold">Active Jurisdiction</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-govBorder shadow-sm space-y-1">
                  <span className="text-slate-500 font-medium block">Reports Pending Submission</span>
                  <div className="text-2xl font-extrabold text-saffron">
                    {summaryData?.reportsAwaitingSubmission ?? 1}
                  </div>
                  <span className="text-[10px] text-saffron font-bold">Awaiting Field Form</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-govBorder shadow-sm space-y-1">
                  <span className="text-slate-500 font-medium block">Completed Audits</span>
                  <div className="text-2xl font-extrabold text-green-600">
                    {summaryData?.completedThisMonth ?? 1}
                  </div>
                  <span className="text-[10px] text-green-700 font-bold">Reports Uploaded</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-govBorder shadow-sm space-y-1">
                  <span className="text-slate-500 font-medium block">High-Risk Site Audits</span>
                  <div className="text-2xl font-extrabold text-red-600">
                    {summaryData?.highRiskInspections ?? 1}
                  </div>
                  <span className="text-[10px] text-red-700 font-bold">Priority Verification</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <Link
              href="/inspections"
              className="bg-white p-4 rounded-xl border border-govBorder shadow-sm hover:border-saffron transition-all space-y-1 group"
            >
              <span className="font-bold text-govBlue group-hover:text-saffron flex items-center gap-1">
                <FileCheck className="w-4 h-4 text-saffron" /> View Assigned Inspections
              </span>
              <p className="text-[11px] text-slate-500">Access complete site inspection schedule & location list.</p>
            </Link>

            <button
              onClick={() => setActiveTab('active')}
              className="bg-white p-4 rounded-xl border border-govBorder shadow-sm hover:border-saffron transition-all text-left space-y-1 group"
            >
              <span className="font-bold text-govBlue group-hover:text-saffron flex items-center gap-1">
                <Camera className="w-4 h-4 text-blue-600" /> Start Geotagged Audit
              </span>
              <p className="text-[11px] text-slate-500">Capture geofenced GPS camera evidence photo.</p>
            </button>

            <button
              onClick={() => setActiveTab('active')}
              className="bg-white p-4 rounded-xl border border-govBorder shadow-sm hover:border-saffron transition-all text-left space-y-1 group"
            >
              <span className="font-bold text-govBlue group-hover:text-saffron flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" /> Submit Inspection Report
              </span>
              <p className="text-[11px] text-slate-500">Fill statutory safety checklist & recommend decision.</p>
            </button>

            <button
              onClick={() => setActiveTab('cancelled')}
              className="bg-white p-4 rounded-xl border border-govBorder shadow-sm hover:border-saffron transition-all text-left space-y-1 group"
            >
              <span className="font-bold text-govBlue group-hover:text-saffron flex items-center gap-1">
                <Clock className="w-4 h-4 text-purple-600" /> Inspection History ({summaryData?.cancelledInspections?.length || 0})
              </span>
              <p className="text-[11px] text-slate-500">View archived and cancelled site audit records.</p>
            </button>
          </div>

          {/* Active vs Cancelled Inspection Tabs */}
          <div className="flex items-center gap-3 border-b border-govBorder pb-2 text-xs">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
                activeTab === 'active'
                  ? 'bg-govBlue text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-saffron" />
              <span>Active Assigned Inspections ({summaryData?.activeInspections?.length || 1})</span>
            </button>

            <button
              onClick={() => setActiveTab('cancelled')}
              className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
                activeTab === 'cancelled'
                  ? 'bg-red-700 text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span>Cancelled Inspection History ({summaryData?.cancelledInspections?.length || 0})</span>
            </button>
          </div>

          {/* Assigned Inspections Content Area */}
          {activeTab === 'active' ? (
            <div className="space-y-6">
              {/* Inspection Details Header Card */}
              <div className="bg-white p-6 rounded-2xl border border-govBorder shadow-sm space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono text-govBlue font-bold">{activeInspection.inspectionReference}</span>
                    <h3 className="font-extrabold text-slate-900 text-sm">{activeInspection.title || 'Statutory Site Inspection'}</h3>
                    <div className="text-slate-600 font-medium">
                      {activeInspection.projectId?.name || activeInspection.unitName || 'Chakan Food Processing Unit'}
                    </div>
                  </div>
                  <Badge variant={persistedReport ? 'green' : 'amber'}>
                    {persistedReport ? 'Report Submitted / Completed' : `Scheduled for ${activeInspection.scheduledDate ? new Date(activeInspection.scheduledDate).toLocaleDateString() : 'Next 3 Days'}`}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-saffron shrink-0" />
                  <span>{activeInspection.locationAddress || activeInspection.venue || 'Plot C-14, Chakan MIDC Phase II, Pune'}</span>
                </div>

                {/* Geofence & Camera Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="space-y-2">
                    <span className="font-bold text-govBlue block">1. Geofence Location Tag:</span>
                    <GeolocationPicker onLocationCaptured={(coords) => setGpsCoords(coords)} />
                  </div>

                  <div className="space-y-2">
                    <span className="font-bold text-govBlue block">2. Geotagged Camera Evidence:</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setCameraOpen(true)}
                      leftIcon={<Camera className="w-4 h-4" />}
                    >
                      Capture Site Photo
                    </Button>
                    {capturedPhoto && (
                      <div className="mt-2 relative w-32 h-20 rounded-lg overflow-hidden border border-slate-300 shadow-sm">
                        <img src={capturedPhoto} alt="Site evidence" className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9px] text-center font-mono py-0.5">
                          GPS Verified
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Checklist Section */}
              <div className="bg-white p-6 rounded-2xl border border-govBorder shadow-sm space-y-4 text-xs">
                <h3 className="font-bold text-govBlue text-sm flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-saffron" /> Statutory Field Inspection Checklist
                </h3>

                <div className="space-y-3">
                  {checklistItems.map((item) => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="font-semibold text-slate-800">{item.title}</div>
                      <div className="flex items-center gap-3">
                        {['PASSED', 'FAILED', 'NEEDS_CORRECTION'].map((st) => (
                          <button
                            key={st}
                            type="button"
                            disabled={!!persistedReport}
                            onClick={() => handleChecklistChange(item.id, st)}
                            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                              item.status === st
                                ? st === 'PASSED'
                                  ? 'bg-green-600 text-white shadow'
                                  : st === 'FAILED'
                                  ? 'bg-red-600 text-white shadow'
                                  : 'bg-amber-500 text-white shadow'
                                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                            } ${persistedReport ? 'opacity-70 cursor-not-allowed' : ''}`}
                          >
                            {st.replace(/_/g, ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PERSISTED SUCCESS STATE CARD vs ACTION FORM */}
              {persistedReport ? (
                /* PERSISTED SUCCESS CARD */
                <div className="bg-green-50/80 border-2 border-green-500 p-6 rounded-2xl shadow-md space-y-4 text-xs animate-fade-in">
                  <div className="flex items-center justify-between border-b border-green-200 pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                      <div>
                        <h3
                          ref={successHeadingRef}
                          tabIndex={-1}
                          className="text-base font-extrabold text-green-950 focus:outline-none"
                        >
                          ✓ Inspection Report Submitted Successfully
                        </h3>
                        <p className="text-xs text-green-800">
                          Persisted report record for <strong className="font-mono">{persistedReport.inspectionReference}</strong>
                        </p>
                      </div>
                    </div>
                    <Badge variant="green">Submitted / Completed</Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-green-200 text-slate-900 font-medium">
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-500 font-bold block">Inspection Result:</span>
                      <div className="flex items-center gap-1.5">
                        {persistedReport.inspectionResult === 'PASSED' ? (
                          <span className="bg-green-100 text-green-800 font-bold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-green-600" /> PASSED
                          </span>
                        ) : persistedReport.inspectionResult === 'FAILED' ? (
                          <span className="bg-red-100 text-red-800 font-bold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1">
                            <XCircle className="w-4 h-4 text-red-600" /> FAILED
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4 text-amber-600" /> NEEDS CORRECTION
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-500 font-bold block">Inspector Recommendation:</span>
                      <span className="font-bold text-govBlue">
                        {persistedReport.recommendation === 'RECOMMEND_APPROVAL'
                          ? 'Recommend Approval'
                          : persistedReport.recommendation === 'RECOMMEND_REJECTION'
                          ? 'Recommend Rejection'
                          : 'Require Clarification'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-500 font-bold block">Submitted Timestamp:</span>
                      <span className="font-bold text-slate-800">
                        {new Date(persistedReport.submittedAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-500 font-bold block">Application Workflow Status:</span>
                      <span className="bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-1 rounded-lg font-bold inline-block">
                        {persistedReport.applicationStatus}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-green-200 text-slate-800 space-y-1">
                    <span className="font-bold text-govBlue text-xs block">Report Summary Remarks:</span>
                    <p className="text-xs leading-relaxed text-slate-900">{persistedReport.reportSummary}</p>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-green-200">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleDownloadReportPDF}
                        leftIcon={<Download className="w-4 h-4" />}
                      >
                        Export PDF Report
                      </Button>

                      <button
                        onClick={() => setShowApplicationSummaryModal(true)}
                        className="bg-govBlue hover:bg-govBlue-dark text-white font-bold px-3.5 py-2 rounded-lg text-xs transition-colors flex items-center gap-1.5"
                      >
                        <FileText className="w-4 h-4 text-saffron" />
                        <span>View Linked Application Summary</span>
                      </button>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPersistedReport(null);
                        fetchInspectorSummary();
                      }}
                      leftIcon={<RefreshCw className="w-4 h-4" />}
                    >
                      Return to Assigned Inspections
                    </Button>
                  </div>
                </div>
              ) : (
                /* ACTIONABLE INSPECTION FORM */
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmitReportForInspection(activeInspection._id, activeInspection.inspectionReference);
                  }}
                  className="bg-white p-6 rounded-2xl border border-govBorder shadow-sm space-y-5 text-xs"
                >
                  <h3 className="font-bold text-govBlue text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                    <FileCheck className="w-5 h-5 text-saffron" /> Inspector Findings & Statutory Recommendation Form
                  </h3>

                  {/* 1. Inspection Result Field */}
                  <div ref={resultFieldRef} className="space-y-2">
                    <label className="font-bold text-slate-800 block text-xs">
                      1. Statutory Inspection Result *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'PASSED', label: '✓ PASSED', bg: 'bg-green-50 border-green-400 text-green-900', ring: 'ring-green-600' },
                        { id: 'FAILED', label: '✕ FAILED', bg: 'bg-red-50 border-red-400 text-red-900', ring: 'ring-red-600' },
                        { id: 'NEEDS_CORRECTION', label: '! NEEDS CORRECTION', bg: 'bg-amber-50 border-amber-400 text-amber-900', ring: 'ring-amber-600' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => {
                            setSelectedResult(opt.id as any);
                            setValidationErrors((prev) => ({ ...prev, result: undefined }));
                          }}
                          className={`p-3 rounded-xl border-2 font-extrabold text-xs text-center transition-all flex items-center justify-center gap-2 ${
                            selectedResult === opt.id
                              ? `${opt.bg} ring-2 ${opt.ring} shadow-md`
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {validationErrors.result && (
                      <p className="text-red-600 text-[11px] font-bold mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> {validationErrors.result}
                      </p>
                    )}
                  </div>

                  {/* 2. Inspector Recommendation Field */}
                  <div ref={recommendationFieldRef} className="space-y-2">
                    <label className="font-bold text-slate-800 block text-xs">
                      2. Inspector Statutory Recommendation *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'RECOMMEND_APPROVAL', label: 'Recommend Approval', bg: 'bg-green-50 border-green-400 text-green-900' },
                        { id: 'RECOMMEND_REJECTION', label: 'Recommend Rejection', bg: 'bg-red-50 border-red-400 text-red-900' },
                        { id: 'REQUIRE_CLARIFICATION', label: 'Require Clarification', bg: 'bg-amber-50 border-amber-400 text-amber-900' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => {
                            setSelectedRecommendation(opt.id as any);
                            setValidationErrors((prev) => ({ ...prev, recommendation: undefined }));
                          }}
                          className={`p-3 rounded-xl border-2 font-extrabold text-xs text-center transition-all ${
                            selectedRecommendation === opt.id
                              ? `${opt.bg} ring-2 ring-govBlue shadow-md`
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {validationErrors.recommendation && (
                      <p className="text-red-600 text-[11px] font-bold mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> {validationErrors.recommendation}
                      </p>
                    )}
                  </div>

                  {/* 3. Report Summary Remarks */}
                  <div className="space-y-1.5">
                    <label htmlFor="report-summary-text" className="font-bold text-slate-800 block text-xs">
                      3. Report Summary Remarks *
                    </label>
                    <textarea
                      id="report-summary-text"
                      ref={summaryFieldRef}
                      disabled={isSubmitting}
                      value={reportSummaryText}
                      onChange={(e) => {
                        setReportSummaryText(e.target.value);
                        setValidationErrors((prev) => ({ ...prev, summary: undefined }));
                      }}
                      rows={3}
                      aria-describedby="summary-hint"
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-sans text-slate-900 focus:ring-2 focus:ring-govBlue focus:border-govBlue"
                      placeholder="Enter inspector findings, statutory compliance observations, and site verification remarks..."
                    />
                    <p id="summary-hint" className="text-[11px] text-slate-500">
                      These remarks will be stored permanently in MongoDB and visible to the scrutinising Department Officer and Applicant.
                    </p>
                    {validationErrors.summary && (
                      <p className="text-red-600 text-[11px] font-bold mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> {validationErrors.summary}
                      </p>
                    )}
                  </div>

                  {/* Form Action Controls */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      disabled={isSubmitting}
                      isLoading={isSubmitting}
                      leftIcon={<CheckCircle2 className="w-4 h-4 text-saffron" />}
                    >
                      {isSubmitting ? 'Submitting Inspection Report…' : 'Submit Inspection Report & Recommendation'}
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      onClick={handleDownloadReportPDF}
                      leftIcon={<Download className="w-4 h-4" />}
                    >
                      Export Draft PDF Report
                    </Button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Cancelled Inspections History Tab */
            <div className="space-y-4 text-xs">
              {summaryData?.cancelledInspections && summaryData.cancelledInspections.length > 0 ? (
                summaryData.cancelledInspections.map((insp) => (
                  <div key={insp._id} className="bg-red-50/50 p-6 rounded-2xl border border-red-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-red-100 pb-2">
                      <div className="space-y-0.5">
                        <span className="font-mono text-govBlue font-bold">{insp.inspectionReference}</span>
                        <h3 className="font-bold text-slate-900 text-sm">{insp.title || 'Cancelled Inspection'}</h3>
                        <div className="text-slate-600">{insp.unitName}</div>
                      </div>
                      <Badge variant="red">Cancelled</Badge>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-red-200 text-red-950 font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>Cancellation Reason: {insp.cancellationReason || 'Application cancelled by department.'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white p-8 rounded-2xl border border-govBorder text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
                  <h3 className="font-bold text-govBlue">No Cancelled Inspections</h3>
                  <p className="text-govMuted">There are no cancelled inspections in the audit history.</p>
                </div>
              )}
            </div>
          )}

          {/* Camera Modal */}
          {cameraOpen && (
            <CameraModal
              isOpen={cameraOpen}
              onClose={() => setCameraOpen(false)}
              onPhotoCaptured={(photoData) => {
                setCapturedPhoto(photoData);
                setCameraOpen(false);
              }}
            />
          )}

          {/* Read-Only Application Summary Modal */}
          {showApplicationSummaryModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-govBlue text-sm flex items-center gap-2">
                    <FileText className="w-5 h-5 text-saffron" />
                    <span>Linked Application Summary (Read-Only)</span>
                  </h3>
                  <button
                    onClick={() => setShowApplicationSummaryModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500 font-medium">Application Number:</span>
                      <span className="font-mono font-bold text-govBlue">
                        {persistedReport?.applicationNumber || 'APP-MPCB-2026-880201'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500 font-medium">Approval Name:</span>
                      <span className="font-bold text-slate-800">Consent to Establish (CTE)</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500 font-medium">Department:</span>
                      <span className="font-bold text-slate-800">Maharashtra Pollution Control Board (MPCB)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Current Workflow Status:</span>
                      <span className="font-bold text-blue-700">INSPECTION_COMPLETED / Awaiting Department Decision</span>
                    </div>
                  </div>

                  <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 text-blue-950 font-medium text-xs flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      The inspection report has been persisted in MongoDB. The application is currently awaiting final statutory decision from the assigned Department Officer.
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setShowApplicationSummaryModal(false)}
                    className="px-4 py-2 bg-govBlue text-white font-bold rounded-lg text-xs"
                  >
                    Close Summary
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </RoleProtectedRoute>
  );
}
