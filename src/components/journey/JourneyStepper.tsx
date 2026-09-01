'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getTranslation } from '@/lib/i18n';
import { ROUTES } from '@/lib/routes';
import {
  Compass,
  FileCheck2,
  UploadCloud,
  FileSpreadsheet,
  Activity,
  SearchCheck,
  CheckCircle2,
  CalendarDays,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

export interface JourneyStepInfo {
  stepNumber: number;
  guideSlug: string;
  nameKey: string;
  descKey: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  isProtected?: boolean;
}

export const JOURNEY_STEPS: JourneyStepInfo[] = [
  {
    stepNumber: 1,
    guideSlug: 'discover',
    nameKey: 'step_1_name',
    descKey: 'step_1_desc',
    href: ROUTES.approvalWizard,
    icon: Compass,
    badge: 'Discovery',
  },
  {
    stepNumber: 2,
    guideSlug: 'prepare',
    nameKey: 'step_2_name',
    descKey: 'step_2_desc',
    href: ROUTES.projects,
    icon: FileCheck2,
    badge: 'Checklist',
  },
  {
    stepNumber: 3,
    guideSlug: 'upload-once',
    nameKey: 'step_3_name',
    descKey: 'step_3_desc',
    href: ROUTES.vault,
    icon: UploadCloud,
    badge: 'Vault Reuse',
    isProtected: true,
  },
  {
    stepNumber: 4,
    guideSlug: 'apply',
    nameKey: 'step_4_name',
    descKey: 'step_4_desc',
    href: ROUTES.applications,
    icon: FileSpreadsheet,
    badge: 'Workspace',
    isProtected: true,
  },
  {
    stepNumber: 5,
    guideSlug: 'track',
    nameKey: 'step_5_name',
    descKey: 'step_5_desc',
    href: ROUTES.applications,
    icon: Activity,
    badge: 'SLA Tracking',
    isProtected: true,
  },
  {
    stepNumber: 6,
    guideSlug: 'inspection',
    nameKey: 'step_6_name',
    descKey: 'step_6_desc',
    href: ROUTES.inspections,
    icon: SearchCheck,
    badge: 'Field Audit',
    isProtected: true,
  },
  {
    stepNumber: 7,
    guideSlug: 'decision',
    nameKey: 'step_7_name',
    descKey: 'step_7_desc',
    href: ROUTES.applications,
    icon: CheckCircle2,
    badge: 'Decision',
    isProtected: true,
  },
  {
    stepNumber: 8,
    guideSlug: 'continue',
    nameKey: 'step_8_name',
    descKey: 'step_8_desc',
    href: ROUTES.compliance,
    icon: CalendarDays,
    badge: 'Renewals & Support',
    isProtected: true,
  },
];

interface JourneyStepperProps {
  activeStep?: number;
  lang?: string;
  compact?: boolean;
  className?: string;
  showDescriptions?: boolean;
}

export const JourneyStepper: React.FC<JourneyStepperProps> = ({
  activeStep = 1,
  lang = 'en',
  compact = false,
  className = '',
  showDescriptions = true,
}) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleStepClick = (step: JourneyStepInfo, e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      router.push(`/how-it-works/${step.guideSlug}`);
    }
  };

  if (compact) {
    return (
      <div className={`w-full overflow-x-auto py-2 ${className}`}>
        <div className="flex items-center min-w-max gap-2 text-xs">
          {JOURNEY_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCurrent = activeStep === step.stepNumber;
            const isPassed = activeStep > step.stepNumber;

            return (
              <React.Fragment key={step.stepNumber}>
                <Link
                  href={step.href}
                  onClick={(e) => handleStepClick(step, e)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                    isCurrent
                      ? 'bg-govBlue text-white border-saffron shadow-sm font-bold ring-2 ring-saffron/30'
                      : isPassed
                      ? 'bg-green-50 text-green-800 border-green-300 font-semibold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-saffron' : isPassed ? 'text-green-600' : 'text-govBlue'}`} />
                  <span>{getTranslation(lang, step.nameKey)}</span>
                </Link>
                {idx < JOURNEY_STEPS.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-govBorder pb-3">
        <div>
          <span className="text-[10px] font-extrabold text-saffron uppercase tracking-widest block">
            End-to-End Single Window Workflow
          </span>
          <h2 className="text-lg font-bold text-govBlue flex items-center gap-2">
            The Complete 8-Step Industrial Journey
          </h2>
        </div>
        <div className="text-xs font-mono font-bold bg-govBlue-50 text-govBlue px-2.5 py-1 rounded border border-govBlue/20">
          Stage {activeStep} of 8
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {JOURNEY_STEPS.map((step) => {
          const Icon = step.icon;
          const isCurrent = activeStep === step.stepNumber;
          const isPassed = activeStep > step.stepNumber;

          return (
            <Link
              key={step.stepNumber}
              href={step.href}
              onClick={(e) => handleStepClick(step, e)}
              className={`group p-4 rounded-xl border transition-all flex flex-col justify-between space-y-2 ${
                isCurrent
                  ? 'bg-gradient-to-br from-govBlue to-govBlue-dark text-white border-saffron shadow-md ring-2 ring-saffron/40'
                  : isPassed
                  ? 'bg-green-50/70 text-slate-900 border-green-300 hover:bg-green-100/70'
                  : 'bg-white text-slate-900 border-slate-200 hover:border-govBlue/40 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${
                    isCurrent
                      ? 'bg-saffron text-white shadow'
                      : isPassed
                      ? 'bg-green-600 text-white'
                      : 'bg-govBlue-50 text-govBlue group-hover:bg-govBlue group-hover:text-white transition-colors'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    isCurrent
                      ? 'bg-saffron/20 text-saffron border border-saffron/30 font-extrabold'
                      : isPassed
                      ? 'bg-green-200/80 text-green-900'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {step.badge}
                </span>
              </div>

              <div>
                <h3
                  className={`text-xs font-bold ${
                    isCurrent ? 'text-white' : 'text-govBlue'
                  }`}
                >
                  {getTranslation(lang, step.nameKey)}
                </h3>
                {showDescriptions && (
                  <p
                    className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${
                      isCurrent ? 'text-slate-200' : 'text-slate-600'
                    }`}
                  >
                    {getTranslation(lang, step.descKey)}
                  </p>
                )}
              </div>

              <div
                className={`pt-2 border-t text-[11px] font-bold flex items-center justify-between ${
                  isCurrent
                    ? 'border-white/10 text-saffron'
                    : isPassed
                    ? 'border-green-200 text-green-800'
                    : 'border-slate-100 text-govBlue group-hover:text-saffron'
                }`}
              >
                <span>{isCurrent ? 'Active Stage' : isPassed ? 'Completed' : 'View Step'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
