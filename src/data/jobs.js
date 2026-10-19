// Placeholder listings — swap for real data (or an API call) when the backend is ready.
// Each industry has a lead recruiter (see team.js) who owns its listings.

export const industries = [
  {
    id: 'hospitality',
    name: 'Hospitality & Restaurants',
    icon: '🍳',
    hue: 30,
    recruiter: 'lucia-romero',
    blurb: 'Kitchens, dining rooms and hotels that run on great people.',
    occupations: ['Line Cook', 'Prep Cook', 'Server', 'Barista', 'Dishwasher', 'Housekeeper', 'Front Desk Agent'],
  },
  {
    id: 'transport',
    name: 'Transportation & Logistics',
    icon: '🚚',
    hue: 210,
    recruiter: 'jake-morrison',
    blurb: 'Delivery, driving and dispatch roles that keep cities moving.',
    occupations: ['Delivery Driver', 'CDL Truck Driver', 'Dispatcher', 'Courier', 'Forklift Operator'],
  },
  {
    id: 'office',
    name: 'Office & Professional',
    icon: '💼',
    hue: 260,
    recruiter: 'lucia-romero',
    blurb: 'Admin, reception and remote support for growing teams.',
    occupations: ['Receptionist', 'Office Assistant', 'Bookkeeper', 'IT Support Assistant', 'Customer Service Rep'],
  },
  {
    id: 'trades',
    name: 'Construction & Skilled Trades',
    icon: '🔧',
    hue: 45,
    recruiter: 'darnell-brooks',
    blurb: 'Licensed and apprentice work with contractors you can trust.',
    occupations: ['Electrician', 'Plumber', 'Carpenter', 'HVAC Technician', 'General Laborer', 'Painter'],
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Caregiving',
    icon: '🩺',
    hue: 160,
    recruiter: 'priya-raman',
    blurb: 'Clinics, home care and senior living with real impact.',
    occupations: ['Medical Assistant', 'Elderly Caregiver', 'Home Health Aide', 'CNA', 'Pharmacy Technician'],
  },
  {
    id: 'retail',
    name: 'Retail & Customer Service',
    icon: '🛒',
    hue: 330,
    recruiter: 'jake-morrison',
    blurb: 'Stores and service counters with flexible, local shifts.',
    occupations: ['Cashier', 'Sales Associate', 'Stock Associate', 'Store Supervisor'],
  },
  {
    id: 'cleaning',
    name: 'Cleaning & Home Services',
    icon: '🧹',
    hue: 190,
    recruiter: 'priya-raman',
    blurb: 'Households and businesses looking for reliable hands.',
    occupations: ['House Cleaner', 'Janitor', 'Nanny', 'Landscaper', 'Handyman'],
  },
  {
    id: 'warehouse',
    name: 'Warehouse & Manufacturing',
    icon: '📦',
    hue: 15,
    recruiter: 'darnell-brooks',
    blurb: 'Day, night and weekend shifts with weekly pay.',
    occupations: ['Warehouse Associate', 'Picker / Packer', 'Machine Operator', 'Quality Inspector'],
  },
];

export const jobTypes = ['Full-time', 'Part-time', 'Shift work', 'Contract'];

