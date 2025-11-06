import { NextResponse } from 'next/server';

/**
 * Health check endpoint for monitoring
 * GET /api/health
 */
export async function GET() {
  try {
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    });
  } catch {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
