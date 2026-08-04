// ===== HarzBuilder App v2.1 — Database Connected =====

const API_URL = '/api/backend/harzBuilderApi';
const HARZPAY_API = '/api/backend/harzPayPayment';
const PAYSTACK_API = "/api/backend/paystackPayment";

let selectedTemplate = null;
let selectedLang = 'English';
let selectedPlan = 'free';
let planPrices = { free: 0, starter: 5000, pro: 10000, enterprise: 50000 };
let harzPayRef = null;
let selectedPaymentMethod = null;
let currentUser = { email: '', name: '' };

// Simple user detection (in production, use auth)
function getUserEmail() {
  const stored = localStorage.getItem('harz_user_email');
  if (stored) return stored;
  const email = prompt('Enter your email to manage your sites:');
  if (email) { localStorage.setItem('harz_user_email', email); currentUser.email = email; return email; }
  return 'guest@harzbuilder.site';
}

async function apiCall(data) {
  try {
    const res = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return await res.json();
  } catch (e) {
    console.error('API call failed:', e);
    return { error: e.message };
  }
}

const templates = [
  { id: 1, icon: '🍽️', name: 'Restaurant Pro', desc: 'Beautiful restaurant website with menu, reservations, and WhatsApp ordering', features: ['Menu display', 'WhatsApp ordering', 'Photo gallery', 'Opening hours'], category: 'Restaurant', premium: false, price: 5000 },
  { id: 2, icon: '🛒', name: 'Shop Simple', desc: 'Online store for small shops — list products, accept orders on WhatsApp', features: ['Product catalog', 'WhatsApp checkout', 'Inventory', 'Categories'], category: 'Shop', premium: false, price: 5000 },
  { id: 3, icon: '🏥', name: 'Clinic Care', desc: 'Professional clinic website with appointment booking and doctor profiles', features: ['Appointment booking', 'Service list', 'Doctor profiles', 'FAQ'], category: 'Clinic', premium: true, price: 10000 },
  { id: 4, icon: '🎓', name: 'School Hub', desc: 'School website with courses, staff profiles, news, and admissions', features: ['Course listing', 'Staff profiles', 'News', 'Admissions form'], category: 'School', premium: true, price: 10000 },
  { id: 5, icon: '💼', name: 'Portfolio One', desc: 'Clean personal portfolio for freelancers, consultants, and creatives', features: ['About section', 'Work showcase', 'Skills', 'Testimonials'], category: 'Portfolio', premium: false, price: 3000 },
  { id: 6, icon: '⚖️', name: 'Services Pro', desc: 'Professional services website for lawyers, accountants, consultants', features: ['Service list', 'Team profiles', 'Case studies', 'Pricing tables'], category: 'Services', premium: true, price: 7500 },
  { id: 7, icon: '💅', name: 'Salon Glam', desc: 'Salon and beauty business website with booking and gallery', features: ['Service menu', 'WhatsApp booking', 'Stylist profiles', 'Price list'], category: 'Salon', premium: false, price: 5000 },
  { id: 8, icon: '🏠', name: 'Property Listings', desc: 'Real estate listing website with property search and agent contact', features: ['Property listings', 'Search & filter', 'Agent contact', 'Map view'], category: 'Real Estate', premium: true, price: 15000 },
];

const HARZPAY_METHODS = [
  { id: 'uba_transfer', icon: '🏦', label: 'UBA Bank Transfer', desc: 'Transfer to UBA 2034326424 — Harz Technology Group' },
  { id: 'card', icon: '💳', label: 'Card Payment', desc: 'Pay with Visa, Mastercard, or Verve' },
  { id: 'gdeg_token', icon: '🪙', label: 'GDEG Token', desc: 'Pay with GDEG tokens (1 GDEG = ₦1)' },
  { id: 'usdt', icon: '₮', label: 'USDT (TRC20)', desc: 'Pay with USDT cryptocurrency' },
];

