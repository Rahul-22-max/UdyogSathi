import { UserSession } from '@/types';

export type DocumentLifecycleStatus =
  | 'uploaded'
  | 'pre_validation_pending'
  | 'pre_validation_passed'
  | 'pre_validation_failed'
  | 'verification_pending'
  | 'verified'
  | 'rejected'
  | 'expired'
  | 'superseded'
  | 'archived';

export type DocumentLinkType = 'uploaded_for_application' | 'reused_from_vault' | 'generated_for_application';

export type ReuseEligibilityStatus =
  | 'eligible'
  | 'eligible_with_warning'
  | 'pending_verification'
  | 'missing'
  | 'expired'
  | 'rejected'
  | 'superseded'
  | 'approval_specific_new_document_required'
  | 'organisation_mismatch'
  | 'project_mismatch'
  | 'document_type_mismatch'
  | 'version_not_accepted'
  | 'not_applicable';

export interface DocumentUsageLink {
  applicationId: string;
  applicationName: string;
  department: string;
  linkedAt: string;
  linkType: DocumentLinkType;
}

export interface VaultDocument {
  id: string;
  ownerUserId: string;
  organisationId: string;
  projectId?: string; // If project-specific (e.g. land deed for Plot C-14)
  documentType: string;
  documentName: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedByUserId: string;
  uploadedByRole: string;
  preValidationStatus: 'pre_validation_pending' | 'pre_validation_passed' | 'pre_validation_failed';
  preValidationResult?: {
    readinessScore: number;
    issues?: string[];
    summary?: string;
  };
  verificationStatus: 'verified' | 'verification_pending' | 'rejected' | 'expired' | 'superseded' | 'archived';
  verifiedAt?: string;
  verifiedByUserId?: string;
  verifiedByRole?: string;
  verificationNotes?: string;
  rejectionReason?: string;
  expiryDate?: string; // YYYY-MM-DD
  issuedDate?: string;
  documentVersion: number;
  parentDocumentId?: string;
  supersededByDocumentId?: string;
  isLatestVersion: boolean;
  isReusable: boolean;
  applicableDepartments?: string[];
  applicableOrganisationId?: string;
  issuerAuthority?: string;
  documentReferenceNumber?: string;
  status: DocumentLifecycleStatus;
  usageCount: number;
  activeUsages: DocumentUsageLink[];
}

export interface ApplicationRequiredDocument {
  id: string;
  applicationId?: string;
  approvalType: string;
  requiredDocumentType: string;
  requiredDocumentLabel: string;
  documentId?: string; // References VaultDocument.id if linked/reused
  linkedDocument?: VaultDocument;
  linkType?: DocumentLinkType;
  requirementStatus: 'missing' | 'available_for_reuse' | 'selected_for_reuse' | 'reused_from_vault' | 'uploaded' | 'verified' | 'expired' | 'rejected';
  reuseEligibility: ReuseEligibilityStatus;
  reuseReason: string;
  blockReason?: string;
  selectedAt?: string;
}

/**
 * Known document type alias mappings
 */
const DOCUMENT_TYPE_ALIASES: Record<string, string[]> = {
  PAN_CARD: ['PAN', 'Permanent Account Number', 'PAN Card', 'Promoter PAN'],
  GST_CERTIFICATE: ['GST', 'GSTIN', 'GST Registration Certificate', 'GST Certificate'],
  COMPANY_REGISTRATION: ['COI', 'Certificate of Incorporation', 'Company Registration Certificate', 'MOA/AOA', 'Partnership Deed'],
  ADDRESS_PROOF: ['Address Proof', 'Electricity Bill', 'MIDC Water Bill', 'Utility Bill'],
  LAND_DEED: ['Land Deed', 'Lease Agreement', 'MIDC Allotment Letter', '7/12 Extract', 'Property Tax Receipt'],
  FIRE_NOC: ['Provisional Fire NOC', 'Fire Safety Certificate', 'Fire Building Plan NOC'],
  MPCB_CTE: ['Consent to Establish', 'MPCB CTE Certificate', 'Pollution NOC'],
  DISH_LAYOUT: ['Factory Building Plan', 'DISH Plan Approval', 'Architectural Layout'],
};

