import { getAllUsers, getManufactures, getTechnicians } from '@/app/lib/dbObject';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (req: NextRequest, { params }: { params: { type: string } }) => {
    const { type } = params;
    /**
     * get data from db by type => first case manufactures
     */    
    try {
      let response;
      switch(type) {
        case 'manufactures':
          response = await getManufactures();
          break;
        case 'technicians':
          response = await getTechnicians();          
      }

      //const result = await getManufactures();
      return NextResponse.json(response);
    } catch (error) {
      console.error('Error loading PDF template:', error);
      return NextResponse.json({ error: 'Failed to load PDF template' }, { status: 500 });
    }
  } 
  