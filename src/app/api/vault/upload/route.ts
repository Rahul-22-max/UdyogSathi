import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import { DocumentModel } from '@/lib/models/document.model';
import { verifyAuthSession } from '@/lib/auth-session';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const authSession = await verifyAuthSession(req);

    const body = await req.json();
    const { name, category = 'IDENTITY', fileUrl, fileType = 'application/pdf', fileSize = 1024000, projectId } = body;

    if (!name || !fileUrl) {
      return NextResponse.json({ success: false, error: 'Name and fileUrl are required' }, { status: 400 });
    }

    const userId = authSession ? authSession.userId : body.userId;
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const doc = await DocumentModel.create({
      userId,
      ownerUserId: userId,
      projectId,
      name,
      documentName: name,
      category,
      fileUrl,
      fileType,
      fileSize,
      sourceType: 'VAULT',
      isVerified: true,
      verificationStatus: 'VERIFIED',
      preValidationScore: 100,
      preValidationStatus: 'PASSED',
      status: 'ACTIVE',
      isDemoRecord: false,
    });

    return NextResponse.json({
      success: true,
      document: {
        ...doc.toObject(),
        id: doc._id.toString(),
      },
    });
  } catch (error: any) {
    console.error('[API /api/vault/upload POST Error]:', error);
    return NextResponse.json({ success: false, error: error.message || 'Upload failed' }, { status: 500 });
  }
}
