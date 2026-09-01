'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { OfficialHeader } from '@/components/layout/OfficialHeader';
import { Footer } from '@/components/layout/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { evaluatePreValidation } from '@/lib/pre-validator';
import { VaultDocument, DEMO_VIJAY_VAULT_DOCUMENTS } from '@/lib/document-reuse';
import { ROUTES } from '@/lib/routes';
import {
  Building2,
  User,
  FileCheck,
  CheckCircle2,
  ShieldCheck,
  Upload,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Clock,
  HelpCircle,
  FileText,
  Save,
  Layers,
  AlertCircle,
  X,
} from 'lucide-react';

interface OnboardingDraft {
  step: number;
  personal: {
    fullName: string;
    mobile: string;
    designation: string;
    preferredLang: string;
    commPref: string;
  };
  organisation: {
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
    panReferenceDemo: string;
    gstReferenceDemo: string;
    contactEmail: string;
    contactPhone: string;
  };
  uploadedDocTypes: string[];
}

function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/dashboard';
  const { currentUser, completeOnboarding } = useAuth();

  const [currentLang, setCurrentLang] = useState('en');
  const [currentStep, setCurrentStep] = useState(1);

  // Step 2: Personal Profile State
  const [fullName, setFullName] = useState(currentUser?.name || 'Vijay Kulkarni');
  const [mobile, setMobile] = useState(currentUser?.mobile || '9822012345');
  const [designation, setDesignation] = useState('Director');
  const [preferredLang, setPreferredLang] = useState(currentUser?.language || 'en');
  const [commPref, setCommPref] = useState('EMAIL_SMS');

  // Step 3: Organisation State
  const [orgName, setOrgName] = useState('Vijay Foods and Agro Processing Pvt. Ltd.');
  const [legalEntity, setLegalEntity] = useState('Private Limited Company');
  const [businessStage, setBusinessStage] = useState('Pre-operation');
  const [sector, setSector] = useState('Food Processing & Agro Industries');
  const [subSector, setSubSector] = useState('Fruit & Vegetable Processing');
  const [district, setDistrict] = useState('Pune');
  const [taluka, setTaluka] = useState('Khed');
  const [address, setAddress] = useState('Plot C-14, Chakan MIDC Phase II, Pune');
  const [midcStatus, setMidcStatus] = useState<'MIDC' | 'NON_MIDC' | 'NOT_DECIDED'>('MIDC');
  const [panStatus, setPanStatus] = useState<'AVAILABLE' | 'NOT_AVAILABLE'>('AVAILABLE');
  const [gstStatus, setGstStatus] = useState<'REGISTERED' | 'APPLIED' | 'NOT_APPLICABLE' | 'NOT_AVAILABLE'>('REGISTERED');
  const [panRef, setPanRef] = useState('ABCDE1234F');
  const [gstRef, setGstRef] = useState('27ABCDE1234F1Z5');
  const [orgEmail, setOrgEmail] = useState(currentUser?.email || 'vijay@vijayfoods.com');
  const [orgPhone, setOrgPhone] = useState('020-27401122');

  // Step 4: Vault Documents State
  const [uploadedDocTypes, setUploadedDocTypes] = useState<string[]>([
    'PAN Card',
    'GST Certificate',
    'Incorporation Certificate',
    'Address Proof',
  ]);

  const [isUploading, setIsUploading] = useState<string | null>(null);

  // Restore saved draft from localStorage
  useEffect(() => {
    try {
      const savedDraftStr = localStorage.getItem('udyogsathi_onboarding_draft');
      if (savedDraftStr) {
        const draft: OnboardingDraft = JSON.parse(savedDraftStr);
        if (draft.step) setCurrentStep(draft.step);
        if (draft.personal) {
          if (draft.personal.fullName) setFullName(draft.personal.fullName);
          if (draft.personal.mobile) setMobile(draft.personal.mobile);
          if (draft.personal.designation) setDesignation(draft.personal.designation);
          if (draft.personal.preferredLang) setPreferredLang(draft.personal.preferredLang);
        }
        if (draft.organisation) {
          if (draft.organisation.organisationName) setOrgName(draft.organisation.organisationName);
          if (draft.organisation.sector) setSector(draft.organisation.sector);
          if (draft.organisation.district) setDistrict(draft.organisation.district);
        }
        if (draft.uploadedDocTypes) setUploadedDocTypes(draft.uploadedDocTypes);
      }
    } catch (e) {}
  }, []);

  const saveDraft = (nextStep?: number) => {
    const targetStep = nextStep ?? currentStep;
    const draft: OnboardingDraft = {
      step: targetStep,
      personal: { fullName, mobile, designation, preferredLang, commPref },
      organisation: {
        organisationName: orgName,
        legalEntityType: legalEntity,
        businessStage,
        sector,
        subSector,
        district,
        taluka,
        address,
        midcStatus,
        panStatus,
        gstStatus,
        panReferenceDemo: panRef,
        gstReferenceDemo: gstRef,
        contactEmail: orgEmail,
        contactPhone: orgPhone,
      },
      uploadedDocTypes,
    };
    try {
      localStorage.setItem('udyogsathi_onboarding_draft', JSON.stringify(draft));
    } catch (e) {}
  };

  const handleNextStep = () => {
    const next = Math.min(currentStep + 1, 5);
    setCurrentStep(next);
    saveDraft(next);
  };

  const handlePrevStep = () => {
    const prev = Math.max(currentStep - 1, 1);
    setCurrentStep(prev);
    saveDraft(prev);
  };

  const handleSimulateDocUpload = (docType: string) => {
    setIsUploading(docType);
    setTimeout(() => {
      if (!uploadedDocTypes.includes(docType)) {
        const updated = [...uploadedDocTypes, docType];
        setUploadedDocTypes(updated);
        saveDraft();
      }
      setIsUploading(null);
    }, 600);
  };

  const handleRemoveDoc = (docType: string) => {
    const updated = uploadedDocTypes.filter((d) => d !== docType);
    setUploadedDocTypes(updated);
    saveDraft();
  };

  const handleFinishOnboarding = (targetPath?: string) => {
    completeOnboarding({
      organisationId: 'org-vijay-1',
      profileUpdates: {
        name: fullName,
        mobile,
        designation,
        language: preferredLang,
      },
    });

    try {
      localStorage.removeItem('udyogsathi_onboarding_draft');
    } catch (e) {}

    const dest = targetPath || returnTo || '/dashboard';
    router.replace(dest);
  };

  return (
    <ProtectedRoute allowUnonboarded={true}>
      <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans">
        <TopUtilityBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
        <OfficialHeader currentLang={currentLang} />
        <DisclaimerBanner lang={currentLang} />

        <main id="main-content" className="flex-1 py-8 px-4 max-w-4xl mx-auto w-full space-y-6">
          {/* Stepper Header Bar */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-govBorder space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold text-saffron uppercase tracking-widest block">
                  First-Time Applicant Onboarding
                </span>
                <h1 className="text-xl font-bold text-govBlue">Set Up Your UdyogSathi Workspace</h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    saveDraft();
                    router.push(ROUTES.home);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5 text-saffron" />
                  <span>Save & Exit</span>
                </button>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-govBlue">
                <span>Step {currentStep} of 5: {
                  currentStep === 1 ? 'Welcome & Overview' :
                  currentStep === 2 ? 'Personal Profile' :
                  currentStep === 3 ? 'Organisation Profile' :
                  currentStep === 4 ? 'Document Vault Setup' : 'Review & Finish'
                }</span>
                <span className="text-saffron">{currentStep * 20}% Completed</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-govBlue via-saffron to-govBlue transition-all duration-500"
                  style={{ width: `${currentStep * 20}%` }}
                />
              </div>
            </div>
          </div>

          {/* STEP 1: WELCOME */}
          {currentStep === 1 && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-govBorder space-y-6 text-xs">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-saffron/10 text-saffron flex items-center justify-center border border-saffron/30">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-govBlue">Welcome to UdyogSathi.</h2>
                <p className="text-slate-600 leading-relaxed text-sm max-w-2xl">
                  Set up your profile, add your business details, and upload key documents once. UdyogSathi will securely organise them in your Document Vault so eligible verified documents can be reused in future approval applications.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-govBlue-50 p-5 rounded-xl border border-govBlue/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-govBlue">
                    <Clock className="w-4 h-4 text-saffron" />
                    <span>Estimated Completion Time</span>
                  </div>
                  <p className="text-slate-600">Takes approximately 3 to 5 minutes to complete setup.</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-govBlue">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    <span>Privacy & Data Security Guarantee</span>
                  </div>
                  <p className="text-slate-600">Your documents are encrypted and accessible only by authorised scrutiny officers.</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-govBlue text-sm">What you will need for initial setup:</h3>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <span>Business / Organisation details (Name, Sector, Legal Type, District, MIDC status)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <span>PAN and GST reference numbers if available (Optional for idea-stage applicants)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <span>Key reusable business documents (PAN, GST, Certificate of Incorporation, Address Proof)</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    saveDraft();
                    router.push(ROUTES.home);
                  }}
                  className="text-slate-600 hover:text-govBlue font-bold"
                >
                  Save and Exit
                </button>

                <button
                  onClick={handleNextStep}
                  className="bg-saffron hover:bg-saffron-dark text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow transition-all flex items-center gap-2"
                >
                  <span>Start Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PERSONAL PROFILE */}
          {currentStep === 2 && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-govBorder space-y-6 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-govBlue flex items-center gap-2">
                  <User className="w-5 h-5 text-saffron" /> Personal Profile Details
                </h2>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Confirm your applicant contact details for statutory correspondence and SLA alerts.
                </p>
              </div>

              <div className="space-y-4 max-w-xl">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-saffron text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Mobile Number (SLA SMS Alerts) *</label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-saffron text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Designation in Enterprise *</label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-saffron text-xs bg-white"
                  >
                    <option value="Proprietor">Proprietor</option>
                    <option value="Partner">Partner</option>
                    <option value="Director">Director</option>
                    <option value="Authorised Representative">Authorised Representative</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Preferred Language</label>
                  <select
                    value={preferredLang}
                    onChange={(e) => setPreferredLang(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-saffron text-xs bg-white"
                  >
                    <option value="en">English</option>
                    <option value="mr">मराठी (Marathi)</option>
                    <option value="hi">हिंदी (Hindi)</option>
                    <option value="ur">اردو (Urdu)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={handlePrevStep}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  onClick={handleNextStep}
                  className="bg-saffron hover:bg-saffron-dark text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow transition-all flex items-center gap-2"
                >
                  <span>Continue to Organisation Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ORGANISATION PROFILE */}
          {currentStep === 3 && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-govBorder space-y-6 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-govBlue flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-saffron" /> Organisation / Business Profile
                </h2>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Enter baseline business details to establish document vault ownership and future statutory checklists.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-800 block mb-1">Organisation / Business Name *</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-saffron text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Legal Entity Type *</label>
                  <select
                    value={legalEntity}
                    onChange={(e) => setLegalEntity(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-saffron text-xs bg-white"
                  >
                    <option value="Proprietorship">Proprietorship</option>
                    <option value="Partnership">Partnership</option>
                    <option value="LLP">Limited Liability Partnership (LLP)</option>
                    <option value="Private Limited Company">Private Limited Company</option>
                    <option value="Public Limited Company">Public Limited Company</option>
                    <option value="Cooperative">Cooperative Society</option>
                    <option value="Trust/Society">Trust / Society</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Business Lifecycle Stage *</label>
                  <select
                    value={businessStage}
                    onChange={(e) => setBusinessStage(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-saffron text-xs bg-white"
                  >
                    <option value="Idea stage">Idea stage</option>
                    <option value="Registration stage">Registration stage</option>
                    <option value="Land identified">Land identified</option>
                    <option value="Construction">Construction</option>
                    <option value="Pre-operation">Pre-operation</option>
                    <option value="Operational">Operational</option>
                    <option value="Expansion">Expansion</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Primary Industrial Sector *</label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-saffron text-xs bg-white"
                  >
                    <option value="Food Processing & Agro Industries">Food Processing & Agro Industries</option>
                    <option value="Automotive & Heavy Engineering">Automotive & Heavy Engineering</option>
                    <option value="Textiles & Apparel">Textiles & Apparel</option>
                    <option value="Pharmaceuticals & Fine Chemicals">Pharmaceuticals & Fine Chemicals</option>
                    <option value="Electronics & Semiconductor">Electronics & Semiconductor</option>
                    <option value="Renewable Energy & Battery Storage">Renewable Energy & Battery Storage</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Maharashtra District *</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-saffron text-xs bg-white"
                  >
                    <option value="Pune">Pune</option>
                    <option value="Thane">Thane</option>
                    <option value="Nagpur">Nagpur</option>
                    <option value="Chhatrapati Sambhajinagar">Chhatrapati Sambhajinagar</option>
                    <option value="Nashik">Nashik</option>
                    <option value="Solapur">Solapur</option>
                    <option value="Raigad">Raigad</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">MIDC Zoning Status</label>
                  <select
                    value={midcStatus}
                    onChange={(e) => setMidcStatus(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-saffron text-xs bg-white"
                  >
                    <option value="MIDC">MIDC Industrial Park</option>
                    <option value="NON_MIDC">Non-MIDC Zone</option>
                    <option value="NOT_DECIDED">Not Decided Yet</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">PAN Status</label>
                  <select
                    value={panStatus}
                    onChange={(e) => setPanStatus(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-saffron text-xs bg-white"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="NOT_AVAILABLE">Not Available Yet</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={handlePrevStep}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  onClick={handleNextStep}
                  className="bg-saffron hover:bg-saffron-dark text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow transition-all flex items-center gap-2"
                >
                  <span>Continue to Document Vault Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: INITIAL DOCUMENT VAULT SETUP */}
          {currentStep === 4 && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-govBorder space-y-6 text-xs">
              <div className="border-b border-slate-100 pb-3 space-y-1">
                <h2 className="text-lg font-bold text-govBlue flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-saffron" /> Set Up Your Verified Document Vault
                </h2>
                <p className="text-slate-600 text-xs">
                  Upload important business documents once. After pre-validation and verification, UdyogSathi can suggest eligible documents for reuse in future approval applications.
                </p>
                <div className="bg-amber-50 text-amber-900 border border-amber-200 p-2.5 rounded-lg text-[11px] font-bold">
                  Note: You can skip documents that you do not have yet. You can upload them later from your Document Vault.
                </div>
              </div>

              {/* Required & Recommended Documents Checklist */}
              <div className="space-y-3">
                {[
                  { title: 'PAN Card', desc: 'Promoter or Enterprise Permanent Account Number card file.', req: true },
                  { title: 'GST Certificate', desc: 'GSTIN registration certificate v2.', req: true },
                  { title: 'Incorporation Certificate', desc: 'Ministry of Corporate Affairs COI or Partnership Deed.', req: true },
                  { title: 'Address Proof', desc: 'MIDC plot allotment letter or registered lease agreement.', req: true },
                  { title: 'Authorised Signatory Letter', desc: 'Board resolution or power of attorney letter.', req: false },
                  { title: 'Land Ownership Document', desc: '7/12 extract or MIDC lease deed file.', req: false },
                ].map((docItem) => {
                  const isUploaded = uploadedDocTypes.includes(docItem.title);
                  return (
                    <div
                      key={docItem.title}
                      className={`p-4 rounded-xl border transition-all flex flex-wrap items-center justify-between gap-3 ${
                        isUploaded ? 'bg-green-50/80 border-green-300' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="space-y-0.5 max-w-md">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-govBlue">{docItem.title}</span>
                          {docItem.req && <span className="text-red-600 font-extrabold">*</span>}
                          {isUploaded && (
                            <span className="bg-green-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded uppercase">
                              Pre-validated
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">{docItem.desc}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {isUploaded ? (
                          <button
                            onClick={() => handleRemoveDoc(docItem.title)}
                            className="text-red-600 hover:text-red-800 font-bold text-[11px] flex items-center gap-1 bg-white px-2.5 py-1 rounded border border-red-200"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSimulateDocUpload(docItem.title)}
                            disabled={isUploading === docItem.title}
                            className="bg-govBlue hover:bg-govBlue-dark text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <Upload className="w-3.5 h-3.5 text-saffron" />
                            <span>{isUploading === docItem.title ? 'Uploading...' : 'Upload File'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Progress Summary */}
              <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-600">Vault Documents Uploaded: </span>
                  <strong className="text-govBlue font-bold">{uploadedDocTypes.length} Files Ready</strong>
                </div>
                <span className="text-green-700 font-bold">Pre-Validation Ready</span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={handlePrevStep}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  onClick={handleNextStep}
                  className="bg-saffron hover:bg-saffron-dark text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow transition-all flex items-center gap-2"
                >
                  <span>Review & Finish Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW AND FINISH */}
          {currentStep === 5 && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-govBorder space-y-6 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-govBlue flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" /> Review Your Workspace Setup
                </h2>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Confirm your applicant workspace profile details before entering your single-window dashboard.
                </p>
              </div>

              {/* Personal Summary */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h3 className="font-bold text-govBlue border-b border-slate-200 pb-1">Personal Profile</h3>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><span className="text-slate-500">Applicant:</span> <strong>{fullName}</strong></div>
                  <div><span className="text-slate-500">Mobile:</span> <strong>{mobile}</strong></div>
                  <div><span className="text-slate-500">Designation:</span> <strong>{designation}</strong></div>
                  <div><span className="text-slate-500">Language:</span> <strong className="uppercase">{preferredLang}</strong></div>
                </div>
              </div>

              {/* Organisation Summary */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h3 className="font-bold text-govBlue border-b border-slate-200 pb-1">Organisation Profile</h3>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><span className="text-slate-500">Organisation:</span> <strong>{orgName}</strong></div>
                  <div><span className="text-slate-500">Legal Entity:</span> <strong>{legalEntity}</strong></div>
                  <div><span className="text-slate-500">Sector:</span> <strong>{sector}</strong></div>
                  <div><span className="text-slate-500">District:</span> <strong>{district} ({midcStatus})</strong></div>
                </div>
              </div>

              {/* Document Vault Summary */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h3 className="font-bold text-govBlue border-b border-slate-200 pb-1">Document Vault Setup</h3>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Uploaded Reusable Files: <strong>{uploadedDocTypes.length} Documents</strong></span>
                  <span className="text-green-700 font-bold">1-Click Document Reuse Ready</span>
                </div>
              </div>

              {/* Primary & Secondary Action CTAs */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleFinishOnboarding(ROUTES.dashboard)}
                  className="w-full bg-saffron hover:bg-saffron-dark text-white font-extrabold text-sm py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Go to My Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <button
                    onClick={() => handleFinishOnboarding(ROUTES.approvalWizard)}
                    className="bg-govBlue hover:bg-govBlue-dark text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Start My Approval Journey</span>
                  </button>

                  <button
                    onClick={() => handleFinishOnboarding(ROUTES.vault)}
                    className="bg-white text-govBlue border border-govBlue/30 hover:bg-slate-100 font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Open Document Vault</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}

export default function OnboardingPage() {
  return (
    <React.Suspense
      fallback={
        <div className="bg-[#f7f9fc] min-h-screen flex items-center justify-center text-xs text-govMuted font-sans">
          Loading Onboarding Wizard...
        </div>
      }
    >
      <OnboardingForm />
    </React.Suspense>
  );
}