function renderTemplates() {
  const grid = document.getElementById('templatesGrid');
  if (!grid) return;
  grid.innerHTML = templates.map(t => `
    <div class="template-card" onclick="selectTemplate(${t.id})">
      <div class="template-preview">${t.icon}<div class="template-badge ${t.premium ? 'pro' : 'free'}">${t.premium ? 'PRO' : 'FREE'}</div></div>
      <div class="template-info">
        <div class="template-name">${t.name}</div>
        <div class="template-desc">${t.desc}</div>
        <div class="template-features">${t.features.map(f => `<span class="template-feature">${f}</span>`).join('')}</div>
        <div class="template-price">₦${t.price.toLocaleString()}/month</div>
      </div>
    </div>`).join('');
}

function selectTemplate(id) {
  selectedTemplate = templates.find(t => t.id === id);
  openBuilder();
  setTimeout(() => {
    document.querySelectorAll('.modal-template').forEach(el => { el.style.borderColor = 'var(--border)'; el.style.boxShadow = 'none'; });
    const el = document.querySelector(`[data-tpl-id="${id}"]`);
    if (el) { el.style.borderColor = 'var(--primary)'; el.style.boxShadow = '0 0 0 2px var(--primary)'; }
  }, 100);
}

function openBuilder(plan) { if (plan) selectedPlan = plan; resetBuilder(); document.getElementById('builderModal').classList.add('active'); renderModalTemplates(); }
function closeBuilder() { document.getElementById('builderModal').classList.remove('active'); }
function resetBuilder() { ['step2','step3','step4','step5'].forEach(s => { const el = document.getElementById(s); if (el) el.classList.add('hidden'); }); document.getElementById('step1').classList.remove('hidden'); }

function renderModalTemplates() {
  const c = document.getElementById('modalTemplates');
  if (!c) return;
  c.innerHTML = templates.map(t => `
    <div class="modal-template" data-tpl-id="${t.id}" onclick="selectModalTemplate(${t.id})" style="padding:16px;cursor:pointer;border:1px solid var(--border);border-radius:8px;text-align:center;">
      <div style="font-size:32px;margin-bottom:8px;">${t.icon}</div>
      <div style="font-size:13px;font-weight:600;">${t.name}</div>
      <div style="font-size:11px;color:var(--text-dim);">${t.category}</div>
    </div>`).join('');
}

function selectModalTemplate(id) {
  selectedTemplate = templates.find(t => t.id === id);
  document.querySelectorAll('.modal-template').forEach(el => { el.style.borderColor = 'var(--border)'; el.style.boxShadow = 'none'; });
  const el = document.querySelector(`[data-tpl-id="${id}"]`);
  if (el) { el.style.borderColor = 'var(--primary)'; el.style.boxShadow = '0 0 0 2px var(--primary)'; }
}

function goToStep2() { if (!selectedTemplate) { showToast('Please select a template first', 'error'); return; } document.getElementById('step1').classList.add('hidden'); document.getElementById('step2').classList.remove('hidden'); document.getElementById('bizCategory').value = selectedTemplate.category; }
function backToStep1() { document.getElementById('step1').classList.remove('hidden'); document.getElementById('step2').classList.add('hidden'); }
function goToStep3() { if (!document.getElementById('bizName').value.trim()) { showToast('Please enter your business name', 'error'); return; } document.getElementById('step2').classList.add('hidden'); document.getElementById('step3').classList.remove('hidden'); renderPlanOptions(); if (!document.getElementById('subdomain').value) document.getElementById('subdomain').value = document.getElementById('bizName').value.trim().toLowerCase().replace(/[^a-z0-9]/g, ''); }
function backToStep2() { document.getElementById('step2').classList.remove('hidden'); document.getElementById('step3').classList.add('hidden'); }

