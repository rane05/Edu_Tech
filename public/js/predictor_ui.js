// predictor_ui.js - College Predictor JavaScript (separate from EJS to avoid compile issues)

document.addEventListener('DOMContentLoaded', function () {
    // ---- Fit score rings ----
    document.querySelectorAll('.fit-ring-canvas').forEach(function (canvas) {
        var score = parseInt(canvas.dataset.score, 10);
        var type = canvas.dataset.type;
        var ctx = canvas.getContext('2d');
        var color = type === 'Safe' ? '#10b981' : (type === 'Dream' ? '#ef4444' : '#f59e0b');
        var bg = type === 'Safe' ? '#d1fae5' : (type === 'Dream' ? '#fee2e2' : '#fef3c7');
        var cx = 36, cy = 36, r = 28;
        var start = -Math.PI / 2;
        var end = start + (2 * Math.PI * score / 100);
        ctx.clearRect(0, 0, 72, 72);
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.strokeStyle = bg; ctx.lineWidth = 7; ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, r, start, end);
        ctx.strokeStyle = color; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.stroke();
    });

    // ---- Branch trend donut ----
    var tCtx = document.getElementById('trendChart');
    if (tCtx) {
        new Chart(tCtx, {
            type: 'doughnut',
            data: {
                labels: ['CS/AI', 'Mechanical', 'E&TC', 'Civil', 'Others'],
                datasets: [{ data: [45, 18, 17, 10, 10], backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#d1d5db'], borderWidth: 0 }]
            },
            options: { cutout: '68%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } } }
        });
    }

    // ---- Event delegation for results list ----
    var resultsList = document.getElementById('results-list');
    if (resultsList) {
        resultsList.addEventListener('click', function (e) {
            var chip = e.target.closest('.branch-chip');
            if (chip) {
                var college = chip.dataset.college || '';
                var branch = chip.dataset.branch || '';
                var trend = {};
                try { trend = JSON.parse(chip.dataset.trend.replace(/&quot;/g, '"')); } catch (ex) { }
                showCutoffHistory(college, branch, trend);
            }
            var wishBtn = e.target.closest('.btn-wishlist');
            if (wishBtn) {
                var d = wishBtn.dataset;
                toggleWishlist(d.idx, (d.name || '').replace(/&quot;/g, '"'), d.location || '', d.fit || '0');
            }
            var cmpBtn = e.target.closest('.btn-compare');
            if (cmpBtn) {
                addToCompare(parseInt(cmpBtn.dataset.idx, 10));
            }
        });
    }

    // ---- Restore wishlist ----
    loadWishlist();
});

// ===== WISHLIST =====
var wishlist = JSON.parse(localStorage.getItem('cet_wishlist') || '[]');

function toggleWishlist(idx, name, location, fit) {
    var btn = document.getElementById('wish-' + idx);
    var pos = wishlist.findIndex(function (w) { return w.name === name; });
    if (pos >= 0) {
        wishlist.splice(pos, 1);
        if (btn) { btn.classList.remove('saved'); btn.innerHTML = '<i class="far fa-heart"></i> Save'; }
    } else {
        wishlist.push({ name: name, location: location, fit: fit });
        if (btn) { btn.classList.add('saved'); btn.innerHTML = '<i class="fas fa-heart"></i> Saved'; }
    }
    localStorage.setItem('cet_wishlist', JSON.stringify(wishlist));
    renderWishlist();
}

function loadWishlist() {
    wishlist = JSON.parse(localStorage.getItem('cet_wishlist') || '[]');
    renderWishlist();
    document.querySelectorAll('[id^="wish-"]').forEach(function (btn) {
        var card = btn.closest('.college-card');
        if (card && wishlist.some(function (w) { return w.name === card.dataset.name; })) {
            btn.classList.add('saved');
            btn.innerHTML = '<i class="fas fa-heart"></i> Saved';
        }
    });
}

function renderWishlist() {
    var panel = document.getElementById('wishlist-panel');
    var items = document.getElementById('wishlist-items');
    if (!panel || !items) return;
    if (wishlist.length === 0) { panel.style.display = 'none'; return; }
    panel.style.display = 'block';
    items.innerHTML = wishlist.map(function (w) {
        return '<div class="d-flex justify-content-between align-items-center p-2 bg-light rounded-2">'
            + '<div class="small">'
            + '<div class="fw-bold" style="font-size:0.78rem">' + w.name.substring(0, 30) + '</div>'
            + '<div class="text-muted" style="font-size:0.7rem">' + w.location + ' Fit: ' + w.fit + '</div>'
            + '</div>'
            + '<button class="btn btn-outline-danger btn-sm py-0 px-2" onclick="removeWish(' + JSON.stringify(w.name) + ')">X</button>'
            + '</div>';
    }).join('');
}

function removeWish(name) {
    wishlist = wishlist.filter(function (w) { return w.name !== name; });
    localStorage.setItem('cet_wishlist', JSON.stringify(wishlist));
    loadWishlist();
}

// ===== COMPARE =====
var compareList = [];
var historyChartInstance = null;

function addToCompare(idx) {
    var card = document.getElementById('card-' + idx);
    if (!card) return;
    var name = card.dataset.name;
    if (compareList.find(function (c) { return c.idx === idx; })) { alert('Already added.'); return; }
    if (compareList.length >= 3) { alert('Compare up to 3 colleges.'); return; }
    compareList.push({
        idx: idx, name: name,
        location: card.dataset.location,
        fit: card.dataset.fit,
        type: card.dataset.type,
        cutoff: card.dataset.cutoff,
        branch: card.dataset.branch
    });
    card.classList.add('selected-compare');
    renderCompareBar();
}

function removeFromCompare(idx) {
    compareList = compareList.filter(function (c) { return c.idx !== idx; });
    var card = document.getElementById('card-' + idx);
    if (card) card.classList.remove('selected-compare');
    renderCompareBar();
}

function clearCompare() {
    compareList.forEach(function (c) {
        var card = document.getElementById('card-' + c.idx);
        if (card) card.classList.remove('selected-compare');
    });
    compareList = [];
    renderCompareBar();
}

function renderCompareBar() {
    var bar = document.getElementById('compare-bar');
    var items = document.getElementById('compare-items');
    var btn = document.getElementById('compareBtn');
    var count = document.getElementById('compareCount');
    if (!bar) return;
    if (compareList.length === 0) {
        bar.classList.remove('show');
        if (btn) btn.style.display = 'none';
        return;
    }
    bar.classList.add('show');
    if (btn) { btn.style.display = 'inline-block'; if (count) count.textContent = compareList.length; }
    items.innerHTML = compareList.map(function (c) {
        return '<div class="compare-chip">' + c.name.substring(0, 25)
            + '<span class="remove" onclick="removeFromCompare(' + c.idx + ')">X</span></div>';
    }).join('');
}

function openCompare() {
    if (compareList.length < 2) { alert('Add at least 2 colleges to compare.'); return; }
    var body = document.getElementById('compare-table-body');
    var rows = [
        { label: 'Location', key: 'location' },
        { label: 'Best Cutoff', key: 'cutoff', suffix: '%' },
        { label: 'Fit Score', key: 'fit' },
        { label: 'Match Type', key: 'type' },
        { label: 'Best Branch', key: 'branch' }
    ];
    var html = '<div class="table-responsive"><table class="table table-bordered text-center align-middle">'
        + '<thead><tr><th style="min-width:140px">Criteria</th>';
    compareList.forEach(function (c) { html += '<th>' + c.name.substring(0, 30) + '</th>'; });
    html += '</tr></thead><tbody>';
    rows.forEach(function (row) {
        html += '<tr><td class="fw-bold text-start">' + row.label + '</td>';
        var numVals = compareList.map(function (c) { return parseFloat(c[row.key]); }).filter(function (v) { return !isNaN(v); });
        compareList.forEach(function (c) {
            var val = c[row.key];
            var cls = '';
            if (numVals.length > 0 && !isNaN(parseFloat(val))) {
                var best = row.key === 'cutoff'
                    ? parseFloat(val) === Math.min.apply(null, numVals)
                    : parseFloat(val) === Math.max.apply(null, numVals);
                if (best) cls = 'better';
            }
            html += '<td class="' + cls + '">' + val + (row.suffix || '') + '</td>';
        });
        html += '</tr>';
    });
    html += '</tbody></table></div>';
    body.innerHTML = html;
    new bootstrap.Modal(document.getElementById('compare-modal')).show();
}

// ===== CUTOFF HISTORY MODAL =====
function showCutoffHistory(college, branch, trendData) {
    var titleEl = document.getElementById('historyModalTitle');
    if (titleEl) titleEl.textContent = branch + ' - ' + college.substring(0, 35);

    var keys = Object.keys(trendData).sort();
    var vals = keys.map(function (k) { return trendData[k]; });
    var table = document.getElementById('historyTable');

    if (keys.length === 0) {
        if (table) table.innerHTML = '<p class="text-muted text-center">Trend data coming soon.</p>';
        var hc = document.getElementById('historyChart');
        if (hc) hc.style.display = 'none';
    } else {
        var hc2 = document.getElementById('historyChart');
        if (hc2) hc2.style.display = 'block';
        var rowsHTML = keys.map(function (k, i) {
            return '<tr><td>' + k + '</td><td><strong>' + vals[i].toFixed(2) + '</strong></td></tr>';
        }).join('');
        if (table) {
            table.innerHTML = '<table class="table table-sm table-bordered text-center">'
                + '<thead class="table-dark"><tr><th>Period</th><th>Cutoff %</th></tr></thead>'
                + '<tbody>' + rowsHTML + '</tbody></table>';
        }
        if (historyChartInstance) historyChartInstance.destroy();
        historyChartInstance = new Chart(document.getElementById('historyChart'), {
            type: 'line',
            data: {
                labels: keys,
                datasets: [{
                    label: 'Cutoff %',
                    data: vals,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99,102,241,0.08)',
                    pointBackgroundColor: '#6366f1',
                    tension: 0.35,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { reverse: true, title: { display: true, text: 'Cutoff %' } } }
            }
        });
    }
    new bootstrap.Modal(document.getElementById('historyModal')).show();
}