/**
 * Normalizes document type strings for comparison
 */
export function normalizeDocumentType(typeStr: string): string {
  const clean = String(typeStr || '').trim().toUpperCase().replace(/[\s\-_]+/g, '_');
  for (const [canonical, aliases] of Object.entries(DOCUMENT_TYPE_ALIASES)) {
    if (canonical === clean) return canonical;
    if (aliases.some(a => a.toUpperCase().replace(/[\s\-_]+/g, '_') === clean)) {
      return canonical;
    }
  }
  return clean;
}

/**
 * Checks if a required document type matches a vault document type
 */
export function isDocumentTypeMatch(vaultDocType: string, requiredDocType: string): boolean {
  const normVault = normalizeDocumentType(vaultDocType);
  const normReq = normalizeDocumentType(requiredDocType);
  return normVault === normReq || normVault.includes(normReq) || normReq.includes(normVault);
}

/**
 * Core Verified Document Reuse Eligibility Engine
 */
export function evaluateDocumentReuseEligibility(
  vaultDoc: VaultDocument,
  requiredDocType: string,
  currentUserId: string,
  currentOrganisationId: string,
  currentProjectId?: string,
  approvalType?: string
): { status: ReuseEligibilityStatus; isEligible: boolean; reason: string; warning?: string } {
  // 1. User & Organisation Ownership Check
  if (vaultDoc.ownerUserId !== currentUserId && vaultDoc.organisationId !== currentOrganisationId) {
    return {
      status: 'organisation_mismatch',
      isEligible: false,
      reason: 'This document belongs to another entrepreneur or organization account.',
    };
  }

  // 2. Document Type Match Check
  if (!isDocumentTypeMatch(vaultDoc.documentType, requiredDocType)) {
    return {
      status: 'document_type_mismatch',
      isEligible: false,
      reason: `Document type (${vaultDoc.documentName}) does not match required document (${requiredDocType}).`,
    };
  }

  // 3. Status & Expiry Check
  if (vaultDoc.status === 'archived' || vaultDoc.status === 'rejected') {
    return {
      status: 'rejected',
      isEligible: false,
      reason: vaultDoc.rejectionReason || 'This document has been rejected during officer scrutiny and cannot be reused.',
    };
  }

  if (vaultDoc.status === 'expired' || (vaultDoc.expiryDate && new Date(vaultDoc.expiryDate).getTime() < Date.now())) {
    return {
      status: 'expired',
      isEligible: false,
      reason: `This document expired on ${vaultDoc.expiryDate || 'past date'}. Please upload a current renewed version.`,
    };
  }

  // 4. Version Check
  if (!vaultDoc.isLatestVersion || vaultDoc.supersededByDocumentId) {
    return {
      status: 'superseded',
      isEligible: false,
      reason: 'A newer verified version of this document is available in your Document Vault.',
    };
  }

  // 5. Official Verification Check
  // Rule: Only officially verified documents can be reused as verified. Pre-validated only documents are pending verification.
  if (vaultDoc.verificationStatus !== 'verified') {
    return {
      status: 'pending_verification',
      isEligible: false,
      reason: 'This document has passed AI pre-validation but is awaiting official officer verification. It will become reusable once verified.',
    };
  }

  // 6. Project-Specific Location Check
  if (vaultDoc.projectId && currentProjectId && vaultDoc.projectId !== currentProjectId) {
    return {
      status: 'project_mismatch',
      isEligible: false,
      reason: 'This location document (Land Lease / Site Plan) is specific to another project plot.',
    };
  }

  // 7. Approval-Specific Requirement Check
  if (approvalType && approvalType.includes('EXPANSION_SPECIAL') && vaultDoc.documentType === 'FIRE_NOC') {
    return {
      status: 'approval_specific_new_document_required',
      isEligible: false,
      reason: 'This statutory approval requires an approval-specific new Fire NOC.',
    };
  }

  // 8. Near Expiry Warning Check (e.g. within 30 days)
  let warningMsg: string | undefined;
  if (vaultDoc.expiryDate) {
    const daysUntilExpiry = Math.ceil((new Date(vaultDoc.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
      warningMsg = `Valid but nearing expiry in ${daysUntilExpiry} days (${vaultDoc.expiryDate}).`;
      return {
        status: 'eligible_with_warning',
        isEligible: true,
        reason: 'Verified and valid for reuse.',
        warning: warningMsg,
      };
    }
  }

  return {
    status: 'eligible',
    isEligible: true,
    reason: 'Verified and valid in your Document Vault — ready for instant 1-click reuse.',
  };
}

/**
 * Calculates Application Document Readiness Score & Summary
 */
export function calculateDocumentReuseSummary(
  requiredDocs: Array<{ type: string; label: string }>,
  userVaultDocs: VaultDocument[],
  currentUserId: string,
  currentOrganisationId: string,
  currentProjectId?: string
) {
  let eligibleCount = 0;
  let missingCount = 0;
  let pendingCount = 0;
  let expiredCount = 0;

  const matches = requiredDocs.map(req => {
    // Find matching document in vault
    const candidates = userVaultDocs.filter(d => isDocumentTypeMatch(d.documentType, req.type));
    
    // Sort candidates: prefer latest verified
    candidates.sort((a, b) => {
      if (a.verificationStatus === 'verified' && b.verificationStatus !== 'verified') return -1;
      if (a.verificationStatus !== 'verified' && b.verificationStatus === 'verified') return 1;
      return b.documentVersion - a.documentVersion;
    });

    const bestCandidate = candidates[0];

    if (!bestCandidate) {
      missingCount++;
      return {
        requiredDoc: req,
        matchedVaultDoc: null,
        eligibility: {
          status: 'missing' as ReuseEligibilityStatus,
          isEligible: false,
          reason: 'No matching document found in your Document Vault. Upload required.',
        },
      };
    }

    const evalResult = evaluateDocumentReuseEligibility(
      bestCandidate,
      req.type,
      currentUserId,
      currentOrganisationId,
      currentProjectId
    );

    if (evalResult.isEligible) {
      eligibleCount++;
    } else if (evalResult.status === 'pending_verification') {
      pendingCount++;
    } else if (evalResult.status === 'expired') {
      expiredCount++;
    } else {
      missingCount++;
    }

    return {
      requiredDoc: req,
      matchedVaultDoc: bestCandidate,
      eligibility: evalResult,
    };
  });

  const totalRequired = requiredDocs.length;
  const readinessScore = totalRequired > 0 ? Math.round((eligibleCount / totalRequired) * 100) : 100;
  const effortReductionPercent = totalRequired > 0 ? Math.round((eligibleCount / totalRequired) * 100) : 0;

  return {
    totalRequired,
    eligibleCount,
    missingCount,
    pendingCount,
    expiredCount,
    readinessScore,
    effortReductionPercent,
    matches,
  };
}

/**
 * Seeded Demo Vault Documents for Vijay (Applicant)
 * Demonstrates 4 verified reusable documents, 1 project-specific deed, 1 expired fire cert,
 * 1 pending MPCB report, and 1 superseded older GST version.
 */
export const DEMO_VIJAY_VAULT_DOCUMENTS: VaultDocument[] = [
  {
    id: 'doc-pan-1',
    ownerUserId: 'user-vijay',
    organisationId: 'org-1',
    documentType: 'PAN_CARD',
    documentName: 'PAN Card - Sahyadri Auto Components Pvt Ltd',
    fileName: 'PAN_AAACS1234F_Sahyadri.pdf',
    fileUrl: '/docs/demo_pan.pdf',
    mimeType: 'application/pdf',
    fileSize: 450000,
    uploadedAt: '2026-01-10T10:00:00Z',
    uploadedByUserId: 'user-vijay',
    uploadedByRole: 'APPLICANT',
    preValidationStatus: 'pre_validation_passed',
    preValidationResult: {
      readinessScore: 100,
      summary: 'AI pre-validation passed: Name, PAN Number (AAACS1234F), and Entity Type match tax database.',
    },
    verificationStatus: 'verified',
    verifiedAt: '2026-01-12T14:30:00Z',
    verifiedByUserId: 'officer-1',
    verifiedByRole: 'OFFICER',
    verificationNotes: 'Verified against Income Tax Portal API integration.',
    documentVersion: 1,
    isLatestVersion: true,
    isReusable: true,
    status: 'verified',
    usageCount: 4,
    activeUsages: [
      {
        applicationId: 'app-1',
        applicationName: 'Consent to Establish (CTE) - MPCB',
        department: 'MPCB',
        linkedAt: '2026-08-25',
        linkType: 'reused_from_vault',
      },
      {
        applicationId: 'app-2',
        applicationName: 'Factory Building Plan Approval',
        department: 'DISH',
        linkedAt: '2026-08-22',
        linkType: 'reused_from_vault',
      },
      {
        applicationId: 'app-3',
        applicationName: 'Provisional Fire NOC',
        department: 'Fire Services',
        linkedAt: '2026-08-20',
        linkType: 'reused_from_vault',
      },
      {
        applicationId: 'app-4',
        applicationName: 'MIDC Water Connection',
        department: 'MIDC',
        linkedAt: '2026-08-15',
        linkType: 'reused_from_vault',
      },
    ],
  },
  {
    id: 'doc-gst-v2',
    ownerUserId: 'user-vijay',
    organisationId: 'org-1',
    documentType: 'GST_CERTIFICATE',
    documentName: 'GST Registration Certificate (REG-06)',
    fileName: 'GST_27AAACS1234F1Z5_2026.pdf',
    fileUrl: '/docs/demo_gst.pdf',
    mimeType: 'application/pdf',
    fileSize: 620000,
    uploadedAt: '2026-03-01T11:15:00Z',
    uploadedByUserId: 'user-vijay',
    uploadedByRole: 'APPLICANT',
    preValidationStatus: 'pre_validation_passed',
    preValidationResult: {
      readinessScore: 98,
      summary: 'AI pre-validation passed: GSTIN 27AAACS1234F1Z5 is active and verified.',
    },
    verificationStatus: 'verified',
    verifiedAt: '2026-03-02T16:00:00Z',
    verifiedByUserId: 'officer-1',
    verifiedByRole: 'OFFICER',
    expiryDate: '2027-03-15',
    documentVersion: 2,
    parentDocumentId: 'doc-gst-v1',
    isLatestVersion: true,
    isReusable: true,
    status: 'verified',
    usageCount: 3,
    activeUsages: [
      {
        applicationId: 'app-1',
        applicationName: 'Consent to Establish (CTE) - MPCB',
        department: 'MPCB',
        linkedAt: '2026-08-25',
        linkType: 'reused_from_vault',
      },
      {
        applicationId: 'app-2',
        applicationName: 'Factory Building Plan Approval',
        department: 'DISH',
        linkedAt: '2026-08-22',
        linkType: 'reused_from_vault',
      },
      {
        applicationId: 'app-4',
        applicationName: 'MIDC Water Connection',
        department: 'MIDC',
        linkedAt: '2026-08-15',
        linkType: 'reused_from_vault',
      },
    ],
  },
  {
    id: 'doc-coi-1',
    ownerUserId: 'user-vijay',
    organisationId: 'org-1',
    documentType: 'COMPANY_REGISTRATION',
    documentName: 'Certificate of Incorporation (ROC Mumbai)',
    fileName: 'Certificate_of_Incorporation_Sahyadri.pdf',
    fileUrl: '/docs/demo_coi.pdf',
    mimeType: 'application/pdf',
    fileSize: 890000,
    uploadedAt: '2026-01-10T10:30:00Z',
    uploadedByUserId: 'user-vijay',
    uploadedByRole: 'APPLICANT',
    preValidationStatus: 'pre_validation_passed',
    preValidationResult: {
      readinessScore: 100,
      summary: 'AI pre-validation passed: ROC CIN U34100MH2025PTC123456 verified.',
    },
    verificationStatus: 'verified',
    verifiedAt: '2026-01-12T15:00:00Z',
    verifiedByUserId: 'officer-1',
    verifiedByRole: 'OFFICER',
    documentVersion: 1,
    isLatestVersion: true,
    isReusable: true,
    status: 'verified',
    usageCount: 4,
    activeUsages: [
      {
        applicationId: 'app-1',
        applicationName: 'Consent to Establish (CTE) - MPCB',
        department: 'MPCB',
        linkedAt: '2026-08-25',
        linkType: 'reused_from_vault',
      },
      {
        applicationId: 'app-2',
        applicationName: 'Factory Building Plan Approval',
        department: 'DISH',
        linkedAt: '2026-08-22',
        linkType: 'reused_from_vault',
      },
      {
        applicationId: 'app-3',
        applicationName: 'Provisional Fire NOC',
        department: 'Fire Services',
        linkedAt: '2026-08-20',
        linkType: 'reused_from_vault',
      },
      {
        applicationId: 'app-4',
        applicationName: 'MIDC Water Connection',
        department: 'MIDC',
        linkedAt: '2026-08-15',
        linkType: 'reused_from_vault',
      },
    ],
  },
  {
    id: 'doc-addr-1',
    ownerUserId: 'user-vijay',
    organisationId: 'org-1',
    documentType: 'ADDRESS_PROOF',
    documentName: 'Registered Office Address Proof & Electricity Bill',
    fileName: 'MSEDCL_Address_Bill_Chakan.pdf',
    fileUrl: '/docs/demo_address.pdf',
    mimeType: 'application/pdf',
    fileSize: 380000,
    uploadedAt: '2026-02-15T09:00:00Z',
    uploadedByUserId: 'user-vijay',
    uploadedByRole: 'APPLICANT',
    preValidationStatus: 'pre_validation_passed',
    preValidationResult: {
      readinessScore: 95,
      summary: 'AI pre-validation passed: Address matches Chakan Phase II allotment.',
    },
    verificationStatus: 'verified',
    verifiedAt: '2026-02-16T12:00:00Z',
    verifiedByUserId: 'officer-1',
    verifiedByRole: 'OFFICER',
    expiryDate: '2027-06-10',
    documentVersion: 1,
    isLatestVersion: true,
    isReusable: true,
    status: 'verified',
    usageCount: 3,
    activeUsages: [
      {
        applicationId: 'app-1',
        applicationName: 'Consent to Establish (CTE) - MPCB',
        department: 'MPCB',
        linkedAt: '2026-08-25',
        linkType: 'reused_from_vault',
      },
      {
        applicationId: 'app-2',
        applicationName: 'Factory Building Plan Approval',
        department: 'DISH',
        linkedAt: '2026-08-22',
        linkType: 'reused_from_vault',
      },
      {
        applicationId: 'app-4',
        applicationName: 'MIDC Water Connection',
        department: 'MIDC',
        linkedAt: '2026-08-15',
        linkType: 'reused_from_vault',
      },
    ],
  },
  {
    id: 'doc-land-1',
    ownerUserId: 'user-vijay',
    organisationId: 'org-1',
    projectId: 'proj-1', // Specific to Chakan Project
    documentType: 'LAND_DEED',
    documentName: 'MIDC Land Lease Allotment Deed (Plot C-14 Chakan Phase II)',
    fileName: 'MIDC_Lease_Deed_Plot_C14.pdf',
    fileUrl: '/docs/demo_land.pdf',
    mimeType: 'application/pdf',
    fileSize: 1450000,
    uploadedAt: '2026-01-20T14:00:00Z',
    uploadedByUserId: 'user-vijay',
    uploadedByRole: 'APPLICANT',
    preValidationStatus: 'pre_validation_passed',
    preValidationResult: {
      readinessScore: 96,
      summary: 'AI pre-validation passed: Lease plot size 15,000 sq.m verified.',
    },
    verificationStatus: 'verified',
    verifiedAt: '2026-01-22T11:00:00Z',
    verifiedByUserId: 'officer-2',
    verifiedByRole: 'OFFICER',
    documentVersion: 1,
    isLatestVersion: true,
    isReusable: true,
    status: 'verified',
    usageCount: 2,
    activeUsages: [
      {
        applicationId: 'app-1',
        applicationName: 'Consent to Establish (CTE) - MPCB',
        department: 'MPCB',
        linkedAt: '2026-08-25',
        linkType: 'reused_from_vault',
      },
      {
        applicationId: 'app-4',
        applicationName: 'MIDC Water Connection',
        department: 'MIDC',
        linkedAt: '2026-08-15',
        linkType: 'reused_from_vault',
      },
    ],
  },
  {
    id: 'doc-fire-exp',
    ownerUserId: 'user-vijay',
    organisationId: 'org-1',
    documentType: 'FIRE_NOC',
    documentName: 'Provisional Fire Safety Clearance (Expired 2025)',
    fileName: 'Fire_NOC_Expired_2025.pdf',
    fileUrl: '/docs/demo_fire_exp.pdf',
    mimeType: 'application/pdf',
    fileSize: 510000,
    uploadedAt: '2025-01-10T10:00:00Z',
    uploadedByUserId: 'user-vijay',
    uploadedByRole: 'APPLICANT',
    preValidationStatus: 'pre_validation_passed',
    verificationStatus: 'expired',
    expiryDate: '2026-01-10', // Expired
    documentVersion: 1,
    isLatestVersion: true,
    isReusable: false,
    status: 'expired',
    usageCount: 0,
    activeUsages: [],
  },
  {
    id: 'doc-mpcb-pend',
    ownerUserId: 'user-vijay',
    organisationId: 'org-1',
    documentType: 'MPCB_CTE',
    documentName: 'Detailed Water & Effluent Balance Engineering Report',
    fileName: 'ETP_Water_Balance_Report_2026.pdf',
    fileUrl: '/docs/demo_etp.pdf',
    mimeType: 'application/pdf',
    fileSize: 1120000,
    uploadedAt: '2026-08-28T16:00:00Z',
    uploadedByUserId: 'user-vijay',
    uploadedByRole: 'APPLICANT',
    preValidationStatus: 'pre_validation_passed',
    preValidationResult: {
      readinessScore: 92,
      summary: 'AI pre-validation passed: ETP capacity 120 KLD matches manufacturing load.',
    },
    verificationStatus: 'verification_pending', // Awaiting officer check
    documentVersion: 1,
    isLatestVersion: true,
    isReusable: false,
    status: 'verification_pending',
    usageCount: 1,
    activeUsages: [
      {
        applicationId: 'app-1',
        applicationName: 'Consent to Establish (CTE) - MPCB',
        department: 'MPCB',
        linkedAt: '2026-08-28',
        linkType: 'uploaded_for_application',
      },
    ],
  },
  {
    id: 'doc-gst-v1',
    ownerUserId: 'user-vijay',
    organisationId: 'org-1',
    documentType: 'GST_CERTIFICATE',
    documentName: 'GST Registration Certificate (Older Version 2024)',
    fileName: 'GST_Old_2024.pdf',
    fileUrl: '/docs/demo_gst_old.pdf',
    mimeType: 'application/pdf',
    fileSize: 580000,
    uploadedAt: '2024-06-01T10:00:00Z',
    uploadedByUserId: 'user-vijay',
    uploadedByRole: 'APPLICANT',
    preValidationStatus: 'pre_validation_passed',
    verificationStatus: 'superseded',
    supersededByDocumentId: 'doc-gst-v2',
    documentVersion: 1,
    isLatestVersion: false,
    isReusable: false,
    status: 'superseded',
    usageCount: 0,
    activeUsages: [],
  },
];

