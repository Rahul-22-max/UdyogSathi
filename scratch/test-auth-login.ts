import { connectToDatabase } from '@/lib/db/mongoose';
import { authenticateUser } from '@/lib/auth';

async function testAuth() {
  console.log('Testing authenticateUser helper...');
  await connectToDatabase();

  const applicant = await authenticateUser('applicant@udyogsathi.gov.in', 'Password@123');
  console.log('Applicant login result:', applicant ? 'SUCCESS' : 'FAILED');
  if (applicant) {
    console.log('User Details:', { id: applicant.id, email: applicant.email, role: applicant.role });
  }

  const officer = await authenticateUser('officer@udyogsathi.gov.in', 'Password@123');
  console.log('Officer login result:', officer ? 'SUCCESS' : 'FAILED');

  const inspector = await authenticateUser('inspector@udyogsathi.gov.in', 'Password@123');
  console.log('Inspector login result:', inspector ? 'SUCCESS' : 'FAILED');

  const invalid = await authenticateUser('applicant@udyogsathi.gov.in', 'WrongPassword@123');
  console.log('Invalid password login result:', invalid === null ? 'SUCCESS (Rejected)' : 'FAILED');

  if (applicant && officer && inspector && invalid === null) {
    console.log('🎉 ALL AUTH VERIFICATIONS PASSED!');
    process.exit(0);
  } else {
    console.error('❌ SOME AUTH VERIFICATIONS FAILED!');
    process.exit(1);
  }
}

testAuth();
