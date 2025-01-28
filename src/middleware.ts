import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {

    const apiKey = req.headers.get('Authorization');
    // Fetch the API key from the environment variables
    const expectedApiKey = process.env.API_KEY;
    
    // If the API key is missing or doesn't match
    if (apiKey !== `Bearer ${expectedApiKey}`) {
      console.log('Access denied: Invalid or missing API key.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
    // If valid, allow the request to proceed
    return NextResponse.next();
  }

export const config = {
    matcher: '/api/:path*',
};
