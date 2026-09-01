export type UserRole = 'GUEST' | 'APPLICANT' | 'OFFICER' | 'INSPECTOR' | 'ADMIN';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ApplicationStatus =
  | 'NOT_STARTED'
  | 'DOCUMENTS_PENDING'
  | 'READY_FOR_SUBMISSION'
  | 'SUBMITTED'
  | 'UNDER_SCRUTINY'
  | 'QUERY_RAISED'
  | 'RESPONSE_SUBMITTED'
  | 'INSPECTION_REQUIRED'
  | 'INSPECTION_SCHEDULED'
  | 'APPROVED'
  | 'REJECTED'
  | 'RETURNED_FOR_CORRECTION'
  | 'EXPIRED'
  | 'RENEWAL_DUE'
  | 'CLOSED';

export type InspectionStatus = 'SCHEDULED' | 'RESCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type GrievanceStatus = 'OPEN' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'AWAITING_APPLICANT' | 'ESCALATED' | 'RESOLVED' | 'CLOSED';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  mobile?: string;
  phone?: string;
  language: string;
  highContrast: boolean;
  fontSize: string;
  department?: string;
  designation?: string;
  communicationPreferences?: string;
  onboardingCompleted?: boolean;
  onboardingStatus?: 'not_started' | 'in_progress' | 'completed';
  onboardingStep?: number;
  organisationId?: string;
  termsAcceptedAt?: string;
  privacyAcceptedAt?: string;
  notificationConsent?: boolean;
}

export interface OrganisationProfile {
  id: string;
  organisationName: string;
  legalEntityType: string;
  businessStage: string;
  sector: string;
  subSector: string;
  district: string;
  taluka: string;
  address: string;
  midcStatus: 'MIDC' | 'NON_MIDC' | 'NOT_DECIDED';
  panStatus: 'AVAILABLE' | 'NOT_AVAILABLE';
  gstStatus: 'REGISTERED' | 'APPLIED' | 'NOT_APPLICABLE' | 'NOT_AVAILABLE';
  panReferenceDemo?: string;
  gstReferenceDemo?: string;
  udyamReferenceDemo?: string;
  contactEmail: string;
  contactPhone: string;
  ownerUserId: string;
}

export interface WizardInput {
  organisationName: string;
  applicantName: string;
  legalEntity: string;
  applicantType: string;
  contactEmail: string;
  contactMobile: string;
  sector: string;
  subSector: string;
  district: string;
  taluka: string;
  locationType: 'MIDC' | 'NON_MIDC';
  landType: string;
  landAreaSqMtr: number;
  builtupAreaSqMtr: number;
  projectStage: 'SETUP' | 'CONSTRUCTION' | 'PRE_OPERATION' | 'OPERATION' | 'EXPANSION';
  investmentAmountINR: number;
  expectedWorkforce: number;
  manufacturingType: string;
  powerRequirementKW: number;
  waterRequirementKLD: number;
  wastewaterKLD: number;
  wasteCategory: 'WHITE' | 'GREEN' | 'ORANGE' | 'RED';
  hazardousMaterials: boolean;
  fireSafetyReq: boolean;
  boilerReq: boolean;
  labourRegReq: boolean;
  preferredLanguage: string;
}

export interface ApprovalChecklistItem {
  ruleId: string;
  approvalTitle: string;
  department: string;
  whyApplicable: string;
  projectStage: string;
  requiredDocuments: string[];
  dependencies: string[];
  estimatedSlaDays: number;
  riskLevel: RiskLevel;
  indicativeFee: string;
  status: ApplicationStatus;
  nextAction: string;
  sourceRef: string;
  requiresInspection?: boolean;
  inspectionStage?: string;
}

export interface PreValidationResult {
  readinessScore: number;
  missingDocuments: string[];
  expiredDocuments: string[];
  warnings: string[];
  metadataMatch: boolean;
  isReadyForSubmission: boolean;
}

export interface LanguageOption {
  code: string;
  nameEn: string;
  nameNative: string;
  isRtl?: boolean;
  hasFullDictionary?: boolean;
}
