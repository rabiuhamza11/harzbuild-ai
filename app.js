// ===== HarzBuilder App =====

const API_BASE = 'https://api.base44.com/v1';
const HARZ_API = 'https://harzbuild-ai.vercel.app/api';

// State
let selectedTemplate = null;
let selectedLang = 'English';
let selectedPlan = 'free';
let planPrices = { free: 0, starter: 5000, pro: 10000, enterprise: 50000 };

// ===== TEMPLATES =====
const templates = [
  { id: 1, icon: '🍽️', name: 'Restaurant Pro', desc: 'Beautiful restaurant website with menu display, reservations, and online ordering via WhatsApp', features: ['Menu display', 'WhatsApp ordering', 'Photo gallery', 'Opening hours'], category: 'Restaurant', premium: false, price: 5000 },
  { id: 2, icon: '🛒', name: 'Shop Simple', desc: 'Online store for small shops — list products, accept orders on WhatsApp', features: ['Product catalog', 'WhatsApp checkout', 'Inventory', 'Categories'], category: 'Shop', premium: false, price: 5000 },
  { id: 3, icon: '🏥', name: 'Clinic Care', desc: 'Professional clinic website with appointment booking and doctor profiles', features: ['Appointment booking', 'Service list', 'Doctor profiles', 'FAQ'], category: 'Clinic', premium: true, price: 10000 },
  { id: 4, icon: '🎓', name: 'School Hub', desc: 'School website with courses, staff profiles, news, and admissions', features: ['Course listing', 'Staff profiles', 'News', 'Admissions form'], category: 'School', premium: true, price: 10000 },
  { id: 5, icon: '💼', name: 'Portfolio One', desc: 'Clean personal portfolio for freelancers, consultants, and creatives', features: ['About section', 'Work showcase', 'Skills', 'Testimonials'], category: 'Portfolio', premium: false, price: 3000 },
  { id: 6, icon: '⚖️', name: 'Services Pro', desc: 'Professional services website for lawyers, accountants, consultants', features: ['Service list', 'Team profiles', 'Case studies', 'Pricing tables'], category: 'Services', premium: true, price: 7500 },
  { id: 7, icon: '💅', name: 'Salon Glam', desc: 'Salon and beauty business website with booking and gallery', features: ['Service menu', 'WhatsApp booking', 'Stylist profiles', 'Price list'], category: 'Salon', premium: false, price: 5000 },
  { id: 8, icon: '🏠', name: 'Property Listings', desc: 'Real estate listing website with property search and agent contact', features: ['Property listings', 'Search & filter', 'Agent contact', 'Map view'], category: 'Real Estate', premium: true, price: 15000 },
];

// ===== RENDER TEMPLATES ON LANDING =====
function renderTemplates() {
  const grid = document.getElementById('templatesGrid');
  if (!grid) return;
  grid.innerHTML = templates.map(t => `
    <div class="template-card" onclick="selectTemplate(${t.id})">
      <div class="template-preview">
        ${t.icon}
        <div class="template-badge ${t.premium ? 'pro' : 'free'}">${t.premium ? 'PRO' : 'FREE'}</div>
      </div>
      <div class="template-info">
        <div class="template-name">${t.name}</div>
        <div class="template-desc">${t.desc}</div>
        <div class="template-features">
          ${t.features.map(f => `<span class="template-feature">${f}</span>`).join('')}
        </div>
        <div class="template-price">₦${t.price.toLocaleString()}/month</div>
      </div>
    </div>
  `).join('');
}

function selectTemplate(id) {
  selectedTemplate = templates.find(t => t.id === id);
  openBuilder();
  // Pre-select the template
  setTimeout(() => {
    document.querySelectorAll('.modal-template').forEach(el => el.classList.remove('selected'));
    const el = document.querySelector(`[data-tpl-id="${id}"]`);
    if (el) {
      el.classList.add('selected');
      el.style.borderColor = 'var(--primary)';
      el.style.boxShadow = '0 0 0 2px var(--primary)';
    }
  }, 100);
}

