class SMSDashboard {
    constructor() {
        this.currentView = 'overview';
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.filteredData = [...smsData];
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
                this.switchView(e.target.dataset.view);
            });
        });

        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            this.filterTransactions();
        });

        document.getElementById('typeFilter')?.addEventListener('change', (e) => {
            this.filterTransactions();
        });

        document.getElementById('dateFilter')?.addEventListener('change', (e) => {
            this.filterTransactions();
        });

        document.getElementById('prevBtn')?.addEventListener('click', () => {
            this.previousPage();
        });

        document.getElementById('nextBtn')?.addEventListener('click', () => {
            this.nextPage();
        });

        document.querySelector('.close')?.addEventListener('click', () => {
            this.closeModal();
        });

        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('modal')) {
                this.closeModal();
            }
        });
    }

    switchView(viewName) {

        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
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
        const total = smsData.length;
        const totalVolume = smsData.reduce((sum, tx) => sum + tx.amount, 0);

        const monthCounts = {};
        smsData.forEach(tx => {
            const month = new Date(tx.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            monthCounts[month] = (monthCounts[month] || 0) + 1;
        });
        const mostActiveMonth = Object.keys(monthCounts).reduce((a, b) => 
            monthCounts[a] > monthCounts[b] ? a : b
        );

        const typeCounts = {};
        smsData.forEach(tx => {
            const type = transactionTypes[tx.type];
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });
        const topCategory = Object.keys(typeCounts).reduce((a, b) => 
            typeCounts[a] > typeCounts[b] ? a : b
        );

        document.getElementById('totalTxn').textContent = total.toLocaleString();
        document.getElementById('totalVolume').textContent = formatAmount(totalVolume);
        document.getElementById('activeMonth').textContent = mostActiveMonth;
        document.getElementById('topCategory').textContent = topCategory;
    }

    filterTransactions() {
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const typeFilter = document.getElementById('typeFilter')?.value || '';
        const dateFilter = document.getElementById('dateFilter')?.value || '';

        this.filteredData = smsData.filter(tx => {
            const matchesSearch = tx.description.toLowerCase().includes(searchTerm) || 
                                tx.details.toLowerCase().includes(searchTerm);
            const matchesType = !typeFilter || tx.type === typeFilter;
            const matchesDate = !dateFilter || tx.date === dateFilter;

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
                <td>${formatDate(tx.date)}</td>
                <td><span class="badge badge-${tx.type}">${transactionTypes[tx.type]}</span></td>
                <td>${formatAmount(tx.amount)}</td>
                <td>${tx.description}</td>
                <td><button class="btn" onclick="dashboard.showDetails(${tx.id})">View</button></td>
            </tr>
        `).join('');

        this.updatePagination();
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
        const pageInfo = document.getElementById('pageInfo');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        if (pageInfo) {
            pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
        }

        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPage === totalPages;
        }
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
        const transaction = smsData.find(tx => tx.id === txId);
        if (!transaction) return;

        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <div class="detail-grid">
                <div class="detail-item">
                    <strong>Transaction ID:</strong> ${transaction.id}
                </div>
                <div class="detail-item">
                    <strong>Date:</strong> ${formatDate(transaction.date)}
                </div>
                <div class="detail-item">
                    <strong>Type:</strong> ${transactionTypes[transaction.type]}
                </div>
                <div class="detail-item">
                    <strong>Amount:</strong> ${formatAmount(transaction.amount)}
                </div>
                <div class="detail-item">
                    <strong>Description:</strong> ${transaction.description}
                </div>
                <div class="detail-item">
                    <strong>Full Details:</strong> ${transaction.details}
                </div>
                ${transaction.sender ? `<div class="detail-item"><strong>From:</strong> ${transaction.sender}</div>` : ''}
                ${transaction.recipient ? `<div class="detail-item"><strong>To:</strong> ${transaction.recipient}</div>` : ''}
                ${transaction.agent ? `<div class="detail-item"><strong>Agent:</strong> ${transaction.agent}</div>` : ''}
                ${transaction.fee ? `<div class="detail-item"><strong>Fee:</strong> ${formatAmount(transaction.fee)}</div>` : ''}
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
    
    .detail-grid {
        display: grid;
        gap: 15px;
    }
    .detail-item {
        padding: 10px;
        background: #f8fafc;
        border-radius: 8px;
        border-left: 4px solid #fbbf24;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = badgeStyles;
document.head.appendChild(styleSheet);

let dashboard;
