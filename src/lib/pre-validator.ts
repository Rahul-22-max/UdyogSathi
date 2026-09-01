import { PreValidationResult } from '@/types';

export interface DocumentItem {
  id?: string;
  name: string;
  category: string;
  fileType: string;
  fileSize: number;
  expiryDate?: Date | string | null;
  isVerified?: boolean;
}

export function evaluatePreValidation(
  requiredDocumentNames: string[],
  uploadedDocuments: DocumentItem[]
): PreValidationResult {
  const missingDocuments: string[] = [];
  const expiredDocuments: string[] = [];
  const warnings: string[] = [];

  const uploadedNames = uploadedDocuments.map(d => d.name.toLowerCase());

  // Check required docs presence
  for (const reqDoc of requiredDocumentNames) {
    const matched = uploadedNames.some(name =>
      name.includes(reqDoc.toLowerCase()) || reqDoc.toLowerCase().includes(name)
    );

    if (!matched) {
      missingDocuments.push(reqDoc);
    }
  }

  // Check file types, sizes, and expiry
  for (const doc of uploadedDocuments) {
    if (doc.fileSize > 10 * 1024 * 1024) {
      warnings.push(`Document '${doc.name}' exceeds maximum recommended size of 10MB.`);
    }

    if (doc.expiryDate) {
      const exp = new Date(doc.expiryDate);
      if (exp < new Date()) {
        expiredDocuments.push(`${doc.name} (Expired on ${exp.toLocaleDateString()})`);
      } else if (exp.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000) {
        warnings.push(`Document '${doc.name}' is expiring within 30 days.`);
      }
    }
  }

  const totalReqCount = requiredDocumentNames.length || 1;
  const presentCount = totalReqCount - missingDocuments.length;
  let score = Math.round((presentCount / totalReqCount) * 100);

  if (expiredDocuments.length > 0) {
    score = Math.max(0, score - 20 * expiredDocuments.length);
  }

  const isReady = missingDocuments.length === 0 && expiredDocuments.length === 0;

  return {
    readinessScore: Math.min(100, Math.max(0, score)),
    missingDocuments,
    expiredDocuments,
    warnings,
    metadataMatch: true,
    isReadyForSubmission: isReady,
  };
}
