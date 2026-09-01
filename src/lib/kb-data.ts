export interface KBArticle {
  id: string;
  slug: string;
  title: string;
  category: 'Environmental & MPCB' | 'Factory Safety & DISH' | 'MIDC Land & Infrastructure' | 'Fire & Boiler Safety' | 'Power & Utilities' | 'Labour & Compliance';
  summary: string;
  content: string[];
  department: string;
  statutoryAct: string;
  slaDays: number;
  requiredDocs: string[];
  sourceRef: string;
  relatedSectors: string[];
}

export const KB_ARTICLES: KBArticle[] = [
  {
    id: 'mpcb-cte-cto-procedure',
    slug: 'mpcb-cte-cto-procedure',
    title: 'MPCB Consent to Establish (CTE) & Consent to Operate (CTO) Procedure',
    category: 'Environmental & MPCB',
    summary:
      'Detailed statutory process for obtaining environmental NOCs from Maharashtra Pollution Control Board based on White, Green, Orange, and Red pollution indices.',
    content: [
      'Under the Water (Prevention and Control of Pollution) Act 1974 and Air Act 1981, any industrial unit emitting trade effluent or air emissions must obtain Consent to Establish (CTE) before starting civil construction.',
      'White Category units (Pollution Index up to 20) are exempt from CTE/CTO subject to self-declaration filing on the MPCB portal.',
      'Green (PI 21-40) and Orange (PI 41-59) category units enjoy expedited auto-renewal facilities upon submiting compliance audit reports.',
      'Red Category (PI 60+) requires mandatory presentation before the MPCB Consent Committee and site inspection by Regional Officers.',
      'Consent to Operate (CTO) must be obtained prior to commercial production, valid for 1 to 5 years depending on the pollution risk grade.',
    ],
    department: 'Maharashtra Pollution Control Board (MPCB)',
    statutoryAct: 'Water Act 1974 & Air Act 1981',
    slaDays: 45,
    requiredDocs: [
      'Project Report & Manufacturing Process Flowchart',
      'MIDC Land Allotment Letter / Revenue NA Permission',
      'Effluent Treatment Plant (ETP) / STP Engineering Layout',
      'Air Pollution Control Equipment (APCE) Specs',
      'Water Balance Sheet & Material Balance Details',
    ],
    sourceRef: 'MPCB Circular No. MPCB/JD(WPC)/B-210412-FTS-0012',
    relatedSectors: ['Chemicals & Petrochemicals', 'Pharmaceuticals & Biotechnology', 'Manufacturing & Heavy Engineering'],
  },
  {
    id: 'dish-factory-plan-approval',
    slug: 'dish-factory-plan-approval',
    title: 'DISH Factory Plan Approval & Occupational Safety Standards',
    category: 'Factory Safety & DISH',
    summary:
      'Mandatory building layout and worker safety scrutiny requirements enforced by Directorate of Industrial Safety & Health (DISH) Maharashtra under the Factories Act 1948.',
    content: [
      'Every factory employing 10 or more workers with power (or 20 without power) must submit structural architectural plans to DISH before erecting new industrial buildings.',
      'The plan must demonstrate adequate ventilation (min 500 cu ft space per worker), emergency escape exits, hazardous machine guarding, lighting lux levels, and sanitation facilities.',
      'High-risk chemical and heavy manufacturing factories require submission of Safety Reports, On-Site Emergency Plans, and HAZOP study audits.',
      'Upon plan approval, the owner must apply for Factory License Registration prior to employing workers.',
    ],
    department: 'Directorate of Industrial Safety & Health (DISH) Maharashtra',
    statutoryAct: 'The Factories Act, 1948 & Maharashtra Factories Rules 1963',
    slaDays: 30,
    requiredDocs: [
      'Architectural Layout Plan (Flow of Raw Materials to Finished Goods)',
      'Structural Stability Certificate by Chartered Engineer',
      'Process Hazard Analysis & Safety Machinery Specs',
      'Form 1 (Application for Plan Approval)',
    ],
    sourceRef: 'DISH Maharashtra Notification DISH/2023/ACT-1948/NORMS',
    relatedSectors: ['Automotive & Heavy Engineering', 'Textiles & Apparel', 'Manufacturing & Heavy Engineering'],
  },
  {
    id: 'midc-land-water-allotment',
    slug: 'midc-land-water-allotment',
    title: 'MIDC Industrial Land Allotment, Water Connection & Building Permitting',
    category: 'MIDC Land & Infrastructure',
    summary:
      'Step-by-step guidance on securing industrial plots, obtaining water tap-in permissions, and getting building approval inside MIDC industrial estates.',
    content: [
      'Industrial plots across MIDC industrial parks are allotted on a 95-year leasehold basis via the MIDC e-Bidding and Priority Allotment Portal.',
      'After executing the Lease Agreement, the allottee must submit building plan drawings to the MIDC Special Planning Authority (SPA) for Building Commencement Certificate (CC).',
      'Industrial water supply tap-in connections are released by MIDC Executive Engineers after verifying pipeline network distance and water requirement KLD.',
      'Building Completion Certificate (BCC) must be obtained within 3 years of plot possession.',
    ],
    department: 'Maharashtra Industrial Development Corporation (MIDC)',
    statutoryAct: 'MIDC Act 1961 & MIDC Building Regulations 2021',
    slaDays: 21,
    requiredDocs: [
      'Detailed Project Report (DPR) with Financial Closure Proof',
      'MIDC Land Allotment Application & EMD Deposit Receipt',
      'Architectural Drawings as per MIDC Building Bye-laws',
      'MPCB Consent to Establish (CTE) Copy',
    ],
    sourceRef: 'MIDC Circular SPA/BCC/2024/098',
    relatedSectors: ['All Industrial Sectors', 'Logistics & Warehousing', 'IT & ITES / Electronics'],
  },
  {
    id: 'provisional-fire-noc-guidelines',
    slug: 'provisional-fire-noc-guidelines',
    title: 'Provisional & Final Fire NOC Norms for Industrial Buildings',
    category: 'Fire & Boiler Safety',
    summary:
      'Comprehensive fire safety norms, hydrant spacing, hose reel requirements, and approval procedure by Maharashtra Fire Services & MIDC Fire Wing.',
    content: [
      'Provisional Fire NOC is issued during the building design phase based on structural height, total built-up area, and occupant load.',
      'Industrial buildings are classified as Group G (Industrial) or Group H (Storage) under the National Building Code (NBC) 2016 Part 4.',
      'Automatic sprinkler systems, fire hydrants, static water storage tanks (min 50,000 to 2,50,000 liters), and fire alarm control panels are mandatory for units over 500 sq m.',
      'Final Fire NOC is granted following physical testing and inspection by a Licensed Fire Officer before issuing Building Completion Certificate.',
    ],
    department: 'Maharashtra Fire Services & MIDC Fire Department',
    statutoryAct: 'Maharashtra Fire Prevention and Life Safety Measures Act 2006',
    slaDays: 15,
    requiredDocs: [
      'Fire Evacuation & Hydrant Layout Plan',
      'Architectural Layout approved by SPA',
      'Form A Certificate from Licensed Fire Agency',
      'Water Tank Capacity Calculation Sheet',
    ],
    sourceRef: 'Directorate of Maharashtra Fire Services Circular MFS/NOC-NORMS/2023',
    relatedSectors: ['Chemicals & Petrochemicals', 'Logistics & Warehousing', 'Manufacturing & Heavy Engineering'],
  },
  {
    id: 'msedcl-ht-power-connection',
    slug: 'msedcl-ht-power-connection',
    title: 'MSEDCL High Tension (HT) Industrial Power Connection Guidelines',
    category: 'Power & Utilities',
    summary:
      'Technical approval process for 11kV, 22kV, or 33kV high tension power connections, transformer commissioning, and electrical inspectorate testing.',
    content: [
      'Industrial units requiring connected load above 100 kW / 100 kVA must apply for High Tension (HT) power supply from MSEDCL.',
      'The applicant must submit load justification, transformer rating details, single-line electrical diagram (SLD), and capacitor panel specs.',
      'The Chief Electrical Inspectorate (CEI) inspects the substation installation, transformer oil breakdown voltage, and earth pit resistance prior to charging.',
      'MSEDCL issues the Demand Note for service line charges, security deposit, and meter installation upon CEI clearance.',
    ],
    department: 'Maharashtra State Electricity Distribution Co. Ltd. (MSEDCL)',
    statutoryAct: 'Electricity Act 2003 & MERC Supply Code Regulations',
    slaDays: 30,
    requiredDocs: [
      'Single Line Electrical Diagram (SLD) signed by Electrical Contractor',
      'Chief Electrical Inspectorate (CEI) Approval Certificate',
      'Proof of Ownership / MIDC Lease Deed',
      'Load Sanction Application Form (Form A1)',
    ],
    sourceRef: 'MSEDCL Commercial Circular No. 342/2024',
    relatedSectors: ['Automotive & Heavy Engineering', 'Renewable Energy & Clean Tech', 'Textiles & Apparel'],
  },
  {
    id: 'boiler-registration-norms',
    slug: 'boiler-registration-norms',
    title: 'Steam Boiler Registration & Annual Statutory Scrutiny',
    category: 'Fire & Boiler Safety',
    summary:
      'Registration, hydraulic pressure testing, and annual inspection procedures under Directorate of Steam Boilers Maharashtra.',
    content: [
      'Any closed vessel exceeding 22.7 liters capacity used for generating steam under pressure falls under the Indian Boilers Act 1923.',
      'Boiler drawings, shell thickness certificates, safety valve specs, and welder qualification certificates must be registered before erection.',
      'The Inspector of Boilers performs hydraulic pressure testing (1.5x working pressure) prior to issuing the Boiler Fitness Certificate.',
      'Boiler operation must be supervised by a qualified First / Second Class Boiler Attendant holding a valid state certificate.',
    ],
    department: 'Directorate of Steam Boilers, Maharashtra State',
    statutoryAct: 'The Indian Boilers Act, 1923 & Maharashtra Boiler Rules 1962',
    slaDays: 20,
    requiredDocs: [
      'Boiler Manufacturer Data Report (Form II, III, IV)',
      'Steam & Feed Water Piping Layout Drawings',
      'Welder Qualification & Radiography Test Reports',
      'Boiler Attendant Certificate Copy',
    ],
    sourceRef: 'Directorate of Steam Boilers Guideline DSB/REG-2023/CIRCULAR',
    relatedSectors: ['Food Processing & Agro Industries', 'Pharmaceuticals & Biotechnology', 'Textiles & Apparel'],
  },
];
