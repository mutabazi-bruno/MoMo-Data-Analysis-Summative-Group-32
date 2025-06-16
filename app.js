function normalizeType(type) {
    const map = {
        "Incoming Money": "incoming",
        "Payments to Code Holders": "payment",
        "Transfers to Mobile Numbers": "transfer",
        "Bank Deposits": "deposit",
        "Withdrawals from Agents": "withdrawal", 
        "Airtime Bill Payments": "airtime",
        "Internet and Voice Bundle Purchases": "bundle",
        "Cash Power Bill Payments": "cashpower",
        "Transactions by Third Parties": "thirdparty",
        "Bank Transfers": "banktransfer",
    };
    return map[type] || "other";
}

class SMSDashboard {
    constructor(dataFromAPI) {
        this.originalData = dataFromAPI.map(tx => ({
            ...tx,
            type: normalizeType(tx.transaction_type),
            description: tx.party || tx.transaction_type,
            details: tx.transaction_id || '',
            body: tx.body || ''
        }));

        this.filteredData = [...this.originalData];
        this.currentView = 'overview';
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.searchDebounce = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateStats();
        this.renderTransactions();

        setTimeout(() => {
            if (typeof initializeCharts === 'function') {
                initializeCharts();
            } else {
                console.error('initializeCharts function not found');
            }
        }, 500);
    }

