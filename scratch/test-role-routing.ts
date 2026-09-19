import { normalizeRole, getRoleDashboardPath, isRouteAllowedForRole, getSafeAuthorizedReturnTo } from '@/lib/rbac';

function testRoleRouting() {
  console.log('🧪 Testing Canonical Role Normalization & Dashboard Routing...');

  const tests = [
    { input: 'INSPECTOR', expectedNorm: 'inspector', expectedPath: '/inspector/dashboard' },
    { input: 'FIELD_INSPECTION_OFFICER', expectedNorm: 'inspector', expectedPath: '/inspector/dashboard' },
    { input: 'Field Inspection Officer', expectedNorm: 'inspector', expectedPath: '/inspector/dashboard' },
    { input: 'inspection_officer', expectedNorm: 'inspector', expectedPath: '/inspector/dashboard' },
    { input: 'DEPARTMENT_OFFICER', expectedNorm: 'department_officer', expectedPath: '/officer/dashboard' },
    { input: 'Department Officer', expectedNorm: 'department_officer', expectedPath: '/officer/dashboard' },
    { input: 'officer', expectedNorm: 'department_officer', expectedPath: '/officer/dashboard' },
    { input: 'ADMINISTRATOR', expectedNorm: 'administrator', expectedPath: '/admin/dashboard' },
    { input: 'State Administrator', expectedNorm: 'administrator', expectedPath: '/admin/dashboard' },
    { input: 'APPLICANT', expectedNorm: 'applicant', expectedPath: '/dashboard' },
    { input: 'Entrepreneur', expectedNorm: 'applicant', expectedPath: '/dashboard' },
  ];

  let passed = 0;
  for (const t of tests) {
    const norm = normalizeRole(t.input);
    const path = getRoleDashboardPath(t.input);
    const isOk = norm === t.expectedNorm && path === t.expectedPath;
    console.log(
      `${isOk ? '✅' : '❌'} Role: "${t.input}" => norm: "${norm}" (expected "${t.expectedNorm}"), path: "${path}" (expected "${t.expectedPath}")`
    );
    if (isOk) passed++;
  }

  console.log('\n🔒 Testing Security & Authorized returnTo Validation...');

  const returnToTests = [
    // Inspector tests
    { role: 'INSPECTOR', returnTo: '/officer/dashboard', expected: '/inspector/dashboard' },
    { role: 'Field Inspection Officer', returnTo: '/officer/dashboard', expected: '/inspector/dashboard' },
    { role: 'INSPECTOR', returnTo: '/inspector/dashboard', expected: '/inspector/dashboard' },
    { role: 'INSPECTOR', returnTo: '/admin/dashboard', expected: '/inspector/dashboard' },
    { role: 'INSPECTOR', returnTo: 'https://malicious.com', expected: '/inspector/dashboard' },
    { role: 'INSPECTOR', returnTo: '//malicious.com', expected: '/inspector/dashboard' },

    // Officer tests
    { role: 'DEPARTMENT_OFFICER', returnTo: '/officer/dashboard', expected: '/officer/dashboard' },
    { role: 'DEPARTMENT_OFFICER', returnTo: '/inspector/dashboard', expected: '/officer/dashboard' },

    // Applicant tests
    { role: 'APPLICANT', returnTo: '/admin/dashboard', expected: '/dashboard' },
    { role: 'APPLICANT', returnTo: '/dashboard', expected: '/dashboard' },
  ];

  let returnToPassed = 0;
  for (const rt of returnToTests) {
    const safePath = getSafeAuthorizedReturnTo({ returnTo: rt.returnTo, roleInput: rt.role });
    const isOk = safePath === rt.expected;
    console.log(
      `${isOk ? '✅' : '❌'} User Role: "${rt.role}" with returnTo="${rt.returnTo}" => safePath: "${safePath}" (expected "${rt.expected}")`
    );
    if (isOk) returnToPassed++;
  }

  if (passed === tests.length && returnToPassed === returnToTests.length) {
    console.log('\n🎉 ALL ROLE ROUTING AND SECURITY TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('\n❌ SOME ROUTING TESTS FAILED!');
    process.exit(1);
  }
}

testRoleRouting();
