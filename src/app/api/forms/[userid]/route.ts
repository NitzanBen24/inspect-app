import { getFormsDataByUserId } from "@/app/services/formService";
import { NextRequest, NextResponse } from 'next/server';

export async function GET (req: NextRequest, { params }: { params: { userid: string } }): Promise<NextResponse> {
    const { userid } = params;
    
    try {

      const data = await getFormsDataByUserId(userid)        
    
      return NextResponse.json(data);

    } catch (error) {
      console.error('Error loading PDF template:', error);
      return NextResponse.json({ error: 'Failed to load PDF template' }, { status: 500 });
    }
  } 