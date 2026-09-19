import dotenv from 'dotenv';
dotenv.config();

import { connectToDatabase } from '../src/lib/db/mongoose';
import { authenticateUser } from '../src/lib/auth';
import { ensureDemoAccountsExist } from '../src/lib/db/seed-helper';
import mongoose from 'mongoose';

async function testAuthFlow() {
  console.log('🧪 Starting Authentication Verification Test...');

  await connectToDatabase();
  console.log('Connected to MongoDB.');

  await ensureDemoAccountsExist();
  console.log('Demo accounts verified/seeded.');

  const testAccounts = [
    { roleName: 'Applicant', email: 'applicant@udyogsathi.gov.in', expectedRole: 'APPLICANT' },
    { roleName: 'Officer', email: 'officer@udyogsathi.gov.in', expectedRole: 'DEPARTMENT_OFFICER' },
    { roleName: 'Inspector', email: 'inspector@udyogsathi.gov.in', expectedRole: 'INSPECTOR' },
    { roleName: 'Admin', email: 'admin@udyogsathi.gov.in', expectedRole: 'ADMINISTRATOR' },
  ];

  const validPassword = 'Password@123';
  let allPassed = true;

  for (const acc of testAccounts) {
    console.log(`\nTesting ${acc.roleName} login (${acc.email})...`);
    
    // Test valid credentials
    const session = await authenticateUser(acc.email, validPassword);
    if (!session) {
      console.error(`❌ FAILED: Unable to authenticate ${acc.email} with correct password.`);
      allPassed = false;
      continue;
    }

    if (session.role !== acc.expectedRole) {
      console.error(`❌ FAILED: Unexpected role for ${acc.email}. Expected ${acc.expectedRole}, got ${session.role}`);
      allPassed = false;
      continue;
    }

    console.log(`✅ SUCCESS: ${acc.roleName} authenticated! User ID: ${session.id}, Role: ${session.role}`);

    // Test invalid password security constraint
    const invalidSession = await authenticateUser(acc.email, 'WrongPassword@999');
    if (invalidSession !== null) {
      console.error(`❌ FAILED SECURITY CHECK: Invalid password succeeded for ${acc.email}!`);
      allPassed = false;
    } else {
      console.log(`🔒 SECURITY CHECK PASSED: Invalid password correctly rejected for ${acc.email}.`);
    }
  }

  await mongoose.disconnect();

  if (allPassed) {
    console.log('\n🎉 ALL AUTHENTICATION TESTS PASSED FOR ALL 4 ROLES!');
    process.exit(0);
  } else {
    console.error('\n❌ SOME AUTHENTICATION TESTS FAILED.');
    process.exit(1);
  }
}

testAuthFlow().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
