'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ApprovalWizardPage from '@/app/approval-wizard/page';

export default function LocalizedApprovalWizardPage() {
  const params = useParams();
  const lang = (params?.lang as string) || 'en';

  return <ApprovalWizardPage />;
}
