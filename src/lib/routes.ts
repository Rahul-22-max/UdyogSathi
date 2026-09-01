export const ROUTES = {
  home: '/',
  approvalWizard: '/approval-wizard',
  wizardAlias: '/wizard',
  sectorGuides: '/sector-guides',
  knowledgeBase: '/knowledge-base',
  schemes: '/schemes',
  about: '/about',
  howItWorks: '/how-it-works',
  contact: '/contact',
  accessibility: '/accessibility',
  privacy: '/privacy',
  terms: '/terms',
  disclaimer: '/disclaimer',
  sitemap: '/sitemap',
  login: '/login',
  register: '/register',
  signup: '/signup',
  onboarding: '/onboarding',
  dashboard: '/dashboard',
  myJourney: '/my-journey',
  projects: '/projects',
  newProject: '/projects/new',
  selectProject: '/select-project',
  applications: '/applications',
  inspections: '/inspections',
  compliance: '/compliance',
  renewals: '/renewals',
  grievances: '/grievances',
  demo: '/demo',
  faq: '/faq',
  vault: '/vault',
} as const;

export const NAVIGATION_MAP: Record<string, string> = {
  'My Approval Journey': ROUTES.dashboard,
  'Approval Wizard': ROUTES.approvalWizard,
  'Start Your Approval Journey': ROUTES.approvalWizard,
  'My Projects': ROUTES.projects,
  'Applications': ROUTES.applications,
  'Document Vault': ROUTES.vault,
  'Inspections': ROUTES.inspections,
  'Compliance & Renewals': ROUTES.compliance,
  'Renewals': ROUTES.renewals,
  'Government Schemes & Incentives': ROUTES.schemes,
  'Grievances & Helpdesk': ROUTES.grievances,
  'Guided Platform Tour': ROUTES.demo,
};

export function getLocalizedRoute(path: string, lang?: string): string {
  if (!lang || lang === 'en') return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `/${lang}${cleanPath}`;
}
