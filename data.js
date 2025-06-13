// static  Mock SMS Transaction Data we change it after getting api 
const smsData = [
    {
        id: 1,
        date: '2024-01-15',
        type: 'incoming',
        amount: 25000,
        description: 'Received from John Doe',
        details: 'Transaction ID: TX001. You have received 25000 RWF from John Doe.',
        sender: 'John Doe',
        phone: '250788123456'
    },
    {
        id: 2,
        date: '2024-01-16',
        type: 'payment',
        amount: 15000,
        description: 'Payment to Jane Smith',
        details: 'TxId: TX002. Your payment of 15000 RWF to Jane Smith has been completed.',
        recipient: 'Jane Smith',
        phone: '250788654321'
    },
    {
        id: 3,
        date: '2024-01-17',
        type: 'airtime',
        amount: 3000,
        description: 'Airtime purchase',
        details: 'Your airtime purchase of 3000 RWF has been completed. Fee: 50 RWF.',
        fee: 50
    },
    {
        id: 4,
        date: '2024-01-18',
        type: 'withdrawal',
        amount: 50000,
        description: 'Agent withdrawal',
        details: 'You have withdrawn 50000 RWF via agent: Mary Agent (250123456789).',
        agent: 'Mary Agent',
        agentPhone: '250123456789'
    },
    {
        id: 5,
        date: '2024-01-19',
        type: 'bundle',
        amount: 2000,
        description: 'Internet bundle 1GB',
        details: 'You have purchased an internet bundle of 1GB for 2000 RWF valid for 30 days.',
        bundle: '1GB',
        validity: '30 days'
    },
    {
        id: 6,
        date: '2024-01-20',
        type: 'transfer',
        amount: 10000,
        description: 'Transfer to 250788999888',
        details: 'Your transfer of 10000 RWF to 250788999888 has been completed.',
        recipient: '250788999888'
    },
    {
        id: 7,
        date: '2024-02-01',
        type: 'incoming',
        amount: 75000,
        description: 'Received from Business Partner',
        details: 'Transaction ID: TX007. You have received 75000 RWF from Business Partner.',
        sender: 'Business Partner',
        phone: '250788777666'
    },
    {
        id: 8,
        date: '2024-02-05',
        type: 'payment',
        amount: 5000,
        description: 'Bill payment',
        details: 'Your bill payment of 5000 RWF has been completed. Reference: BP001.',
        reference: 'BP001'
    },
    {
        id: 9,
        date: '2024-02-10',
        type: 'withdrawal',
        amount: 30000,
        description: 'Agent withdrawal',
        details: 'You have withdrawn 30000 RWF via agent: Peter Agent (250111222333).',
        agent: 'Peter Agent',
        agentPhone: '250111222333'
    },
    {
        id: 10,
        date: '2024-02-15',
        type: 'airtime',
        amount: 5000,
        description: 'Airtime purchase',
        details: 'Your airtime purchase of 5000 RWF has been completed.',
        fee: 0
    },
    {
        id: 11,
        date: '2024-03-01',
        type: 'incoming',
        amount: 120000,
        description: 'Salary payment',
        details: 'Transaction ID: TX011. You have received 120000 RWF salary payment.',
        sender: 'Company ABC',
        phone: '250788111222'
    },
    {
        id: 12,
        date: '2024-03-05',
        type: 'transfer',
        amount: 25000,
        description: 'Transfer to family',
        details: 'Your transfer of 25000 RWF to family member has been completed.',
        recipient: 'Family Member'
    },
    {
        id: 13,
        date: '2024-03-10',
        type: 'bundle',
        amount: 8000,
        description: 'Internet bundle 5GB',
        details: 'You have purchased an internet bundle of 5GB for 8000 RWF valid for 30 days.',
        bundle: '5GB',
        validity: '30 days'
    },
    {
        id: 14,
        date: '2024-03-15',
        type: 'payment',
        amount: 35000,
        description: 'Utility bill payment',
        details: 'Your utility bill payment of 35000 RWF has been completed.',
        utility: 'Electricity'
    },
    {
        id: 15,
        date: '2024-03-20',
        type: 'withdrawal',
        amount: 80000,
        description: 'Agent withdrawal',
        details: 'You have withdrawn 80000 RWF via agent: Susan Agent (250999888777).',
        agent: 'Susan Agent',
        agentPhone: '250999888777'
    }
];

const transactionTypes = {
    incoming: 'Incoming Money',
    payment: 'Payment',
    transfer: 'Transfer',
    withdrawal: 'Withdrawal',
    airtime: 'Airtime',
    bundle: 'Data Bundle'
};

const monthlyData = {
    labels: ['Jan 2024', 'Feb 2024', 'Mar 2024'],
    datasets: [{
        label: 'Transaction Volume (RWF)',
        data: [150000, 265000, 390000],
        backgroundColor: '#fbbf24',
        borderColor: '#1e3a8a',
        borderWidth: 2
    }]
};

const typeDistribution = {
    labels: ['Incoming Money', 'Payments', 'Transfers', 'Withdrawals', 'Airtime', 'Data Bundle'],
    datasets: [{
        data: [220000, 55000, 35000, 160000, 8000, 10000],
        backgroundColor: [
            '#1e3a8a',
            '#3b82f6',
            '#fbbf24',
            '#fcd34d',
            '#0f172a',
            '#64748b'
        ]
    }]
};

const dailyTrends = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
        {
            label: 'Incoming',
            data: [45000, 75000, 120000, 95000],
            borderColor: '#1e3a8a',
            backgroundColor: 'rgba(30, 58, 138, 0.1)',
            tension: 0.4
        },
        {
            label: 'Outgoing',
            data: [30000, 40000, 85000, 65000],
            borderColor: '#fbbf24',
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            tension: 0.4
        }
    ]
};

const agentPerformance = {
    labels: ['Mary Agent', 'Peter Agent', 'Susan Agent', 'Other Agents'],
    datasets: [{
        data: [50000, 30000, 80000, 45000],
        backgroundColor: [
            '#1e3a8a',
            '#3b82f6',
            '#fbbf24',
            '#fcd34d'
        ]
    }]
};

function formatAmount(amount) {
    return new Intl.NumberFormat('en-RW', {
        style: 'currency',
        currency: 'RWF',
        minimumFractionDigits: 0
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-RW', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getTransactionsByType(type) {
    return smsData.filter(transaction => transaction.type === type);
}

function getTransactionsByDateRange(startDate, endDate) {
    return smsData.filter(transaction => {
        const txDate = new Date(transaction.date);
        return txDate >= new Date(startDate) && txDate <= new Date(endDate);
    });
}

function searchTransactions(query) {
    return smsData.filter(transaction => 
        transaction.description.toLowerCase().includes(query.toLowerCase()) ||
        transaction.details.toLowerCase().includes(query.toLowerCase())
    );
}