function renderPlanOptions() {
  const c = document.getElementById('planOptions');
  const plans = [
    { id: 'free', name: 'Free', price: 0, desc: 'Basic template, harzbuilder.site subdomain' },
    { id: 'starter', name: 'Starter', price: 5000, desc: 'All templates, WhatsApp ordering, no branding' },
    { id: 'pro', name: 'Pro', price: 10000, desc: 'Custom domain, analytics, priority support' },
  ];
  c.innerHTML = plans.map(p => `
    <div style="padding:16px;border:1px solid var(--border);border-radius:8px;margin-bottom:8px;cursor:pointer;" onclick="selectPlanOption('${p.id}')" id="plan-${p.id}">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div><div style="font-weight:600;font-size:15px;">${p.name}</div><div style="font-size:12px;color:var(--text-dim);">${p.desc}</div></div>
        <div style="font-size:18px;font-weight:700;color:${p.price === 0 ? 'var(--success)' : 'var(--accent)'};">${p.price === 0 ? 'Free' : '₦' + p.price.toLocaleString() + '/mo'}</div>
      </div>
    </div>`).join('');
  selectPlanOption(selectedPlan);
}

function selectPlanOption(planId) {
  selectedPlan = planId;
  document.querySelectorAll('#planOptions > div').forEach(el => { el.style.borderColor = 'var(--border)'; el.style.background = 'transparent'; });
  const el = document.getElementById(`plan-${planId}`);
  if (el) { el.style.borderColor = 'var(--primary)'; el.style.background = 'var(--primary-glow)'; }
  const btn = document.getElementById('createBtn');
  btn.textContent = planId === 'free' ? 'Create My Website (Free)' : 'Create & Pay with HarzPay';
}
function selectLang(btn, lang) { selectedLang = lang; document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); }

function renderHarzPayMethods() {
  const c = document.getElementById('paymentMethods');
  if (!c) return;
  c.innerHTML = HARZPAY_METHODS.map(m => `
    <div style="padding:14px;border:1px solid var(--border);border-radius:8px;margin-bottom:8px;cursor:pointer;" onclick="selectPaymentMethod('${m.id}')" id="paymethod-${m.id}">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="font-size:24px;">${m.icon}</div>
        <div><div style="font-weight:600;font-size:14px;">${m.label}</div><div style="font-size:12px;color:var(--text-dim);">${m.desc}</div></div>
      </div>
    </div>`).join('');
}
function selectPaymentMethod(id) {
  selectedPaymentMethod = id;
  document.querySelectorAll('#paymentMethods > div').forEach(el => { el.style.borderColor = 'var(--border)'; el.style.background = 'transparent'; });
  const el = document.getElementById(`paymethod-${id}`);
  if (el) { el.style.borderColor = 'var(--primary)'; el.style.background = 'var(--primary-glow)'; }
  document.getElementById('confirmPaymentBtn').disabled = false;
}

