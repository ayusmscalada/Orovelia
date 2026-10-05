// Placeholder product suite — rename and rewrite to match what Orovelia actually sells.
export const products = [
  {
    id: 'aurum',
    name: 'Aurum',
    tagline: 'Your AI co-pilot for every team.',
    description:
      'Aurum learns your company’s knowledge and turns it into instant answers, drafts and automations — securely, in the tools you already use.',
    icon: '✧',
    accent: '#f0b24a',
    features: ['Private knowledge base', 'Draft & summarise anything', 'Slack, Teams & email', 'SOC 2 ready'],
    metric: { value: '12h', label: 'saved per person, weekly' },
  },
  {
    id: 'halo',
    name: 'Halo',
    tagline: 'Analytics that actually explain themselves.',
    description:
      'Halo unifies your data into living dashboards with plain-language insights, anomaly alerts and forecasts that anyone can trust.',
    icon: '◎',
    accent: '#9b6bff',
    features: ['Real-time dashboards', 'Natural-language queries', 'Anomaly detection', '120+ connectors'],
    metric: { value: '4×', label: 'faster decisions' },
  },
  {
    id: 'sail',
    name: 'Sail',
    tagline: 'Workflows that run themselves.',
    description:
      'Sail lets you design automations visually — approvals, hand-offs, notifications — and keeps every process moving without the busywork.',
    icon: '⟡',
    accent: '#ff6b9a',
    features: ['Visual flow builder', 'Approvals & SLAs', 'Audit trail', 'Webhooks & API'],
    metric: { value: '70%', label: 'less manual work' },
  },
  {
    id: 'forge',
    name: 'Forge',
    tagline: 'The design system engine.',
    description:
      'Forge keeps design and code in sync — tokens, components and docs generated from a single source of truth, shipped everywhere.',
    icon: '⬡',
    accent: '#5fd0c5',
    features: ['Design tokens', 'Component library', 'Auto-generated docs', 'Figma sync'],
    metric: { value: '2×', label: 'faster UI delivery' },
  },
];

export const plans = [
  {
    name: 'Starter',
    price: { monthly: 0, yearly: 0 },
    blurb: 'For individuals exploring the suite.',
    features: ['1 product of your choice', 'Up to 3 seats', 'Community support', 'Core integrations'],
    cta: 'Start free',
  },
  {
    name: 'Growth',
    price: { monthly: 49, yearly: 39 },
    blurb: 'For teams ready to move faster.',
    features: ['All four products', 'Up to 50 seats', 'Priority email & chat', 'Advanced automations', 'SSO'],
    cta: 'Start 14-day trial',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: { monthly: null, yearly: null },
    blurb: 'For organisations at scale.',
    features: ['Unlimited seats', 'Dedicated success manager', 'Custom SLAs & security review', 'On-premise option'],
    cta: 'Talk to sales',
  },
];

export const comparison = [
  { feature: 'Seats', values: ['3', '50', 'Unlimited'] },
  { feature: 'Products included', values: ['1', 'All 4', 'All 4'] },
  { feature: 'AI requests / month', values: ['500', '50,000', 'Unlimited'] },
  { feature: 'Single sign-on (SSO)', values: [false, true, true] },
  { feature: 'Audit logs', values: [false, true, true] },
  { feature: 'Dedicated success manager', values: [false, false, true] },
  { feature: 'Uptime SLA', values: ['—', '99.9%', '99.99%'] },
];
