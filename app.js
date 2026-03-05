// Initialize Lucide Icons
lucide.createIcons();

// Configuration
const CLOSING_DATE = new Date('August 7, 2026 23:59:59').getTime();
const START_DATE = new Date('September 7, 2025 00:00:00').getTime();
const TARGET_AMOUNT = 120000;
const ADMIN_ID = 'swapnil0709';
const ADMIN_PASS = 'S161212p@0709';

// State Management
let transactions = JSON.parse(localStorage.getItem('bishhi_transactions')) || [];
let currentSection = 'dashboard';
let isAdmin = false;

// Pre-defined Members
const members = [
    { name: 'Swapnil patil1', total: 0 },
    { name: 'Swapnil patil2', total: 0 },
    { name: 'Prajyot Chougule', total: 0 },
    { name: 'Rushikesh chougule', total: 0 },
    { name: 'Shivam patil', total: 0 },
    { name: 'Prajwal chougule', total: 0 },
    { name: 'Suraj nalawade1', total: 0 },
    { name: 'Suraj nalawade2', total: 0 },
    { name: 'Devaraj patil', total: 0 },
    { name: 'Pratik patil', total: 0 }
];

// Initialize UI
document.addEventListener('DOMContentLoaded', () => {
    updateCountdown();
    updateDashboard();
    updateMembersList();
    populateMemberSelect();

    // Set up timer interval
    setInterval(updateCountdown, 1000 * 60 * 60); // Update every hour is enough for days display

    // Menu toggle
    const menuBtn = document.getElementById('menu-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');

    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
        dropdownMenu.classList.add('hidden');
    });

    // Login Form
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('login-id').value;
        const pass = document.getElementById('login-password').value;

        if (id === ADMIN_ID && pass === ADMIN_PASS) {
            isAdmin = true;
            localStorage.setItem('bishhi_admin', 'true');
            closeModal('login-modal');
            showToast('Admin logged in successfully!');
            openAdminModal();
            updateMenu();
            document.getElementById('login-error').classList.add('hidden');
        } else {
            document.getElementById('login-error').classList.remove('hidden');
        }
    });

    // Check existing admin session
    if (localStorage.getItem('bishhi_admin') === 'true') {
        isAdmin = true;
        updateMenu();
    }

    // Payment Form
    document.getElementById('payment-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const memberName = document.getElementById('payment-member').value;
        const amount = parseFloat(document.getElementById('payment-amount').value);

        if (memberName && amount > 0) {
            addTransaction(memberName, amount);
            closeModal('admin-modal');
            showToast('Transaction added successfully!');
            e.target.reset();
        }
    });
});

function populateMemberSelect() {
    const select = document.getElementById('payment-member');
    select.innerHTML = '<option value="" disabled selected>Select Member</option>';
    members.forEach(m => {
        const option = document.createElement('option');
        option.value = m.name;
        option.textContent = m.name;
        select.appendChild(option);
    });
}

function updateMenu() {
    const dropdown = document.getElementById('dropdown-menu');
    if (isAdmin) {
        dropdown.innerHTML = `
            <button onclick="showSection('dashboard')"><i data-lucide="layout-dashboard"></i> Dashboard</button>
            <button onclick="showSection('members')"><i data-lucide="users"></i> Members</button>
            <button onclick="openAdminModal()"><i data-lucide="plus-circle"></i> Add Payment</button>
            <button onclick="logout()"><i data-lucide="log-out"></i> Admin Logout</button>
        `;
    } else {
        dropdown.innerHTML = `
            <button onclick="showSection('dashboard')"><i data-lucide="layout-dashboard"></i> Dashboard</button>
            <button onclick="showSection('members')"><i data-lucide="users"></i> Members</button>
            <button onclick="openLogin()"><i data-lucide="user-cog"></i> Admin Login</button>
        `;
    }
    lucide.createIcons();
}

function logout() {
    isAdmin = false;
    localStorage.removeItem('bishhi_admin');
    updateMenu();
    showToast('Logged out');
}

