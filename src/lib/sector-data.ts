import { Factory, Car, FlaskConical, Pill, Laptop, Utensils, Shirt, Zap, Building, Truck } from 'lucide-react';

export interface SectorGuide {
  id: string;
  slug: string;
  name: string;
  category: string;
  icon: any;
  pollutionCategory: 'RED' | 'ORANGE' | 'GREEN' | 'WHITE';
  description: string;
  keyApprovals: string[];
  acts: string[];
  avgSlaDays: number;
  schemes: string[];
  kbLinks: { title: string; slug: string }[];
}

export const SECTOR_GUIDES: SectorGuide[] = [
  {
    id: 'manufacturing',
    slug: 'manufacturing',
    name: 'Manufacturing & Heavy Engineering',
    category: 'Heavy Industry',
    icon: Factory,
    pollutionCategory: 'RED',
    description:
      'Regulatory compliance guidelines for heavy equipment, metal fabrication, machinery manufacturing, and foundry units in Maharashtra.',
    keyApprovals: [
      'MPCB Consent to Establish (CTE) - Red Category',
      'DISH Factory Plan Approval & License',
      'Provisional & Final Fire NOC from MFD / MIDC Fire',
      'MSEDCL HT Industrial Power Connection',
      'Steam Boiler Safety Registration (if applicable)',
    ],
    acts: [
      'The Factories Act, 1948',
      'Water (Prevention and Control of Pollution) Act, 1974',
      'Air (Prevention and Control of Pollution) Act, 1981',
      'Maharashtra Regional and Town Planning Act, 1966',
    ],
    avgSlaDays: 45,
    schemes: ['PSI 2019 Capital Subsidy', 'Power Tariff Subsidy for Heavy Units', 'Interest Subsidy for MSME Expansion'],
    kbLinks: [
      { title: 'MPCB Red Category Consent Procedures', slug: 'mpcb-cte-cto-procedure' },
      { title: 'DISH Factory Plan Approval Guidelines', slug: 'dish-factory-plan-approval' },
    ],
  },
  {
    id: 'automotive',
    slug: 'automotive',
    name: 'Automotive & Auto Components',
    category: 'Engineering',
    icon: Car,
    pollutionCategory: 'ORANGE',
    description:
      'Clearances required for vehicle assembly, precision component machining, stamping, painting, and automotive R&D facilities.',
    keyApprovals: [
      'MPCB CTE/CTO - Orange Category',
      'MIDC Industrial Land & Water Connection Allotment',
      'Hazardous Waste Management Authorization',
      'Labour Dept Shops & Establishment / Contract Labour License',
    ],
    acts: ['Factories Act 1948', 'Environment Protection Act 1986', 'Motor Vehicles Manufacturing Norms'],
    avgSlaDays: 30,
    schemes: ['Maharashtra Electric Vehicle Policy 2021', 'PLI Scheme for Auto Components', 'Industrial Promotion Subsidy'],
    kbLinks: [
      { title: 'MIDC Land & Water Allotment Rules', slug: 'midc-land-water-allotment' },
      { title: 'Hazardous Waste Authorization Guide', slug: 'hazardous-waste-authorization' },
    ],
  },
  {
    id: 'chemicals',
    slug: 'chemicals',
    name: 'Chemicals & Petrochemicals',
    category: 'Process Industry',
    icon: FlaskConical,
    pollutionCategory: 'RED',
    description:
      'Comprehensive statutory norms for specialty chemicals, polymers, petrochemical processing, and hazardous material storage.',
    keyApprovals: [
      'State Level Environment Impact Assessment (SEIAA) Clearance',
      'MPCB CTE - Red Category Special Scrutiny',
      'DISCCO / Explosives Safety Clearance (PESO)',
      'Public Liability Insurance Coverage Clearance',
    ],
    acts: [
      'Manufacture, Storage and Import of Hazardous Chemical Rules 1989',
      'Environment Impact Assessment Notification 2006',
      'Petroleum Act 1934',
    ],
    avgSlaDays: 60,
    schemes: ['Chemical Cluster Infrastructure Scheme', 'Effluent Treatment Plant (ETP) Capital Subsidy'],
    kbLinks: [
      { title: 'SEIAA Environmental Clearance Roadmap', slug: 'seiaa-environmental-clearance' },
      { title: 'MPCB Red Category Consent Procedures', slug: 'mpcb-cte-cto-procedure' },
    ],
  },
  {
    id: 'pharmaceuticals',
    slug: 'pharmaceuticals',
    name: 'Pharmaceuticals & Biotechnology',
    category: 'Healthcare & Life Sciences',
    icon: Pill,
    pollutionCategory: 'RED',
    description:
      'Regulatory compliance for Bulk Drug Active Pharmaceutical Ingredients (APIs), formulations, biotech labs, and clinical units.',
    keyApprovals: [
      'FDA Maharashtra Drug Manufacturing License',
      'MPCB CTE/CTO (Zero Liquid Discharge verification)',
      'DISH Cleanroom & Safety Scrutiny',
      'Bio-Medical Waste Authorization',
    ],
    acts: ['Drugs and Cosmetics Act 1940', 'Water & Air Pollution Acts', 'Bio-Medical Waste Management Rules 2016'],
    avgSlaDays: 40,
    schemes: ['Bulk Drug Park Promotion Scheme', 'Pharma R&D Incentive Policy', 'Patent Registration Subsidy'],
    kbLinks: [
      { title: 'FDA Drug Manufacturing Licensing', slug: 'fda-drug-manufacturing-license' },
      { title: 'Zero Liquid Discharge (ZLD) Compliance', slug: 'zld-compliance-guide' },
    ],
  },
  {
    id: 'it-ites',
    slug: 'it-ites',
    name: 'IT & ITES / Electronics Manufacturing',
    category: 'Technology',
    icon: Laptop,
    pollutionCategory: 'WHITE',
    description:
      'Expedited green-channel approvals for software parks, data centers, ITES call centers, and ESDM electronics manufacturing units.',
    keyApprovals: [
      'IT Park Registration under Directorate of Industries',
      'MPCB White Category Exemption Certificate',
      'Continuous 24x7 Power Clearance from MSEDCL',
      'Shops & Establishment Electronic Registration',
    ],
    acts: ['Maharashtra IT/ITES Policy 2023', 'Shops and Establishments Act 2017', 'Information Technology Act 2000'],
    avgSlaDays: 15,
    schemes: ['Maharashtra IT Policy Electricity Duty Exemption', 'Stamp Duty Exemption for IT Parks', 'ESDM Capital Grant'],
    kbLinks: [{ title: 'Shops & Establishment License Guide', slug: 'shops-establishment-license' }],
  },
  {
    id: 'food-processing',
    slug: 'food-processing',
    name: 'Food Processing & Agro Industries',
    category: 'Agro-Business',
    icon: Utensils,
    pollutionCategory: 'GREEN',
    description:
      'Statutory roadmap for agricultural processing, dairy plants, cold chain logistics, fruit processing, and beverages.',
    keyApprovals: [
      'FSSAI Central / State Food Business License',
      'MPCB CTE/CTO - Green Category',
      'Agro-Marketing Board NOC / APMC Permission',
      'Boiler Inspection Certificate (for steam pasteurization)',
    ],
    acts: ['Food Safety and Standards Act 2006', 'Factories Act 1948', 'Agricultural Produce Market Act'],
    avgSlaDays: 20,
    schemes: ['Pradhan Mantri KISAN SAMPADA Yojana', 'Chief Minister Agriculture & Food Processing Scheme'],
    kbLinks: [
      { title: 'FSSAI Food Licensing Step-by-Step', slug: 'fssai-food-license' },
      { title: 'Boiler Safety Registration', slug: 'boiler-registration-norms' },
    ],
  },
  {
    id: 'textiles',
    slug: 'textiles',
    name: 'Textiles & Apparel',
    category: 'Consumer Goods',
    icon: Shirt,
    pollutionCategory: 'ORANGE',
    description:
      'Regulations for spinning, weaving, garmenting, fabric dyeing, processing units, and textile parks in Maharashtra.',
    keyApprovals: [
      'MPCB CTE/CTO (CETP Connection Verification)',
      'DISH Factory Registration for Textile Units',
      'MIDC Textile Zone Plot Allotment',
      'Labour Law Registration for Textile Workers',
    ],
    acts: ['Textile Processing Regulations', 'Water Pollution Prevention Act', 'Factories Act 1948'],
    avgSlaDays: 25,
    schemes: ['Maharashtra Textile Policy 2023-28', 'Capital Subsidy for Textile Parks', 'Power Tariff Subsidy for Powerlooms'],
    kbLinks: [{ title: 'CETP Connection & Effluent Norms', slug: 'cetp-effluent-norms' }],
  },
  {
    id: 'renewable-energy',
    slug: 'renewable-energy',
    name: 'Renewable Energy & Clean Tech',
    category: 'Energy',
    icon: Zap,
    pollutionCategory: 'WHITE',
    description:
      'Approvals for solar power generation, wind energy farms, green hydrogen plants, and EV battery manufacturing.',
    keyApprovals: [
      'MEDA (Maharashtra Energy Development Agency) Registration',
      'MSETCL / MSEDCL Grid Connectivity & Interconnection NOC',
      'Revenue Dept Land Use Conversion (NA Permission)',
      'MPCB White Category NOC',
    ],
    acts: ['Electricity Act 2003', 'Maharashtra Renewable Energy Policy 2020', 'Land Revenue Code 1966'],
    avgSlaDays: 30,
    schemes: ['State Solar Power Incentive Scheme', 'Green Hydrogen Subsidy Policy', 'Open Access Electricity Duty Concession'],
    kbLinks: [{ title: 'Grid Connectivity & MEDA Registration', slug: 'meda-grid-connectivity' }],
  },
  {
    id: 'msme',
    slug: 'msme',
    name: 'MSME & General Manufacturing',
    category: 'Small & Medium Business',
    icon: Building,
    pollutionCategory: 'GREEN',
    description:
      'Fast-track single-window compliance for micro, small, and medium enterprises operating across industrial clusters.',
    keyApprovals: [
      'Udyam Registration Certificate',
      'Maitri Single Window Consent',
      'MPCB Green Category Auto-Approval',
      'Municipal / Gram Panchayat NOC',
    ],
    acts: ['Micro, Small and Medium Enterprises Development Act 2006', 'Maharashtra Industrial Policy 2019'],
    avgSlaDays: 14,
    schemes: ['MSME Credit Guarantee Scheme (CGTMSE)', 'Capital Interest Subsidy', 'Quality Certification Reimbursement'],
    kbLinks: [{ title: 'Udyam & Maitri Single Window Registration', slug: 'udyam-maitri-guide' }],
  },
  {
    id: 'logistics',
    slug: 'logistics',
    name: 'Logistics & Warehousing',
    category: 'Supply Chain',
    icon: Truck,
    pollutionCategory: 'WHITE',
    description:
      'Approvals for integrated logistics parks, cold storage complexes, multi-modal transport hubs, and fulfillment centers.',
    keyApprovals: [
      'Logistics Park Registration under State Policy',
      'Building Plan Approval for High-Bay Storage',
      'Fire NOC for Warehouse Storage Height',
      'Highway Access Permission (NHAI / MSRDC)',
    ],
    acts: ['Maharashtra Integrated Logistics Policy 2024', 'National Highways Act 1956', 'Building Bye-laws'],
    avgSlaDays: 20,
    schemes: ['Logistics Hub Infrastructure Subsidy', 'Stamp Duty Concession for Logistics Parks'],
    kbLinks: [{ title: 'Warehouse Fire NOC Guidelines', slug: 'warehouse-fire-noc' }],
  },
];