// Defaults per industry so each listing only spells out what's unique to it.
const defaults = {
  hospitality: {
    requirements: ['Food handler card (or willing to get one)', 'Comfortable standing for long shifts', 'Team-first attitude'],
    benefits: ['Free shift meal', 'Weekly pay', 'Tips shared fairly'],
  },
  transport: {
    requirements: ['Valid driver’s license and clean record', 'Able to lift 50 lbs', 'Smartphone for route app'],
    benefits: ['Fuel card', 'Weekly pay', 'Paid time off'],
  },
  office: {
    requirements: ['Confident with email and spreadsheets', 'Clear, friendly communication', 'Organised and dependable'],
    benefits: ['Health insurance', 'Paid holidays', '401(k) match'],
  },
  trades: {
    requirements: ['Relevant license or apprenticeship', 'Own basic hand tools', 'Reliable transportation'],
    benefits: ['Tool allowance', 'Overtime available', 'Health & dental'],
  },
  healthcare: {
    requirements: ['CPR/BLS certification', 'Background check required', 'Compassionate and patient'],
    benefits: ['Health insurance', 'Paid training', 'Mileage reimbursement'],
  },
  retail: {
    requirements: ['Friendly with customers', 'Basic math and cash handling', 'Weekend availability'],
    benefits: ['Employee discount', 'Flexible scheduling', 'Paid time off'],
  },
  cleaning: {
    requirements: ['Attention to detail', 'Reliable transportation', 'References preferred'],
    benefits: ['Supplies provided', 'Flexible hours', 'Same-week pay'],
  },
  warehouse: {
    requirements: ['Able to lift 50 lbs', 'Steel-toe boots', 'Comfortable with scanners'],
    benefits: ['Weekly pay', 'Shift differential', 'Health insurance'],
  },
};