    setupEventListeners() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.switchView(item.dataset.view);
            });
        });

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                clearTimeout(this.searchDebounce);
                this.searchDebounce = setTimeout(() => {
                    this.filterTransactions();
                }, 300);
            });
        }

        document.getElementById('typeFilter')?.addEventListener('change', () => this.filterTransactions());
        document.getElementById('dateFilter')?.addEventListener('change', () => this.filterTransactions());
        document.getElementById('prevBtn')?.addEventListener('click', () => this.previousPage());
        document.getElementById('nextBtn')?.addEventListener('click', () => this.nextPage());

        document.querySelector('.close')?.addEventListener('click', () => this.closeModal());

        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('modal')) {
                this.closeModal();
            }
        });
    }

    switchView(viewName) {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

        document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
        document.getElementById(viewName).classList.add('active');

        this.currentView = viewName;

        if (viewName === 'analytics') {
            setTimeout(() => {
                Object.values(charts).forEach(chart => {
                    if (chart) chart.resize();
                });
            }, 100);
        }
    }

    updateStats() {
        const total = this.originalData.length;
        const totalVolume = this.originalData.reduce((sum, tx) => sum + (tx.amount || 0), 0);

        const monthCounts = {};
        this.originalData.forEach(tx => {
            const month = new Date(tx.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            monthCounts[month] = (monthCounts[month] || 0) + 1;
        });
        const mostActiveMonth = Object.keys(monthCounts).reduce((a, b) => monthCounts[a] > monthCounts[b] ? a : b, "N/A");

        const typeCounts = {};
        this.originalData.forEach(tx => {
            const type = tx.type || 'other';
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });
        const topCategory = Object.keys(typeCounts).reduce((a, b) => typeCounts[a] > typeCounts[b] ? a : b, "N/A");

        document.getElementById('totalTxn').textContent = total.toLocaleString();
        document.getElementById('totalVolume').textContent = `${(totalVolume / 1_000_000).toFixed(1)}M RWF`;
        document.getElementById('activeMonth').textContent = mostActiveMonth;
        document.getElementById('topCategory').textContent = topCategory;
    }

    filterTransactions() {
        const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase();
        const typeFilter = (document.getElementById('typeFilter')?.value || '').toLowerCase();
        const dateFilter = document.getElementById('dateFilter')?.value || '';

        this.filteredData = this.originalData.filter(tx => {
          
            const searchFields = [
                tx.description?.toLowerCase() || '',
                tx.details?.toLowerCase() || '',
                tx.transaction_type?.toLowerCase() || '',
                tx.body?.toLowerCase() || '',
                tx.amount?.toString() || '',
                tx.date?.toLowerCase() || ''
            ].join(' ');

            const matchesSearch = searchTerm === '' || searchFields.includes(searchTerm);
            
            
            const matchesType = typeFilter === '' || 
                              tx.type === typeFilter || 
                              (tx.transaction_type || '').toLowerCase().includes(typeFilter);
            
            
            const txDate = new Date(tx.date).toISOString().split('T')[0];
            const matchesDate = dateFilter === '' || 
                              tx.date.startsWith(dateFilter) || 
                              txDate === dateFilter;

            return matchesSearch && matchesType && matchesDate;
        });

        this.currentPage = 1;
        this.renderTransactions();
    }

    renderTransactions() {
        const tbody = document.getElementById('transactionBody');
        if (!tbody) return;

        const startIdx = (this.currentPage - 1) * this.itemsPerPage;
        const endIdx = startIdx + this.itemsPerPage;
        const pageData = this.filteredData.slice(startIdx, endIdx);

        tbody.innerHTML = pageData.map(tx => `
            <tr>
                <td>${new Date(tx.date).toLocaleDateString()}</td>
                <td><span class="badge badge-${tx.type}">${tx.transaction_type}</span></td>
                <td>${tx.amount ? tx.amount.toLocaleString() : 'N/A'} RWF</td>
                <td>${tx.description || 'No description'}</td>
                <td><button class="btn" onclick="dashboard.showDetails(${tx.id})">View</button></td>
            </tr>
        `).join('');

        this.updatePagination();
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage) || 1;
        const pageInfo = document.getElementById('pageInfo');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        if (pageInfo) pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
        if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
        if (nextBtn) nextBtn.disabled = this.currentPage >= totalPages;
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderTransactions();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderTransactions();
        }
    }

    showDetails(txId) {
        const transaction = this.originalData.find(tx => tx.id === txId);
        if (!transaction) return;

        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <div class="detail-grid">
                <div class="detail-item"><strong>Transaction ID:</strong> ${transaction.id}</div>
                <div class="detail-item"><strong>Date:</strong> ${new Date(transaction.date).toLocaleString()}</div>
                <div class="detail-item"><strong>Type:</strong> ${transaction.transaction_type}</div>
                <div class="detail-item"><strong>Amount:</strong> ${transaction.amount ? transaction.amount.toLocaleString() : 'N/A'} RWF</div>
                <div class="detail-item"><strong>Description:</strong> ${transaction.description || 'No description'}</div>
                <div class="detail-item"><strong>Details:</strong> ${transaction.details || 'No details'}</div>
                <div class="detail-item"><strong>Full Message:</strong> ${transaction.body || 'No message available'}</div>
            </div>
        `;

        document.getElementById('modal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('modal').style.display = 'none';
    }
}

const badgeStyles = `
.badge { 
    padding: 4px 8px; 
    border-radius: 4px; 
    font-size: 0.8rem; 
    font-weight: 600; 
    color: white; 
}
.badge-incoming { background-color: #22c55e; }
.badge-payment { background-color: #3b82f6; }
.badge-transfer { background-color: #8b5cf6; }
.badge-withdrawal { background-color: #ef4444; }
.badge-airtime { background-color: #f59e0b; }
.badge-bundle { background-color: #06b6d4; }
.badge-cashpower { background-color: #a855f7; }
.badge-thirdparty { background-color: #64748b; }
.badge-banktransfer { background-color: #14b8a6; }
.badge-other { background-color: #6b7280; }

.detail-grid { 
    display: grid; 
    gap: 15px; 
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}
.detail-item { 
    padding: 10px; 
    background: #f8fafc; 
    border-radius: 8px; 
    border-left: 4px solid #fbbf24; 
}

.btn {
    padding: 6px 12px;
    background-color: #1e3a8a;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn:hover {
    background-color: #1e40af;
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = badgeStyles;
document.head.appendChild(styleSheet);

let dashboard;