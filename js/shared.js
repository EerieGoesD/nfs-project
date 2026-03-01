/**
 * NFS Car Performance Charts — Shared Engine
 * by Eerie Goes D
 * Reusable across all NFS game pages.
 */

var NFS = (function () {
  var MEDAL = ["\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"];
  var C = { ts: "#ff6a1a", acc: "#3b8bff", han: "#00d68f", total: "#8b5cf6" };

  function fmt(v) { return v.toFixed(1); }
  function rank(i) { return i < 3 ? MEDAL[i] : "#" + (i + 1); }
  function rc(i) { return i < 3 ? "rank-gold" : "rank-other"; }

  function sn(name, shortMap) {
    return (shortMap && shortMap[name]) || name;
  }

  /* ─── Single-stat bar chart + table ─── */
  function renderSingle(containerId, cars, shortMap, stat, color, label, maxStat) {
    var sorted = cars.slice().sort(function (a, b) { return b[stat] - a[stat]; });
    maxStat = maxStat || 10;
    var h = '<div class="bar-chart">';
    for (var i = 0; i < sorted.length; i++) {
      var c = sorted[i];
      var p = (c[stat] / maxStat * 100).toFixed(1);
      var isTop3 = i < 3;
      h += '<div class="bar-row">' +
        '<div class="bar-rank' + (isTop3 ? ' top3' : '') + '">' + rank(i) + '</div>' +
        '<div class="bar-label" title="' + c.name + '">' + sn(c.name, shortMap) + '</div>' +
        '<div class="bar-track"><div class="bar-fill" style="width:' + p + '%;background:' + color + '"><span>' + fmt(c[stat]) + '</span></div></div>' +
        '</div>';
    }
    h += '</div>';
    h += '<table class="stat-table"><thead><tr><th>Rank</th><th>Car</th><th style="color:' + color + '">' + label + '</th></tr></thead><tbody>';
    for (var i = 0; i < sorted.length; i++) {
      var c = sorted[i];
      h += '<tr><td class="' + rc(i) + '">' + rank(i) + '</td><td>' + c.name + '</td><td style="color:' + color + '">' + fmt(c[stat]) + '</td></tr>';
    }
    h += '</tbody></table>';
    document.getElementById(containerId).innerHTML = h;
  }

  /* ─── Stacked multi-stat bar chart + table ─── */
  function renderStacked(containerId, cars, shortMap, keys, colors, labels, sortKey) {
    var ext = cars.map(function (c) {
      var o = { name: c.name };
      for (var k in c) o[k] = c[k];
      o.ts_acc = (c.ts || 0) + (c.acc || 0);
      o.ts_han = (c.ts || 0) + (c.han || 0);
      o.acc_han = (c.acc || 0) + (c.han || 0);
      o.total = (c.ts || 0) + (c.acc || 0) + (c.han || 0);
      return o;
    });
    var sorted = ext.slice().sort(function (a, b) { return b[sortKey] - a[sortKey]; });
    var maxVal = sorted[0][sortKey];

    var h = '<div class="legend">';
    for (var i = 0; i < keys.length; i++) {
      h += '<div class="legend-item"><div class="legend-dot" style="background:' + colors[i] + '"></div>' + labels[i] + '</div>';
    }
    h += '</div><div class="bar-chart">';

    for (var i = 0; i < sorted.length; i++) {
      var c = sorted[i];
      var tot = 0;
      for (var j = 0; j < keys.length; j++) tot += c[keys[j]];
      var tp = (tot / maxVal * 100).toFixed(1);
      var isTop3 = i < 3;
      h += '<div class="bar-row">' +
        '<div class="bar-rank' + (isTop3 ? ' top3' : '') + '">' + rank(i) + '</div>' +
        '<div class="bar-label" title="' + c.name + '">' + sn(c.name, shortMap) + '</div>' +
        '<div class="bar-track"><div class="stacked-bar-fill" style="width:' + tp + '%">';
      for (var j = 0; j < keys.length; j++) {
        var sp = (c[keys[j]] / maxVal * 100).toFixed(2);
        h += '<div class="stacked-segment" style="width:' + sp + '%;background:' + colors[j] + '"></div>';
      }
      h += '</div></div><div class="bar-total">' + fmt(tot) + '</div></div>';
    }
    h += '</div>';

    h += '<table class="stat-table"><thead><tr><th>Rank</th><th>Car</th>';
    for (var i = 0; i < keys.length; i++) {
      h += '<th style="color:' + colors[i] + '">' + labels[i] + '</th>';
    }
    h += '<th style="color:#8b5cf6">Total</th></tr></thead><tbody>';
    for (var i = 0; i < sorted.length; i++) {
      var c = sorted[i];
      var tot = 0;
      for (var j = 0; j < keys.length; j++) tot += c[keys[j]];
      h += '<tr><td class="' + rc(i) + '">' + rank(i) + '</td><td>' + c.name + '</td>';
      for (var j = 0; j < keys.length; j++) {
        h += '<td style="color:' + colors[j] + '">' + fmt(c[keys[j]]) + '</td>';
      }
      h += '<td style="color:#8b5cf6">' + fmt(tot) + '</td></tr>';
    }
    h += '</tbody></table>';
    document.getElementById(containerId).innerHTML = h;
  }

  /* ─── Tab / Panel switching ─── */
  function initTabs(btnSelector, panelPrefix) {
    var btns = document.querySelectorAll(btnSelector);
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); });
        document.querySelectorAll('[id^="' + panelPrefix + '"]').forEach(function (p) { p.classList.remove('active'); });
        btn.classList.add('active');
        var target = document.getElementById(panelPrefix + btn.dataset.tab);
        if (target) target.classList.add('active');
      });
    });
  }

  /* ─── Best cars table helper ─── */
  function bestTable(rows) {
    var h = '<table class="stat-table"><thead><tr><th style="text-align:left;width:220px">Category</th><th style="text-align:left">Car</th><th>Score</th></tr></thead><tbody>';
    rows.forEach(function (r) {
      h += '<tr><td style="text-align:left;font-family:var(--font-body);font-weight:600;color:' + r[2] + ';font-size:12px">' + r[0] + '</td><td style="text-align:left;font-family:var(--font-body);font-weight:500">' + r[1] + '</td><td style="color:' + r[2] + '">' + r[3] + '</td></tr>';
    });
    h += '</tbody></table>';
    return h;
  }

  /* ─── TLDR card helper ─── */
  function tldrCard(label, car, stat, color) {
    return '<div class="tldr-card" style="border-left:3px solid ' + color + '">' +
      '<div class="tldr-lbl">' + label + '</div>' +
      '<div class="tldr-car">' + car + '</div>' +
      (stat ? '<div class="tldr-stat" style="color:' + color + '">' + stat + '</div>' : '') +
      '</div>';
  }

  /* ─── Render all 14 charts for a game ─── */
  function renderAllCharts(stockCars, tunedCars, shortMap) {
    // Stock single
    renderSingle("chart-s-ts", stockCars, shortMap, "ts", C.ts, "Top Speed", 10);
    renderSingle("chart-s-acc", stockCars, shortMap, "acc", C.acc, "Acceleration", 10);
    renderSingle("chart-s-han", stockCars, shortMap, "han", C.han, "Handling", 10);
    // Stock stacked
    renderStacked("chart-s-ts-acc", stockCars, shortMap, ["ts", "acc"], [C.ts, C.acc], ["Top Speed", "Acceleration"], "ts_acc");
    renderStacked("chart-s-ts-han", stockCars, shortMap, ["ts", "han"], [C.ts, C.han], ["Top Speed", "Handling"], "ts_han");
    renderStacked("chart-s-acc-han", stockCars, shortMap, ["acc", "han"], [C.acc, C.han], ["Acceleration", "Handling"], "acc_han");
    renderStacked("chart-s-total", stockCars, shortMap, ["ts", "acc", "han"], [C.ts, C.acc, C.han], ["Top Speed", "Acceleration", "Handling"], "total");
    // Tuned single
    renderSingle("chart-t-ts", tunedCars, shortMap, "ts", C.ts, "Top Speed", 100);
    renderSingle("chart-t-acc", tunedCars, shortMap, "acc", C.acc, "Acceleration", 100);
    renderSingle("chart-t-han", tunedCars, shortMap, "han", C.han, "Handling", 100);
    // Tuned stacked
    renderStacked("chart-t-ts-acc", tunedCars, shortMap, ["ts", "acc"], [C.ts, C.acc], ["Top Speed", "Acceleration"], "ts_acc");
    renderStacked("chart-t-ts-han", tunedCars, shortMap, ["ts", "han"], [C.ts, C.han], ["Top Speed", "Handling"], "ts_han");
    renderStacked("chart-t-acc-han", tunedCars, shortMap, ["acc", "han"], [C.acc, C.han], ["Acceleration", "Handling"], "acc_han");
    renderStacked("chart-t-total", tunedCars, shortMap, ["ts", "acc", "han"], [C.ts, C.acc, C.han], ["Top Speed", "Acceleration", "Handling"], "total");
  }

  return {
    C: C,
    fmt: fmt,
    renderSingle: renderSingle,
    renderStacked: renderStacked,
    renderAllCharts: renderAllCharts,
    initTabs: initTabs,
    tldrCard: tldrCard,
    bestTable: bestTable
  };
})();
