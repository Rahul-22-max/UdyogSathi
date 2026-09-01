import { NextResponse } from 'next/server';
import { generateApprovalChecklist } from '@/lib/rule-engine';

export async function POST(request: Request) {
  try {
    const wizardInput = await request.json();
    const checklist = await generateApprovalChecklist(wizardInput);
    return NextResponse.json({ success: true, checklist });
  } catch (error) {
    console.error('Wizard API error:', error);
    return NextResponse.json({ error: 'Failed to generate approval checklist.' }, { status: 500 });
  }
}
