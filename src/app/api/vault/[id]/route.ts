import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import { DocumentModel } from '@/lib/models/document.model';
import { verifyAuthSession } from '@/lib/auth-session';
import { isValidObjectId } from '@/lib/utils/object-id';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: 'Invalid Document ID format' }, { status: 400 });
    }

    const authSession = await verifyAuthSession(req);
    const document = await DocumentModel.findById(id).lean();

    if (!document) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    if (authSession && authSession.role === 'APPLICANT') {
      const ownerId = document.userId?.toString() || document.ownerUserId?.toString();
      if (ownerId && ownerId !== authSession.userId) {
        return NextResponse.json({ success: false, error: 'Forbidden: Access to this document is restricted.' }, { status: 403 });
      }
    }

    return NextResponse.json({
      success: true,
      document: {
        ...document,
        id: document._id.toString(),
        userId: document.userId?.toString(),
        ownerUserId: document.ownerUserId?.toString(),
      },
    });
  } catch (error: any) {
    console.error('[API /api/vault/[id] GET Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: 'Invalid Document ID format' }, { status: 400 });
    }

    const authSession = await verifyAuthSession(req);
    if (!authSession) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const document = await DocumentModel.findById(id);
    if (!document) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    if (authSession.role === 'APPLICANT') {
      const ownerId = document.userId?.toString() || document.ownerUserId?.toString();
      if (ownerId && ownerId !== authSession.userId) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
    }

    const body = await req.json();
    if (body.name) document.name = body.name;
    if (body.documentName) document.documentName = body.documentName;
    if (body.category) document.category = body.category;
    if (body.isVerified !== undefined) document.isVerified = body.isVerified;
    if (body.verificationStatus) document.verificationStatus = body.verificationStatus;
    if (body.reuseConsent !== undefined) document.reuseConsent = body.reuseConsent;

    await document.save();

    return NextResponse.json({
      success: true,
      document: {
        ...document.toObject(),
        id: document._id.toString(),
      },
    });
  } catch (error: any) {
    console.error('[API /api/vault/[id] PATCH Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
