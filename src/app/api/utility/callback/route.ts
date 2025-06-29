import { NextRequest, NextResponse } from 'next/server';
import { UtilityIntegrationClient } from '@/lib/utility-integration/utility-api-client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    if (error) {
      // Handle user denial or other errors
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings/utility-connection?error=${error}`
      );
    }
    
    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings/utility-connection?error=missing_params`
      );
    }
    
    const client = new UtilityIntegrationClient();
    await client.handleOAuthCallback(code, state);
    
    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/utility-connection?success=true`
    );
    
  } catch (error) {
    console.error('Utility OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/utility-connection?error=callback_failed`
    );
  }
}