// ===== BUILDER MODAL =====
function openBuilder(plan) {
  if (plan) selectedPlan = plan;
  resetBuilder();
  document.getElementById('builderModal').classList.add('active');
  renderModalTemplates();
}

function closeBuilder() {
  document.getElementById('builderModal').classList.remove('active');
}

function resetBuilder() {
  document.getElementById('step1').classList.remove('hidden');
  document.getElementById('step2').classList.add('hidden');
  document.getElementById('step3').classList.add('hidden');
  document.getElementById('step4').classList.add('hidden');
}

function renderModalTemplates() {
  const container = document.getElementById('modalTemplates');
  if (!container) return;
  container.innerHTML = templates.map(t => `
    <div class="modal-template template-card" data-tpl-id="${t.id}" onclick="selectModalTemplate(${t.id})" style="padding: 16px; cursor: pointer; border: 1px solid var(--border); border-radius: 8px; text-align: center;">
      <div style="font-size: 32px; margin-bottom: 8px;">${t.icon}</div>
      <div style="font-size: 13px; font-weight: 600;">${t.name}</div>
      <div style="font-size: 11px; color: var(--text-dim);">${t.category}</div>
    </div>
  `).join('');
}

function selectModalTemplate(id) {
  selectedTemplate = templates.find(t => t.id === id);
  document.querySelectorAll('.modal-template').forEach(el => {
    el.style.borderColor = 'var(--border)';
    el.style.boxShadow = 'none';
  });
  const el = document.querySelector(`[data-tpl-id="${id}"]`);
  if (el) {
    el.style.borderColor = 'var(--primary)';
    el.style.boxShadow = '0 0 0 2px var(--primary)';
  }
}

function goToStep2() {
  if (!selectedTemplate) {
    showToast('Please select a template first', 'error');
    return;
  }
  document.getElementById('step1').classList.add('hidden');
  document.getElementById('step2').classList.remove('hidden');
  // Set category from template
  document.getElementById('bizCategory').value = selectedTemplate.category;
}

function backToStep1() {
  document.getElementById('step1').classList.remove('hidden');
  document.getElementById('step2').classList.add('hidden');
}

