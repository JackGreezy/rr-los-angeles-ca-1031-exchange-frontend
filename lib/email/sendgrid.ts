import sgMail from '@sendgrid/mail';

let apiKeyInitialized = false;

function ensureApiKeyInitialized() {
  if (apiKeyInitialized) return;
  
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('Missing SENDGRID_API_KEY');
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  apiKeyInitialized = true;
}

export const SENDGRID_TEMPLATE_ID = process.env.SENDGRID_TEMPLATE_ID || 'd-15217ab1c55347b5847c2421b1a82847';

type Lead = {
  name: string;
  email: string;
  phone?: string;
  phone_plain?: string;
  projectType: string;
  property?: string;
  estimatedCloseDate?: string;
  city?: string;
  company?: string;
  timeline?: string;
  message?: string;
};

type BrandData = {
  subject?: string;
  preheader?: string;
  company_name: string;
  logo_url?: string;
  city_state?: string;
  brand_accent?: string;
  cta_dark_bg?: string;
  bg_color?: string;
  text_dark?: string;
  text_muted?: string;
  text_body?: string;
  text_faint?: string;
  border_color?: string;
  card_header_bg?: string;
  card_header_text?: string;
  header_text_color?: string;
  footer_text_color?: string;
  hero_title?: string;
  hero_subtitle?: string;
  details_title?: string;
  call_cta_label?: string;
  call_phone?: string;
  call_phone_plain?: string;
  site_cta_label?: string;
  site_url?: string;
  address_line?: string;
  footer_note?: string;
  submitted_date?: string;
  supportEmail?: string;
};

export async function sendCustomerConfirmation(brand: BrandData, lead: Lead) {
  ensureApiKeyInitialized();
  const fromEmail = brand.supportEmail || 'help@1031exchangelosangeles.com';
  const msg = {
    to: lead.email,
    from: { email: fromEmail, name: brand.company_name },
    templateId: SENDGRID_TEMPLATE_ID,
    dynamicTemplateData: { ...brand, lead },
  };
  await sgMail.send(msg);
}

export async function sendInternalNotifications(brand: BrandData, lead: Lead) {
  ensureApiKeyInitialized();
  const fromEmail = brand.supportEmail || 'help@1031exchangelosangeles.com';
  const recipients = [
    process.env.CONTRACTOR_EMAIL,
    'rankhoundseo@gmail.com',
  ].filter(Boolean) as string[];

  const sends = recipients.map(email =>
    sgMail.send({
      to: email,
      from: { email: fromEmail, name: brand.company_name },
      templateId: SENDGRID_TEMPLATE_ID,
      dynamicTemplateData: { ...brand, lead },
    })
  );
  await Promise.all(sends);
}



