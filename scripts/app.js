// ======================================================
// Tulasi Sales System - Full App Script (Mobile Friendly)
// ======================================================

const app = (() => {
  // -------------------------------
  // LOCAL STORAGE KEYS
  // -------------------------------
  const LS_USERS = "SALES_USERS";
  const LS_ITEMS = "ITEM_LIST";
  const LS_VISITS = "VISITS_LIST";
  const LS_OUTLETS = "OUTLET_DATA";
  const LS_META = "OUTLET_META";

  // -------------------------------
  // DEFAULT DATA
  // -------------------------------
  function loadDefaults() {
    if (!localStorage.getItem(LS_USERS)) {
      const users = {
        "CSADMIN": { password: "TULASIADMIN25", role: "admin" },
        "STICS01": { password: "TULASI0125", role: "sales" },
        "STICS02": { password: "TULASI0225", role: "sales" },
        "STICS03": { password: "TULASI0325", role: "sales" },
        "STICS04": { password: "TULASI0425", role: "sales" },
        "STICS05": { password: "TULASI0525", role: "sales" },
        "STICS06": { password: "TULASI0625", role: "sales" },
        "STICS07": { password: "TULASI0725", role: "sales" },
        "STICS08": { password: "TULASI0825", role: "sales" },
        "STICS09": { password: "TULASI0925", role: "sales" },
        "STICS10": { password: "TULASI1025", role: "sales" },
      };
      localStorage.setItem(LS_USERS, JSON.stringify(users));
    }

    if (!localStorage.getItem(LS_ITEMS)) {
      const items = [
        { name: "Tulasi Cotton" },
        { name: "Tulasi Jute" },
        { name: "Tulasi Classic" },
        { name: "Tulasi Premium" }
      ];
      localStorage.setItem(LS_ITEMS, JSON.stringify(items));
    }
  }

  // -------------------------------
  // LOGIN FUNCTION
  // -------------------------------
  function login(uid, pwd) {
    const users = JSON.parse(localStorage.getItem(LS_USERS)) || {};
    const user = users[uid];
    if (user && user.password === pwd) {
      localStorage.setItem("CURRENT_USER", JSON.stringify({ uid, role: user.role }));
      if (user.role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "outlet-report.html";
      }
    } else {
      alert("Invalid User ID or Password");
    }
  }

  // -------------------------------
  // ADMIN ITEM MANAGEMENT
  // -------------------------------
  function initAdmin() {
    const listDiv = document.getElementById("itemList");
    const form = document.getElementById("addItemForm");
    let items = JSON.parse(localStorage.getItem(LS_ITEMS)) || [];

    function render() {
      listDiv.innerHTML = "";
      items.forEach((i, idx) => {
        const div = document.createElement("div");
        div.className = "item-row";
        div.innerHTML = `${idx + 1}. ${i.name} <button data-i="${idx}">❌</button>`;
        listDiv.appendChild(div);
      });
      localStorage.setItem(LS_ITEMS, JSON.stringify(items));
    }

    render();

    form.onsubmit = e => {
      e.preventDefault();
      const name = document.getElementById("itemName").value.trim();
      if (!name) return;
      items.push({ name });
      form.reset();
      render();
    };

    listDiv.addEventListener("click", e => {
      if (e.target.tagName === "BUTTON") {
        const i = e.target.dataset.i;
        items.splice(i, 1);
        render();
      }
    });
  }

  // -------------------------------
  // OUTLET SETUP / REPORT (for Sales Executives)
  // -------------------------------
  function initOutletReport() {
    let meta = JSON.parse(localStorage.getItem(LS_META)) || {
      districts: [],
      towns: {},
      distributors: {},
      beats: {},
    };
    let outlets = JSON.parse(localStorage.getItem(LS_OUTLETS)) || [];

    const districtSel = document.getElementById("districtSelect");
    const townSel = document.getElementById("townSelect");
    const distSel = document.getElementById("distributorSelect");
    const beatSel = document.getElementById("beatSelect");
    const itemSel = document.getElementById("runningItems");
    const outletTbl = document.getElementById("outletTable").querySelector("tbody");

    // Load items
    const items = JSON.parse(localStorage.getItem(LS_ITEMS)) || [];
    items.forEach(i => {
      const opt = document.createElement("option");
      opt.value = i.name;
      opt.textContent = i.name;
      itemSel.appendChild(opt);
    });

    // Utility: refresh dropdowns
    function refreshSelect(sel, list) {
      sel.innerHTML = "";
      const def = document.createElement("option");
      def.value = "";
      def.textContent = "-- Select --";
      sel.appendChild(def);
      list.forEach(v => {
        const o = document.createElement("option");
        o.value = v;
        o.textContent = v;
        sel.appendChild(o);
      });
    }

    function loadMeta() {
      refreshSelect(districtSel, meta.districts);
      const selDist = districtSel.value;
      refreshSelect(townSel, selDist && meta.towns[selDist] ? meta.towns[selDist] : []);
      const selTown = townSel.value;
      refreshSelect(distSel, selTown && meta.distributors[selTown] ? meta.distributors[selTown] : []);
      const selDistName = distSel.value;
      refreshSelect(beatSel, selDistName && meta.beats[selDistName] ? meta.beats[selDistName] : []);
    }

    loadMeta();

    // Manual creation (New District, Town, Distributor, Beat)
    document.getElementById("newDistrict").addEventListener("change", e => {
      const val = e.target.value.trim();
      if (val && !meta.districts.includes(val)) {
        meta.districts.push(val);
        localStorage.setItem(LS_META, JSON.stringify(meta));
        loadMeta();
        districtSel.value = val;
      }
      e.target.value = "";
    });

    document.getElementById("newTown").addEventListener("change", e => {
      const val = e.target.value.trim();
      const dist = districtSel.value;
      if (!dist) return alert("Select District first!");
      if (!meta.towns[dist]) meta.towns[dist] = [];
      if (val && !meta.towns[dist].includes(val)) {
        meta.towns[dist].push(val);
        localStorage.setItem(LS_META, JSON.stringify(meta));
        loadMeta();
        townSel.value = val;
      }
      e.target.value = "";
    });

    document.getElementById("newDistributor").addEventListener("change", e => {
      const val = e.target.value.trim();
      const town = townSel.value;
      if (!town) return alert("Select Town first!");
      if (!meta.distributors[town]) meta.distributors[town] = [];
      if (val && !meta.distributors[town].includes(val)) {
        meta.distributors[town].push(val);
        localStorage.setItem(LS_META, JSON.stringify(meta));
        loadMeta();
        distSel.value = val;
      }
      e.target.value = "";
    });

    document.getElementById("newBeat").addEventListener("change", e => {
      const val = e.target.value.trim();
      const dist = distSel.value;
      if (!dist) return alert("Select Distributor first!");
      if (!meta.beats[dist]) meta.beats[dist] = [];
      if (val && !meta.beats[dist].includes(val)) {
        meta.beats[dist].push(val);
        localStorage.setItem(LS_META, JSON.stringify(meta));
        loadMeta();
        beatSel.value = val;
      }
      e.target.value = "";
    });

    // Save outlet record
    document.getElementById("outletForm").onsubmit = e => {
      e.preventDefault();
      const outlet = {
        district: districtSel.value,
        town: townSel.value,
        distributor: distSel.value,
        beat: beatSel.value,
        name: document.getElementById("outletName").value.trim(),
        proprietor: document.getElementById("proprietorName").value.trim(),
        whatsapp: document.getElementById("whatsapp").value.trim(),
        items: Array.from(itemSel.selectedOptions).map(o => o.value),
        grade: document.getElementById("grade").value,
      };
      outlets.push(outlet);
      localStorage.setItem(LS_OUTLETS, JSON.stringify(outlets));
      alert("Outlet saved successfully");
      renderTable();
      e.target.reset();
    };

    function renderTable() {
      outletTbl.innerHTML = "";
      outlets.forEach(o => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${o.district}</td>
          <td>${o.town}</td>
          <td>${o.distributor}</td>
          <td>${o.beat}</td>
          <td>${o.name}</td>
          <td>${o.proprietor}</td>
          <td>${o.whatsapp}</td>
          <td>${o.items.join(", ")}</td>
          <td>${o.grade}</td>
        `;
        outletTbl.appendChild(tr);
      });
    }

    renderTable();
  }

  // -------------------------------
  // EXPORT FUNCTIONS
  // -------------------------------
  return { loadDefaults, login, initAdmin, initOutletReport };
})();

// -------------------------------
// AUTO PAGE INITIALIZATION
// -------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const page = window.location.pathname.split("/").pop();
  if (page === "index.html" || page === "") {
    document.getElementById("loginBtn")?.addEventListener("click", () => {
      const uid = document.getElementById("userid").value;
      const pwd = document.getElementById("password").value;
      app.login(uid, pwd);
    });
    app.loadDefaults();
  } else if (page === "admin.html") {
    app.initAdmin();
  } else if (page === "outlet-report.html") {
    app.initOutletReport();
  }
});
