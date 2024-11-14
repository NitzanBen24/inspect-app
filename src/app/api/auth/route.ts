import { NextRequest, NextResponse } from 'next/server';
import { authorizeUser, removeUserTkn } from '@/app/utils/authUtils';

export async function GET(req: NextRequest): Promise<NextResponse> {
  return authorizeUser(req);    
}

export async function POST(): Promise<NextResponse> {
  return removeUserTkn();
}

