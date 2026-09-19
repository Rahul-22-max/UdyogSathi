import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthSession } from '@/lib/auth-session';
import { connectToDatabase } from '@/lib/db/mongoose';
import { ProjectModel } from '@/lib/models/project.model';
import { OrganisationModel } from '@/lib/models/organisation.model';
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
      return NextResponse.json({ success: true, projects: [] });
    }

    const rawProjects = await ProjectModel.find({
      $or: [{ ownerUserId: userId }, { createdByUserId: userId }],
      status: { $ne: 'ARCHIVED' },
    })
      .sort({ createdAt: -1 })
      .lean();

    const projects = rawProjects.map((p: any) => ({
      ...p,
      id: p._id.toString(),
      organisationId: p.organisationId?.toString(),
      ownerUserId: p.ownerUserId?.toString(),
    }));

    return NextResponse.json({ success: true, projects });
  } catch (error: any) {
    console.error('[API /api/projects GET Error]:', error);
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

    let organisationId = body.organisationId;
    if (!organisationId && userId) {
      let org = await OrganisationModel.findOne({ ownerUserId: userId }).exec();
      if (!org) {
        org = await OrganisationModel.create({
          name: `${body.name || 'Industrial'} Entity`,
          legalEntityType: 'Private Limited',
          address: body.address || 'MIDC Industrial Area',
          district: body.district || 'Pune',
          taluka: body.taluka || 'Khed',
          state: 'Maharashtra',
          pinCode: '410501',
          ownerUserId: userId,
          isDemoRecord: true,
        });
      }
      organisationId = org._id;
    }

    const projectCode = `PRJ-${(body.district || 'MH').substring(0, 3).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const project = await ProjectModel.create({
      projectCode,
      organisationId,
      ownerUserId: userId,
      createdByUserId: userId,
      name: body.name || 'New Industrial Unit',
      sector: body.sector || 'Manufacturing',
      subSector: body.subSector || 'General Industry',
      district: body.district || 'Pune',
      taluka: body.taluka || 'Khed',
      isMIDC: body.isMIDC ?? true,
      locationType: body.locationType || 'MIDC',
      landArea: body.landArea || 5000,
      builtUpArea: body.builtUpArea || 2500,
      investmentAmount: body.investmentAmount || body.investmentAmountINR || 50000000,
      workforce: body.workforce || body.expectedWorkforce || 50,
      waterReq: body.waterReq || body.waterRequirementKLD || 500,
      powerReq: body.powerReq || body.powerRequirementKW || 100,
      wasteCategory: body.wasteCategory || 'GREEN',
      hazardousMaterials: body.hazardousMaterials ?? false,
      stage: body.stage || body.projectStage || 'SETUP',
      status: 'ACTIVE',
      isDemoRecord: true,
    });

    return NextResponse.json({
      success: true,
      project: {
        ...project.toObject(),
        id: project._id.toString(),
      },
    });
  } catch (error: any) {
    console.error('[API /api/projects POST Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
