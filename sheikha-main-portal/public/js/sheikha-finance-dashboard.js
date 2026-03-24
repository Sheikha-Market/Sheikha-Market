const financeState = {
    summary: null,
    rates: null,
    analytics: null,
    sales: []
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
});

function formatUsd(value) {
    return currencyFormatter.format(Number(value || 0));
}

function setStatus(message, isError = false) {
    const statusNode = document.getElementById('finance-status');
    statusNode.textContent = message;
    statusNode.className = `finance-status ${isError ? 'finance-negative' : 'finance-positive'}`;
}

async function fetchJson(url, options) {
    const response = await fetch(url, options);
    const payload = await response.json();

    if (!response.ok || payload.success === false) {
        throw new Error(payload.message || 'تعذر تنفيذ الطلب');
    }

    return payload.data;
}

function renderSummary() {
    const summary = financeState.summary;
    if (!summary) {
        return;
    }

    document.getElementById('kpi-gross').textContent = formatUsd(summary.totals.grossVolumeUsd);
    document.getElementById('kpi-profit').textContent = formatUsd(summary.totals.tradeRevenueUsd);
    document.getElementById('kpi-charity').textContent = formatUsd(summary.totals.charityFundUsd);
    document.getElementById('kpi-victory').textContent = formatUsd(summary.totals.victorySupplyUsd);
    document.getElementById('updated-at').textContent = new Date(summary.updatedAt).toLocaleString(
        'ar-SA'
    );
}

function renderRates() {
    const tableBody = document.getElementById('rates-body');
    tableBody.innerHTML = '';

    for (const rate of financeState.rates.rates) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${rate.currency}</td>
            <td>${rate.usdRate}</td>
            <td>${rate.inverseRate}</td>
        `;
        tableBody.appendChild(row);
    }
}

function renderAnalytics() {
    const analytics = financeState.analytics;
    document.getElementById('momentum-chip').textContent = `زخم التداول: ${analytics.momentum}`;
    document.getElementById('top-category').textContent =
        `${analytics.topCategory.name} | ${formatUsd(analytics.topCategory.volumeUsd)}`;
    document.getElementById('top-currency').textContent =
        `${analytics.topCurrency.code} | ${formatUsd(analytics.topCurrency.volumeUsd)}`;

    const container = document.getElementById('algorithms-list');
    container.innerHTML = '';

    analytics.algorithms.forEach(algorithm => {
        const item = document.createElement('article');
        item.className = 'finance-algorithm';
        item.innerHTML = `
            <strong>${algorithm.title}</strong>
            <p class="finance-muted">${algorithm.description}</p>
            <span class="finance-chip">الإشارة: ${algorithm.signal}</span>
        `;
        container.appendChild(item);
    });
}

function renderSales() {
    const tableBody = document.getElementById('sales-body');
    tableBody.innerHTML = '';

    financeState.sales.forEach(sale => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${sale.clientName}</td>
            <td>${sale.currency} ${Number(sale.contractValue).toLocaleString('en-US')}</td>
            <td>${formatUsd(sale.amountUsd)}</td>
            <td>${sale.category}</td>
            <td>${new Date(sale.createdAt).toLocaleDateString('ar-SA')}</td>
        `;
        tableBody.appendChild(row);
    });
}

async function loadFinanceState() {
    const [summary, rates, analytics, sales] = await Promise.all([
        fetchJson('/api/finance/summary'),
        fetchJson('/api/finance/rates'),
        fetchJson('/api/finance/analytics/trading'),
        fetchJson('/api/finance/sales?limit=12')
    ]);

    financeState.summary = summary;
    financeState.rates = rates;
    financeState.analytics = analytics;
    financeState.sales = sales.sales;

    renderSummary();
    renderRates();
    renderAnalytics();
    renderSales();
}

async function submitSale(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    payload.contractValue = Number(payload.contractValue);

    try {
        setStatus('جاري تنفيذ العقد...');
        await fetchJson('/api/finance/sales', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        form.reset();
        await loadFinanceState();
        setStatus('تم تنفيذ العقد وتحديث لوحة التمويل');
    } catch (error) {
        setStatus(error.message, true);
    }
}

async function createBackup() {
    try {
        setStatus('جاري إنشاء نسخة احتياطية...');
        const backup = await fetchJson('/api/finance/backups', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ label: 'dashboard' })
        });
        setStatus(`تم إنشاء النسخة: ${backup.fileName}`);
    } catch (error) {
        setStatus(error.message, true);
    }
}

document.getElementById('sale-form').addEventListener('submit', submitSale);
document.getElementById('backup-button').addEventListener('click', createBackup);

loadFinanceState()
    .then(() => setStatus('تم تحميل منظومة التمويل والتداول'))
    .catch(error => setStatus(error.message, true));
