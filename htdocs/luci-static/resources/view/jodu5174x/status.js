'use strict';
'require view';
'require fs';
'require ui';
'require uci';
'require poll';

return view.extend({
	handleSaveApply: null,
	handleSave: null,
	handleReset: null,

	load: function () {
		return Promise.resolve();
	},

	render: function () {
		var isConfiguring = false;
		var rebootInProgress = false;

		var style = document.createElement('style');
		style.innerHTML = `
			@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

			#cbi-jodu5174x {
				font-family: 'Inter', sans-serif;
				color: #e2e8f0;
				margin-top: 10px;
				max-width: 100%;
				overflow-x: hidden;
				box-sizing: border-box;
			}
			#cbi-jodu5174x * { box-sizing: border-box; }

			.sa-header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px; }
			.sa-title-row { display: flex; align-items: center; gap: 15px; width: auto; }
			.sa-header-actions { display: flex; align-items: center; gap: 8px; }
			.sa-header-bar h2 { margin: 0; white-space: nowrap; line-height: 1; font-weight: 800; font-size: 24px; color: #f8fafc; }

			.sa-badge {
				font-size: 13px;
				font-weight: 500;
				color: #38bdf8;
				background: rgba(56,189,248,0.1);
				border: 1px solid rgba(56,189,248,0.3);
				padding: 4px 8px;
				border-radius: 6px;
				margin-left: 10px;
				vertical-align: middle;
			}

			.sa-uptime { display: flex; flex-direction: row; align-items: baseline; justify-content: flex-start; margin-top: 2px; }
			.sa-uptime-label { font-size: 13px; color: #94a3b8; font-weight: 500; margin-right: 6px; }
			.sa-uptime-val { font-size: 13px; font-weight: 600; color: #f8fafc; }

			.action-btn {
				margin: 0 !important;
				padding: 4px 12px !important;
				height: 28px !important;
				border-radius: 6px !important;
				box-sizing: border-box !important;
				font-size: 12px !important;
				font-weight: 600 !important;
				display: inline-flex;
				align-items: center;
				justify-content: center;
				cursor: pointer;
				transition: all 0.15s ease;
				border: none !important;
				gap: 6px;
			}

			.btn-red {
				background-color: #dc2626 !important;
				border: 1px solid #b91c1c !important;
				box-shadow: 0 0 8px rgba(220, 38, 38, 0.4) !important;
				color: #ffffff !important;
			}
			.btn-red:hover {
				background-color: #b91c1c !important;
				box-shadow: 0 0 12px rgba(220, 38, 38, 0.6) !important;
			}

			.btn-blue {
				background-color: #0284c7 !important;
				border: 1px solid #0369a1 !important;
				box-shadow: 0 0 8px rgba(2, 132, 199, 0.4) !important;
				color: #ffffff !important;
			}
			.btn-blue:hover {
				background-color: #0369a1 !important;
				box-shadow: 0 0 12px rgba(2, 132, 199, 0.6) !important;
			}

			.sa-grid-top { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 15px; margin-bottom: 20px; }

			.sa-card {
				padding: 16px 15px;
				text-align: center;
				border-radius: 12px;
				background: transparent;
				border: 1px solid rgba(255, 255, 255, 0.15);
			}

			.sa-icon { width: 42px; height: 42px; margin: 0 auto 12px auto; display: flex; align-items: center; justify-content: center; }
			.sa-card h2 { margin: 6px 0; font-size: 22px; font-weight: 700; }
			.sa-card span { font-size: 12px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; color: #94a3b8; }

			.sa-grid-mid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; margin-bottom: 20px; }

			.sa-grid-bot { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: stretch; margin-bottom: 20px; }
			.sa-grid-bot > .cbi-section { display: flex; flex-direction: column; }

			.cbi-section h3 { font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 600; color: #f8fafc; margin-bottom: 12px; }

			.sa-transparent-node {
				background: transparent;
				border: 1px solid rgba(255, 255, 255, 0.15);
				border-radius: 8px;
				overflow: hidden;
				flex: 1;
				display: flex;
				flex-direction: column;
			}
			.sa-table { width: 100%; flex: 1; border-collapse: collapse; }
			.sa-tr { border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
			.sa-tr:last-child { border-bottom: none; }

			.sa-td { padding: 10px 14px; font-size: 13px; }
			.sa-td.left { font-weight: 500; color: #94a3b8; width: 45%; }
			.sa-td.right { text-align: right; font-weight: 600; width: 55%; color: #e2e8f0; }
			.val-highlight { font-size: 14px; font-family: monospace; }

			.badge-active-cell {
				font-size: 11px !important;
				font-weight: 700 !important;
				color: #38bdf8 !important;
				background: rgba(56, 189, 248, 0.15) !important;
				border: 1px solid rgba(56, 189, 248, 0.4) !important;
				padding: 4px 10px !important;
				border-radius: 6px !important;
				display: inline-block;
				letter-spacing: 0.5px;
			}

			.cbi-page-actions { display: none !important; }

			@keyframes sa-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
			.sa-spin { animation: sa-spin 1s linear infinite; transform-origin: center; }

			@media (max-width: 900px) {
				.sa-grid-bot { grid-template-columns: 1fr; }
			}

			@media (max-width: 650px) {
				.sa-title-row { width: 100%; flex-wrap: wrap; gap: 8px; }
				.sa-uptime { width: 100%; justify-content: flex-start; margin-top: 0; flex-wrap: wrap; }
				.sa-header-actions { width: 100%; }
				.action-btn { flex: 1; height: 38px !important; font-size: 14px !important; }
				.sa-card { padding: 15px 12px; }
				.sa-card h2 { font-size: 20px; }
				.sa-td { padding: 8px 10px; }
			}

			@media (max-width: 560px) {
				.sa-grid-top { grid-template-columns: 1fr; }
			}
		`;
		document.head.appendChild(style);

		var container = document.createElement('div');
		container.className = 'cbi-map';
		container.id = 'cbi-jodu5174x';
		container.innerHTML = `
			<div class="sa-header-bar">
				<div class="sa-title-row">
					<h2 name="content">
						5G Dashboard
						<span class="sa-badge" id="ui-model-badge">JODU5174x</span>
					</h2>
					<div class="sa-uptime">
						<span class="sa-uptime-label">Uptime:</span>
						<span id="ui-uptime-val" class="sa-uptime-val">--</span>
					</div>
				</div>

				<div class="sa-header-actions">
					<button class="btn action-btn btn-red" id="odu-reboot-btn">
						<svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
						<span style="color:#ffffff !important;">Reboot</span>
					</button>
					<button class="btn action-btn btn-blue" id="odu-settings-btn">
						<svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
						<span style="color:#ffffff !important;">Settings</span>
					</button>
				</div>
			</div>

			<div class="sa-grid-top">
				<div class="cbi-section-node sa-card">
					<div class="sa-icon">
						<img src="${L.resource('jodu5174x/jio-logo.png')}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));" alt="Jio Logo" onerror="this.style.display='none'">
					</div>
					<h2 style="color: #60a5fa; text-shadow: 0 0 15px rgba(96,165,250,0.4);">JioTrue 5G</h2>
					<span id="ui-top-mode">--</span>
				</div>
				<div class="cbi-section-node sa-card">
					<div class="sa-icon" id="icon-sig">
						<svg viewBox="0 0 24 24" fill="none" width="36" height="36">
							<rect x="2" y="16" width="3" height="6" rx="1.5" fill="#334155"/>
							<rect x="7" y="12" width="3" height="10" rx="1.5" fill="#334155"/>
							<rect x="12" y="8" width="3" height="14" rx="1.5" fill="#334155"/>
							<rect x="17" y="4" width="3" height="18" rx="1.5" fill="#334155"/>
						</svg>
					</div>
					<h2 id="ui-sig-pct">--%</h2><span>Signal Quality</span>
				</div>
				<div class="cbi-section-node sa-card">
					<div class="sa-icon" id="icon-conn">
						<svg viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="36" height="36"><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M17.31 17.31A10.43 10.43 0 0 1 12 19c-7 0-10-7-10-7a13.23 13.23 0 0 1 7.58-6.19"/><path d="M14 14.66V17c0 .55-.47.98-.97 1.21C11.69 18.75 10 18.24 10 17v-2.34"/><path d="m2 2 20 20"/></svg>
					</div>
					<h2 id="ui-state" style="color: #f43f5e; text-shadow: 0 0 15px rgba(244,63,94,0.4);">LINK DOWN</h2><span>Connection</span>
				</div>
			</div>

			<div class="sa-grid-mid">
				<div class="cbi-section-node sa-card" style="padding: 12px 15px; display: flex; justify-content: space-evenly; align-items: center; flex-direction: row; flex-wrap: wrap;">
					<div style="font-weight: 600; color: #f8fafc; font-size: 14px;">Data Usage (Session)</div>
					<div style="display: flex; gap: 30px;">
						<div style="text-align: center;"><span style="font-size: 11px; color:#94a3b8;">DOWNLOAD</span> <b id="ui-rx-bytes" style="font-size: 16px; color: #4ade80;">--</b></div>
						<div style="text-align: center;"><span style="font-size: 11px; color:#94a3b8;">UPLOAD</span> <b id="ui-tx-bytes" style="font-size: 16px; color: #38bdf8;">--</b></div>
					</div>
				</div>
			</div>

			<div class="sa-grid-bot">
				<div class="cbi-section">
					<h3>Cellular Parameters (Primary Cell)</h3>
					<div class="sa-transparent-node">
						<table class="sa-table">
							<tr class="sa-tr"><td class="sa-td left">Ethernet Link</td><td class="sa-td right val-highlight" id="ui-eth-link">--</td></tr>
							<tr class="sa-tr"><td class="sa-td left">Band</td><td class="sa-td right val-highlight" id="ui-band">--</td></tr>
							<tr class="sa-tr"><td class="sa-td left">Bandwidth</td><td class="sa-td right val-highlight" id="ui-bw">--</td></tr>
							<tr class="sa-tr"><td class="sa-td left">NR-ARFCN</td><td class="sa-td right val-highlight" id="ui-arfcn">--</td></tr>
							<tr class="sa-tr"><td class="sa-td left">Physical Cell ID</td><td class="sa-td right val-highlight" id="ui-pcid">--</td></tr>
							<tr class="sa-tr"><td class="sa-td left">Modulation</td><td class="sa-td right val-highlight" id="ui-mod">--</td></tr>
							<tr class="sa-tr"><td class="sa-td left">BLER</td><td class="sa-td right val-highlight" id="ui-bler">--</td></tr>
							<tr class="sa-tr"><td class="sa-td left">MIMO</td><td class="sa-td right val-highlight" id="ui-mimo">--</td></tr>
							<tr class="sa-tr"><td class="sa-td left">RSRP</td><td class="sa-td right val-highlight" id="ui-rsrp">--</td></tr>
							<tr class="sa-tr"><td class="sa-td left">RSRQ</td><td class="sa-td right val-highlight" id="ui-rsrq" style="color: #f472b6;">--</td></tr>
							<tr class="sa-tr"><td class="sa-td left">SINR</td><td class="sa-td right val-highlight" id="ui-sinr" style="color: #38bdf8;">--</td></tr>
						</table>
					</div>
				</div>

				<div class="cbi-section">
					<h3>Cellular Parameters (Secondary Cell)</h3>
					<div class="sa-transparent-node">
						<table class="sa-table">
							<tr class="sa-tr"><td class="sa-td left">Aggregation Status</td><td class="sa-td right val-highlight" id="ui-ca-status">Inactive</td></tr>
							<tr class="sa-tr"><td class="sa-td left">Band</td><td class="sa-td right val-highlight" id="ui-scc-band">NA</td></tr>
							<tr class="sa-tr"><td class="sa-td left">Bandwidth</td><td class="sa-td right val-highlight" id="ui-scc-bw">NA</td></tr>
							<tr class="sa-tr"><td class="sa-td left">NR-ARFCN</td><td class="sa-td right val-highlight" id="ui-scc-arfcn">NA</td></tr>
							<tr class="sa-tr"><td class="sa-td left">Physical Cell ID</td><td class="sa-td right val-highlight" id="ui-scc-pcid">NA</td></tr>
							<tr class="sa-tr"><td class="sa-td left">Modulation</td><td class="sa-td right val-highlight" id="ui-scc-mod">NA</td></tr>
							<tr class="sa-tr"><td class="sa-td left">BLER</td><td class="sa-td right val-highlight" id="ui-scc-bler">NA</td></tr>
							<tr class="sa-tr"><td class="sa-td left">MIMO</td><td class="sa-td right val-highlight" id="ui-scc-mimo">NA</td></tr>
							<tr class="sa-tr"><td class="sa-td left">RSRP</td><td class="sa-td right val-highlight" id="ui-scc-rsrp">NA</td></tr>
							<tr class="sa-tr"><td class="sa-td left">RSRQ</td><td class="sa-td right val-highlight" id="ui-scc-rsrq" style="color: #f472b6;">NA</td></tr>
						</table>
					</div>
				</div>
			</div>
		`;

		function fmt(v) {
			if (v === undefined || v === null || v === '' || v === 'NA')
				return '--';
			return v;
		}

		function modelFromSoftversion(sv) {
			if (!sv) return 'JODU5174x';
			var m = sv.split('_REL_')[0];
			return m || 'JODU5174x';
		}

		function isFDDBand(band) {
			var fdd = ['n1', 'n3', 'n5', 'n8', 'n28', 'n40'];
			return fdd.indexOf(band) !== -1;
		}

		// ODU already appends the unit to some fields (e.g. "30 MHz", "-83 dBm").
		// Only append it ourselves if it isn't already there, to avoid "30 MHz MHz".
		function withUnit(val, unit) {
			if (val === undefined || val === null || val === '' || val === 'NA')
				return null;
			var s = String(val).trim();
			return s.indexOf(unit) !== -1 ? s : (s + ' ' + unit);
		}

		function openConfirmModal(title, msg, onConfirm) {
			var body = document.createElement('div');
			body.innerHTML = `<div style="padding: 10px 0; color: #e2e8f0; font-size: 14px;">${msg}</div>`;

			var btnWrap = document.createElement('div');
			btnWrap.className = 'right';
			btnWrap.style.marginTop = '20px';

			var btnCancel = document.createElement('button');
			btnCancel.className = 'btn';
			btnCancel.innerText = 'Cancel';
			btnCancel.onclick = ui.hideModal;
			btnWrap.appendChild(btnCancel);

			var btnOk = document.createElement('button');
			btnOk.className = 'btn cbi-button-action important';
			btnOk.style.marginLeft = '8px';
			btnOk.innerText = 'Confirm';
			btnOk.onclick = function () {
				ui.hideModal();
				onConfirm();
			};
			btnWrap.appendChild(btnOk);

			body.appendChild(btnWrap);
			ui.showModal(title, [body]);
		}

		function openSettingsModal() {
			uci.unload('jodu5174x');
			uci.load('jodu5174x').then(function () {
				var host = uci.get('jodu5174x', 'main', 'host') || '192.168.225.1';
				var user = uci.get('jodu5174x', 'main', 'username') || 'Anish';
				var pass = uci.get('jodu5174x', 'main', 'password') || '';

				var body = document.createElement('div');
				body.innerHTML = `
					<div class="cbi-value">
						<label class="cbi-value-title">ODU IP Address</label>
						<div class="cbi-value-field">
							<input type="text" id="cfg-host" class="cbi-input-text" value="${host}" autocomplete="off" data-lpignore="true">
						</div>
					</div>
					<div class="cbi-value">
						<label class="cbi-value-title">WebUI Username</label>
						<div class="cbi-value-field">
							<input type="text" id="cfg-user" class="cbi-input-text" value="${user}" autocomplete="off" data-lpignore="true">
						</div>
					</div>
					<div class="cbi-value">
						<label class="cbi-value-title">WebUI Password</label>
						<div class="cbi-value-field">
							<input type="password" id="cfg-pass" class="cbi-input-text" value="${pass}" autocomplete="new-password" data-lpignore="true">
						</div>
					</div>
				`;

				var btnWrap = document.createElement('div');
				btnWrap.className = 'right';
				btnWrap.style.marginTop = '20px';

				var btnCancel = document.createElement('button');
				btnCancel.className = 'btn';
				btnCancel.innerText = 'Cancel';
				btnCancel.onclick = ui.hideModal;
				btnWrap.appendChild(btnCancel);

				var btnSave = document.createElement('button');
				btnSave.className = 'btn cbi-button-action important';
				btnSave.style.marginLeft = '8px';
				btnSave.innerText = 'Save & Apply';
				btnSave.onclick = function () {
					var newHost = (document.getElementById('cfg-host') ? document.getElementById('cfg-host').value.trim() : '') || '192.168.225.1';
					var newUser = (document.getElementById('cfg-user') ? document.getElementById('cfg-user').value.trim() : '');
					var newPass = (document.getElementById('cfg-pass') ? document.getElementById('cfg-pass').value.trim() : '');

					btnSave.innerText = 'Applying...';
					btnSave.disabled = true;

					ui.hideModal();

					var cmds = [
						'uci set jodu5174x.main.host="' + newHost + '"',
						'uci set jodu5174x.main.username="' + newUser + '"',
						'uci set jodu5174x.main.password="' + newPass + '"',
						'uci commit jodu5174x'
					].join('; ');

					fs.exec_direct('/bin/sh', ['-c', cmds]).then(function () {
						window.location.reload();
					}).catch(function (e) {});
				};
				btnWrap.appendChild(btnSave);

				body.appendChild(btnWrap);
				ui.showModal('Settings (JODU5174x)', [body]);
			});
		}

		var btnSettings = container.querySelector('#odu-settings-btn');
		btnSettings.addEventListener('click', function () {
			openSettingsModal();
		});

		var rebootBtn = container.querySelector('#odu-reboot-btn');
		rebootBtn.addEventListener('click', function () {
			openConfirmModal(
				'Reboot ODU',
				'This reboots the <b>JODU51740/51741 ODU</b> itself. The 5G connection will drop for a minute or two while it restarts, and this dashboard will refresh automatically once it\'s back. Continue?',
				function () {
					rebootInProgress = true;
					rebootBtn.disabled = true;
					rebootBtn.innerHTML = '<svg class="sa-spin" style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg><span style="color:#ffffff !important;">Rebooting\u2026</span>';

					ui.addNotification(null, E('p', 'Rebooting the ODU\u2026'), 'info');
					fs.exec_direct('/usr/libexec/jodu5174x-reboot.sh', []).catch(function (e) {});
				}
			);
		});

		poll.add(function () {
			if (isConfiguring) return;

			return fs.exec_direct('/usr/libexec/jodu5174x-data.sh', []).then(function (res) {
				if (isConfiguring) return;

				try {
					if (!res) return;
					var payload = JSON.parse(res.trim());

					var ethEl = document.getElementById('ui-eth-link');
					if (ethEl) {
						var eth = payload.eth_link;
						if (eth === 'down') { ethEl.innerText = 'DOWN'; ethEl.style.color = '#f43f5e'; }
						else if (!eth || eth === 'unknown') { ethEl.innerText = '--'; ethEl.style.color = ''; }
						else { ethEl.innerText = (eth === 'up' ? 'UP' : eth); ethEl.style.color = '#4ade80'; }
					}

					if (rebootInProgress && payload.netstatus && !payload.error) {
						rebootInProgress = false;
						ui.addNotification(null, E('p', 'ODU is back online \u2014 refreshing\u2026'), 'info');
						setTimeout(function () { window.location.reload(); }, 800);
						return;
					}

					var stateEl = document.getElementById('ui-state');
					var iconEl = document.getElementById('icon-conn');

					if (payload.error || !payload.netstatus) {
						if (rebootInProgress) {
							if (stateEl) {
								stateEl.className = '';
								stateEl.innerText = 'REBOOTING\u2026';
								stateEl.style.color = '#38bdf8';
								stateEl.style.textShadow = '0 0 15px rgba(56,189,248,0.4)';
							}
							if (iconEl) {
								iconEl.innerHTML = '<svg class="sa-spin" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" width="36" height="36"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg>';
							}
							return;
						}
						if (stateEl) {
							stateEl.className = '';
							stateEl.innerText = 'LINK DOWN';
							stateEl.style.color = '#f43f5e';
							stateEl.style.textShadow = '0 0 15px rgba(244,63,94,0.4)';
						}
						if (iconEl) {
							iconEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="36" height="36"><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M17.31 17.31A10.43 10.43 0 0 1 12 19c-7 0-10-7-10-7a13.23 13.23 0 0 1 7.58-6.19"/><path d="M14 14.66V17c0 .55-.47.98-.97 1.21C11.69 18.75 10 18.24 10 17v-2.34"/><path d="m2 2 20 20"/></svg>';
						}
						return;
					}

					var n = payload.netstatus;
					var ds = payload.datastatus || {};

					var attached = (n.sim_card_state === 'Attached' || n.sim_card_state === 'Roaming');
					var provisioning = /provision/i.test(n.sim_card_state || '') || /provision/i.test(n.rrc_state || '');

					if (provisioning) {
						if (stateEl) {
							stateEl.className = '';
							stateEl.innerText = 'PROVISIONING';
							stateEl.style.color = '#2dd4bf';
							stateEl.style.textShadow = '0 0 15px rgba(45,212,191,0.4)';
						}
						if (iconEl) {
							iconEl.innerHTML = '<svg class="sa-spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="36" height="36"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="#2dd4bf"/></svg>';
						}
					} else if (stateEl) {
						stateEl.className = '';
						stateEl.innerText = attached ? 'LINK ACTIVE' : (fmt(n.sim_card_state) || 'DOWN').toUpperCase();
						stateEl.style.color = attached ? '#4ade80' : '#f43f5e';
						stateEl.style.textShadow = attached ? '0 0 15px rgba(74,222,128,0.4)' : '0 0 15px rgba(244,63,94,0.4)';

						if (iconEl) {
							iconEl.innerHTML = attached
								? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="36" height="36"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>'
								: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="36" height="36"><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M17.31 17.31A10.43 10.43 0 0 1 12 19c-7 0-10-7-10-7a13.23 13.23 0 0 1 7.58-6.19"/><path d="M14 14.66V17c0 .55-.47.98-.97 1.21C11.69 18.75 10 18.24 10 17v-2.34"/><path d="m2 2 20 20"/></svg>';
						}
					}

					var modelEl = document.getElementById('ui-model-badge');
					if (modelEl) modelEl.innerText = modelFromSoftversion(n.softversion);

					var topModeEl = document.getElementById('ui-top-mode');
					if (topModeEl) topModeEl.innerText = fmt(n.operation_mode) + ' | ' + fmt(n.rrc_state);

					var upEl = document.getElementById('ui-uptime-val');
					if (upEl) upEl.innerText = fmt(n.connection_time);

					var el;
					el = document.getElementById('ui-band'); if (el) el.innerText = fmt(n.band);
					el = document.getElementById('ui-bw'); if (el) el.innerText = withUnit(n.band_width, 'MHz') || '--';
					el = document.getElementById('ui-arfcn'); if (el) el.innerText = fmt(n.arfcn);
					el = document.getElementById('ui-pcid'); if (el) el.innerText = fmt(n.pcid);
					el = document.getElementById('ui-mod'); if (el) el.innerText = fmt(n.modulation);
					el = document.getElementById('ui-mimo'); if (el) el.innerText = fmt(n.mimo);

					var blerVal = n.bler_dl !== undefined ? (parseFloat(n.bler_dl) * 100).toFixed(2) + '%' : '--';
					var uiBler = document.getElementById('ui-bler');
					if (uiBler) {
						uiBler.innerText = blerVal;
						var blerNum = parseFloat(blerVal);
						uiBler.style.color = (isNaN(blerNum) || blerNum === 0) ? '#4ade80' : (blerNum >= 10 ? '#f43f5e' : '#fbbf24');
					}

					var rsrp = parseInt(n.rsrp, 10); if (isNaN(rsrp)) rsrp = -130;
					var rsrq = parseInt(n.rsrq, 10); if (isNaN(rsrq)) rsrq = -20;
					var sinr = parseInt(n.sinr, 10); if (isNaN(sinr)) sinr = 0;

					var rsrpCol = rsrp >= -85 ? '#4ade80' : (rsrp >= -100 ? '#fbbf24' : '#f43f5e');
					var uiRsrp = document.getElementById('ui-rsrp');
					if (uiRsrp) { uiRsrp.innerText = (n.rsrp !== undefined ? rsrp + ' dBm' : '--'); uiRsrp.style.color = rsrpCol; }

					var rsrqCol = rsrq >= -9 ? '#4ade80' : (rsrq >= -13 ? '#fbbf24' : '#f43f5e');
					var uiRsrq = document.getElementById('ui-rsrq');
					if (uiRsrq) { uiRsrq.innerText = (n.rsrq !== undefined ? rsrq + ' dB' : '--'); uiRsrq.style.color = rsrqCol; }

					var sinrCol = sinr >= 15 ? '#4ade80' : (sinr >= 5 ? '#fbbf24' : '#f43f5e');
					var uiSinr = document.getElementById('ui-sinr');
					if (uiSinr) { uiSinr.innerText = (n.sinr !== undefined ? sinr + ' dB' : '--'); uiSinr.style.color = sinrCol; }

					var qRsrp = Math.max(0, Math.min(100, ((rsrp + 115) / 55) * 100));
					var qRsrq = Math.max(0, Math.min(100, ((rsrq + 18) / 9) * 100));
					var qSinr = Math.max(0, Math.min(100, (sinr / 30) * 100));
					var sigQuality = Math.round((qRsrp * 0.6) + (qRsrq * 0.2) + (qSinr * 0.2));
					if (isNaN(sigQuality)) sigQuality = 0;

					var qCol = sigQuality >= 70 ? '#4ade80' : (sigQuality >= 40 ? '#fbbf24' : '#f43f5e');
					var sigEl = document.getElementById('ui-sig-pct');
					if (sigEl) {
						sigEl.innerText = sigQuality + '%';
						sigEl.style.color = qCol;
						sigEl.style.textShadow = '0 0 15px ' + qCol + '66';
					}

					var activeBars = 0;
					if (sigQuality >= 80) activeBars = 4;
					else if (sigQuality >= 55) activeBars = 3;
					else if (sigQuality >= 30) activeBars = 2;
					else if (sigQuality > 0) activeBars = 1;

					var barSpecs = [ {y:16,h:6}, {y:12,h:10}, {y:8,h:14}, {y:4,h:18} ];
					var sigSvg = '<svg viewBox="0 0 24 24" fill="none" width="36" height="36">';
					var xs = [2, 7, 12, 17];
					for (var i = 0; i < 4; i++) {
						var fCol = (i < activeBars) ? '#38bdf8' : '#334155';
						sigSvg += '<rect x="' + xs[i] + '" y="' + barSpecs[i].y + '" width="3" height="' + barSpecs[i].h + '" rx="1.5" fill="' + fCol + '"/>';
					}
					sigSvg += '</svg>';
					var iSig = document.getElementById('icon-sig');
					if (iSig) iSig.innerHTML = sigSvg;

					var uiRx = document.getElementById('ui-rx-bytes');
					var uiTx = document.getElementById('ui-tx-bytes');
					if (uiRx) uiRx.innerText = fmt(ds.downData);
					if (uiTx) uiTx.innerText = fmt(ds.upData);

					if (n.arfcn_sec && n.arfcn_sec !== 'NA') {
						el = document.getElementById('ui-ca-status'); if (el) { el.innerText = 'Active (CA)'; el.style.color = '#03dac6'; }
						el = document.getElementById('ui-scc-band'); if (el) el.innerText = fmt(n.band_sec);
						el = document.getElementById('ui-scc-bw'); if (el) el.innerText = withUnit(n.band_width_sec, 'MHz') || 'NA';
						el = document.getElementById('ui-scc-arfcn'); if (el) el.innerText = fmt(n.arfcn_sec);
						el = document.getElementById('ui-scc-pcid'); if (el) el.innerText = n.pcid_sec || 'NA';
						el = document.getElementById('ui-scc-mod'); if (el) el.innerText = fmt(n.modulation_sec);
						el = document.getElementById('ui-scc-mimo'); if (el) el.innerText = fmt(n.mimo_sec);
						el = document.getElementById('ui-scc-rsrp'); if (el) el.innerText = withUnit(n.rsrp_sec, 'dBm') || 'NA';
						el = document.getElementById('ui-scc-rsrq'); if (el) el.innerText = withUnit(n.rsrq_sec, 'dB') || 'NA';
						var sbler = n.bler_dl_sec !== undefined ? (parseFloat(n.bler_dl_sec) * 100).toFixed(2) + '%' : 'NA';
						el = document.getElementById('ui-scc-bler'); if (el) el.innerText = sbler;
					} else {
						el = document.getElementById('ui-ca-status'); if (el) { el.innerText = 'Inactive'; el.style.color = '#94a3b8'; }
						['ui-scc-band', 'ui-scc-bw', 'ui-scc-arfcn', 'ui-scc-pcid', 'ui-scc-mod', 'ui-scc-mimo', 'ui-scc-rsrp', 'ui-scc-rsrq', 'ui-scc-bler'].forEach(function (id) {
							var e = document.getElementById(id); if (e) e.innerText = 'NA';
						});
					}
				} catch (e) {}
			});
		}, 5);

		return container;
	}
});
