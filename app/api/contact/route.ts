import { NextRequest, NextResponse } from 'next/server'
import { apiRateLimiter } from '@/lib/rate-limit'
import { verifyTurnstile } from '@/lib/turnstile'
import { getBrand } from '@/lib/brand'
import { sendCustomerConfirmation, sendInternalNotifications } from '@/lib/email/sendgrid'

export const runtime = 'nodejs'

// Map site identifiers to project types for CRM categorization
function getProjectTypeFromSite(site: string): string {
  const siteToProjectType: Record<string, string> = {
    'rr-los-angeles-ca-1031-exchange': '1031 Exchange',
  }
  return siteToProjectType[site] || 'Unknown'
}

export async function POST(request: NextRequest) {
  const rate = apiRateLimiter.isAllowed(request)
  const stdHeaders = {
    'X-RateLimit-Limit': '5',
    'X-RateLimit-Remaining': rate.remaining.toString(),
    'X-RateLimit-Reset': rate.resetTime.toString(),
  }

  if (!rate.allowed) {
    const retry = Math.ceil((rate.resetTime - Date.now()) / 1000)
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.', retryAfter: retry },
      { status: 429, headers: { ...stdHeaders, 'Retry-After': String(retry) } },
    )
  }

  try {
    const contentType = request.headers.get('content-type') || ''
    const body = contentType.includes('application/json')
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries())

    const zapierWebhookUrl = (process.env.ZAPIER_WEBHOOK || '').trim()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.1031exchangelosangeles.com'

    if (!zapierWebhookUrl) {
      console.error('ZAPIER_WEBHOOK environment variable is not set')
      return NextResponse.json({ error: 'Webhook configuration error' }, { status: 500, headers: stdHeaders })
    }

    // Honeypot check - if you add a honeypot field in the future, check it here
    // Currently not using honeypot since 'company' is a legitimate field

    const payload = {
      ...body,
      projectType: getProjectTypeFromSite('rr-los-angeles-ca-1031-exchange'),
      contractorEmail: process.env.CONTRACTOR_EMAIL || '',
      timestamp: new Date().toISOString(),
      source: process.env.NEXT_PUBLIC_SOURCE || '1031 Exchange Los Angeles Website',
      submitted_at: new Date().toISOString(),
      website_url: siteUrl,
      // helpful tracing for Zapier
      _meta: {
        site: 'rr-los-angeles-ca-1031-exchange',
        route: '/api/contact',
      },
    }

    // Verify Turnstile - REQUIRED
    const token = body['cf-turnstile-response'] || body['turnstileToken'];
    if (!token) {
      console.error("Missing captcha token in request");
      return NextResponse.json({ error: 'Captcha token missing' }, { status: 400, headers: stdHeaders });
    }

    const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined;
    const captchaValid = await verifyTurnstile(token, clientIp);
    if (!captchaValid) {
      console.error("Captcha verification failed");
      return NextResponse.json({ error: 'Captcha verification failed' }, { status: 400, headers: stdHeaders });
    }

    // Normalize URL (avoid missing trailing slash issues)
    const zapierUrl = zapierWebhookUrl.endsWith('/') ? zapierWebhookUrl : `${zapierWebhookUrl}/`

    // Send to Zapier with timeout + simple retries
    let z: Response | undefined
    for (let attempt = 1; attempt <= 3; attempt++) {
      const zapierController = new AbortController()
      const zapierTimeout = setTimeout(() => zapierController.abort(), 20_000)
      try {
        z = await fetch(zapierUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: zapierController.signal,
        })
      } catch (e) {
        console.error('Zapier fetch error:', { attempt, error: e })
      } finally {
        clearTimeout(zapierTimeout)
      }
      if (z && z.ok) break
      await new Promise((r) => setTimeout(r, attempt * 250))
    }

    if (!z || !z.ok) {
      const status = z?.status
      const text = z ? await z.text().catch(() => '') : ''
      console.error('Zapier webhook failed after retries (will continue):', { status, body: text })
      // Do not block UX; continue to email even if Zapier fails
    }

    // Send emails via SendGrid
    const brand = getBrand()
    const lead = {
      name: String(body.name || ''),
      email: String(body.email || ''),
      phone: body.phone ? String(body.phone).replace(/\D/g, '') : undefined,
      phone_plain: body.phone ? String(body.phone).replace(/\D/g, '') : undefined,
      projectType: String(body.projectType || body.service || '1031 Exchange Project'),
      property: body.property ? String(body.property) : undefined,
      estimatedCloseDate: body.estimatedCloseDate ? String(body.estimatedCloseDate) : undefined,
      city: body.city ? String(body.city) : undefined,
      company: body.company ? String(body.company) : undefined,
      timeline: body.timeline ? String(body.timeline) : undefined,
      message: body.message ? String(body.message) : (body.details ? String(body.details) : undefined),
    }

    // Add submitted_date to brand data
    const brandWithDate = {
      ...brand,
      submitted_date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    try {
      await Promise.all([
        sendCustomerConfirmation(brandWithDate, lead),
        sendInternalNotifications(brandWithDate, lead),
      ])
      console.log('SendGrid emails sent successfully to:', body.email)
    } catch (error) {
      console.error("SendGrid email failed", error)
      // continue without blocking UX
    }

    return NextResponse.json({ success: true }, { headers: stdHeaders })
  } catch (error) {
    console.error('Error processing form submission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: stdHeaders })
  }
}