function goToStep3() {
  const name = document.getElementById('bizName').value.trim();
  if (!name) {
    showToast('Please enter your business name', 'error');
    return;
  }
  document.getElementById('step2').classList.add('hidden');
  document.getElementById('step3').classList.remove('hidden');
  renderPlanOptions();
  // Auto-generate subdomain from business name
  if (!document.getElementById('subdomain').value) {
    document.getElementById('subdomain').value = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
}

function backToStep2() {
  document.getElementById('step2').classList.remove('hidden');
  document.getElementById('step3').classList.add('hidden');
}

function renderPlanOptions() {
  const container = document.getElementById('planOptions');
  const plans = [
    { id: 'free', name: 'Free', price: 0, desc: 'Basic template, harzbuilder.site subdomain' },
    { id: 'starter', name: 'Starter', price: 5000, desc: 'All templates, WhatsApp ordering, no branding' },
    { id: 'pro', name: 'Pro', price: 10000, desc: 'Custom domain, analytics, priority support' },
  ];
  container.innerHTML = plans.map(p => `
    <div style="padding: 16px; border: 1px solid var(--border); border-radius: 8px; margin-bottom: 8px; cursor: pointer;" 
         onclick="selectPlanOption('${p.id}')" id="plan-${p.id}">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-weight: 600; font-size: 15px;">${p.name}</div>
          <div style="font-size: 12px; color: var(--text-dim);">${p.desc}</div>
        </div>
        <div style="font-size: 18px; font-weight: 700; color: ${p.price === 0 ? 'var(--success)' : 'var(--accent)'};">
          ${p.price === 0 ? 'Free' : '₦' + p.price.toLocaleString() + '/mo'}
        </div>
      </div>
    </div>
  `).join('');
  // Pre-select based on selectedPlan
  selectPlanOption(selectedPlan);
}

function selectPlanOption(planId) {
  selectedPlan = planId;
  document.querySelectorAll('#planOptions > div').forEach(el => {
    el.style.borderColor = 'var(--border)';
    el.style.background = 'transparent';
  });
  const el = document.getElementById(`plan-${planId}`);
  if (el) {
    el.style.borderColor = 'var(--primary)';
    el.style.background = 'var(--primary-glow)';
  }
  // Update button text
  const btn = document.getElementById('createBtn');
  if (planId === 'free') {
    btn.textContent = 'Create My Website (Free)';
  } else {
    btn.textContent = `Create & Pay ₦${planPrices[planId].toLocaleString()}/mo`;
  }
}

function selectLang(btn, lang) {
  selectedLang = lang;
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// ===== CREATE SITE =====
async function createSite() {
  const bizName = document.getElementById('bizName').value.trim();
  const bizCategory = document.getElementById('bizCategory').value;
  const bizDesc = document.getElementById('bizDesc').value.trim();
  const bizPhone = document.getElementById('bizPhone').value.trim();
  const bizWhatsapp = document.getElementById('bizWhatsapp').value.trim();
  const bizEmail = document.getElementById('bizEmail').value.trim();
  const bizCity = document.getElementById('bizCity').value.trim();
  const bizState = document.getElementById('bizState').value.trim();
  const bizAddress = document.getElementById('bizAddress').value.trim();
  const subdomain = document.getElementById('subdomain').value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  if (!bizName || !subdomain) {
    showToast('Please fill in business name and site URL', 'error');
    return;
  }

  // Show loading
  const btn = document.getElementById('createBtn');
  btn.textContent = 'Creating...';
  btn.disabled = true;

  try {
    // Save site to local storage (will connect to backend later)
    const site = {
      id: Date.now().toString(),
      name: bizName,
      business_name: bizName,
      business_category: bizCategory,
      template_id: selectedTemplate ? selectedTemplate.id.toString() : '1',
      template_name: selectedTemplate ? selectedTemplate.name : 'Restaurant Pro',
      subdomain: subdomain,
      custom_domain: '',
      status: 'draft',
      content: {
        description: bizDesc,
        phone: bizPhone,
        whatsapp: bizWhatsapp,
        email: bizEmail,
        city: bizCity,
        state: bizState,
        address: bizAddress,
        template_icon: selectedTemplate ? selectedTemplate.icon : '📄',
      },
      language: selectedLang,
      published_url: `https://${subdomain}.harzbuilder.site`,
      views_count: 0,
      owner_email: bizEmail,
      owner_phone: bizPhone,
      plan: selectedPlan,
      created_date: new Date().toISOString(),
    };

    // Save to localStorage
    let sites = JSON.parse(localStorage.getItem('harz_sites') || '[]');
    sites.push(site);
    localStorage.setItem('harz_sites', JSON.stringify(sites));

    // If paid plan, initialize Paystack payment
    if (selectedPlan !== 'free' && selectedPlan !== 'enterprise') {
      // Try to call Paystack backend function
      try {
        const response = await fetch('/api/backend/initializePaystackPayment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: bizEmail || 'owner@harzbuilder.site',
            amount: planPrices[selectedPlan],
            plan_name: selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1),
            site_id: site.id,
            callback_url: window.location.origin + '/index.html?payment=success&site=' + site.id,
          }),
        });
        const data = await response.json();
        if (data.authorization_url) {
          // Redirect to Paystack payment
          localStorage.setItem('pending_payment', JSON.stringify({
            site_id: site.id,
            plan: selectedPlan,
            amount: planPrices[selectedPlan],
          }));
          window.location.href = data.authorization_url;
          return;
        }
      } catch (e) {
        console.log('Paystack not configured yet, continuing with free trial');
      }
    }

    // Show success
    document.getElementById('step3').classList.add('hidden');
    document.getElementById('step4').classList.remove('hidden');
    const urlEl = document.getElementById('siteUrl');
    urlEl.href = site.published_url;
    urlEl.textContent = site.published_url;

    showToast('Website created successfully! 🎉', 'success');
  } catch (error) {
    showToast('Something went wrong. Please try again.', 'error');
    btn.disabled = false;
    btn.textContent = 'Create My Website';
  }
}

