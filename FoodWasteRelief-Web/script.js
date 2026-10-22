// Default seed data if no data exists in localStorage
const initialRequests = [
    { id: 1, org: "Sunshine Care Home", location: "Bukit Jalil", item: "50 Packed Meals", urgency: "High", status: "Active" },
    { id: 2, org: "Hope Children Orphanage", location: "Sri Petaling", item: "40 Grocery Boxes", urgency: "Medium", status: "Fulfilled" },
    { id: 3, org: "Harmony Old Folks Home", location: "Taman Connaught", item: "60 Bakery Pastries", urgency: "High", status: "Fulfilled" },
    { id: 4, org: "Kasih Sayang Shelter", location: "Sungai Besi", item: "35 Rice Packets", urgency: "Medium", status: "Fulfilled" },
    { id: 5, org: "Grace Community Centre", location: "Seri Kembangan", item: "40 Fresh Bento Sets", urgency: "High", status: "Fulfilled" }
];

// Load saved requests from localStorage or fallback to initial seed data
let requests = JSON.parse(localStorage.getItem('apu_food_requests')) || initialRequests;

let currentTab = 'active'; // 'active' or 'history'

// Save current requests array to browser localStorage
function saveRequests() {
    localStorage.setItem('apu_food_requests', JSON.stringify(requests));
}

function renderTable() {
    const tbody = document.getElementById('request-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    // Filter based on active tab
    const filteredRequests = requests.filter(req => {
        return currentTab === 'active' ? req.status === 'Active' : req.status === 'Fulfilled';
    });

    if (filteredRequests.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-8 text-slate-400 text-xs">
                    <i class="fa-solid fa-box-open text-2xl mb-2 block text-slate-300"></i>
                    No ${currentTab === 'active' ? 'active requests right now' : 'fulfilled requests in history'}.
                </td>
            </tr>
        `;
    } else {
        filteredRequests.forEach((req) => {
            const isFulfilled = req.status === 'Fulfilled';
            const statusBadge = isFulfilled 
                ? `<span class="bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-semibold text-[10px]">Fulfilled</span>`
                : `<span class="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-semibold text-[10px]">Active</span>`;
            
            const actionBtn = isFulfilled
                ? `<button onclick="toggleStatus(${req.id})" class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium px-2 py-1 rounded transition border border-slate-200">Reopen</button>`
                : `<button onclick="toggleStatus(${req.id})" class="text-xs bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-semibold px-2 py-1 rounded transition border border-emerald-200 shadow-sm">Mark Fulfilled</button>`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="p-3 font-medium text-slate-800">${req.org}<br><span class="text-[10px] text-slate-400">${req.location}</span></td>
                <td class="p-3">${req.item}</td>
                <td class="p-3"><span class="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">${req.urgency}</span></td>
                <td class="p-3">${statusBadge}</td>
                <td class="p-3 text-center">${actionBtn}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    updateStats();
}

function switchTab(tab) {
    currentTab = tab;
    
    const activeBtn = document.getElementById('tab-active');
    const historyBtn = document.getElementById('tab-history');
    const hintText = document.getElementById('table-hint');

    if (tab === 'active') {
        if (activeBtn) activeBtn.className = "px-3 py-1.5 rounded-md bg-white text-emerald-700 shadow-sm transition font-semibold";
        if (historyBtn) historyBtn.className = "px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5 font-medium";
        if (hintText) hintText.innerText = '* Click "Mark Fulfilled" to move items into the Fulfilled History tab.';
    } else {
        if (historyBtn) historyBtn.className = "px-3 py-1.5 rounded-md bg-white text-emerald-700 shadow-sm transition font-semibold flex items-center gap-1.5";
        if (activeBtn) activeBtn.className = "px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-900 transition font-medium";
        if (hintText) hintText.innerText = '* Showing completed and fulfilled requests in history.';
    }

    renderTable();
}

function toggleStatus(id) {
    const item = requests.find(r => r.id === id);
    if (item) {
        item.status = item.status === 'Active' ? 'Fulfilled' : 'Active';
        saveRequests(); // Save change persistent to localStorage
        renderTable();
    }
}

function updateStats() {
    const totalRaised = requests.length;
    const fulfilledCount = requests.filter(r => r.status === 'Fulfilled').length;
    
    const statRaised = document.getElementById('stat-raised');
    const statFulfilled = document.getElementById('stat-fulfilled');
    const statItems = document.getElementById('stat-items');
    const statOrgs = document.getElementById('stat-orgs');
    const historyCount = document.getElementById('history-count');

    if (statRaised) statRaised.innerText = totalRaised;
    if (statFulfilled) statFulfilled.innerText = fulfilledCount;
    if (statItems) statItems.innerText = (totalRaised * 35);
    if (statOrgs) statOrgs.innerText = new Set(requests.map(r => r.org)).size;
    if (historyCount) historyCount.innerText = fulfilledCount;
}

function updateLocationSummary() {
    const summaryContainer = document.getElementById('location-summary-grid');
    if (!summaryContainer) return;

    // Count cases per location
    const locationCounts = {};
    requests.forEach(req => {
        // Normalize location text (trim spaces)
        const loc = req.location.trim();
        locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });

    // Generate HTML cards for each location
    summaryContainer.innerHTML = '';
    for (const [location, count] of Object.entries(locationCounts)) {
        const card = document.createElement('div');
        card.className = "bg-slate-50 border border-slate-200 p-3 rounded-lg flex flex-col justify-between";
        card.innerHTML = `
            <span class="font-semibold text-slate-700 truncate" title="${location}">${location}</span>
            <div class="flex items-baseline justify-between mt-2">
                <span class="text-emerald-700 font-bold text-base">${count}</span>
                <span class="text-[10px] text-slate-400">Cases</span>
            </div>
        `;
        summaryContainer.appendChild(card);
    }
}


const form = document.getElementById('submission-form');
if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const org = document.getElementById('org-name').value;
        const location = document.getElementById('org-location').value;
        const item = document.getElementById('item-name').value;
        const urgency = document.getElementById('item-urgency').value;

        requests.unshift({
            id: Date.now(),
            org: org,
            location: location,
            item: item,
            urgency: urgency,
            status: "Active"
        });

        saveRequests(); // Save newly added request to localStorage
        currentTab = 'active';
        switchTab('active');
        this.reset();
        alert('Request successfully submitted and added to Active Requests!');
    });
}

// Initial render call
renderTable();