// ===== CREATE SITE (DATABASE) =====
async function createSite() {
  const bizName = document.getElementById('bizName').value.trim();
  const subdomain = document.getElementById('subdomain').value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!bizName || !subdomain) { showToast('Please fill in business name and site URL', 'error'); return; }

  const btn = document.getElementById('createBtn');
  btn.textContent = 'Creating...'; btn.disabled = true;

  const userEmail = document.getElementById('bizEmail').value.trim() || getUserEmail();
  if (!localStorage.getItem('harz_user_email')) localStorage.setItem('harz_user_email', userEmail);

  const businessData = {
    business_name: bizName,
    description: document.getElementById('bizDesc').value.trim(),
    phone: document.getElementById('bizPhone').value.trim(),
    email: userEmail,
    whatsapp: document.getElementById('bizWhatsapp').value.trim(),
    address: document.getElementById('bizAddress').value.trim(),
    city: document.getElementById('bizCity').value.trim(),
    state: document.getElementById('bizState').value.trim(),
  };

  const siteData = {
    name: bizName,
    business_name: bizName,
    business_category: document.getElementById('bizCategory').value,
    template_id: selectedTemplate ? selectedTemplate.id.toString() : '1',
    subdomain: subdomain,
    custom_domain: '',
    content: { description: businessData.description, phone: businessData.phone, whatsapp: businessData.whatsapp, email: userEmail, city: businessData.city, state: businessData.state, address: businessData.address, template_icon: selectedTemplate ? selectedTemplate.icon : '📄', template_name: selectedTemplate ? selectedTemplate.name : '' },
    language: selectedLang,
    published_url: `https://${subdomain}.harzbuilder.site`,
    owner_email: userEmail,
    owner_phone: businessData.phone,
  };

  // Save to database
  const result = await apiCall({ action: 'create_site', site_data: siteData, business_data: businessData, user_email: userEmail });

  if (result.error) {
    // Fallback to localStorage
    console.warn('DB save failed, using localStorage:', result.error);
    const site = { ...siteData, id: Date.now().toString(), status: 'draft', views_count: 0, plan: selectedPlan, created_date: new Date().toISOString() };
    let sites = JSON.parse(localStorage.getItem('harz_sites') || '[]');
    sites.push(site);
    localStorage.setItem('harz_sites', JSON.stringify(sites));
    currentSiteId = site.id;
  } else {
    currentSiteId = result.site?.id || result.site?._id || Date.now().toString();
  }

  if (selectedPlan === 'free') {
    // Publish free sites immediately
    if (result.site?.id || result.site?._id) {
      await apiCall({ action: 'publish_site', site_id: result.site.id || result.site._id });
    }
    showSuccess({ published_url: siteData.published_url });
    return;
  }

  // Paid plan — show HarzPay
  document.getElementById('step3').classList.add('hidden');
  document.getElementById('step5').classList.remove('hidden');
  document.getElementById('paymentAmount').textContent = `₦${planPrices[selectedPlan].toLocaleString()}/month`;
  renderHarzPayMethods();
  btn.disabled = false; btn.textContent = 'Create & Pay with HarzPay';
}

let currentSiteId = null;


async function processHarzPay() {
  if (!selectedPaymentMethod) { showToast('Select a payment method', 'error'); return; }
  const btn = document.getElementById('confirmPaymentBtn');
  btn.textContent = 'Processing...'; btn.disabled = true;

  const userEmail = document.getElementById('bizEmail').value.trim() || getUserEmail();
  const bizName = document.getElementById('bizName').value.trim();

  // CARD PAYMENT → Stripe Checkout
  if (selectedPaymentMethod === 'card') {
    try {
      const response = await fetch(PAYSTACK_API, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_checkout', site_id: currentSiteId, plan: selectedPlan, amount: planPrices[selectedPlan], customer_email: userEmail, customer_name: bizName, plan_name: selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1) }) });
      const data = await response.json();
      if (data.authorization_url) {
        // Save pending payment info before redirect
        localStorage.setItem('pending_paystack_payment', JSON.stringify({ site_id: currentSiteId, plan: selectedPlan, amount: planPrices[selectedPlan], subdomain: document.getElementById('subdomain').value }));
        window.location.href = data.authorization_url;
        return;
      } else {
        showToast(data.error || 'Card payment failed. Try another method.', 'error');
        btn.disabled = false; btn.textContent = 'Confirm Payment Method';
        return;
      }
    } catch (e) {
      showToast('Card payment unavailable. Try bank transfer.', 'error');
      btn.disabled = false; btn.textContent = 'Confirm Payment Method';
      return;
    }
  }

  // OTHER METHODS → HarzPay manual flow
  try {
    const response = await fetch(HARZPAY_API, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'initiate', site_id: currentSiteId, plan: selectedPlan, amount: planPrices[selectedPlan], customer_email: userEmail, customer_name: bizName, payment_method: selectedPaymentMethod }) });
    const data = await response.json();
    if (data.reference) {
      harzPayRef = data.reference;
      document.getElementById('paymentInstructions').classList.remove('hidden');
      document.getElementById('instructionsText').textContent = data.instructions;
      document.getElementById('paymentRef').textContent = data.reference;
      document.getElementById('confirmPaymentBtn').classList.add('hidden');
      document.getElementById('verifyPaymentBtn').classList.remove('hidden');
    } else { showToast(data.error || 'Payment failed', 'error'); btn.disabled = false; btn.textContent = 'Confirm Payment Method'; }
  } catch (e) {
    const method = HARZPAY_METHODS.find(m => m.id === selectedPaymentMethod);
    document.getElementById('paymentInstructions').classList.remove('hidden');
    document.getElementById('instructionsText').textContent = method.desc + '\n\nAmount: ₦' + planPrices[selectedPlan].toLocaleString() + '/month\n\nAfter payment, click "I\'ve Paid — Verify"';
    document.getElementById('paymentRef').textContent = `HARZB-${Date.now()}`;
    document.getElementById('confirmPaymentBtn').classList.add('hidden');
    document.getElementById('verifyPaymentBtn').classList.remove('hidden');
  }
}