const raw = [
  ['line-cook-nashville', 'Line Cook', 'hospitality', 'Hearth & Hollow Kitchen', 'Nashville', 'TN', 'Full-time', 'Evenings & weekends', 18, 22, 'hour', 1, { urgent: true, summary: 'A busy neighborhood kitchen known for wood-fired seasonal plates is looking for a line cook who loves a fast service and a clean station.', responsibilities: ['Run the grill or sauté station during dinner service', 'Prep mise en place to recipe standards', 'Keep the line clean and organised', 'Communicate tickets with the expo'] }],
  ['medical-assistant-sacramento', 'Medical Assistant', 'healthcare', 'Riverbend Family Clinic', 'Sacramento', 'CA', 'Full-time', 'Mon–Fri, 8am–4:30pm', 22, 25.5, 'hour', 2, { summary: 'A family practice serving 4,000 patients needs a warm, organised medical assistant to keep clinic days running smoothly.', responsibilities: ['Room patients and take vitals', 'Update electronic health records', 'Schedule follow-ups and referrals', 'Support providers during procedures'] }],
  ['it-support-remote', 'IT Support Assistant', 'office', 'Brightline Accounting', 'Remote', 'US', 'Full-time', 'Mon–Fri, flexible', 21, 26, 'hour', 3, { remote: true, summary: 'Help a 60-person accounting firm stay online — password resets, laptop setup and friendly troubleshooting over chat and video.', responsibilities: ['Resolve help-desk tickets by chat and video', 'Set up laptops and accounts for new hires', 'Maintain the device inventory', 'Write simple how-to guides'] }],
  ['electrician-slc', 'Journeyman Electrician', 'trades', 'Wasatch Power & Light Contractors', 'Salt Lake City', 'UT', 'Full-time', 'Mon–Fri, 7am–3:30pm', 32, 40, 'hour', 1, { urgent: true, summary: 'Commercial and residential electrical contractor growing its service team. Steady work, newer trucks, and a foreman who actually mentors.', responsibilities: ['Install and repair wiring, panels and fixtures', 'Read blueprints and follow NEC code', 'Troubleshoot service calls', 'Mentor apprentices on site'], requirements: ['Utah journeyman license', '4+ years field experience', 'Valid driver’s license'] }],
  ['warehouse-night-atlanta', 'Warehouse Associate — Night Shift', 'warehouse', 'Peachtree Fulfillment', 'Atlanta', 'GA', 'Shift work', 'Nights, 10pm–6:30am', 19, 21, 'hour', 0, { summary: 'Pick, pack and ship for a regional e-commerce hub. Night shift pays a $2/hr differential and you’ll never sit in rush-hour traffic.', responsibilities: ['Pick orders using a handheld scanner', 'Pack and label shipments', 'Load outbound trailers', 'Keep aisles safe and tidy'] }],
  ['caregiver-phoenix', 'Elderly Caregiver', 'healthcare', 'Sunrise Home Companions', 'Phoenix', 'AZ', 'Part-time', 'Flexible, 20–30 hrs/week', 17, 20, 'hour', 2, { summary: 'Provide companionship and daily support to seniors in their own homes. Matched with clients near you — no long commutes.', responsibilities: ['Assist with meals, bathing and mobility', 'Provide medication reminders', 'Offer companionship and light housekeeping', 'Log visit notes in the app'] }],
  ['delivery-driver-dallas', 'Delivery Driver', 'transport', 'Lone Star Parcel', 'Dallas', 'TX', 'Full-time', 'Mon–Fri, 8am–5pm', 20, 23, 'hour', 1, { summary: 'Local route delivery in a branded van — no overnight trips, home every evening.', responsibilities: ['Deliver 120–150 packages on a set route', 'Inspect the vehicle before each shift', 'Scan and photograph deliveries', 'Deliver friendly customer service'] }],
  ['house-cleaner-denver', 'House Cleaner', 'cleaning', 'Fresh Nest Cleaning Co.', 'Denver', 'CO', 'Part-time', 'Weekdays, 9am–2pm', 19, 24, 'hour', 4, { summary: 'Join a small, family-run cleaning team serving the same homes every week — reliable hours that fit around school pick-up.', responsibilities: ['Clean kitchens, bathrooms and living areas', 'Follow each client’s checklist', 'Report any damage or concerns', 'Work as a pair with a teammate'] }],
  ['cashier-orlando', 'Cashier', 'retail', 'Green Basket Market', 'Orlando', 'FL', 'Part-time', 'Flexible, incl. weekends', 15, 17, 'hour', 3, { summary: 'A community grocery store looking for upbeat cashiers who know regulars by name.', responsibilities: ['Ring up purchases accurately', 'Handle cash, card and EBT payments', 'Bag groceries with care', 'Keep the front end tidy'] }],
  ['cdl-driver-memphis', 'CDL-A Truck Driver — Regional', 'transport', 'Delta Freightways', 'Memphis', 'TN', 'Full-time', 'Home every weekend', 78000, 92000, 'year', 2, { summary: 'Regional dry-van routes across the Southeast, with guaranteed home time every weekend and newer equipment.', responsibilities: ['Drive regional routes safely and on time', 'Complete pre- and post-trip inspections', 'Maintain ELD logs', 'Communicate with dispatch'], requirements: ['Class A CDL', '1+ year OTR or regional experience', 'Clean MVR'] }],
  ['receptionist-chicago', 'Front Desk Receptionist', 'office', 'Lakeshore Dental Group', 'Chicago', 'IL', 'Full-time', 'Mon–Fri, 8am–5pm', 19, 22, 'hour', 5, { summary: 'Be the first smile patients see at a modern, friendly dental office in River North.', responsibilities: ['Greet and check in patients', 'Answer phones and schedule appointments', 'Verify insurance', 'Keep the reception area welcoming'] }],
  ['barista-seattle', 'Barista', 'hospitality', 'Ferry Street Coffee', 'Seattle', 'WA', 'Part-time', 'Early mornings', 19, 21, 'hour', 1, { summary: 'Specialty café by the waterfront. Full latte-art training provided — passion matters more than experience.', responsibilities: ['Prepare espresso drinks to spec', 'Run the register and greet regulars', 'Keep the bar spotless', 'Help with opening duties'] }],
  ['plumber-houston', 'Service Plumber', 'trades', 'Bayou City Plumbing', 'Houston', 'TX', 'Full-time', 'Mon–Fri + on-call rotation', 30, 42, 'hour', 3, { summary: 'Residential service plumbing with a take-home truck and a fair on-call rotation.', responsibilities: ['Diagnose and repair leaks, drains and water heaters', 'Quote jobs clearly to homeowners', 'Keep the truck stocked', 'Follow local code'] }],
  ['cna-columbus', 'Certified Nursing Assistant', 'healthcare', 'Maple Grove Senior Living', 'Columbus', 'OH', 'Shift work', '12-hr shifts, days or nights', 19, 23, 'hour', 2, { urgent: true, summary: 'A family-owned senior community with low turnover and a culture that actually values its CNAs.', responsibilities: ['Assist residents with daily living', 'Record vitals and observations', 'Support mobility and transfers', 'Partner with nurses on care plans'], requirements: ['Active CNA certification', 'CPR/BLS', 'Background check'] }],
  ['forklift-indianapolis', 'Forklift Operator', 'warehouse', 'Crossroads Distribution', 'Indianapolis', 'IN', 'Full-time', 'Days, 6am–2:30pm', 20, 23, 'hour', 6, { summary: 'Move inventory safely in a climate-controlled distribution center.', responsibilities: ['Operate sit-down and reach forklifts', 'Load and unload trailers', 'Cycle count inventory', 'Follow safety protocols'], requirements: ['Forklift certification (or we’ll certify you)', 'Able to lift 50 lbs', 'Steel-toe boots'] }],
  ['server-new-orleans', 'Server', 'hospitality', 'Magnolia Courtyard', 'New Orleans', 'LA', 'Part-time', 'Evenings & weekends', 12, 30, 'hour', 2, { summary: 'Creole dining room in the French Quarter. Base pay plus strong tips — average total $30/hr on weekends.', responsibilities: ['Guide guests through the menu', 'Take orders and serve courses', 'Process payments', 'Partner with bar and kitchen'] }],
  ['bookkeeper-remote', 'Part-time Bookkeeper', 'office', 'Cedar & Co. Landscaping', 'Remote', 'US', 'Contract', '15 hrs/week, flexible', 25, 32, 'hour', 7, { remote: true, summary: 'Keep the books for a growing landscaping business — fully remote, set your own hours.', responsibilities: ['Reconcile bank and card accounts', 'Run payroll twice a month', 'Prepare monthly reports', 'Chase overdue invoices'], requirements: ['QuickBooks Online experience', '2+ years bookkeeping', 'Detail-oriented'] }],
  ['hvac-tech-charlotte', 'HVAC Technician', 'trades', 'Carolina Comfort Air', 'Charlotte', 'NC', 'Full-time', 'Mon–Fri + rotating Saturdays', 26, 36, 'hour', 1, { summary: 'Residential install and service with paid factory training on the latest heat-pump systems.', responsibilities: ['Install and service HVAC systems', 'Perform seasonal maintenance', 'Diagnose refrigerant and electrical issues', 'Educate homeowners on options'] }],
  ['sales-associate-portland', 'Sales Associate', 'retail', 'Trailhead Outfitters', 'Portland', 'OR', 'Part-time', 'Flexible, incl. weekends', 17, 19, 'hour', 4, { summary: 'Help hikers and campers find the right gear at an independent outdoor shop.', responsibilities: ['Advise customers on gear', 'Process sales and returns', 'Restock and merchandise', 'Join monthly product trainings'] }],
  ['janitor-minneapolis', 'Commercial Janitor', 'cleaning', 'North Star Facility Services', 'Minneapolis', 'MN', 'Shift work', 'Evenings, 5pm–1:30am', 18, 20, 'hour', 3, { summary: 'Evening cleaning for modern office buildings downtown. Quiet, steady, independent work.', responsibilities: ['Clean offices, restrooms and break rooms', 'Empty trash and recycling', 'Operate floor scrubbers', 'Report maintenance issues'] }],
  ['dispatcher-las-vegas', 'Dispatcher', 'transport', 'Silver State Towing', 'Las Vegas', 'NV', 'Full-time', 'Rotating 10-hr shifts', 20, 24, 'hour', 5, { summary: 'Coordinate drivers across the valley from a calm, modern dispatch room.', responsibilities: ['Assign calls to drivers', 'Track jobs in the dispatch system', 'Update customers on ETAs', 'Log incidents accurately'], requirements: ['Calm under pressure', 'Fast, accurate typing', 'Spanish a plus'] }],
  ['nanny-san-diego', 'Nanny', 'cleaning', 'Private household', 'San Diego', 'CA', 'Full-time', 'Mon–Fri, 8am–5pm', 25, 30, 'hour', 2, { summary: 'A warm family in North Park is looking for a nanny for their two children (ages 2 and 5).', responsibilities: ['Care for two children during the day', 'Plan play, outings and naps', 'Prepare simple meals', 'Light child-related housekeeping'], requirements: ['2+ years childcare experience', 'CPR/First Aid', 'References and background check'] }],
  ['picker-packer-reno', 'Picker / Packer', 'warehouse', 'High Desert Logistics', 'Reno', 'NV', 'Shift work', 'Weekends, 4×10s', 18, 20, 'hour', 1, { summary: 'Weekend-only schedule — four 10-hour days Friday to Monday, then three days off.', responsibilities: ['Pick items with RF scanner', 'Pack orders for shipping', 'Meet daily quality targets', 'Keep the work area organised'] }],
  ['pharmacy-tech-tampa', 'Pharmacy Technician', 'healthcare', 'Bayside Community Pharmacy', 'Tampa', 'FL', 'Full-time', 'Mon–Sat rotation', 18, 22, 'hour', 6, { summary: 'An independent pharmacy that knows its patients by name. Licensed or trainee techs welcome.', responsibilities: ['Fill prescriptions accurately', 'Manage inventory and orders', 'Process insurance claims', 'Support the pharmacist'], requirements: ['Florida pharmacy tech registration', 'Customer-service mindset', 'Attention to detail'] }],
  ['prep-cook-austin', 'Prep Cook', 'hospitality', 'Barton Taqueria', 'Austin', 'TX', 'Full-time', 'Mornings, 6am–2pm', 16, 18, 'hour', 0, { summary: 'Morning prep for a beloved taqueria — salsas, braises and tortillas from scratch. Out by 2pm every day.', responsibilities: ['Prep proteins, salsas and sides', 'Follow recipes and portion guides', 'Label and rotate stock', 'Keep prep areas spotless'] }],
  ['customer-service-remote', 'Customer Service Representative', 'office', 'Homestead Insurance', 'Remote', 'US', 'Full-time', 'Mon–Fri, 9am–5:30pm ET', 19, 21, 'hour', 2, { remote: true, summary: 'Help policyholders over phone and chat from home. Paid training and equipment provided.', responsibilities: ['Answer inbound calls and chats', 'Update policies and billing', 'Escalate claims to specialists', 'Log every interaction'] }],
  ['carpenter-boston', 'Finish Carpenter', 'trades', 'Back Bay Renovations', 'Boston', 'MA', 'Full-time', 'Mon–Fri, 7am–3:30pm', 30, 38, 'hour', 4, { summary: 'High-end residential renovations — trim, built-ins and cabinetry for historic brownstones.', responsibilities: ['Install trim, doors and cabinetry', 'Build custom built-ins', 'Read drawings and take precise measurements', 'Protect clients’ homes on site'] }],
  ['housekeeper-miami', 'Hotel Housekeeper', 'hospitality', 'The Palmetto Hotel', 'Miami', 'FL', 'Full-time', 'Days, rotating weekends', 16, 18, 'hour', 3, { summary: 'A boutique hotel in Brickell offering steady hours, free parking and a staff meal every shift.', responsibilities: ['Clean and refresh guest rooms', 'Restock amenities', 'Report maintenance needs', 'Deliver warm guest service'] }],
];

export const jobs = raw.map(
  ([id, title, industry, employer, city, state, type, schedule, payMin, payMax, payUnit, postedDaysAgo, extra]) => {
    const ind = industries.find((i) => i.id === industry);
    return {
      id,
      title,
      industry,
      employer,
      city,
      state,
      type,
      schedule,
      payMin,
      payMax,
      payUnit,
      postedDaysAgo,
      remote: false,
      urgent: false,
      recruiterId: ind.recruiter,
      ...defaults[industry],
      ...extra,
    };
  }
);

export const getJob = (id) => jobs.find((j) => j.id === id);
export const getIndustry = (id) => industries.find((i) => i.id === id);
export const jobsInIndustry = (id) => jobs.filter((j) => j.industry === id);
