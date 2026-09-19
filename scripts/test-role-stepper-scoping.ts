import { normalizeRole } from '../src/lib/rbac';

console.log('--- Testing Role Normalization & Stepper Scoping Logic ---');

const testRoles = [
  { input: 'APPLICANT', expectedNorm: 'applicant', showStepper: true },
  { input: 'entrepreneur', expectedNorm: 'applicant', showStepper: true },
  { input: 'DEPARTMENT_OFFICER', expectedNorm: 'department_officer', showStepper: false },
  { input: 'officer', expectedNorm: 'department_officer', showStepper: false },
  { input: 'Field Inspection Officer', expectedNorm: 'inspector', showStepper: false },
  { input: 'INSPECTOR', expectedNorm: 'inspector', showStepper: false },
  { input: 'ADMINISTRATOR', expectedNorm: 'administrator', showStepper: false },
  { input: 'State Administrator', expectedNorm: 'administrator', showStepper: false },
  { input: undefined, expectedNorm: 'guest', showStepper: true }, // unauthenticated public
];

let failed = false;

for (const t of testRoles) {
  const norm = normalizeRole(t.input);
  const isAuthenticated = t.input !== undefined;
  const showStepper = !isAuthenticated || norm === 'applicant';

  const normMatch = norm === t.expectedNorm;
  const stepperMatch = showStepper === t.showStepper;

  if (normMatch && stepperMatch) {
    console.log(`[PASS] Role: "${t.input}" -> Normalized: "${norm}" | Show Stepper: ${showStepper}`);
  } else {
    console.error(`[FAIL] Role: "${t.input}" -> Normalized: "${norm}" (expected "${t.expectedNorm}") | Show Stepper: ${showStepper} (expected ${t.showStepper})`);
    failed = true;
  }
}

if (failed) {
  console.error('\nTests FAILED!');
  process.exit(1);
} else {
  console.log('\nAll role normalization & stepper scoping tests PASSED successfully!');
}
