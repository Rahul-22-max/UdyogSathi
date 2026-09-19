import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import { ProjectModel } from '@/lib/models/project.model';
import { verifyAuthSession } from '@/lib/auth-session';
import { assertProjectAccess } from '@/lib/permissions/access-guards';
import { isValidObjectId } from '@/lib/utils/object-id';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: 'Invalid Project ID format' }, { status: 400 });
    }

    const authSession = await verifyAuthSession(req);
    const project = await ProjectModel.findById(id).lean();

    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    if (authSession) {
      try {
        assertProjectAccess(authSession, project);
      } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: err.statusCode || 403 });
      }
    }

    return NextResponse.json({
      success: true,
      project: {
        ...project,
        id: project._id.toString(),
        organisationId: project.organisationId?.toString(),
        ownerUserId: project.ownerUserId?.toString(),
      },
    });
  } catch (error: any) {
    console.error('[API /api/projects/[id] GET Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: 'Invalid Project ID format' }, { status: 400 });
    }

    const authSession = await verifyAuthSession(req);
    if (!authSession) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const project = await ProjectModel.findById(id);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    assertProjectAccess(authSession, project);

    const body = await req.json();
    const allowedUpdates = [
      'name',
      'sector',
      'subSector',
      'district',
      'taluka',
      'landArea',
      'builtUpArea',
      'investmentAmount',
      'workforce',
      'waterReq',
      'powerReq',
      'wasteCategory',
      'hazardousMaterials',
      'stage',
      'status',
    ];

    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        (project as any)[key] = body[key];
      }
    }

    await project.save();

    return NextResponse.json({
      success: true,
      project: {
        ...project.toObject(),
        id: project._id.toString(),
      },
    });
  } catch (error: any) {
    console.error('[API /api/projects/[id] PATCH Error]:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: error.statusCode || 500 });
  }
}
