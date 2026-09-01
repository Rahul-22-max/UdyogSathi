'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { OfficialHeader } from '@/components/layout/OfficialHeader';
import { Footer } from '@/components/layout/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CameraModal } from '@/components/inspection/CameraModal';
import { GeolocationPicker } from '@/components/inspection/GeolocationPicker';
import { WorkflowStore, InspectionItem } from '@/lib/workflow-store';
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
} from 'lucide-react';

import { RoleProtectedRoute } from '@/components/auth/RoleProtectedRoute';
import { useAuth } from '@/context/AuthContext';

export default function InspectorDashboardPage() {
  const { currentUser } = useAuth();
  const [currentLang, setCurrentLang] = useState('en');
  const [activeInspections, setActiveInspections] = useState<InspectionItem[]>([]);
  const [cancelledInspections, setCancelledInspections] = useState<InspectionItem[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'cancelled'>('active');

  const [cameraOpen, setCameraOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [gpsCoords, setGpsCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const [checklistItems, setChecklistItems] = useState([
    {
      id: 'chk-1',
      title: 'Fire Hydrant Pressure Test (Min 3.5 kg/cm2)',
      status: 'NOT_CHECKED',
      notes: '',
    },
    {
      id: 'chk-2',
      title: 'Emergency Exit Door Signage & Minimum 2.0 Meter Width',
      status: 'NOT_CHECKED',
      notes: '',
    },
    {
      id: 'chk-3',
      title: 'Structural Steel Fireproofing Thermal Coating Certificate',
      status: 'NOT_CHECKED',
      notes: '',
    },
  ]);

  const [selectedRecommendation, setSelectedRecommendation] = useState<'RECOMMEND_APPROVAL' | 'RECOMMEND_REJECTION' | 'REQUIRE_CLARIFICATION'>('RECOMMEND_APPROVAL');
  const [reportSummaryText, setReportSummaryText] = useState('All statutory safety equipment verified and found compliant with Factories Act norms.');
  const [isFastDemoSandbox, setIsFastDemoSandbox] = useState(true);
  const [reportSubmissionSuccess, setReportSubmissionSuccess] = useState<string | null>(null);

  const refreshInspections = () => {
    setActiveInspections(WorkflowStore.getActiveInspectionsForInspector(currentUser?.email, currentUser?.id));
    setCancelledInspections(WorkflowStore.getCancelledInspections());
  };

  useEffect(() => {
    refreshInspections();
  }, [currentUser]);

  const handleChecklistChange = (id: string, status: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const handleSubmitReportForInspection = (insp: InspectionItem) => {
    const res = WorkflowStore.submitInspectionReport({
      inspectionId: insp.id,
      recommendation: selectedRecommendation,
      reportSummary: reportSummaryText,
      inspectorName: currentUser?.name || 'Rajendra Deshmukh (Inspector)',
      isFastDemoSandbox,
    });

    if (res.success) {
      setReportSubmissionSuccess(
        `Inspection report submitted successfully for ${insp.referenceNumber}! Application status updated to ${
          isFastDemoSandbox
            ? selectedRecommendation === 'RECOMMEND_APPROVAL'
              ? 'APPROVED — Demo Sandbox'
              : 'REJECTED — Demo Sandbox'
            : 'INSPECTION COMPLETED / UNDER REVIEW'
        }.`
      );
      refreshInspections();
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
    doc.text(`Inspection Unit: ${activeInspections[0]?.unitName || 'Industrial Unit'}`, 14, 35);
    doc.text(`Inspector: ${currentUser?.name || 'Rajendra Deshmukh'}`, 14, 42);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 49);

    if (gpsCoords) {
      doc.text(`GPS Tag: Lat ${gpsCoords.latitude}, Lon ${gpsCoords.longitude}`, 14, 56);
    }

    const rows = checklistItems.map((item, idx) => [
      (idx + 1).toString(),
      item.title,
      item.status,
      item.notes || 'No remarks',
    ]);

    autoTable(doc, {
      startY: 65,
      head: [['#', 'Safety Verification Item', 'Status', 'Inspector Remarks']],
      body: rows,
      headStyles: { fillColor: [18, 59, 102] },
    });

    doc.save(`UdyogSathi_Inspection_Report_${activeInspections[0]?.referenceNumber || 'Export'}.pdf`);
  };

  return (
    <RoleProtectedRoute allowedRoles={['inspector', 'INSPECTOR', 'administrator', 'ADMIN']}>
      <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans">
        <TopUtilityBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
        <OfficialHeader currentLang={currentLang} />
        <DisclaimerBanner lang={currentLang} />

        <main id="main-content" className="flex-1 py-8 px-4 max-w-4xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-govBorder flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-saffron" />
                <h1 className="text-xl font-bold text-govBlue">Field Inspector Camera & Evidence Portal</h1>
              </div>
              <p className="text-xs text-govMuted mt-1">
                Authorised DISH/MPCB Inspector Portal for capturing geotagged site photo evidence and safety checklists.
              </p>
            </div>

            <div className="bg-purple-50 text-purple-900 border border-purple-200 px-3 py-1 rounded-full text-xs font-bold">
              {currentUser?.name || 'Rajendra Deshmukh'}
            </div>
          </div>

          {/* Success Banner */}
          {reportSubmissionSuccess && (
            <div className="bg-green-50 border-2 border-green-500 text-green-950 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold shadow-sm animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <span>{reportSubmissionSuccess}</span>
              </div>
              <button
                onClick={() => setReportSubmissionSuccess(null)}
                className="text-green-800 hover:text-green-950 text-xs font-bold underline"
              >
                Dismiss
              </button>
            </div>
          )}

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
              <span>Active Scheduled Inspections ({activeInspections.length})</span>
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
              <span>Cancelled Inspection History ({cancelledInspections.length})</span>
            </button>
          </div>

          {/* Assigned Inspections List */}
          {activeTab === 'active' ? (
            <div className="space-y-4">
              {activeInspections.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-govBorder text-center space-y-2 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto" />
                  <h3 className="font-bold text-govBlue">No Active Inspections Pending</h3>
                  <p className="text-govMuted">All assigned site audits have been completed or cleared.</p>
                </div>
              ) : (
                activeInspections.map((insp) => (
                  <div key={insp.id} className="bg-white p-6 rounded-2xl border border-govBorder shadow-sm space-y-4 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="font-mono text-govBlue font-bold">{insp.id}</span>
                        <h3 className="font-extrabold text-slate-900 text-sm">{insp.title}</h3>
                        <div className="text-slate-600 font-medium">{insp.unitName}</div>
                      </div>
                      <Badge variant="amber">Scheduled for {insp.scheduledDate}</Badge>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700">
                      <MapPin className="w-4 h-4 text-saffron shrink-0" />
                      <span>{insp.venue}</span>
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
                ))
              )}

              {/* Safety Checklist Execution */}
              {activeInspections.length > 0 && (
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
                              onClick={() => handleChecklistChange(item.id, st)}
                              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                item.status === st
                                  ? st === 'PASSED'
                                    ? 'bg-green-600 text-white shadow'
                                    : st === 'FAILED'
                                    ? 'bg-red-600 text-white shadow'
                                    : 'bg-amber-500 text-white shadow'
                                  : 'bg-white text-slate-700 border border-slate-300'
                              }`}
                            >
                              {st.replace(/_/g, ' ')}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Inspector Finding & Recommendation Submission */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 mt-4">
                    <span className="font-bold text-govBlue block text-xs">Inspector Findings & Recommendation:</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'RECOMMEND_APPROVAL', label: 'Recommend Approval', bg: 'bg-green-50 border-green-300 text-green-800' },
                        { id: 'RECOMMEND_REJECTION', label: 'Recommend Rejection', bg: 'bg-red-50 border-red-300 text-red-800' },
                        { id: 'REQUIRE_CLARIFICATION', label: 'Require Clarification', bg: 'bg-amber-50 border-amber-300 text-amber-800' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelectedRecommendation(opt.id as any)}
                          className={`p-2.5 rounded-xl border font-bold text-xs text-center transition-all ${
                            selectedRecommendation === opt.id
                              ? `${opt.bg} ring-2 ring-govBlue shadow-sm`
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Report Summary Remarks:</label>
                      <textarea
                        value={reportSummaryText}
                        onChange={(e) => setReportSummaryText(e.target.value)}
                        rows={2}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-sans text-slate-900"
                        placeholder="Enter inspector findings and remarks..."
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="fastSandboxToggle"
                        checked={isFastDemoSandbox}
                        onChange={(e) => setIsFastDemoSandbox(e.target.checked)}
                        className="rounded border-slate-300 text-govBlue focus:ring-govBlue"
                      />
                      <label htmlFor="fastSandboxToggle" className="text-[11px] font-bold text-purple-900 cursor-pointer">
                        Fast Demo Sandbox Mode (Simulate immediate decision: Approved — Demo Sandbox)
                      </label>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSubmitReportForInspection(activeInspections[0])}
                        leftIcon={<CheckCircle2 className="w-4 h-4 text-saffron" />}
                      >
                        Submit Inspection Report & Recommendation
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleDownloadReportPDF}
                        leftIcon={<Download className="w-4 h-4" />}
                      >
                        Export PDF Report
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Cancelled Inspections History Tab */
            <div className="space-y-4 text-xs">
              {cancelledInspections.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-govBorder text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
                  <h3 className="font-bold text-govBlue">No Cancelled Inspections</h3>
                  <p className="text-govMuted">There are no cancelled inspections in the audit history.</p>
                </div>
              ) : (
                cancelledInspections.map((insp) => (
                  <div key={insp.id} className="bg-red-50/50 p-6 rounded-2xl border border-red-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-red-100 pb-2">
                      <div className="space-y-0.5">
                        <span className="font-mono text-govBlue font-bold">{insp.id}</span>
                        <h3 className="font-bold text-slate-900 text-sm">{insp.title}</h3>
                        <div className="text-slate-600">{insp.unitName}</div>
                      </div>
                      <Badge variant="red">Cancelled (App Rejected)</Badge>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-red-200 text-red-950 font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>
                        Cancellation Reason: {insp.cancellationReason || 'Application rejected by department.'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 font-mono">
                      Venue: {insp.venue} | Inspector: {insp.inspectorName}
                    </div>
                  </div>
                ))
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
        </main>

        <Footer />
      </div>
    </RoleProtectedRoute>
  );
}