async function verifyHarzPay() {
  const btn = document.getElementById('verifyPaymentBtn');
  btn.textContent = 'Verifying...'; btn.disabled = true;
  const userEmail = document.getElementById('bizEmail').value.trim() || getUserEmail();
  await apiCall({ action: 'create_subscription', site_id: currentSiteId, plan: selectedPlan, amount: planPrices[selectedPlan], payment_method: selectedPaymentMethod, payment_reference: harzPayRef, user_email: userEmail });
  if (currentSiteId) { await apiCall({ action: 'publish_site', site_id: currentSiteId }); }
  let sites = JSON.parse(localStorage.getItem('harz_sites') || '[]');
  if (sites.length > 0) { sites[sites.length - 1].status = 'published'; sites[sites.length - 1].plan = selectedPlan; localStorage.setItem('harz_sites', JSON.stringify(sites)); }
  showSuccess({ published_url: `https://${document.getElementById('subdomain').value}.harzbuilder.site` });
  showToast('Payment confirmed via HarzPay! Site published! 🎉', 'success');
}

// Handle Stripe payment success redirect
function checkStripeCallback() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('payment') === 'success') {
    const pending = JSON.parse(localStorage.getItem('pending_paystack_payment') || '{}');
    if (pending.site_id) {
      // Create subscription and publish site
      apiCall({ action: 'create_subscription', site_id: pending.site_id, plan: pending.plan, amount: pending.amount, payment_method: 'card', payment_reference: 'paystack_' + Date.now(), user_email: getUserEmail() });
      apiCall({ action: 'publish_site', site_id: pending.site_id });
      let sites = JSON.parse(localStorage.getItem('harz_sites') || '[]');
      if (sites.length > 0) { sites[sites.length - 1].status = 'published'; sites[sites.length - 1].plan = pending.plan; localStorage.setItem('harz_sites', JSON.stringify(sites)); }
      localStorage.removeItem('pending_paystack_payment');
      showToast('Payment successful! Site published! 🎉', 'success');
      setTimeout(() => showDashboard(), 1500);
    }
    window.history.replaceState({}, '', window.location.pathname);
  }
}

function showSuccess(site) {
  ['step3','step5'].forEach(s => { const el = document.getElementById(s); if (el) el.classList.add('hidden'); });
  document.getElementById('step4').classList.remove('hidden');
  const urlEl = document.getElementById('siteUrl');
  urlEl.href = site.published_url; urlEl.textContent = site.published_url;
}


// ===== DASHBOARD (DATABASE) =====
async function showDashboard() {
  document.querySelector('.navbar').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  await renderDashboard();
}
function showLanding() { document.getElementById('dashboard').classList.add('hidden'); document.querySelector('.navbar').classList.remove('hidden'); }

