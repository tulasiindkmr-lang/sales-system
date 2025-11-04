// Tulasi Sales System - GitHub Pages Ready Version (2025)
// ------------------------------------------------------
// Fixes:
//  - Uses relative "./data/..." paths for GitHub Pages
//  - Works correctly under /sales-system/ subdirectory
//  - Proper login redirect for Admin & Sales Executives
//  - Compatible with all browsers (no external backend)
// ------------------------------------------------------

const app = (function(){
  // local storage keys
  const LS_USERS = 'ts_users';
  const LS_DISTRICTS = 'ts_districts';
  const LS_TOWNS = 'ts_towns';
  const LS_DISTRIBUTORS = 'ts_distributors';
  const LS_OUTLETS = 'ts_outlets';
  const LS_ITEMS = 'ts_items';
  const LS_SALES = 'ts_sales_orders';
  const LS_VISITS = 'ts_outlet_visits';

  // Load initial JSON data files if not already in localStorage
  function loadDefaults(){
    if(!localStorage.getItem(LS_USERS)){
      fetch('./data/users.json')
        .then(r => r.json())
        .then(j => localStorage.setItem(LS_USERS, JSON.stringify(j)))
        .catch(err => console.error('Error loading users.json', err));
    }
    if(!localStorage.getItem(LS_ITEMS)){
      fetch('./data/items.json')
        .then(r => r.json())
        .then(j => localStorage.setItem(LS_ITEMS, JSON.stringify(j)))
        .catch(err => console.error('Error loading items.json', err));
    }
    if(!localStorage.getItem(LS_DISTRICTS)) localStorage.setItem(LS_DISTRICTS, JSON.stringify([]));
    if(!localStorage.getItem(LS_TOWNS)) localStorage.setItem(LS_TOWNS, JSON.stringify([]));
    if(!localStorage.getItem(LS_DISTRIBUTORS)) localStorage.setItem(LS_DISTRIBUTORS, JSON.stringify([]));
    if(!localStorage.getItem(LS_OUTLETS)) localStorage.setItem(LS_OUTLETS, JSON.stringify([]));
    if(!localStorage.getItem(LS_SALES)) localStorage.setItem(LS_SALES, JSON.stringify([]));
    if(!localStorage.getItem(LS_VISITS)) localStorage.setItem(LS_VISITS, JSON.stringify([]));
  }

  // -----------------------------
  // LOGIN
  // -----------------------------
  function login(uid, pwd){
    uid = uid.toUpperCase();
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '{}');
    if(users[uid] && users[uid].password === pwd){
      localStorage.setItem('ts_current_user', uid);
      if(users[uid].role === 'admin'){
        window.location.href = './admin.html';
      } else {
        window.location.href = './sales-order.html';
      }
    } else {
      const msg = document.getElementById('msg');
      if(msg) msg.innerText = 'Invalid User ID or Password';
    }
  }

  // -----------------------------
  // ADMIN DASHBOARD
  // -----------------------------
  function initAdmin(){
    loadDefaults();
    renderDistricts();
    renderTowns();
    renderDistributors();
    renderOutlets();
    renderItems();
    renderUserAssignments();

    document.getElementById('addDistrictBtn').onclick = () => {
      const name = document.getElementById('newDistrict').value.trim();
      if(!name) return alert('Enter district name');
      const arr = JSON.parse(localStorage.getItem(LS_DISTRICTS));
      arr.push({ id: 'D' + (arr.length + 1), name });
      localStorage.setItem(LS_DISTRICTS, JSON.stringify(arr));
      renderDistricts();
      renderTowns();
    };

    document.getElementById('addTownBtn').onclick = () => {
      const town = document.getElementById('newTown').value.trim();
      const district = document.getElementById('districtForTown').value;
      if(!town || !district) return alert('Select district and enter town');
      const arr = JSON.parse(localStorage.getItem(LS_TOWNS));
      arr.push({ id: 'T' + (arr.length + 1), name: town, district });
      localStorage.setItem(LS_TOWNS, JSON.stringify(arr));
      renderTowns();
      renderDistributors();
    };

    document.getElementById('addDistributorBtn').onclick = () => {
      const name = document.getElementById('newDistributor').value.trim();
      const town = document.getElementById('townForDistributor').value;
      if(!name || !town) return alert('Enter distributor name and select town');
      const arr = JSON.parse(localStorage.getItem(LS_DISTRIBUTORS));
      arr.push({ id: 'DR' + (arr.length + 1), name, town });
      localStorage.setItem(LS_DISTRIBUTORS, JSON.stringify(arr));
      renderDistributors();
    };

    document.getElementById('addOutletBtn').onclick = () => {
      const name = document.getElementById('newOutlet').value.trim();
      const owner = document.getElementById('outletOwner').value.trim();
      const whats = document.getElementById('outletWhats').value.trim();
      const town = document.getElementById('outletTown').value;
      const checks = Array.from(document.querySelectorAll('#distributorCheckboxes input[type=checkbox]:checked')).map(ch => ch.value);
      if(!name || !town || checks.length === 0) return alert('Enter all outlet details and select distributors');
      const arr = JSON.parse(localStorage.getItem(LS_OUTLETS));
      arr.push({ id: 'O' + (arr.length + 1), name, owner, whats, town, distributors: checks });
      localStorage.setItem(LS_OUTLETS, JSON.stringify(arr));
      renderOutlets();
    };

    document.getElementById('addItemBtn').onclick = () => {
      const name = document.getElementById('newItem').value.trim();
      if(!name) return alert('Enter item name');
      const arr = JSON.parse(localStorage.getItem(LS_ITEMS));
      arr.push({ id: 'I' + (arr.length + 1), name });
      localStorage.setItem(LS_ITEMS, JSON.stringify(arr));
      renderItems();
    };

    document.getElementById('exportSales').onclick = () => {
      const sales = JSON.parse(localStorage.getItem(LS_SALES) || '[]');
      const ws = XLSX.utils.json_to_sheet(sales);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sales');
      XLSX.writeFile(wb, 'sales_orders.xlsx');
    };

    document.getElementById('exportVisits').onclick = () => {
      const visits = JSON.parse(localStorage.getItem(LS_VISITS) || '[]');
      const ws = XLSX.utils.json_to_sheet(visits);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Visits');
      XLSX.writeFile(wb, 'outlet_visits.xlsx');
    };
  }

  function renderDistricts(){
    const arr = JSON.parse(localStorage.getItem(LS_DISTRICTS) || '[]');
    const ul = document.getElementById('districtList');
    const sel = document.getElementById('districtForTown');
    if(ul) ul.innerHTML = '';
    if(sel) sel.innerHTML = '';
    arr.forEach(d => {
      if(ul){ const li = document.createElement('li'); li.textContent = d.name; ul.appendChild(li); }
      if(sel){ const opt = document.createElement('option'); opt.value = d.id; opt.textContent = d.name; sel.appendChild(opt); }
    });
  }

  function renderTowns(){
    const arr = JSON.parse(localStorage.getItem(LS_TOWNS) || '[]');
    const ul = document.getElementById('townList');
    const sel1 = document.getElementById('townForDistributor');
    const sel2 = document.getElementById('outletTown');
    if(ul) ul.innerHTML = '';
    if(sel1) sel1.innerHTML = '';
    if(sel2) sel2.innerHTML = '';
    arr.forEach(t => {
      if(ul){ const li = document.createElement('li'); li.textContent = t.name; ul.appendChild(li); }
      if(sel1){ const opt = document.createElement('option'); opt.value = t.id; opt.textContent = t.name; sel1.appendChild(opt); }
      if(sel2){ const opt2 = document.createElement('option'); opt2.value = t.id; opt2.textContent = t.name; sel2.appendChild(opt2); }
    });
  }

  function renderDistributors(){
    const arr = JSON.parse(localStorage.getItem(LS_DISTRIBUTORS) || '[]');
    const ul = document.getElementById('distributorList');
    const box = document.getElementById('distributorCheckboxes');
    if(ul) ul.innerHTML = '';
    if(box) box.innerHTML = '';
    arr.forEach(d => {
      if(ul){ const li = document.createElement('li'); li.textContent = d.name; ul.appendChild(li); }
      if(box){
        const id = 'cb' + d.id;
        const cb = document.createElement('input'); cb.type = 'checkbox'; cb.id = id; cb.value = d.id;
        const lbl = document.createElement('label'); lbl.htmlFor = id; lbl.textContent = d.name;
        box.appendChild(cb); box.appendChild(lbl); box.appendChild(document.createElement('br'));
      }
    });
  }

  function renderOutlets(){
    const arr = JSON.parse(localStorage.getItem(LS_OUTLETS) || '[]');
    const ul = document.getElementById('outletList');
    if(!ul) return;
    ul.innerHTML = '';
    arr.forEach(o => {
      const li = document.createElement('li');
      li.textContent = `${o.name} - ${o.owner} (${o.distributors.join(',')})`;
      ul.appendChild(li);
    });
  }

  function renderItems(){
    const arr = JSON.parse(localStorage.getItem(LS_ITEMS) || '[]');
    const ul = document.getElementById('itemList');
    if(!ul) return;
    ul.innerHTML = '';
    arr.forEach(i => {
      const li = document.createElement('li');
      li.textContent = i.name;
      ul.appendChild(li);
    });
  }

  function renderUserAssignments(){
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '{}');
    const div = document.getElementById('userAssignments');
    if(!div) return;
    div.innerHTML = '';
    Object.keys(users).forEach(u => {
      if(users[u].role === 'exec'){
        const p = document.createElement('p');
        const assigned = (users[u].assignedDistricts || []).join(', ');
        p.textContent = `${u} — Districts: ${assigned || 'None'}`;
        div.appendChild(p);
      }
    });
  }

  // -----------------------------
  // SALES ORDER FORM
  // -----------------------------
  function initSalesForm(){
    loadDefaults();
    const current = localStorage.getItem('ts_current_user');
    const users = JSON.parse(localStorage.getItem(LS_USERS) || '{}');
    const assigned = (users[current] && users[current].assignedDistricts) || [];
    const allDistricts = JSON.parse(localStorage.getItem(LS_DISTRICTS) || '[]');
    const districts = assigned.length ? allDistricts.filter(d => assigned.includes(d.id)) : allDistricts;

    const districtSel = document.getElementById('districtSelect');
    districtSel.innerHTML = '';
    districts.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.id;
      opt.textContent = d.name;
      districtSel.appendChild(opt);
    });

    districtSel.onchange = () => fillTowns(districtSel.value);
    if(districtSel.options.length) fillTowns(districtSel.value);

    function fillTowns(did){
      const towns = JSON.parse(localStorage.getItem(LS_TOWNS) || '[]').filter(t => t.district === did);
      const tsel = document.getElementById('townSelect');
      tsel.innerHTML = '';
      towns.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = t.name;
        tsel.appendChild(opt);
      });
      if(tsel.options.length) fillDistributors(tsel.value);
      tsel.onchange = () => fillDistributors(tsel.value);
    }

    function fillDistributors(tid){
      const dists = JSON.parse(localStorage.getItem(LS_DISTRIBUTORS) || '[]').filter(d => d.town === tid);
      const dsel = document.getElementById('distributorSelect');
      dsel.innerHTML = '';
      dists.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.id;
        opt.textContent = d.name;
        dsel.appendChild(opt);
      });
      if(dsel.options.length) fillOutlets(dsel.value);
      dsel.onchange = () => fillOutlets(dsel.value);
    }

    function fillOutlets(drid){
      const outs = JSON.parse(localStorage.getItem(LS_OUTLETS) || '[]').filter(o => o.distributors.includes(drid));
      const osel = document.getElementById('outletSelect');
      osel.innerHTML = '';
      outs.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o.id;
        opt.textContent = o.name;
        osel.appendChild(opt);
      });
      if(osel.options.length) fillOutletDetails(osel.value);
      osel.onchange = () => fillOutletDetails(osel.value);
    }

    function fillOutletDetails(oid){
      const outs = JSON.parse(localStorage.getItem(LS_OUTLETS) || '[]');
      const o = outs.find(x => x.id === oid);
      document.getElementById('propName').value = o?.owner || '';
      document.getElementById('propWhats').value = o?.whats || '';
      document.getElementById('propLoc').value = o?.location || '';
    }

    // Load items
    const items = JSON.parse(localStorage.getItem(LS_ITEMS) || '[]');
    const itemsSel = document.getElementById('itemsSelect');
    itemsSel.innerHTML = '';
    items.forEach(i => {
      const opt = document.createElement('option');
      opt.value = i.id;
      opt.textContent = i.name;
      itemsSel.appendChild(opt);
    });

    document.getElementById('orderForm').onsubmit = function(e){
      e.preventDefault();
      const sales = JSON.parse(localStorage.getItem(LS_SALES) || '[]');
      const payload = {
        id: 'S' + (sales.length + 1),
        user: current,
        district: document.getElementById('districtSelect').value,
        town: document.getElementById('townSelect').value,
        distributor: document.getElementById('distributorSelect').value,
        outlet: document.getElementById('outletSelect').value,
        items: Array.from(document.getElementById('itemsSelect').selectedOptions).map(o => o.value),
        grade: document.getElementById('gradeSelect').value,
        datetime: new Date().toISOString()
      };
      sales.push(payload);
      localStorage.setItem(LS_SALES, JSON.stringify(sales));
      alert('Order saved successfully');
      this.reset();
    };
  }

  // -----------------------------
  // OUTLET VISIT FORM
  // -----------------------------
  function initVisitForm(){
    loadDefaults();
    const dSel = document.getElementById('v_district');
    const districts = JSON.parse(localStorage.getItem(LS_DISTRICTS) || '[]');
    dSel.innerHTML = '';
    districts.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.id;
      opt.textContent = d.name;
      dSel.appendChild(opt);
    });
    dSel.onchange = () => fillTowns(dSel.value);
    if(dSel.options.length) fillTowns(dSel.value);

    function fillTowns(did){
      const towns = JSON.parse(localStorage.getItem(LS_TOWNS) || '[]').filter(t => t.district === did);
      const tsel = document.getElementById('v_town');
      tsel.innerHTML = '';
      towns.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = t.name;
        tsel.appendChild(opt);
      });
      if(tsel.options.length) fillDistributors(tsel.value);
      tsel.onchange = () => fillDistributors(tsel.value);
    }

    function fillDistributors(tid){
      const dists = JSON.parse(localStorage.getItem(LS_DISTRIBUTORS) || '[]').filter(d => d.town === tid);
      const dsel = document.getElementById('v_distributor');
      dsel.innerHTML = '';
      dists.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.id;
        opt.textContent = d.name;
        dsel.appendChild(opt);
      });
      if(dsel.options.length) fillOutlets(dsel.value);
      dsel.onchange = () => fillOutlets(dsel.value);
    }

    function fillOutlets(drid){
      const outs = JSON.parse(localStorage.getItem(LS_OUTLETS) || '[]').filter(o => o.distributors.includes(drid));
      const osel = document.getElementById('v_outlet');
      osel.innerHTML = '';
      outs.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o.id;
        opt.textContent = o.name;
        osel.appendChild(opt);
      });
    }

    document.getElementById('visitForm').onsubmit = function(e){
      e.preventDefault();
      const visits = JSON.parse(localStorage.getItem(LS_VISITS) || '[]');
      const payload = {
        id: 'V' + (visits.length + 1),
        user: localStorage.getItem('ts_current_user'),
        district: document.getElementById('v_district').value,
        town: document.getElementById('v_town').value,
        distributor: document.getElementById('v_distributor').value,
        outlet: document.getElementById('v_outlet').value,
        orderTaken: document.getElementById('v_order').value,
        stock: document.getElementById('v_stock').value,
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

