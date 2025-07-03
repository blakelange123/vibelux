import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // In a real app, you would get the customer ID from your database
    // For now, we'll create a portal session with the email
    const { customerId } = await req.json();

    if (!customerId) {
      // If no customer ID, you might want to look it up from your database
      return new NextResponse('Customer ID required', { status: 400 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Stripe portal error:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}