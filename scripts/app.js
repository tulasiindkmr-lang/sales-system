// --------------------------------
// SALES SYSTEM APP.JS
// --------------------------------

const app = (() => {
  const LS_USERS = 'users';
  const LS_DISTRICTS = 'districts';
  const LS_TOWNS = 'towns';
  const LS_DISTRIBUTORS = 'distributors';
  const LS_OUTLETS = 'outlets';
  const LS_ITEMS = 'items';
  const LS_VISITS = 'visits';
  const LS_LOGGEDIN = 'loggedinUser';

  // --------------------------------
  // Load Default JSON Data from /data/
  // --------------------------------
  async function loadDefaults() {
    try {
      const files = [
        { key: LS_USERS, path: './data/users.json' },
        { key: LS_DISTRICTS, path: './data/districts.json' },
        { key: LS_TOWNS, path: './data/towns.json' },
        { key: LS_DISTRIBUTORS, path: './data/distributors.json' },
        { key: LS_OUTLETS, path: './data/outlets.json' },
        { key: LS_ITEMS, path: './data/items.json' }
      ];

      for (const f of files) {
        const res = await fetch(f.path);
        if (!res.ok) throw new Error(`Failed to load ${f.path}`);
        const data = await res.json();
        localStorage.setItem(f.key, JSON.stringify(data));
      }

      console.log('✅ Data loaded successfully.');
    } catch (err) {
      console.error('⚠️ Error loading defaults:', err);
    }
  }

  // --------------------------------
  // LOGIN FUNCTION
  // --------------------------------
  function login(userid, password) {
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '{}');
    const user = users[userid];
    if (!user || user.password !== password) {
      alert('Invalid user ID or password');
      return;
    }
    localStorage.setItem(LS_LOGGEDIN, JSON.stringify(user));
    if (user.role === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'sales-order.html';
    }
  }

  // --------------------------------
  // ADMIN PAGE INITIALIZATION
  // --------------------------------
  function initAdmin() {
    const items = JSON.parse(localStorage.getItem(LS_ITEMS) || '[]');
    const itemList = document.getElementById('itemList');
    const addItemBtn = document.getElementById('addItemBtn');
    const itemNameInput = document.getElementById('itemName');

    function renderItems() {
      itemList.innerHTML = '';
      items.forEach((item, i) => {
        const li = document.createElement('li');
        li.textContent = `${i + 1}. ${item}`;
        itemList.appendChild(li);
      });
    }

    addItemBtn.onclick = () => {
      const val = itemNameInput.value.trim();
      if (val) {
        items.push(val);
        localStorage.setItem(LS_ITEMS, JSON.stringify(items));
        itemNameInput.value = '';
        renderItems();
      }
    };

    renderItems();
  }

  // --------------------------------
  // SALES ORDER FORM INITIALIZATION
  // --------------------------------
  function initSalesForm() {
    const districts = JSON.parse(localStorage.getItem(LS_DISTRICTS) || '[]');
    const distributors = JSON.parse(localStorage.getItem(LS_DISTRIBUTORS) || '[]');
    const outlets = JSON.parse(localStorage.getItem(LS_OUTLETS) || '[]');
    const items = JSON.parse(localStorage.getItem(LS_ITEMS) || '[]');

    const distSel = document.getElementById('district');
    const distrSel = document.getElementById('distributor');
    const outletSel = document.getElementById('outlet');
    const gradeSel = document.getElementById('grade');
    const submitBtn = document.getElementById('submitOrder');

    // Populate Districts
    distSel.innerHTML = '<option value="">Select District</option>';
    districts.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.name;
      opt.textContent = d.name;
      distSel.appendChild(opt);
    });

    // When District changes, load Distributors
    distSel.onchange = () => {
      const selected = distSel.value;
      distrSel.innerHTML = '<option value="">Select Distributor</option>';
      const filtered = distributors.filter(x => x.district === selected);
      filtered.forEach(x => {
        const opt = document.createElement('option');
        opt.value = x.name;
        opt.textContent = x.name;
        distrSel.appendChild(opt);
      });
    };

    // When Distributor changes, load Outlets
    distrSel.onchange = () => {
      const selected = distrSel.value;
      outletSel.innerHTML = '<option value="">Select Outlet</option>';
      const filtered = outlets.filter(x => x.distributor === selected);
      filtered.forEach(x => {
        const opt = document.createElement('option');
        opt.value = x.name;
        opt.textContent = x.name;
        outletSel.appendChild(opt);
      });
    };

    // Grade Options
    ['A (10+ cartons)', 'B (5-10 cartons)', 'C (1-5 cartons)'].forEach(g => {
      const opt = document.createElement('option');
      opt.value = g;
      opt.textContent = g;
      gradeSel.appendChild(opt);
    });

    // Submit Form
    submitBtn.onclick = () => {
      const order = {
        district: distSel.value,
        distributor: distrSel.value,
        outlet: outletSel.value,
        grade: gradeSel.value,
        date: new Date().toISOString()
      };
      const orders = JSON.parse(localStorage.getItem(LS_VISITS) || '[]');
      orders.push(order);
      localStorage.setItem(LS_VISITS, JSON.stringify(orders));
      alert('✅ Order recorded successfully.');
    };
  }

  // --------------------------------
  // OUTLET VISIT FORM
  // --------------------------------
  function initVisitForm() {
    const outlets = JSON.parse(localStorage.getItem(LS_OUTLETS) || '[]');
    const outletSel = document.getElementById('v_outlet');
    const visitForm = document.getElementById('visitForm');

    outletSel.innerHTML = '<option value="">Select Outlet</option>';
    outlets.forEach(o => {
      const opt = document.createElement('option');
      opt.value = o.name;
      opt.textContent = o.name;
      outletSel.appendChild(opt);
    });

    visitForm.onsubmit = function(e) {
      e.preventDefault();
      const visits = JSON.parse(localStorage.getItem(LS_VISITS) || '[]');
      const payload = {
        outlet: document.getElementById('v_outlet').value,
        display: document.getElementById('v_display').value,
        remarks: document.getElementById('v_remarks').value,
        datetime: new Date().toISOString()
      };
      visits.push(payload);
      localStorage.setItem(LS_VISITS, JSON.stringify(visits));
      alert('Visit record saved');
      this.reset();
    };
  }

  return {
    loadDefaults,
    login,
    initAdmin,
    initSalesForm,
    initVisitForm
  };
})();

// --------------------------------
// AUTO INIT BASED ON PAGE
// --------------------------------
document.addEventListener('DOMContentLoaded', function(){
  const page = window.location.pathname.split('/').pop();
  if(page === 'index.html' || page === ''){
    document.getElementById('loginBtn')?.addEventListener('click', () => {
      const uid = document.getElementById('userid').value;
      const pwd = document.getElementById('password').value;
      app.login(uid, pwd);
    });
    app.loadDefaults();
  } else if(page === 'admin.html'){
    app.initAdmin();
  } else if(page === 'sales-order.html'){
    app.initSalesForm();
  } else if(page === 'outlet-report.html'){
    app.initVisitForm();
  }
});
