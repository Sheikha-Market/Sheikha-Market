async function getJson(url) {
    const res = await fetch(url);
    const body = await res.json();
    if (!body.success) throw new Error(body.message || 'API error');
    return body.data;
}

function fmtNum(value) {
    return Number(value || 0).toLocaleString('en-US');
}

function listToHtml(items) {
    return items.map(x => `<li>${x}</li>`).join('');
}

async function loadOverview() {
    const data = await getJson('/api/sheikha/global/overview');
    const cards = [
        ['عدد الدول', data.summary.totalCountries],
        ['عدد الشبكات', data.summary.totalNetworks],
        ['عدد السكان', fmtNum(data.globalAggregates?.totals?.population)],
        ['الموظفون', fmtNum(data.globalAggregates?.totals?.employed)],
        ['العاطلون', fmtNum(data.globalAggregates?.totals?.unemployed)],
        ['التجار', fmtNum(data.globalAggregates?.totals?.traders)],
        ['المتعلمون', fmtNum(data.globalAggregates?.totals?.educated)],
        ['المساعدات $', fmtNum(data.globalAggregates?.totals?.aidUsd)]
    ];

    document.getElementById('summaryCards').innerHTML = cards
        .map(([title, value]) => `<article class="card"><h3>${title}</h3><p>${value}</p></article>`)
        .join('');

    const quran = data.islamicPovertyKnowledgeBase?.quranReferences || [];
    const sunnah = data.islamicPovertyKnowledgeBase?.sunnahReferences || [];

    document.getElementById('quranRefs').innerHTML = quran
        .map(x => `<li><strong>${x.source}</strong> - ${x.insight}</li>`)
        .join('');
    document.getElementById('sunnahRefs').innerHTML = sunnah
        .map(x => `<li><strong>${x.source}</strong> - ${x.insight}</li>`)
        .join('');
}

async function loadLeaderboards() {
    const countries = await getJson(
        '/api/sheikha/global/countries?page=1&pageSize=10&sortBy=accelerationIndex&order=desc'
    );
    const poverty = await getJson(
        '/api/sheikha/global/countries?page=1&pageSize=10&sortBy=povertyIndex&order=desc'
    );
    const networks = await getJson('/api/sheikha/global/networks/dashboard');

    document.getElementById('topAcceleration').innerHTML = countries.items
        .map(x => `<li>${x.countryAr} - <span class="good-high">${x.accelerationIndex}</span></li>`)
        .join('');

    document.getElementById('topPoverty').innerHTML = poverty.items
        .map(x => `<li>${x.countryAr} - <span class="bad-high">${x.povertyIndex}</span></li>`)
        .join('');

    document.getElementById('networkSnapshots').innerHTML = (networks.networkSnapshots || [])
        .map(
            network => `
        <article class="network-card">
            <h3>${network.nameAr}</h3>
            <p>الشهر: ${network.month}</p>
            <p><strong>قادة الشبكة:</strong> ${(network.leaderCountries || []).map(x => x.countryAr).join('، ')}</p>
            <p><strong>الأكثر هشاشة:</strong> ${(network.vulnerableCountries || []).map(x => x.countryAr).join('، ')}</p>
            <p><strong>إجراءات:</strong> ${(network.strategicActions || []).join('، ')}</p>
        </article>
    `
        )
        .join('');
}

async function loadCountriesTable() {
    const sortBy = document.getElementById('sortBy').value;
    const order = document.getElementById('sortOrder').value;
    const data = await getJson(
        `/api/sheikha/global/countries?page=1&pageSize=40&sortBy=${encodeURIComponent(sortBy)}&order=${encodeURIComponent(order)}`
    );

    document.getElementById('countriesTable').innerHTML = data.items
        .map(x => {
            const stats = x.socioEconomicStats || {};
            return `<tr>
            <td>${x.countryAr}</td>
            <td>${x.continentAr}</td>
            <td class="good-high">${x.accelerationIndex}</td>
            <td class="bad-high">${x.povertyIndex}</td>
            <td>${x.shariaMarketJusticeIndex}</td>
            <td>${stats.unemploymentRate || 0}</td>
            <td>${fmtNum(stats.employed)}</td>
            <td>${fmtNum(stats.unemployed)}</td>
            <td>${fmtNum(stats.aidAmountUsd)}</td>
        </tr>`;
        })
        .join('');
}

async function loadCountryDetails() {
    const name = document.getElementById('countryInput').value.trim();
    if (!name) {
        document.getElementById('countryDetails').innerHTML = 'اكتب اسم الدولة أولاً.';
        return;
    }

    try {
        const country = await getJson(`/api/sheikha/global/countries/${encodeURIComponent(name)}`);
        const intervention = await getJson(
            `/api/sheikha/global/interventions/${encodeURIComponent(name)}`
        );

        const stats = country.socioEconomicStats || {};
        const causes = (intervention.rootCauseAnalysis || []).map(x => `${x.cause} (${x.weight})`);
        const immediate = intervention.interventionScenario?.immediateActions || [];
        const medium = intervention.interventionScenario?.mediumTermActions || [];
        const annual = intervention.interventionScenario?.annualTransformationActions || [];

        document.getElementById('countryDetails').innerHTML = `
            <h3>${country.countryAr}</h3>
            <p>القارة: ${country.continentAr}</p>
            <p>التسارع: ${country.accelerationIndex} | الفقر: ${country.povertyIndex} | العدالة: ${country.shariaMarketJusticeIndex}</p>
            <p>السكان: ${fmtNum(stats.population)} | الموظفون: ${fmtNum(stats.employed)} | العاطلون: ${fmtNum(stats.unemployed)}</p>
            <p>المساعدات: $${fmtNum(stats.aidAmountUsd)} | المستفيدون: ${fmtNum(stats.assistedPeople)} | غير المستفيدين: ${fmtNum(stats.notAssistedPeople)}</p>
            <h4>الأسباب الجذرية</h4>
            <ul>${listToHtml(causes)}</ul>
            <h4>تدخل فوري</h4>
            <ul>${listToHtml(immediate)}</ul>
            <h4>تدخل متوسط</h4>
            <ul>${listToHtml(medium)}</ul>
            <h4>تحول سنوي</h4>
            <ul>${listToHtml(annual)}</ul>
        `;
    } catch (err) {
        document.getElementById('countryDetails').innerHTML =
            `تعذر جلب بيانات الدولة: ${err.message}`;
    }
}

async function refreshAll() {
    const started = new Date();
    await loadOverview();
    await loadLeaderboards();
    await loadCountriesTable();
    document.getElementById('lastUpdated').textContent =
        `آخر تحديث: ${started.toLocaleString('ar-SA')}`;
}

document.getElementById('refreshBtn').addEventListener('click', refreshAll);
document.getElementById('countrySearchBtn').addEventListener('click', loadCountryDetails);
document.getElementById('loadCountriesBtn').addEventListener('click', loadCountriesTable);

refreshAll().catch(err => {
    document.getElementById('summaryCards').innerHTML =
        `<article class="card"><h3>خطأ</h3><p>${err.message}</p></article>`;
});
