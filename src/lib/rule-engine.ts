if (typeof window !== 'undefined') {
  throw new Error('Server-only module');
}
import { connectToDatabase } from '@/lib/db/mongoose';
import { ApprovalRuleModel, IApprovalRule } from '@/lib/models/approval-rule.model';
import { WizardInput, ApprovalChecklistItem, RiskLevel } from '@/types';

export async function generateApprovalChecklist(input: WizardInput): Promise<ApprovalChecklistItem[]> {
  try {
    await connectToDatabase();
    // Fetch active rules from MongoDB
    const dbRules: IApprovalRule[] = await ApprovalRuleModel.find({ isActive: true })
      .sort({ priority: 1 })
      .lean<IApprovalRule[]>();

    const checklist: ApprovalChecklistItem[] = [];

    for (const rule of dbRules) {
      let isApplicable = true;

      // Sector check
      if (rule.sector !== 'ALL' && rule.sector !== input.sector) {
        isApplicable = false;
      }

      // Location type check (MIDC vs NON_MIDC)
      if (rule.locationType && rule.locationType !== 'ALL') {
        if (rule.locationType === 'MIDC' && !input.locationType.includes('MIDC')) {
          isApplicable = false;
        }
        if (rule.locationType === 'NON_MIDC' && input.locationType.includes('MIDC')) {
          isApplicable = false;
        }
      }

      // Investment check
      if (rule.minInvestment && input.investmentAmountINR < rule.minInvestment) {
        isApplicable = false;
      }

      // Workforce check
      if (rule.minWorkforce && input.expectedWorkforce < rule.minWorkforce) {
        isApplicable = false;
      }

      // Environmental Category check
      if (rule.envCategory && rule.envCategory !== input.wasteCategory) {
        if (rule.envCategory === 'ORANGE' && input.wasteCategory === 'RED') {
          // Red requires CTE too
          isApplicable = true;
        } else if (rule.envCategory === 'WHITE' && input.wasteCategory !== 'WHITE') {
          isApplicable = false;
        }
      }

      // Hazardous material condition check
      if (rule.hazardousCondition && !input.hazardousMaterials) {
        isApplicable = false;
      }

      if (isApplicable) {
        let reqDocs: string[] = Array.isArray(rule.requiredDocs) ? rule.requiredDocs : [];
        if (typeof rule.requiredDocs === 'string') {
          try {
            reqDocs = JSON.parse(rule.requiredDocs);
          } catch {
            reqDocs = ['Business Registration Proof', 'Project Plan'];
          }
        }

        let deps: string[] = Array.isArray(rule.dependencies) ? rule.dependencies : [];
        if (typeof rule.dependencies === 'string') {
          try {
            deps = JSON.parse(rule.dependencies);
          } catch {
            deps = [];
          }
        }

        const requiresInsp =
          rule.requiresInspection ||
          rule.department.includes('MPCB') ||
          rule.department.includes('DISH') ||
          rule.department.includes('Safety') ||
          rule.department.includes('Fire') ||
          rule.requiredApproval.toLowerCase().includes('factory') ||
          rule.requiredApproval.toLowerCase().includes('consent') ||
          rule.requiredApproval.toLowerCase().includes('fire');

        checklist.push({
          ruleId: rule.ruleId,
          approvalTitle: rule.requiredApproval,
          department: rule.department,
          whyApplicable: rule.explanation,
          projectStage: rule.projectStage || input.projectStage,
          requiredDocuments: reqDocs,
          dependencies: deps,
          estimatedSlaDays: rule.slaDays,
          riskLevel: rule.riskLevel as RiskLevel,
          indicativeFee: `₹${(Math.floor(Math.random() * 8) + 2) * 1000} (Demo SLA)`,
          status: 'NOT_STARTED',
          nextAction: 'Upload Required Documents in Vault',
          sourceRef: rule.sourceReference || rule.sourceRef || 'Maharashtra Industry Regulation Guidelines',
          requiresInspection: requiresInsp,
          inspectionStage: requiresInsp ? 'before_decision' : 'not_required',
        });
      }
    }

    // Fallback if no db rules matched
    if (checklist.length === 0) {
      checklist.push({
        ruleId: 'RULE_SHOPS_EST_GENERIC',
        approvalTitle: 'Shops & Establishment Registration',
        department: 'Labour Department, Maharashtra',
        whyApplicable: 'Mandatory commercial registration for all business units.',
        projectStage: input.projectStage,
        requiredDocuments: ['PAN Card', 'Aadhaar Card', 'Address Proof'],
        dependencies: [],
        estimatedSlaDays: 7,
        riskLevel: 'LOW',
        indicativeFee: '₹1,000 (Demo Fee)',
        status: 'NOT_STARTED',
        nextAction: 'Submit Identity & Business Documents',
        sourceRef: 'MH Shops & Est Act 2017',
      });
    }

    return checklist;
  } catch (error) {
    console.error('Error generating checklist:', error);
    return [
      {
        ruleId: 'RULE_MPCB_CTE',
        approvalTitle: 'Consent to Establish (CTE) - MPCB',
        department: 'Maharashtra Pollution Control Board (MPCB)',
        whyApplicable: `Required for ${input.sector} project in ${input.district} under Orange/Red category pollution control norms.`,
        projectStage: 'SETUP',
        requiredDocuments: ['Project Report', 'Site Plan', 'Process Flow Diagram', 'Water & Waste Balance Sheet'],
        dependencies: ['MIDC Land Allotment / Land Lease Proof'],
        estimatedSlaDays: 30,
        riskLevel: 'HIGH',
        indicativeFee: '₹5,000 (Demo Fee)',
        status: 'NOT_STARTED',
        nextAction: 'Upload Technical & Water Balance Documents',
        sourceRef: 'Water (Prevention & Control of Pollution) Act 1974',
      },
      {
        ruleId: 'RULE_DISH_FACTORY',
        approvalTitle: 'Factory Building Plan Approval',
        department: 'Directorate of Industrial Safety and Health (DISH)',
        whyApplicable: `Mandatory statutory approval under Factories Act for workforce of ${input.expectedWorkforce} workers.`,
        projectStage: 'CONSTRUCTION',
        requiredDocuments: ['Architectural Factory Layout', 'Machinery Spacing Diagram', 'Stability Certificate'],
        dependencies: ['Consent to Establish (CTE)'],
        estimatedSlaDays: 21,
        riskLevel: 'MEDIUM',
        indicativeFee: '₹3,500 (Demo Fee)',
        status: 'NOT_STARTED',
        nextAction: 'Upload Architectural Layout',
        sourceRef: 'Factories Act 1948 Sec 6',
      },
    ];
  }
}