// Countdown Timer Logic
function updateCountdown() {
    const now = new Date().getTime();
    const distance = CLOSING_DATE - now;

    if (distance < 0) {
        document.getElementById('countdown-timer').innerHTML = `
            <div class="timer-unit">
                <span style="font-size: 24px">CLOSED</span>
            </div>
        `;
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    document.getElementById('timer-days').innerText = days;
    document.getElementById('timer-hours').innerText = hours;
}

// Navigation Logic
function showSection(sectionId) {
    // Update active section visibility
    document.getElementById('dashboard-section').classList.add('hidden');
    document.getElementById('members-section').classList.add('hidden');
    document.getElementById(`-section`.replace('-', `${sectionId}-`)).classList.remove('hidden'); // Fixed string interpolation fallback

    // More robust way
    const sections = ['dashboard', 'members'];
    sections.forEach(s => {
        const el = document.getElementById(`${s}-section`);
        if (s === sectionId) {
            el.classList.remove('hidden');
            el.classList.add('active');
        } else {
            el.classList.add('hidden');
            el.classList.remove('active');
        }
    });

    // Update bottom tabs
    document.querySelectorAll('.tab-item').forEach(tab => tab.classList.remove('active'));
    document.getElementById(`tab-${sectionId}`).classList.add('active');

    currentSection = sectionId;
}

// Transaction Logic
function addTransaction(name, amount) {
    const now = new Date();
    const newTransaction = {
        name,
        amount,
        date: now.toLocaleDateString('en-GB'), // DD/MM/YYYY
        time: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        timestamp: now.getTime()
    };

    transactions.unshift(newTransaction);
    localStorage.setItem('bishhi_transactions', JSON.stringify(transactions));

    updateDashboard();
    updateMembersList();
}

function updateDashboard() {
    const totalCollected = transactions.reduce((sum, t) => sum + t.amount, 0);
    const progressPercent = Math.min((totalCollected / TARGET_AMOUNT) * 100, 100);
    const remaining = Math.max(TARGET_AMOUNT - totalCollected, 0);

    // Update progress bar
    document.getElementById('progress-fill').style.width = `${progressPercent}%`;
    document.getElementById('progress-collected').innerText = `₹${totalCollected.toLocaleString('en-IN')}`;
    document.getElementById('progress-percentage').innerText = `${Math.round(progressPercent)}% Completed`;
    document.getElementById('progress-remaining-text').innerText = `₹${remaining.toLocaleString('en-IN')} to go`;
    document.getElementById('progress-target').innerText = `₹${TARGET_AMOUNT.toLocaleString('en-IN')}`;

    // Update summary cards
    document.getElementById('summary-total').innerText = `₹${totalCollected.toLocaleString('en-IN')}`;

    // Update table
    const tableBody = document.getElementById('transactions-body');
    const emptyState = document.getElementById('empty-state');

    if (transactions.length === 0) {
        tableBody.innerHTML = '';
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        tableBody.innerHTML = transactions.map(t => `
            <tr>
                <td><strong>${t.name}</strong></td>
                <td><span class="amount-cell">₹${t.amount.toLocaleString('en-IN')}</span></td>
                <td>${t.date}</td>
                <td>${t.time}</td>
            </tr>
        `).join('');
    }
}

function updateMembersList() {
    // Reset totals
    const membersData = members.map(m => {
        const total = transactions
            .filter(t => t.name === m.name)
            .reduce((sum, t) => sum + t.amount, 0);
        return { ...m, total };
    });

    const totalCollected = membersData.reduce((sum, m) => sum + m.total, 0);
    document.getElementById('members-total-contributions').innerText = `₹${totalCollected.toLocaleString('en-IN')}`;
    document.getElementById('members-avg-contribution').innerText = `₹${Math.round(totalCollected / 10).toLocaleString('en-IN')}`;

    const listEl = document.getElementById('member-list');
    listEl.innerHTML = membersData.map(m => {
        const percentage = Math.min((m.total / (TARGET_AMOUNT / 10)) * 100, 100);
        return `
            <div class="member-item">
                <div class="member-info-row">
                    <div class="member-info">
                        <h4>${m.name}</h4>
                        <p>Total Contribution</p>
                    </div>
                    <div class="member-contribution">
                        <span class="amount">₹${m.total.toLocaleString('en-IN')}</span>
                    </div>
                </div>
                <div class="member-progress-mini">
                    <div class="mini-bar-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

// Modal Controllers
function openLogin() {
    if (isAdmin) {
        openAdminModal();
    } else {
        document.getElementById('login-modal').classList.remove('hidden');
    }
}

function openAdminModal() {
    document.getElementById('admin-modal').classList.remove('hidden');
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
    if (id === 'login-modal') {
        document.getElementById('login-form').reset();
        document.getElementById('login-error').classList.add('hidden');
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    toastMsg.innerText = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}
