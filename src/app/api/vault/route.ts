import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthSession } from '@/lib/auth-session';
import { connectToDatabase } from '@/lib/db/mongoose';
import { DocumentModel } from '@/lib/models/document.model';
import { UserModel } from '@/lib/models/user.model';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const authSession = await verifyAuthSession(req);

    let userId = authSession ? authSession.userId : null;
    if (!userId) {
      const demoUser = await UserModel.findOne({ role: 'APPLICANT' }).exec();
      userId = demoUser ? demoUser._id.toString() : null;
    }

    if (!userId) {
      return NextResponse.json({ success: true, documents: [] });
    }

    const rawDocs = await DocumentModel.find({
      $or: [{ userId: userId }, { ownerUserId: userId }],
      status: { $ne: 'ARCHIVED' },
    })
      .sort({ createdAt: -1 })
      .lean();

    const documents = rawDocs.map((doc: any) => ({
      ...doc,
      id: doc._id.toString(),
      userId: doc.userId?.toString(),
      organisationId: doc.organisationId?.toString(),
      projectId: doc.projectId?.toString(),
    }));

    return NextResponse.json({ success: true, documents });
  } catch (error: any) {
    console.error('[API /api/vault GET Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const authSession = await verifyAuthSession(req);
    const body = await req.json();

    let userId = authSession ? authSession.userId : body.userId;
    if (!userId) {
      const demoUser = await UserModel.findOne({ role: 'APPLICANT' }).exec();
      userId = demoUser ? demoUser._id.toString() : undefined;
    }

    const doc = await DocumentModel.create({
      userId,
      ownerUserId: userId,
      organisationId: body.organisationId,
      projectId: body.projectId,
      name: body.name || body.documentName || 'Vault Document',
      documentName: body.documentName || body.name || 'Vault Document',
      category: body.category || 'IDENTITY',
      fileUrl: body.fileUrl || '/uploads/sample.pdf',
      fileType: body.fileType || 'application/pdf',
      fileSize: body.fileSize || 1024500,
      sourceType: body.sourceType || 'VAULT',
      isVerified: body.isVerified ?? false,
      verificationStatus: body.verificationStatus || 'PENDING',
      preValidationScore: body.preValidationScore ?? 100,
      status: 'ACTIVE',
      isDemoRecord: true,
    });

    return NextResponse.json({
      success: true,
      document: {
        ...doc.toObject(),
        id: doc._id.toString(),
      },
    });
  } catch (error: any) {
    console.error('[API /api/vault POST Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
