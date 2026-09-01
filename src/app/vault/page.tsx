'use client';

import React, { useState, useEffect } from 'react';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { OfficialHeader } from '@/components/layout/OfficialHeader';
import { Footer } from '@/components/layout/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  VaultDocument,
  DocumentLifecycleStatus,
} from '@/lib/document-reuse';
import { WorkflowStore } from '@/lib/workflow-store';
import { useAuth } from '@/context/AuthContext';
import {
  FileCheck,
  Upload,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Trash2,
  Eye,
  Download,
  Info,
  ShieldCheck,
  Clock,
  RefreshCw,
  ExternalLink,
  Layers,
  History,
  X,
  Edit3,
  RotateCcw,
} from 'lucide-react';
import { getTranslation } from '@/lib/i18n';

export default function DocumentVaultPage() {
  const [currentLang, setCurrentLang] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [selectedDocUsage, setSelectedDocUsage] = useState<VaultDocument | null>(null);
  const [previewDoc, setPreviewDoc] = useState<VaultDocument | null>(null);

  // Edit / Replace Modal States
  const [editDoc, setEditDoc] = useState<VaultDocument | null>(null);
  const [editDocName, setEditDocName] = useState('');
  const [editDocRef, setEditDocRef] = useState('');
  const [editDocExpiry, setEditDocExpiry] = useState('');

  const [replaceDoc, setReplaceDoc] = useState<VaultDocument | null>(null);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const { currentUser } = useAuth();
  const userEmail = currentUser?.email || 'applicant@udyogsathi.gov.in';

  // Load from WorkflowStore
  useEffect(() => {
    setDocuments(WorkflowStore.getVaultDocuments(userEmail));
  }, [userEmail]);

  const refreshDocs = () => {
    setDocuments(WorkflowStore.getVaultDocuments(userEmail));
  };

  const verifiedCount = documents.filter((d) => d.verificationStatus === 'verified' && d.isLatestVersion).length;
  const totalUsages = documents.reduce((acc, d) => acc + (d.usageCount || 0), 0);
  const expiredCount = documents.filter((d) => d.status === 'expired').length;
  const pendingCount = documents.filter((d) => d.status === 'verification_pending').length;

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.documentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'VERIFIED') return matchesSearch && doc.verificationStatus === 'verified' && doc.isLatestVersion;
    if (statusFilter === 'REUSABLE') return matchesSearch && doc.isReusable && doc.isLatestVersion;
    if (statusFilter === 'PENDING') return matchesSearch && doc.status === 'verification_pending';
    if (statusFilter === 'EXPIRED') return matchesSearch && doc.status === 'expired';
    if (statusFilter === 'SUPERSEDED') return matchesSearch && doc.status === 'superseded';
    return matchesSearch;
  });

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newDoc: VaultDocument = {
        id: `doc-${Date.now()}`,
        ownerUserId: 'usr-applicant-1',
        organisationId: 'org-1',
        documentType: 'OTHER',
        documentName: file.name.replace(/\.[^/.]+$/, ''),
        fileName: file.name,
        fileUrl: '#',
        mimeType: file.type || 'application/pdf',
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        uploadedByUserId: 'usr-applicant-1',
        uploadedByRole: 'APPLICANT',
        preValidationStatus: 'pre_validation_passed',
        preValidationResult: {
          readinessScore: 90,
          summary: 'AI pre-validation passed: Document format and size accepted.',
        },
        verificationStatus: 'verification_pending',
        documentVersion: 1,
        isLatestVersion: true,
        isReusable: false,
        status: 'verification_pending',
        usageCount: 0,
        activeUsages: [],
      };
      WorkflowStore.saveVaultDocument(newDoc);
      refreshDocs();
      setToastMsg('Document uploaded successfully to your secure vault.');
      setTimeout(() => setToastMsg(null), 4000);
    }
  };

  const handleSaveEditDetails = () => {
    if (!editDoc) return;
    const updated: VaultDocument = {
      ...editDoc,
      documentName: editDocName || editDoc.documentName,
      documentReferenceNumber: editDocRef || editDoc.documentReferenceNumber,
      expiryDate: editDocExpiry || editDoc.expiryDate,
    };
    WorkflowStore.saveVaultDocument(updated);
    refreshDocs();
    setEditDoc(null);
    setToastMsg('Document metadata details updated successfully.');
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleExecuteReplace = () => {
    if (!replaceDoc || !replaceFile) return;
    setIsReplacing(true);
    setTimeout(() => {
      WorkflowStore.replaceVaultDocument(
        replaceDoc.id,
        replaceFile.name,
        '#',
        replaceFile.size
      );
      refreshDocs();
      setIsReplacing(false);
      setReplaceDoc(null);
      setReplaceFile(null);
      setToastMsg(`Document replaced successfully with new Version ${replaceDoc.documentVersion + 1}.`);
      setTimeout(() => setToastMsg(null), 4000);
    }, 700);
  };

  const getStatusBadge = (doc: VaultDocument) => {
    if (doc.status === 'expired') {
      return <Badge variant="red">Expired ({doc.expiryDate})</Badge>;
    }
    if (doc.status === 'superseded') {
      return <Badge variant="gray">Superseded (v{doc.documentVersion})</Badge>;
    }
    if (doc.verificationStatus === 'verified') {
      return <Badge variant="green">Verified</Badge>;
    }
    if (doc.verificationStatus === 'rejected') {
      return <Badge variant="red">Rejected by Officer</Badge>;
    }
    return <Badge variant="amber">Verification Pending</Badge>;
  };

  return (
    <ProtectedRoute>
      <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans">
        <TopUtilityBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
        <OfficialHeader currentLang={currentLang} />
        <DisclaimerBanner lang={currentLang} />

        <main id="main-content" className="flex-1 py-8 px-4 max-w-7xl mx-auto w-full space-y-6">
          {/* Toast Notification */}
          {toastMsg && (
            <div className="bg-green-50 text-green-900 border border-green-300 p-4 rounded-xl shadow-md text-xs font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>{toastMsg}</span>
              </div>
            </div>
          )}

          {/* Header Banner */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-govBorder flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-6 h-6 text-saffron" />
                <h1 className="text-xl font-bold text-govBlue">{getTranslation(currentLang, 'nav_vault')}</h1>
              </div>
              <p className="text-xs text-govMuted mt-1">
                Upload business documents once, pre-validate readiness score, and reuse across multiple statutory applications.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="bg-saffron hover:bg-saffron-dark text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow cursor-pointer transition-all flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>Upload New Document</span>
                <input type="file" onChange={handleSimulatedUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Key Statistics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-white p-4 rounded-2xl border border-govBorder shadow-sm space-y-1">
              <span className="text-slate-500 font-medium block">Total Vault Documents</span>
              <div className="text-2xl font-extrabold text-govBlue">{documents.length}</div>
              <span className="text-[10px] text-govSuccess font-bold">Encrypted Storage</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-govBorder shadow-sm space-y-1">
              <span className="text-slate-500 font-medium block">Officer Verified</span>
              <div className="text-2xl font-extrabold text-green-600">{verifiedCount}</div>
              <span className="text-[10px] text-green-700 font-bold">1-Click Reusable</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-govBorder shadow-sm space-y-1">
              <span className="text-slate-500 font-medium block">Active Application Usages</span>
              <div className="text-2xl font-extrabold text-saffron">{totalUsages}</div>
              <span className="text-[10px] text-saffron font-bold">Zero Duplicate Uploads</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-govBorder shadow-sm space-y-1">
              <span className="text-slate-500 font-medium block">Pending / Expiry Alerts</span>
              <div className="text-2xl font-extrabold text-amber-600">{pendingCount + expiredCount}</div>
              <span className="text-[10px] text-amber-700 font-bold">Renewal Reminders On</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-govBorder shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search document name, type, or file name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent w-full text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {['ALL', 'VERIFIED', 'REUSABLE', 'PENDING', 'EXPIRED', 'SUPERSEDED'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
                    statusFilter === filter
                      ? 'bg-govBlue text-white shadow'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Document Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className={`bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all ${
                  doc.status === 'superseded' ? 'opacity-70 border-slate-200 bg-slate-50/50' : 'border-govBorder'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-govBlue">v{doc.documentVersion}</span>
                        {getStatusBadge(doc)}
                      </div>
                      <h3 className="font-extrabold text-govBlue text-sm">{doc.documentName}</h3>
                      <div className="text-slate-500 font-mono text-[11px]">{doc.fileName}</div>
                    </div>
                    <FileText className="w-6 h-6 text-saffron shrink-0" />
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-slate-600">
                      <span>AI Pre-Validation Score:</span>
                      <strong className="text-green-700 font-bold">
                        {doc.preValidationResult?.readinessScore || 90}% Passed
                      </strong>
                    </div>

                    {doc.verifiedAt && (
                      <div className="flex justify-between text-slate-600">
                        <span>Officer Verification:</span>
                        <span className="font-bold text-govBlue">Verified ({doc.verifiedAt.split('T')[0]})</span>
                      </div>
                    )}

                    {doc.expiryDate && (
                      <div className="flex justify-between text-slate-600">
                        <span>Validity Expiry:</span>
                        <span className={`font-bold ${doc.status === 'expired' ? 'text-red-600' : 'text-slate-800'}`}>
                          {doc.expiryDate}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Active Reuse Indicator */}
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-500">Active Reuse Count:</span>
                    <button
                      onClick={() => setSelectedDocUsage(doc)}
                      className="font-bold text-govBlue hover:text-saffron underline flex items-center gap-1"
                    >
                      <Layers className="w-3.5 h-3.5 text-saffron" />
                      <span>Used in {doc.usageCount || 0} Applications</span>
                    </button>
                  </div>
                </div>

                {/* Document Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="font-bold text-govBlue hover:bg-govBlue-50 px-2.5 py-1.5 rounded-lg border border-govBlue/20 flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditDoc(doc);
                      setEditDocName(doc.documentName);
                      setEditDocRef(doc.documentReferenceNumber || '');
                      setEditDocExpiry(doc.expiryDate || '');
                    }}
                    className="font-bold text-slate-700 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-300 flex items-center gap-1 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setReplaceDoc(doc)}
                    className="font-bold text-saffron hover:bg-saffron/10 px-2.5 py-1.5 rounded-lg border border-saffron/30 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Replace</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Details Modal */}
          {editDoc && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-govBlue text-sm flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-saffron" /> Edit Document Metadata
                  </h3>
                  <button onClick={() => setEditDoc(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Document Display Title *</label>
                    <input
                      type="text"
                      value={editDocName}
                      onChange={(e) => setEditDocName(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Document Reference Number</label>
                    <input
                      type="text"
                      value={editDocRef}
                      onChange={(e) => setEditDocRef(e.target.value)}
                      placeholder="e.g. 27AAAAA0000A1Z5"
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Validity Expiry Date</label>
                    <input
                      type="date"
                      value={editDocExpiry}
                      onChange={(e) => setEditDocExpiry(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditDoc(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEditDetails}
                    className="px-5 py-2 bg-saffron hover:bg-saffron-dark text-white font-bold rounded-lg shadow"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Replace Document Modal */}
          {replaceDoc && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-govBlue text-sm flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-saffron" /> Replace Document with New Version
                  </h3>
                  <button onClick={() => setReplaceDoc(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl text-amber-950 space-y-1">
                  <span className="font-bold">Replacing: {replaceDoc.documentName}</span>
                  <p className="text-[11px]">
                    Current Version: <strong className="font-mono">v{replaceDoc.documentVersion}</strong>. The old version will be marked as <strong className="font-semibold">Superseded</strong> and archived in audit history.
                  </p>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Select New File Version *</label>
                  <input
                    type="file"
                    onChange={(e) => setReplaceFile(e.target.files?.[0] || null)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setReplaceDoc(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExecuteReplace}
                    disabled={!replaceFile || isReplacing}
                    className="px-5 py-2 bg-saffron hover:bg-saffron-dark text-white font-bold rounded-lg shadow disabled:opacity-50"
                  >
                    {isReplacing ? 'Uploading Version...' : 'Confirm Replace & Upload'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* View Usage Modal */}
          {selectedDocUsage && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-saffron" />
                    <h3 className="font-bold text-govBlue text-sm">Document Reuse History</h3>
                  </div>
                  <button onClick={() => setSelectedDocUsage(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <div className="font-bold text-govBlue text-xs">{selectedDocUsage.documentName}</div>
                  <div className="text-[11px] text-govMuted font-mono">Vault ID: {selectedDocUsage.id}</div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <span className="text-[11px] font-bold text-govMuted uppercase tracking-wider block">
                    Linked Statutory Applications ({selectedDocUsage.activeUsages.length})
                  </span>

                  {selectedDocUsage.activeUsages.length === 0 ? (
                    <div className="bg-slate-50 p-4 rounded-xl text-center text-xs text-slate-500">
                      Not yet linked to any submitted application. Ready for instant 1-click reuse.
                    </div>
                  ) : (
                    selectedDocUsage.activeUsages.map((usage, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="font-bold text-govBlue">{usage.applicationName}</div>
                        <div className="flex items-center justify-between text-[11px] text-slate-600">
                          <span>Dept: {usage.department}</span>
                          <span className="bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            {usage.linkType.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={() => setSelectedDocUsage(null)}
                  className="w-full bg-govBlue text-white font-bold py-2.5 rounded-lg text-xs hover:bg-govBlue-dark"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* View Metadata Preview Modal */}
          {previewDoc && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-govBlue text-sm">Document Metadata Details</h3>
                  <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Document Title:</span>
                    <strong className="text-govBlue">{previewDoc.documentName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">File Name:</span>
                    <span className="font-mono">{previewDoc.fileName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Document Version:</span>
                    <strong className="font-mono text-saffron">Version {previewDoc.documentVersion}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pre-Validation Result:</span>
                    <span className="text-green-700 font-bold">
                      {previewDoc.preValidationResult?.summary || 'Pre-validated 90% passed'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setPreviewDoc(null)}
                  className="w-full bg-govBlue text-white font-bold py-2.5 rounded-lg text-xs hover:bg-govBlue-dark"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