// ===== DASHBOARD =====
function showDashboard() {
  document.querySelector('.navbar').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  renderDashboard();
}

function showLanding() {
  document.getElementById('dashboard').classList.add('hidden');
  document.querySelector('.navbar').classList.remove('hidden');
}

function renderDashboard() {
  const sites = JSON.parse(localStorage.getItem('harz_sites') || '[]');
  
  // Stats
  document.getElementById('statSites').textContent = sites.length;
  document.getElementById('statPublished').textContent = sites.filter(s => s.status === 'published').length;
  document.getElementById('statViews').textContent = sites.reduce((sum, s) => sum + (s.views_count || 0), 0);
  
  const paidPlans = sites.filter(s => s.plan && s.plan !== 'free');
  document.getElementById('statPlan').textContent = paidPlans.length > 0 ? paidPlans[0].plan.charAt(0).toUpperCase() + paidPlans[0].plan.slice(1) : 'Free';

  // Sites list
  const list = document.getElementById('sitesList');
  if (sites.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📄</div>
        <div class="empty-state-text">No websites yet. Create your first one!</div>
        <button class="btn btn-primary" onclick="openBuilder()">+ Create Website</button>
      </div>
    `;
  } else {
    list.innerHTML = sites.map(s => `
      <div class="site-card">
        <div class="site-info">
          <div class="site-name">${s.content.template_icon || '📄'} ${s.business_name}</div>
          <div class="site-meta">
            <span>📂 ${s.business_category}</span>
            <span>🌐 ${s.published_url || s.subdomain + '.harzbuilder.site'}</span>
            <span>👁️ ${s.views_count || 0} views</span>
            <span>📅 ${new Date(s.created_date).toLocaleDateString()}</span>
          </div>
        </div>
        <div class="site-actions">
          <span class="site-status ${s.status}">${s.status}</span>
          <button class="btn btn-primary btn-sm" onclick="publishSite('${s.id}')">Publish</button>
          <button class="btn btn-outline btn-sm" onclick="viewSite('${s.published_url}')">View</button>
          <button class="btn btn-outline btn-sm" onclick="deleteSite('${s.id}')" style="color: var(--danger);">Delete</button>
        </div>
      </div>
    `).join('');
  }
}

function publishSite(id) {
  let sites = JSON.parse(localStorage.getItem('harz_sites') || '[]');
  const site = sites.find(s => s.id === id);
  if (site) {
    site.status = 'published';
    localStorage.setItem('harz_sites', JSON.stringify(sites));
    renderDashboard();
    showToast('Site published! 🚀', 'success');
  }
}

function viewSite(url) {
  window.open(url, '_blank');
}

function deleteSite(id) {
  if (!confirm('Delete this website? This cannot be undone.')) return;
  let sites = JSON.parse(localStorage.getItem('harz_sites') || '[]');
  sites = sites.filter(s => s.id !== id);
  localStorage.setItem('harz_sites', JSON.stringify(sites));
  renderDashboard();
  showToast('Site deleted', 'success');
}

function showDashPage(page, el) {
  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
  if (el) el.classList.add('active');
}

// ===== TOAST =====
function showToast(msg, type) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast show ' + (type || '');
  setTimeout(() => { toast.className = 'toast'; }, 3000);
}

// ===== PAYMENT CALLBACK =====
function checkPaymentCallback() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('payment') === 'success') {
    const pending = JSON.parse(localStorage.getItem('pending_payment') || '{}');
    if (pending.site_id) {
      let sites = JSON.parse(localStorage.getItem('harz_sites') || '[]');
      const site = sites.find(s => s.id === pending.site_id);
      if (site) {
        site.status = 'published';
        site.plan = pending.plan;
      }
      localStorage.setItem('harz_sites', JSON.stringify(sites));
      localStorage.removeItem('pending_payment');
      showToast('Payment successful! Your site is live. 🎉', 'success');
    }
    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);
  }
}

// ===== INIT =====
renderTemplates();
checkPaymentCallback();

// Close modal on overlay click
document.getElementById('builderModal').addEventListener('click', function(e) {
  if (e.target === this) closeBuilder();
});
