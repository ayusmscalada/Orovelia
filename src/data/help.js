export const helpCategories = [
  { id: 'getting-started', icon: '✦', title: 'Getting started', text: 'Set up your workspace and invite your team.' },
  { id: 'billing', icon: '◇', title: 'Billing & plans', text: 'Invoices, upgrades, refunds and payment methods.' },
  { id: 'account', icon: '◎', title: 'Account & security', text: 'Passwords, SSO, permissions and data privacy.' },
  { id: 'integrations', icon: '⟡', title: 'Integrations & API', text: 'Connect your tools and build on our platform.' },
];

export const faqs = [
  {
    category: 'getting-started',
    q: 'How do I create my Orovelia workspace?',
    a: 'Click “Start free” on any page, sign up with your work email, and follow the three-step setup. Your workspace is ready in under two minutes.',
  },
  {
    category: 'getting-started',
    q: 'How do I invite teammates?',
    a: 'Open Settings → Members and click “Invite”. You can paste multiple emails at once or share an invite link restricted to your company domain.',
  },
  {
    category: 'getting-started',
    q: 'Is there a guided onboarding?',
    a: 'Yes. Growth and Enterprise customers get a live onboarding session with our Customer Success team. Everyone has access to interactive in-app tours.',
  },
  {
    category: 'billing',
    q: 'Can I switch between monthly and yearly billing?',
    a: 'Anytime from Settings → Billing. Switching to yearly applies a 20% discount and credits any unused monthly balance automatically.',
  },
  {
    category: 'billing',
    q: 'Do you offer refunds?',
    a: 'Yearly plans can be refunded in full within 30 days. Monthly plans can be cancelled anytime and stay active until the end of the billing period.',
  },
  {
    category: 'billing',
    q: 'Which payment methods do you accept?',
    a: 'All major credit cards, Apple Pay and Google Pay. Enterprise customers can also pay by bank transfer against an invoice.',
  },
  {
    category: 'account',
    q: 'How do I reset my password?',
    a: 'Choose “Forgot password” on the sign-in screen. We’ll email you a secure link that expires after 30 minutes.',
  },
  {
    category: 'account',
    q: 'Where is my data stored?',
    a: 'Data is encrypted at rest and in transit, and hosted in the EU or US region you select. We never use your data to train shared models.',
  },
  {
    category: 'account',
    q: 'Do you support single sign-on?',
    a: 'Yes — SAML and OIDC SSO are available on Growth and Enterprise plans, including Okta, Azure AD and Google Workspace.',
  },
  {
    category: 'integrations',
    q: 'Which tools can I connect?',
    a: 'Over 120 integrations including Slack, Microsoft Teams, Google Workspace, Notion, Salesforce, HubSpot, Jira and GitHub.',
  },
  {
    category: 'integrations',
    q: 'Where can I find my API key?',
    a: 'Go to Settings → Developers → API keys. Keys can be scoped per product and rotated at any time.',
  },
  {
    category: 'integrations',
    q: 'Is there a rate limit on the API?',
    a: 'Growth plans allow 600 requests per minute; Enterprise limits are tailored to your needs. Every response includes rate-limit headers.',
  },
];

export const channels = [
  { icon: '✉', title: 'Email support', text: 'support@orovelia.com', note: 'Replies within 4 hours', href: 'mailto:support@orovelia.com' },
  { icon: '◌', title: 'Live chat', text: 'Chat with a human', note: 'Mon–Fri, 24 hours', href: '#chat' },
  { icon: '☏', title: 'Phone', text: '+1 (555) 014-2026', note: 'Enterprise customers', href: 'tel:+15550142026' },
];