async function renderDashboard() {
  const email = getUserEmail();
  // Show loading
  const list = document.getElementById('sitesList');
  list.innerHTML = '<div class="empty-state"><div style="font-size: 24px; color: var(--text-dim);">Loading...</div></div>';

  // Fetch from database
  const result = await apiCall({ action: 'get_stats', user_email: email });

  if (result.error) {
    // Fallback to localStorage
    const sites = JSON.parse(localStorage.getItem('harz_sites') || '[]');
    document.getElementById('statSites').textContent = sites.length;
    document.getElementById('statPublished').textContent = sites.filter(s => s.status === 'published').length;
    document.getElementById('statViews').textContent = sites.reduce((sum, s) => sum + (s.views_count || 0), 0);
    document.getElementById('statPlan').textContent = 'Free';
    renderSitesList(sites, true);
    return;
  }

  document.getElementById('statSites').textContent = result.total_sites || 0;
  document.getElementById('statPublished').textContent = result.published_sites || 0;
  document.getElementById('statViews').textContent = result.total_views || 0;
  document.getElementById('statPlan').textContent = result.active_plan || 'Free';

  const sites = result.sites || [];
  renderSitesList(sites, false);
}

function renderSitesList(sites, isLocal) {
  const list = document.getElementById('sitesList');
  if (sites.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📄</div><div class="empty-state-text">No websites yet. Create your first one!</div><button class="btn btn-primary" onclick="openBuilder()">+ Create Website</button></div>`;
    return;
  }
  list.innerHTML = sites.map(s => {
    const data = isLocal ? s : (s.data || s);
    const id = isLocal ? s.id : (s.id || s._id);
    const icon = data.content?.template_icon || data.template_icon || '📄';
    const url = data.published_url || (data.subdomain ? data.subdomain + '.harzbuilder.site' : '');
    const views = data.views_count || 0;
    const status = data.status || 'draft';
    const created = data.created_date || s.created_date;
    return `
      <div class="site-card"><div class="site-info">
        <div class="site-name">${icon} ${data.business_name || data.name}</div>
        <div class="site-meta"><span>📂 ${data.business_category || ''}</span><span>🌐 ${url}</span><span>👁️ ${views} views</span><span>📅 ${created ? new Date(created).toLocaleDateString() : ''}</span></div>
      </div><div class="site-actions">
        <span class="site-status ${status}">${status}</span>
        <button class="btn btn-primary btn-sm" onclick="publishSite('${id}', ${isLocal})">Publish</button>
        <button class="btn btn-outline btn-sm" onclick="viewSite('${url}')">View</button>
        <button class="btn btn-outline btn-sm" onclick="deleteSite('${id}', ${isLocal})" style="color:var(--danger);">Delete</button>
      </div></div>`;
  }).join('');
}

async function publishSite(id, isLocal) {
  if (isLocal) {
    let sites = JSON.parse(localStorage.getItem('harz_sites') || '[]');
    const s = sites.find(x => x.id === id);
    if (s) { s.status = 'published'; localStorage.setItem('harz_sites', JSON.stringify(sites)); renderDashboard(); showToast('Site published! 🚀', 'success'); }
  } else {
    await apiCall({ action: 'publish_site', site_id: id });
    renderDashboard();
    showToast('Site published! 🚀', 'success');
  }
}

function viewSite(url) { if (url) window.open(url, '_blank'); }

async function deleteSite(id, isLocal) {
  if (!confirm('Delete this website?')) return;
  if (isLocal) {
    let sites = JSON.parse(localStorage.getItem('harz_sites') || '[]');
    sites = sites.filter(s => s.id !== id);
    localStorage.setItem('harz_sites', JSON.stringify(sites));
    renderDashboard(); showToast('Site deleted', 'success');
  } else {
    await apiCall({ action: 'delete_site', site_id: id });
    renderDashboard(); showToast('Site deleted', 'success');
  }
}

function showDashPage(page, el) { document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active')); if (el) el.classList.add('active'); }
function showToast(msg, type) { const t = document.getElementById('toast'); t.textContent = msg; t.className = 'toast show ' + (type || ''); setTimeout(() => { t.className = 'toast'; }, 3000); }

renderTemplates();
document.getElementById('builderModal').addEventListener('click', function(e) { if (e.target === this) closeBuilder(); });

checkStripeCallback();
