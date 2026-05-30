import { createServer } from 'node:http';

const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || '0.0.0.0';
const embeddedHtml = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>股市 &amp; Co. — 台股智慧看盤</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;background:#f5f0e8;color:#3d1f0a;min-height:100vh;font-size:14px}
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-track{background:#ede4d5}
::-webkit-scrollbar-thumb{background:#d4b896;border-radius:3px}

/* NAV */
.navbar{display:flex;align-items:center;background:#3d1f0a;border-bottom:1px solid #2a1506;padding:0 20px;height:52px;gap:24px;position:sticky;top:0;z-index:100}
.navbar-brand{font-size:18px;font-weight:700;color:#f5ead8;white-space:nowrap;font-family:Georgia,serif;letter-spacing:.5px}
.navbar-tabs{display:flex;gap:4px;flex:1}
.tab-btn{padding:7px 16px;border:none;background:transparent;color:#9a7050;cursor:pointer;border-radius:6px;font-size:13px;transition:all .2s;font-family:Arial,sans-serif}
.tab-btn:hover{background:#5a2d0e;color:#f5ead8}
.tab-btn.active{background:#c17f3e;color:#fff;font-weight:700}
.navbar-info{display:flex;align-items:center;gap:12px;font-size:13px;color:#9a7050}
.badge-demo{background:#c17f3e;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700}
.index-up{color:#c0392b}

/* TABS */
.tab-content{display:none}
.tab-content.active{display:block}

/* SCREENER LAYOUT */
.screener-layout{display:grid;grid-template-columns:320px 1fr;height:calc(100vh - 52px);overflow:hidden}
.filter-panel{background:#ede4d5;border-right:0.5px solid #d4b896;overflow-y:auto;display:flex;flex-direction:column}
.results-panel{overflow-y:auto;padding:16px;background:#f5f0e8}

/* MODULES */
.module{border-bottom:0.5px solid #d4b896}
.module-header{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;cursor:pointer;user-select:none;background:#ede4d5;transition:background .15s}
.module-header:hover{background:#d4c4a8}
.module-title{font-weight:700;font-size:13px;color:#8b4513}
.module-num{background:#c17f3e;color:#fff;padding:1px 6px;border-radius:3px;font-size:11px;margin-right:8px;font-weight:700}
.toggle-icon{color:#9a7050;transition:transform .2s;font-size:12px}
.module-header.collapsed .toggle-icon{transform:rotate(-90deg)}
.module-body{padding:12px 16px;background:#f5f0e8;display:flex;flex-direction:column;gap:10px}
.module-body.hidden{display:none}

/* FORM ELEMENTS */
.form-label{font-size:12px;color:#7a4f2a;margin-bottom:4px;display:block}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.form-input{background:#ede4d5;border:0.5px solid #c9aa85;color:#3d1f0a;padding:6px 10px;border-radius:6px;width:100%;font-size:13px;outline:none;transition:border-color .2s;font-family:Arial,sans-serif}
.form-input:focus{border-color:#c17f3e}
.form-input[type=range]{padding:4px 0;accent-color:#c17f3e;background:transparent;border:none}
.range-display{font-size:12px;color:#c17f3e;font-weight:700}
.checkbox-group{display:flex;flex-direction:column;gap:6px}
.checkbox-item{display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;color:#4a2e18}
.checkbox-item input[type=checkbox]{accent-color:#8b4513;width:14px;height:14px}
.checkbox-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px}
.select-input{background:#ede4d5;border:0.5px solid #c9aa85;color:#3d1f0a;padding:6px 10px;border-radius:6px;width:100%;font-size:13px;outline:none;font-family:Arial,sans-serif}
.input-with-unit{position:relative;display:flex;align-items:center}
.input-unit{position:absolute;right:10px;color:#9a7050;font-size:12px;pointer-events:none}

/* RUN BUTTON */
.run-btn-wrap{padding:16px;margin-top:auto;border-top:0.5px solid #d4b896;background:#ede4d5}
.btn-run{width:100%;padding:12px;background:#3d1f0a;color:#f5ead8;border:none;border-radius:20px;font-size:15px;font-weight:700;cursor:pointer;transition:all .2s;letter-spacing:.5px;font-family:Arial,sans-serif}
.btn-run:hover{background:#5a2d0e;transform:translateY(-1px);box-shadow:0 4px 16px rgba(61,31,10,.3)}
.btn-run:active{transform:translateY(0)}

/* RESULTS */
.placeholder-msg{display:flex;flex-direction:column;align-items:center;justify-content:center;height:300px;color:#9a7050;gap:12px}
.placeholder-icon{font-size:48px}
.results-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.results-count{font-size:13px;color:#7a4f2a}
.results-count strong{color:#c17f3e}

/* TABLE */
.stock-table{width:100%;border-collapse:collapse;font-size:13px}
.stock-table th{background:#ede4d5;color:#9a7050;padding:8px 10px;text-align:left;border-bottom:0.5px solid #d4b896;white-space:nowrap;position:sticky;top:0;z-index:10;font-weight:700;cursor:pointer}
.stock-table th:hover{color:#3d1f0a}
.stock-table th .sort-icon{color:#c9aa85;margin-left:4px}
.stock-table td{padding:8px 10px;border-bottom:0.5px solid #e0d4c0;white-space:nowrap;color:#4a2e18}
.stock-table tr:hover td{background:#ede4d5;cursor:pointer}
.stock-table tr.selected td{background:#f5e8d0}
.code-cell{font-weight:700;color:#8b4513}
.name-cell{font-weight:500;color:#3d1f0a}
.up{color:#c0392b}
.down{color:#27ae60}
.neutral{color:#9a7050}
.tag{display:inline-block;padding:1px 6px;border-radius:3px;font-size:11px;margin:1px}
.tag-green{background:#f5e8d0;color:#8b4513;border:0.5px solid #c9aa85}
.tag-blue{background:#eaf0f8;color:#1a5c9a;border:0.5px solid #a8c0d8}
.tag-yellow{background:#fef8ec;color:#8b6010;border:0.5px solid #d4b050}

/* CHART PANEL */
.chart-panel{background:#ede4d5;border-radius:10px;padding:16px;margin-top:16px;border:0.5px solid #d4b896}
.chart-panel-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.chart-stock-info{display:flex;align-items:baseline;gap:12px}
.chart-stock-code{font-size:13px;color:#9a7050}
.chart-stock-name{font-size:16px;font-weight:700;color:#3d1f0a;font-family:Georgia,serif}
.chart-stock-price{font-size:20px;font-weight:700}
.chart-period-btns{display:flex;gap:4px}
.period-btn{padding:4px 10px;border:0.5px solid #c9aa85;background:#f5f0e8;color:#7a4f2a;border-radius:12px;cursor:pointer;font-size:12px;transition:all .2s}
.period-btn.active,.period-btn:hover{background:#3d1f0a;border-color:#3d1f0a;color:#f5ead8}
.close-chart-btn{background:transparent;border:none;color:#9a7050;font-size:18px;cursor:pointer;padding:4px 8px;border-radius:4px}
.close-chart-btn:hover{background:#d4c4a8;color:#3d1f0a}

/* ========== TAB 2: SOCIAL ========== */
.social-layout{padding:20px;max-width:1400px;margin:0 auto}
.social-search-bar{display:flex;gap:12px;margin-bottom:24px}
.social-search-input{flex:1;background:#ede4d5;border:0.5px solid #c9aa85;color:#3d1f0a;padding:10px 16px;border-radius:20px;font-size:15px;outline:none;font-family:Arial,sans-serif}
.social-search-input:focus{border-color:#c17f3e}
.btn-crawl{padding:10px 24px;background:#3d1f0a;color:#f5ead8;border:none;border-radius:20px;cursor:pointer;font-size:14px;font-weight:700;transition:all .2s;font-family:Arial,sans-serif}
.btn-crawl:hover{background:#5a2d0e}

.social-grid{display:grid;grid-template-columns:280px 1fr;gap:20px;margin-bottom:20px}

/* THERMOMETER */
.thermo-card{background:#ede4d5;border-radius:10px;padding:20px;display:flex;flex-direction:column;align-items:center;border:0.5px solid #d4b896}
.thermo-title{font-size:14px;color:#7a4f2a;margin-bottom:16px;font-weight:700}
.thermo-container{width:100px;height:220px;position:relative;margin:0 auto 16px}
.thermo-tube{position:absolute;left:50%;transform:translateX(-50%);width:36px;top:0;bottom:40px;background:#f5f0e8;border:1.5px solid #d4b896;border-radius:18px;overflow:hidden}
.thermo-fill{position:absolute;bottom:0;left:0;right:0;transition:height .8s ease,background .8s ease;border-radius:0 0 18px 18px}
.thermo-bulb{position:absolute;bottom:-2px;left:50%;transform:translateX(-50%);width:48px;height:48px;border-radius:50%;border:1.5px solid #d4b896;transition:background .8s ease}
.thermo-scale{position:absolute;right:-30px;top:0;bottom:40px;display:flex;flex-direction:column;justify-content:space-between;font-size:10px;color:#9a7050}
.thermo-labels{display:flex;flex-direction:column;align-items:center;gap:4px}
.thermo-score{font-size:28px;font-weight:700;font-family:Georgia,serif}
.thermo-desc{font-size:13px;color:#7a4f2a}

.sentiment-stats{background:#ede4d5;border-radius:10px;padding:16px;border:0.5px solid #d4b896}
.stat-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:0.5px solid #e0d4c0}
.stat-row:last-child{border-bottom:none}
.stat-label{font-size:13px;color:#7a4f2a}
.stat-value{font-weight:700;color:#3d1f0a}
.chart-card{background:#ede4d5;border-radius:10px;padding:16px;border:0.5px solid #d4b896}
.chart-card-title{font-size:13px;color:#7a4f2a;margin-bottom:12px;font-weight:700;letter-spacing:.5px}

/* POSTS */
.posts-section{margin-top:20px}
.posts-title{font-size:15px;font-weight:700;color:#3d1f0a;margin-bottom:12px}
.posts-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}
.post-card{background:#ede4d5;border-radius:10px;padding:16px;border-left:3px solid #d4b896;border-top:0.5px solid #d4b896;border-right:0.5px solid #d4b896;border-bottom:0.5px solid #d4b896}
.post-card.bullish{border-left-color:#c0392b}
.post-card.bearish{border-left-color:#27ae60}
.post-card.neutral{border-left-color:#c17f3e}
.post-header{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.post-avatar{width:36px;height:36px;border-radius:50%;background:#c17f3e;display:flex;align-items:center;justify-content:center;font-size:16px}
.post-user{font-size:13px;font-weight:700;color:#3d1f0a}
.post-time{font-size:11px;color:#9a7050}
.post-text{font-size:13px;line-height:1.6;color:#4a2e18;margin-bottom:10px}
.post-sentiment{display:flex;align-items:center;gap:6px;font-size:12px}
.sentiment-badge{padding:2px 8px;border-radius:10px;font-weight:700;font-size:11px}
.sentiment-badge.bullish{background:#fde8e8;color:#c0392b}
.sentiment-badge.bearish{background:#e8f8ed;color:#1e8449}
.sentiment-badge.neutral{background:#fef9ec;color:#8b6010}
.post-keyword{color:#c17f3e;font-weight:700}

/* ========== TAB 3: SECTOR ========== */
.sector-layout{padding:20px;max-width:1400px;margin:0 auto}
.sector-header{display:flex;align-items:center;gap:16px;margin-bottom:20px;flex-wrap:wrap}
.sector-header h2{font-size:18px;font-weight:700;color:#3d1f0a;font-family:Georgia,serif}
.corr-threshold-wrap{display:flex;align-items:center;gap:10px;font-size:13px;color:#7a4f2a}
.corr-value{font-size:16px;font-weight:700;color:#c17f3e;min-width:36px;font-family:Georgia,serif}
.corr-band-header{padding:3px 10px;font-size:11px;font-weight:700;letter-spacing:.5px;color:#c17f3e;background:#ede4d5;border-top:1px solid #d4b896;border-bottom:1px solid #d4b896;margin-top:4px}
.btn-scan{background:#3d1f0a;color:#f5ead8;border:none;padding:6px 18px;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;transition:background .15s;white-space:nowrap}
.btn-scan:hover{background:#5a2d0e}
.scan-progress-wrap{display:none;align-items:center;gap:10px;padding:8px 0 4px;margin-bottom:8px}
.scan-bar-bg{flex:1;background:#d4c4a8;border-radius:4px;height:8px;overflow:hidden}
.scan-bar-fill{height:100%;background:#c17f3e;width:0%;transition:width .3s ease}
.scan-lbl{font-size:12px;color:#7a4f2a;min-width:220px}
.sector-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));gap:16px}
.sector-card{background:#ede4d5;border-radius:10px;overflow:hidden;border:0.5px solid #d4b896}
.sector-card-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:#3d1f0a;cursor:pointer;transition:background .15s}
.sector-card-header:hover{background:#5a2d0e}
.sector-name{font-size:15px;font-weight:700;color:#f5ead8}
.sector-leader-badge{background:#c17f3e;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700}
.sector-card-body{padding:12px;background:#f5f0e8}
.leader-row{display:flex;align-items:center;gap:10px;padding:8px 10px;background:#f5e8d0;border-radius:6px;margin-bottom:8px;border:0.5px solid #c9aa85}
.leader-crown{font-size:16px}
.stock-row{display:flex;align-items:center;gap:10px;padding:6px 4px;border-bottom:0.5px solid #e0d4c0}
.stock-row:last-child{border-bottom:none}
.row-code{font-weight:700;color:#8b4513;width:48px;font-size:13px}
.row-name{flex:1;font-size:13px;color:#4a2e18}
.row-price{font-size:13px;font-weight:700;width:60px;text-align:right;color:#3d1f0a}
.row-change{font-size:12px;width:52px;text-align:right}
.corr-bar-wrap{flex:1;max-width:100px;background:#d4c4a8;border-radius:3px;height:6px;overflow:hidden}
.corr-bar{height:100%;border-radius:3px;background:#c17f3e;transition:width .6s ease}
.corr-label{font-size:11px;color:#9a7050;width:32px;text-align:right}
.sector-col-header{display:flex;align-items:center;gap:10px;padding:3px 4px 5px;border-bottom:0.5px solid #d4b896;margin-bottom:4px}
.sector-col-header span{font-size:10px;color:#9a7050;font-weight:600}

/* PTT POST CARDS */
.ptt-cat{display:inline-block;padding:1px 7px;border-radius:3px;font-size:11px;font-weight:700;margin-right:6px}
.ptt-cat-標的{background:#8b4513;color:#fde8d0}
.ptt-cat-新聞{background:#1a5c3a;color:#c3f0d8}
.ptt-cat-心得{background:#7a5c00;color:#fde8a0}
.ptt-cat-閒聊{background:#6b6b6b;color:#eeeeee}
.ptt-cat-請益{background:#4a2d80;color:#e8d8ff}
.ptt-cat-討論{background:#1a3d6b;color:#c8deff}
.post-title-text{font-size:13px;font-weight:600;color:#3d1f0a;line-height:1.4}
.post-meta-row{display:flex;align-items:center;gap:10px;margin-top:4px;font-size:11px;color:#9a7050}
.ptt-nrec{color:#c17f3e;font-weight:700}
.ptt-nrec.neg{color:#c0392b}
.ptt-source-badge{font-size:11px;color:#b08060;margin-left:auto;display:flex;align-items:center;gap:4px}

/* LOADING */
.loading-overlay{position:fixed;inset:0;background:rgba(245,240,232,.85);display:flex;align-items:center;justify-content:center;z-index:1000;display:none}
.loading-spinner{text-align:center}
.spinner{width:40px;height:40px;border:3px solid #d4b896;border-top-color:#c17f3e;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 12px}
@keyframes spin{to{transform:rotate(360deg)}}
.loading-text{color:#7a4f2a;font-size:14px;font-weight:700}

/* MISC */
.section-divider{height:0.5px;background:#d4b896;margin:8px 0}
.info-note{font-size:11px;color:#9a7050;padding:4px 0;line-height:1.5}
</style>
</head>
<body>

<div class="loading-overlay" id="loadingOverlay">
  <div class="loading-spinner">
    <div class="spinner"></div>
    <div class="loading-text">計算中...</div>
  </div>
</div>

<!-- NAV -->
<nav class="navbar">
  <div class="navbar-brand">股市 &amp; Co.</div>
  <div class="navbar-tabs">
    <button class="tab-btn active" onclick="switchTab('screener',this)">技術篩選</button>
    <button class="tab-btn" onclick="switchTab('social',this)">PTT 股票板</button>
    <button class="tab-btn" onclick="switchTab('sector',this)">族群分類</button>
  </div>
  <div class="navbar-info">
    <span id="dataStatusBadge" class="badge-demo" title="資料來源狀態">載入中...</span>
    <button id="refreshBtn" onclick="refreshPrices()" style="padding:4px 10px;background:#5a2d0e;border:0.5px solid #c17f3e;color:#f5ead8;border-radius:12px;cursor:pointer;font-size:12px;font-family:Arial,sans-serif" title="重新抓取即時報價">⟳ 更新報價</button>
    <span id="dataTimeEl" style="color:#9a7050;font-size:12px;white-space:nowrap"></span>
    <span style="color:#c9a880">加權指數 <strong class="index-up" id="twiiDisplay">23,184 ▲1.12%</strong></span>
  </div>
</nav>

<!-- ==================== TAB 1: SCREENER ==================== -->
<div id="tab-screener" class="tab-content active">
  <div class="screener-layout">
    <!-- FILTER PANEL -->
    <div class="filter-panel">

      <!-- Module 1 -->
      <div class="module">
        <div class="module-header" onclick="toggleModule(this)">
          <span><span class="module-num">1</span><span class="module-title">基礎市場與板塊設定</span></span>
          <span class="toggle-icon">▼</span>
        </div>
        <div class="module-body">
          <div>
            <label class="form-label">產業族群（可複選）</label>
            <div class="checkbox-grid">
              <label class="checkbox-item"><input type="checkbox" name="industry" value="晶圓代工" checked> 晶圓代工</label>
              <label class="checkbox-item"><input type="checkbox" name="industry" value="IC設計" checked> IC設計</label>
              <label class="checkbox-item"><input type="checkbox" name="industry" value="AI伺服器" checked> AI伺服器</label>
              <label class="checkbox-item"><input type="checkbox" name="industry" value="封測" checked> 封測</label>
              <label class="checkbox-item"><input type="checkbox" name="industry" value="被動元件" checked> 被動元件</label>
              <label class="checkbox-item"><input type="checkbox" name="industry" value="電子代工" checked> 電子代工</label>
              <label class="checkbox-item"><input type="checkbox" name="industry" value="電源元件" checked> 電源元件</label>
              <label class="checkbox-item"><input type="checkbox" name="industry" value="光學" checked> 光學</label>
              <label class="checkbox-item"><input type="checkbox" name="industry" value="PCB" checked> PCB</label>
              <label class="checkbox-item"><input type="checkbox" name="industry" value="金融" checked> 金融</label>
              <label class="checkbox-item"><input type="checkbox" name="industry" value="電信" checked> 電信</label>
              <label class="checkbox-item"><input type="checkbox" name="industry" value="傳產石化" checked> 傳產石化</label>
              <label class="checkbox-item"><input type="checkbox" name="industry" value="鋼鐵" checked> 鋼鐵</label>
              <label class="checkbox-item"><input type="checkbox" name="industry" value="食品" checked> 食品</label>
              <label class="checkbox-item"><input type="checkbox" name="industry" value="航運" checked> 航運</label>
              <label class="checkbox-item"><input type="checkbox" name="industry" value="DRAM" checked> DRAM</label>
            </div>
          </div>
          <div class="section-divider"></div>
          <div>
            <label class="form-label">市值下限（億元）</label>
            <input type="number" class="form-input" id="marketCapMin" value="100" placeholder="例：100">
          </div>
          <div>
            <label class="form-label">股本上限（億元）</label>
            <input type="number" class="form-input" id="capitalMax" value="500" placeholder="例：500">
          </div>
        </div>
      </div>

      <!-- Module 2 -->
      <div class="module">
        <div class="module-header" onclick="toggleModule(this)">
          <span><span class="module-num">2</span><span class="module-title">價格動能與成交量結構</span></span>
          <span class="toggle-icon">▼</span>
        </div>
        <div class="module-body">
          <div>
            <label class="form-label">N 日漲跌幅區間（%）</label>
            <div class="form-row">
              <div><label class="form-label">天數 N</label><input type="number" class="form-input" id="nDays" value="5" min="1" max="60"></div>
              <div></div>
            </div>
            <div class="form-row" style="margin-top:6px">
              <div><label class="form-label">最小漲幅%</label><input type="number" class="form-input" id="changeMin" value="-99" step="0.5"></div>
              <div><label class="form-label">最大漲幅%</label><input type="number" class="form-input" id="changeMax" value="99" step="0.5"></div>
            </div>
          </div>
          <div class="section-divider"></div>
          <label class="checkbox-item">
            <input type="checkbox" id="filterVolume" checked>
            今日量 &gt; 5日均量 ×
            <input type="number" class="form-input" id="volMultiplier" value="1.5" min="1" max="5" step="0.1" style="width:60px;margin-left:4px"> 倍，且收紅K
          </label>
          <div class="section-divider"></div>
          <div>
            <label class="form-label">乖離率 (20日均線) 範圍（%）</label>
            <div class="form-row">
              <div><label class="form-label">最小</label><input type="number" class="form-input" id="biasMin" value="-10" step="0.5"></div>
              <div><label class="form-label">最大</label><input type="number" class="form-input" id="biasMax" value="20" step="0.5"></div>
            </div>
          </div>
          <div class="section-divider"></div>
          <label class="checkbox-item">
            <input type="checkbox" id="filterGap"> 篩選帶有「向上跳空缺口」標的
          </label>
        </div>
      </div>

      <!-- Module 3 -->
      <div class="module">
        <div class="module-header" onclick="toggleModule(this)">
          <span><span class="module-num">3</span><span class="module-title">技術型態與指標</span></span>
          <span class="toggle-icon">▼</span>
        </div>
        <div class="module-body">
          <div>
            <label class="form-label">底部型態篩選</label>
            <div class="checkbox-group">
              <label class="checkbox-item"><input type="checkbox" id="patWBottom"> W底突破頸線</label>
              <label class="checkbox-item"><input type="checkbox" id="patLongLower"> 長下影線探底</label>
            </div>
          </div>
          <div class="section-divider"></div>
          <div>
            <label class="form-label">均線條件</label>
            <div class="checkbox-group">
              <label class="checkbox-item"><input type="checkbox" id="filterMaAligned"> 均線多頭排列（短中長依次向上）</label>
              <label class="checkbox-item"><input type="checkbox" id="filterMaBreakout"> 帶量突破均線糾結區</label>
            </div>
          </div>
          <div class="section-divider"></div>
          <div>
            <label class="form-label">技術指標篩選</label>
            <div class="checkbox-group">
              <label class="checkbox-item"><input type="checkbox" id="filterKD"> 日KD黃金交叉且K值低檔（&lt;50）</label>
              <label class="checkbox-item"><input type="checkbox" id="filterMACD"> MACD翻紅（MACD柱由負轉正）</label>
              <label class="checkbox-item"><input type="checkbox" id="filterBollinger"> 突破布林通道上軌</label>
            </div>
          </div>
        </div>
      </div>

      <!-- Module 4 -->
      <div class="module">
        <div class="module-header" onclick="toggleModule(this)">
          <span><span class="module-num">4</span><span class="module-title">籌碼流向</span></span>
          <span class="toggle-icon">▼</span>
        </div>
        <div class="module-body">
          <div class="form-row">
            <div>
              <label class="form-label">外資連買天數 ≥</label>
              <div class="input-with-unit">
                <input type="number" class="form-input" id="foreignDays" value="0" min="0" max="30">
                <span class="input-unit">天</span>
              </div>
            </div>
            <div>
              <label class="form-label">投信連買天數 ≥</label>
              <div class="input-with-unit">
                <input type="number" class="form-input" id="trustDays" value="0" min="0" max="30">
                <span class="input-unit">天</span>
              </div>
            </div>
          </div>
          <label class="checkbox-item">
            <input type="checkbox" id="filterMajorUp"> 千張大戶持股比例連續增加
          </label>
          <label class="checkbox-item">
            <input type="checkbox" id="filterShortSqueeze"> 軋空潛力（融資↓ + 融券↑ + 股價抗跌）
          </label>
        </div>
      </div>

      <!-- Module 5 -->
      <div class="module">
        <div class="module-header" onclick="toggleModule(this)">
          <span><span class="module-num">5</span><span class="module-title">基本面與價值防護</span></span>
          <span class="toggle-icon">▼</span>
        </div>
        <div class="module-body">
          <label class="checkbox-item">
            <input type="checkbox" id="filterRevenue"> 單月營收 MoM &gt;
            <input type="number" class="form-input" id="revMoM" value="10" min="0" style="width:56px;margin:0 4px">% 且 YoY &gt;
            <input type="number" class="form-input" id="revYoY" value="10" min="0" style="width:56px;margin:0 4px">%
          </label>
          <div class="form-row">
            <div>
              <label class="form-label">本益比(PE) ≤</label>
              <input type="number" class="form-input" id="peMax" value="999" min="1">
            </div>
            <div>
              <label class="form-label">股價淨值比(PB) ≤</label>
              <input type="number" class="form-input" id="pbMax" value="999" min="0.1" step="0.1">
            </div>
          </div>
          <div>
            <label class="form-label">近5年平均現金殖利率 ≥</label>
            <div class="input-with-unit">
              <input type="number" class="form-input" id="yieldMin" value="0" min="0" max="20" step="0.1">
              <span class="input-unit">%</span>
            </div>
          </div>
          <div class="section-divider"></div>
          <div>
            <label class="form-label">被動投資重合度評估 — 選擇 ETF</label>
            <select class="select-input" id="etfSelect">
              <option value="">不篩選</option>
              <option value="0050">元大台灣50 (0050)</option>
              <option value="0056">元大高股息 (0056)</option>
              <option value="00881">國泰台灣5G+ (00881)</option>
            </select>
          </div>
        </div>
      </div>

      <div class="run-btn-wrap">
        <button class="btn-run" onclick="runScreener()">執行篩選</button>
        <p class="info-note" style="margin-top:8px;text-align:center">Demo 模式 — 使用模擬資料展示功能</p>
      </div>
    </div>

    <!-- RESULTS PANEL -->
    <div class="results-panel" id="resultsPanel">
      <div class="placeholder-msg" id="screenerPlaceholder">
        <div class="placeholder-icon" style="font-size:36px;color:#c17f3e">◎</div>
        <div style="font-size:15px;color:#475569">設定篩選條件後，點擊「執行篩選」查看結果</div>
        <div style="font-size:13px;color:#334155">支援五大模組交叉篩選，找出強勢標的</div>
      </div>
      <div id="screenerResults" style="display:none">
        <div class="results-header">
          <span class="results-count" id="resultCount"></span>
          <span style="font-size:12px;color:#475569">點擊股票列查看走勢圖</span>
        </div>
        <div style="overflow-x:auto">
          <table class="stock-table" id="stockTable">
            <thead>
              <tr>
                <th onclick="sortTable('code')">代碼 <span class="sort-icon">↕</span></th>
                <th onclick="sortTable('name')">名稱 <span class="sort-icon">↕</span></th>
                <th onclick="sortTable('industry')">產業</th>
                <th onclick="sortTable('price')">股價 <span class="sort-icon">↕</span></th>
                <th onclick="sortTable('change5d')">N日漲跌 <span class="sort-icon">↕</span></th>
                <th onclick="sortTable('volRatio')">量/均量 <span class="sort-icon">↕</span></th>
                <th onclick="sortTable('bias20d')">乖離率 <span class="sort-icon">↕</span></th>
                <th onclick="sortTable('pe')">PE <span class="sort-icon">↕</span></th>
                <th onclick="sortTable('pb')">PB <span class="sort-icon">↕</span></th>
                <th onclick="sortTable('dividendYield')">殖利率 <span class="sort-icon">↕</span></th>
                <th>標籤</th>
              </tr>
            </thead>
            <tbody id="stockTableBody"></tbody>
          </table>
        </div>
        <!-- Chart area -->
        <div id="chartArea" style="display:none" class="chart-panel">
          <div class="chart-panel-header">
            <div class="chart-stock-info">
              <span class="chart-stock-code" id="chartCode"></span>
              <span class="chart-stock-name" id="chartName"></span>
              <span class="chart-stock-price" id="chartPrice"></span>
            </div>
            <div style="display:flex;gap:8px;align-items:center">
              <div class="chart-period-btns">
                <button class="period-btn active" onclick="changePeriod(20,this)">1M</button>
                <button class="period-btn" onclick="changePeriod(60,this)">3M</button>
                <button class="period-btn" onclick="changePeriod(120,this)">6M</button>
              </div>
              <button class="close-chart-btn" onclick="closeChart()">✕</button>
            </div>
          </div>
          <canvas id="priceChart" height="120"></canvas>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ==================== TAB 2: SOCIAL ==================== -->
<div id="tab-social" class="tab-content">
  <div class="social-layout">
    <div class="social-search-bar">
      <input type="text" class="social-search-input" id="socialSearchInput" placeholder="輸入股票代碼或公司名稱，例如：台積電 / 2330" value="台積電">
      <button class="btn-crawl" onclick="runCrawler()">🕷 爬取 PTT 股票板</button>
    </div>

    <div id="socialResults" style="display:none">
      <div class="social-grid">
        <!-- Thermometer -->
        <div>
          <div class="thermo-card" style="margin-bottom:12px">
            <div class="thermo-title">社群情緒溫度計</div>
            <div class="thermo-container">
              <div class="thermo-tube">
                <div class="thermo-fill" id="thermoFill" style="height:60%;background:linear-gradient(to top,#f59e0b,#10b981)"></div>
              </div>
              <div class="thermo-scale">
                <span>極多</span><span>偏多</span><span>中立</span><span>偏空</span><span>極空</span>
              </div>
              <div class="thermo-bulb" id="thermoBulb" style="background:#10b981"></div>
            </div>
            <div class="thermo-labels">
              <div class="thermo-score up" id="thermoScore">68</div>
              <div class="thermo-desc" id="thermoDesc">偏多氣氛</div>
            </div>
          </div>

          <div class="sentiment-stats">
            <div class="stat-row">
              <span class="stat-label">近7日提及次數</span>
              <span class="stat-value" id="statMentions">1,247</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">多方貼文比例</span>
              <span class="stat-value up" id="statBullish">58.3%</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">空方貼文比例</span>
              <span class="stat-value down" id="statBearish">22.1%</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">中立貼文比例</span>
              <span class="stat-value neutral" id="statNeutral">19.6%</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">熱度趨勢</span>
              <span class="stat-value up" id="statTrend">↑ 上升中</span>
            </div>
          </div>
        </div>

        <!-- Charts area -->
        <div>
          <div class="chart-card" style="margin-bottom:12px">
            <div class="chart-card-title">社群提及量 vs 股價走勢（近30日）</div>
            <canvas id="socialChart" height="130"></canvas>
          </div>
          <div class="chart-card">
            <div class="chart-card-title">每日情緒分佈</div>
            <canvas id="sentimentChart" height="100"></canvas>
          </div>
        </div>
      </div>

      <div class="posts-section">
        <div class="posts-title" id="postsTitle">PTT 股票板最新討論文章</div>
        <div class="posts-grid" id="postsGrid"></div>
      </div>
    </div>

    <div id="socialPlaceholder">
      <div class="placeholder-msg" style="height:400px">
        <div class="placeholder-icon" style="font-size:36px;color:#c17f3e">◎</div>
        <div style="font-size:15px;color:#475569">輸入股票代碼後點擊「爬取 PTT 股票板」</div>
        <div style="font-size:13px;color:#334155">分析 PTT 股票板討論熱度與多空情緒，並與股價走勢比對</div>
      </div>
    </div>
  </div>
</div>

<!-- ==================== TAB 3: SECTOR ==================== -->
<div id="tab-sector" class="tab-content">
  <div class="sector-layout">
    <div class="sector-header">
      <h2>族群分類分析</h2>
      <span style="font-size:12px;color:#9a7050">篩選標準：今天往前 <b style="color:#c17f3e">20 交易日</b>、複合相關性（方向＋幅度＋走勢）&gt; <b style="color:#c17f3e">0.4</b>，每 0.1 分段顯示 ｜ 開啟頁面自動全台掃描</span>
      <button id="scanBtn" class="btn-scan" onclick="fullScanCorrelations()">全台掃描</button>
    </div>
    <div id="scanProgWrap" class="scan-progress-wrap">
      <div class="scan-bar-bg"><div id="scanBarFill" class="scan-bar-fill"></div></div>
      <span id="scanLbl" class="scan-lbl"></span>
    </div>
    <div class="sector-grid" id="sectorGrid"></div>
  </div>
</div>

<script>
// ===================== STOCK DATABASE =====================
const STOCKS = [
  // 晶圓代工
  {code:'2330',name:'台積電',industry:'晶圓代工',marketCap:15234,capital:2593,price:2275,prevClose:2300,change5d:-1.1,change20d:12.3,volume:28500000,vol5dAvg:18200000,bias20d:3.8,gap:true,redK:true,pe:22.5,pb:5.8,dividendYield:1.8,revenueMoM:15.2,revenueYoY:28.5,foreignBuyDays:8,trustBuyDays:5,majorHolderUp:true,shortSqueeze:false,kdGolden:false,macdGreen:true,bollingerBreak:true,maAligned:true,maBreakout:true,patterns:['maAligned','bollingerBreak'],etf0050Weight:30.5,biz:'none',volatility:0.018,trend:0.002},
  {code:'2303',name:'聯電',industry:'晶圓代工',marketCap:1850,capital:1289,price:138.5,prevClose:143.5,change5d:-3.5,change20d:5.1,volume:42000000,vol5dAvg:30000000,bias20d:2.1,gap:false,redK:true,pe:12.8,pb:1.9,dividendYield:4.2,revenueMoM:5.1,revenueYoY:8.3,foreignBuyDays:3,trustBuyDays:1,majorHolderUp:false,shortSqueeze:false,kdGolden:true,macdGreen:false,bollingerBreak:false,maAligned:false,maBreakout:false,patterns:['kdGolden'],etf0050Weight:1.8,biz:'none',volatility:0.022,trend:0.001},

  // IC設計
  {code:'2454',name:'聯發科',industry:'IC設計',marketCap:3890,capital:159,price:4345,prevClose:4640,change5d:-6.4,change20d:15.2,volume:4200000,vol5dAvg:2800000,bias20d:7.2,gap:true,redK:true,pe:18.2,pb:4.1,dividendYield:2.5,revenueMoM:18.3,revenueYoY:32.1,foreignBuyDays:10,trustBuyDays:7,majorHolderUp:true,shortSqueeze:false,kdGolden:true,macdGreen:true,bollingerBreak:true,maAligned:true,maBreakout:true,patterns:['wBottom','maAligned','kdGolden','bollingerBreak'],etf0050Weight:8.2,biz:'ip_license',volatility:0.025,trend:0.003},
  {code:'3034',name:'聯詠',industry:'IC設計',marketCap:580,capital:77,price:479,prevClose:485,change5d:-1.2,change20d:9.8,volume:2100000,vol5dAvg:1500000,bias20d:4.5,gap:false,redK:true,pe:14.5,pb:3.2,dividendYield:4.8,revenueMoM:12.1,revenueYoY:18.4,foreignBuyDays:5,trustBuyDays:3,majorHolderUp:true,shortSqueeze:false,kdGolden:true,macdGreen:true,bollingerBreak:false,maAligned:true,maBreakout:false,patterns:['maAligned','kdGolden'],etf0050Weight:0.8,biz:'none',volatility:0.023,trend:0.002},
  {code:'2379',name:'瑞昱',industry:'IC設計',marketCap:720,capital:84,price:597,prevClose:605,change5d:-1.3,change20d:11.3,volume:1800000,vol5dAvg:1200000,bias20d:5.8,gap:true,redK:true,pe:16.8,pb:3.5,dividendYield:3.1,revenueMoM:9.8,revenueYoY:21.5,foreignBuyDays:6,trustBuyDays:4,majorHolderUp:false,shortSqueeze:false,kdGolden:false,macdGreen:true,bollingerBreak:true,maAligned:true,maBreakout:true,patterns:['maAligned','bollingerBreak'],etf0050Weight:1.1,biz:'none',volatility:0.024,trend:0.002},
  {code:'6770',name:'力積電',industry:'IC設計',marketCap:320,capital:495,price:80.5,prevClose:74.8,change5d:7.6,change20d:4.2,volume:35000000,vol5dAvg:28000000,bias20d:1.5,gap:false,redK:true,pe:28.5,pb:1.4,dividendYield:1.2,revenueMoM:3.2,revenueYoY:5.8,foreignBuyDays:1,trustBuyDays:0,majorHolderUp:false,shortSqueeze:true,kdGolden:false,macdGreen:false,bollingerBreak:false,maAligned:false,maBreakout:false,patterns:['shortSqueeze'],etf0050Weight:0,biz:'none',volatility:0.028,trend:0.0005},

  // AI伺服器
  {code:'2382',name:'廣達',industry:'AI伺服器',marketCap:3250,capital:386,price:312.5,prevClose:312,change5d:0.2,change20d:18.5,volume:15000000,vol5dAvg:9500000,bias20d:9.8,gap:true,redK:true,pe:25.2,pb:6.8,dividendYield:1.5,revenueMoM:22.5,revenueYoY:45.2,foreignBuyDays:12,trustBuyDays:8,majorHolderUp:true,shortSqueeze:false,kdGolden:true,macdGreen:true,bollingerBreak:true,maAligned:true,maBreakout:true,patterns:['wBottom','maAligned','kdGolden','maBreakout','bollingerBreak'],etf0050Weight:3.5,biz:'none',volatility:0.03,trend:0.004},
  {code:'2356',name:'英業達',industry:'AI伺服器',marketCap:890,capital:489,price:64,prevClose:62,change5d:3.2,change20d:14.8,volume:12000000,vol5dAvg:8000000,bias20d:8.2,gap:true,redK:true,pe:18.5,pb:3.2,dividendYield:3.8,revenueMoM:16.8,revenueYoY:38.5,foreignBuyDays:8,trustBuyDays:5,majorHolderUp:true,shortSqueeze:false,kdGolden:true,macdGreen:true,bollingerBreak:false,maAligned:true,maBreakout:true,patterns:['maAligned','kdGolden'],etf0050Weight:0.9,biz:'none',volatility:0.028,trend:0.003},
  {code:'3231',name:'緯創',industry:'AI伺服器',marketCap:980,capital:352,price:144.5,prevClose:145,change5d:-0.3,change20d:16.2,volume:9500000,vol5dAvg:6200000,bias20d:8.9,gap:false,redK:true,pe:16.2,pb:3.8,dividendYield:3.2,revenueMoM:19.5,revenueYoY:41.8,foreignBuyDays:7,trustBuyDays:6,majorHolderUp:true,shortSqueeze:false,kdGolden:false,macdGreen:true,bollingerBreak:true,maAligned:true,maBreakout:false,patterns:['maAligned','bollingerBreak'],etf0050Weight:1.2,biz:'none',volatility:0.027,trend:0.003},
  {code:'6669',name:'緯穎',industry:'AI伺服器',marketCap:1450,capital:70,price:4955,prevClose:5075,change5d:-2.4,change20d:22.1,volume:2800000,vol5dAvg:1600000,bias20d:11.2,gap:true,redK:true,pe:32.5,pb:8.5,dividendYield:0.8,revenueMoM:28.5,revenueYoY:58.2,foreignBuyDays:14,trustBuyDays:9,majorHolderUp:true,shortSqueeze:false,kdGolden:true,macdGreen:true,bollingerBreak:true,maAligned:true,maBreakout:true,patterns:['wBottom','maAligned','kdGolden','bollingerBreak','maBreakout'],etf0050Weight:0,biz:'none',volatility:0.035,trend:0.005},

  // 封測
  {code:'3711',name:'日月光投控',industry:'封測',marketCap:1680,capital:776,price:621,prevClose:642,change5d:-3.3,change20d:7.8,volume:14000000,vol5dAvg:10000000,bias20d:3.8,gap:false,redK:true,pe:14.8,pb:2.5,dividendYield:3.5,revenueMoM:8.5,revenueYoY:12.8,foreignBuyDays:5,trustBuyDays:3,majorHolderUp:false,shortSqueeze:false,kdGolden:true,macdGreen:false,bollingerBreak:false,maAligned:false,maBreakout:false,patterns:['kdGolden'],etf0050Weight:1.5,biz:'none',volatility:0.02,trend:0.001},
  {code:'2408',name:'南亞科',industry:'DRAM',marketCap:520,capital:344,price:324.5,prevClose:312,change5d:4.0,change20d:8.5,volume:9000000,vol5dAvg:6500000,bias20d:4.2,gap:false,redK:true,pe:52.0,pb:1.8,dividendYield:0.5,revenueMoM:5.8,revenueYoY:15.2,foreignBuyDays:3,trustBuyDays:2,majorHolderUp:false,shortSqueeze:false,kdGolden:false,macdGreen:true,bollingerBreak:false,maAligned:false,maBreakout:false,patterns:['macdGreen'],etf0050Weight:0.4,biz:'none',volatility:0.03,trend:0.001},

  // 被動元件
  {code:'2327',name:'國巨',industry:'被動元件',marketCap:1250,capital:76,price:749,prevClose:701,change5d:6.8,change20d:11.5,volume:1500000,vol5dAvg:1000000,bias20d:5.2,gap:false,redK:true,pe:12.5,pb:2.8,dividendYield:5.2,revenueMoM:10.2,revenueYoY:18.5,foreignBuyDays:6,trustBuyDays:4,majorHolderUp:true,shortSqueeze:false,kdGolden:true,macdGreen:true,bollingerBreak:false,maAligned:true,maBreakout:false,patterns:['maAligned','kdGolden'],etf0050Weight:1.2,biz:'none',volatility:0.022,trend:0.002},
  {code:'2492',name:'華新科',industry:'被動元件',marketCap:468,capital:120,price:390,prevClose:380,change5d:2.6,change20d:8.5,volume:8000000,vol5dAvg:5500000,bias20d:4.2,gap:false,redK:true,pe:16.5,pb:2.2,dividendYield:4.5,revenueMoM:6.5,revenueYoY:12.8,foreignBuyDays:4,trustBuyDays:2,majorHolderUp:true,shortSqueeze:false,kdGolden:false,macdGreen:true,bollingerBreak:false,maAligned:true,maBreakout:false,patterns:['maAligned'],etf0050Weight:0.3,biz:'none',volatility:0.020,trend:0.002},
  {code:'2344',name:'華邦電',industry:'DRAM',marketCap:280,capital:596,price:143.5,prevClose:155,change5d:-7.4,change20d:4.5,volume:28000000,vol5dAvg:22000000,bias20d:1.8,gap:false,redK:true,pe:38.5,pb:1.2,dividendYield:1.8,revenueMoM:4.5,revenueYoY:8.2,foreignBuyDays:2,trustBuyDays:1,majorHolderUp:false,shortSqueeze:false,kdGolden:false,macdGreen:false,bollingerBreak:false,maAligned:false,maBreakout:false,patterns:[],etf0050Weight:0.2,biz:'none',volatility:0.025,trend:0.0005},

  // 電子代工
  {code:'2317',name:'鴻海',industry:'電子代工',marketCap:4580,capital:1386,price:261.5,prevClose:264,change5d:-0.9,change20d:9.8,volume:45000000,vol5dAvg:32000000,bias20d:4.8,gap:false,redK:true,pe:11.2,pb:1.8,dividendYield:4.8,revenueMoM:8.2,revenueYoY:12.5,foreignBuyDays:7,trustBuyDays:4,majorHolderUp:false,shortSqueeze:false,kdGolden:true,macdGreen:true,bollingerBreak:false,maAligned:true,maBreakout:false,patterns:['maAligned','kdGolden'],etf0050Weight:4.8,biz:'none',volatility:0.018,trend:0.001},
  {code:'2354',name:'鴻準',industry:'電子代工',marketCap:380,capital:214,price:58.4,prevClose:59.7,change5d:-2.2,change20d:7.2,volume:5500000,vol5dAvg:4000000,bias20d:3.5,gap:false,redK:true,pe:15.8,pb:2.1,dividendYield:3.8,revenueMoM:6.8,revenueYoY:10.2,foreignBuyDays:3,trustBuyDays:1,majorHolderUp:false,shortSqueeze:false,kdGolden:false,macdGreen:true,bollingerBreak:false,maAligned:false,maBreakout:false,patterns:['macdGreen'],etf0050Weight:0.3,biz:'none',volatility:0.02,trend:0.001},
  {code:'2353',name:'宏碁',industry:'電子代工',marketCap:520,capital:352,price:32.2,prevClose:31.4,change5d:2.5,change20d:8.5,volume:12000000,vol5dAvg:8500000,bias20d:3.8,gap:false,redK:true,pe:13.5,pb:2.2,dividendYield:3.2,revenueMoM:5.5,revenueYoY:9.8,foreignBuyDays:4,trustBuyDays:2,majorHolderUp:false,shortSqueeze:false,kdGolden:true,macdGreen:false,bollingerBreak:false,maAligned:false,maBreakout:false,patterns:['kdGolden'],etf0050Weight:0.5,biz:'ecommerce',volatility:0.019,trend:0.001},

  // 電源元件
  {code:'2308',name:'台達電',industry:'電源元件',marketCap:2850,capital:259,price:2375,prevClose:2520,change5d:-5.8,change20d:10.5,volume:4200000,vol5dAvg:3000000,bias20d:5.2,gap:false,redK:true,pe:28.5,pb:5.2,dividendYield:2.5,revenueMoM:12.5,revenueYoY:22.8,foreignBuyDays:8,trustBuyDays:5,majorHolderUp:true,shortSqueeze:false,kdGolden:false,macdGreen:true,bollingerBreak:true,maAligned:true,maBreakout:false,patterns:['maAligned','bollingerBreak'],etf0050Weight:3.2,biz:'none',volatility:0.02,trend:0.002},
  {code:'6415',name:'矽力-KY',industry:'電源元件',marketCap:1250,capital:40,price:614,prevClose:665,change5d:-7.7,change20d:14.5,volume:650000,vol5dAvg:420000,bias20d:6.8,gap:true,redK:true,pe:38.5,pb:12.5,dividendYield:0.8,revenueMoM:18.5,revenueYoY:35.2,foreignBuyDays:9,trustBuyDays:6,majorHolderUp:true,shortSqueeze:false,kdGolden:true,macdGreen:true,bollingerBreak:true,maAligned:true,maBreakout:true,patterns:['wBottom','maAligned','kdGolden','bollingerBreak'],etf0050Weight:0,biz:'ip_license',volatility:0.03,trend:0.003},

  // 光學
  {code:'3008',name:'大立光',industry:'光學',marketCap:3680,capital:135,price:3445,prevClose:3505,change5d:-1.7,change20d:12.8,volume:850000,vol5dAvg:620000,bias20d:5.8,gap:false,redK:true,pe:42.5,pb:8.5,dividendYield:1.2,revenueMoM:12.8,revenueYoY:22.5,foreignBuyDays:7,trustBuyDays:3,majorHolderUp:false,shortSqueeze:false,kdGolden:false,macdGreen:true,bollingerBreak:true,maAligned:true,maBreakout:false,patterns:['maAligned','bollingerBreak'],etf0050Weight:2.8,biz:'none',volatility:0.022,trend:0.002},
  {code:'2474',name:'可成',industry:'光學',marketCap:350,capital:175,price:192,prevClose:208.5,change5d:-7.9,change20d:5.8,volume:3200000,vol5dAvg:2500000,bias20d:2.8,gap:false,redK:true,pe:15.2,pb:1.5,dividendYield:5.8,revenueMoM:4.8,revenueYoY:8.5,foreignBuyDays:2,trustBuyDays:1,majorHolderUp:false,shortSqueeze:false,kdGolden:true,macdGreen:false,bollingerBreak:false,maAligned:false,maBreakout:false,patterns:['kdGolden'],etf0050Weight:0.2,biz:'none',volatility:0.019,trend:0.0005},

  // PCB
  {code:'3037',name:'欣興',industry:'PCB',marketCap:680,capital:394,price:1025,prevClose:1080,change5d:-5.1,change20d:9.2,volume:8000000,vol5dAvg:5800000,bias20d:4.2,gap:false,redK:true,pe:15.8,pb:2.5,dividendYield:3.5,revenueMoM:8.8,revenueYoY:14.5,foreignBuyDays:5,trustBuyDays:3,majorHolderUp:true,shortSqueeze:false,kdGolden:true,macdGreen:true,bollingerBreak:false,maAligned:true,maBreakout:false,patterns:['maAligned','kdGolden'],etf0050Weight:0.6,biz:'none',volatility:0.022,trend:0.001},
  {code:'4958',name:'臻鼎-KY',industry:'PCB',marketCap:520,capital:220,price:481,prevClose:532,change5d:-9.6,change20d:9.8,volume:5500000,vol5dAvg:3800000,bias20d:4.8,gap:true,redK:true,pe:14.2,pb:2.2,dividendYield:3.8,revenueMoM:10.5,revenueYoY:16.8,foreignBuyDays:4,trustBuyDays:2,majorHolderUp:false,shortSqueeze:false,kdGolden:false,macdGreen:true,bollingerBreak:true,maAligned:false,maBreakout:false,patterns:['bollingerBreak'],etf0050Weight:0.4,biz:'none',volatility:0.023,trend:0.002},
  {code:'2383',name:'台光電',industry:'PCB',marketCap:290,capital:118,price:5030,prevClose:5305,change5d:-5.2,change20d:8.5,volume:2800000,vol5dAvg:2000000,bias20d:3.8,gap:false,redK:true,pe:12.8,pb:2.8,dividendYield:5.2,revenueMoM:7.5,revenueYoY:12.8,foreignBuyDays:3,trustBuyDays:2,majorHolderUp:true,shortSqueeze:false,kdGolden:true,macdGreen:false,bollingerBreak:false,maAligned:false,maBreakout:false,patterns:['kdGolden'],etf0050Weight:0.2,biz:'none',volatility:0.02,trend:0.001},

  // 金融
  {code:'2881',name:'富邦金',industry:'金融',marketCap:2850,capital:1296,price:108.5,prevClose:110,change5d:-1.4,change20d:6.8,volume:22000000,vol5dAvg:16000000,bias20d:3.2,gap:false,redK:true,pe:9.8,pb:1.5,dividendYield:5.5,revenueMoM:8.5,revenueYoY:15.2,foreignBuyDays:4,trustBuyDays:2,majorHolderUp:false,shortSqueeze:false,kdGolden:true,macdGreen:false,bollingerBreak:false,maAligned:false,maBreakout:false,patterns:['kdGolden'],etf0050Weight:2.8,biz:'none',volatility:0.015,trend:0.001},
  {code:'2882',name:'國泰金',industry:'金融',marketCap:2350,capital:1430,price:83.9,prevClose:85.4,change5d:-1.8,change20d:5.8,volume:28000000,vol5dAvg:20000000,bias20d:2.8,gap:false,redK:true,pe:10.2,pb:1.2,dividendYield:4.8,revenueMoM:6.2,revenueYoY:11.5,foreignBuyDays:3,trustBuyDays:1,majorHolderUp:false,shortSqueeze:false,kdGolden:false,macdGreen:true,bollingerBreak:false,maAligned:false,maBreakout:false,patterns:['macdGreen'],etf0050Weight:2.2,biz:'none',volatility:0.014,trend:0.001},
  {code:'2884',name:'玉山金',industry:'金融',marketCap:1580,capital:1293,price:30.8,prevClose:31.1,change5d:-1.0,change20d:5.2,volume:35000000,vol5dAvg:25000000,bias20d:2.4,gap:false,redK:true,pe:12.5,pb:1.1,dividendYield:3.8,revenueMoM:5.5,revenueYoY:8.8,foreignBuyDays:2,trustBuyDays:1,majorHolderUp:false,shortSqueeze:false,kdGolden:true,macdGreen:false,bollingerBreak:false,maAligned:false,maBreakout:false,patterns:['kdGolden'],etf0050Weight:1.5,biz:'none',volatility:0.013,trend:0.0008},
  {code:'2886',name:'兆豐金',industry:'金融',marketCap:1420,capital:1347,price:40,prevClose:39.5,change5d:1.3,change20d:4.8,volume:18000000,vol5dAvg:13000000,bias20d:2.2,gap:false,redK:true,pe:10.5,pb:1.0,dividendYield:5.2,revenueMoM:4.8,revenueYoY:8.5,foreignBuyDays:2,trustBuyDays:0,majorHolderUp:false,shortSqueeze:false,kdGolden:false,macdGreen:false,bollingerBreak:false,maAligned:false,maBreakout:false,patterns:[],etf0050Weight:1.3,biz:'none',volatility:0.012,trend:0.0007},
  {code:'2891',name:'中信金',industry:'金融',marketCap:1950,capital:1508,price:59.8,prevClose:59.2,change5d:1.0,change20d:4.5,volume:40000000,vol5dAvg:30000000,bias20d:2.0,gap:false,redK:true,pe:9.5,pb:0.9,dividendYield:4.5,revenueMoM:4.2,revenueYoY:7.8,foreignBuyDays:1,trustBuyDays:1,majorHolderUp:false,shortSqueeze:false,kdGolden:false,macdGreen:false,bollingerBreak:false,maAligned:false,maBreakout:false,patterns:[],etf0050Weight:1.8,biz:'none',volatility:0.012,trend:0.0007},

  // 電信
  {code:'2412',name:'中華電',industry:'電信',marketCap:2580,capital:775,price:137,prevClose:137,change5d:0.0,change20d:3.2,volume:5200000,vol5dAvg:4500000,bias20d:1.5,gap:false,redK:true,pe:22.5,pb:3.2,dividendYield:4.5,revenueMoM:2.5,revenueYoY:4.2,foreignBuyDays:1,trustBuyDays:0,majorHolderUp:false,shortSqueeze:false,kdGolden:false,macdGreen:false,bollingerBreak:false,maAligned:false,maBreakout:false,patterns:[],etf0050Weight:2.5,biz:'none',volatility:0.01,trend:0.0003},
  {code:'4904',name:'遠傳',industry:'電信',marketCap:980,capital:464,price:94.8,prevClose:92.9,change5d:2.0,change20d:3.8,volume:3500000,vol5dAvg:3000000,bias20d:1.8,gap:false,redK:true,pe:25.5,pb:2.8,dividendYield:4.2,revenueMoM:3.2,revenueYoY:5.8,foreignBuyDays:1,trustBuyDays:0,majorHolderUp:false,shortSqueeze:false,kdGolden:true,macdGreen:false,bollingerBreak:false,maAligned:false,maBreakout:false,patterns:['kdGolden'],etf0050Weight:0.8,biz:'none',volatility:0.011,trend:0.0004},

  // 傳產石化
  {code:'1301',name:'台塑',industry:'傳產石化',marketCap:1580,capital:636,price:45,prevClose:45.5,change5d:-1.1,change20d:4.5,volume:8500000,vol5dAvg:7000000,bias20d:2.0,gap:false,redK:true,pe:18.5,pb:1.5,dividendYield:4.2,revenueMoM:3.5,revenueYoY:5.8,foreignBuyDays:2,trustBuyDays:1,majorHolderUp:false,shortSqueeze:false,kdGolden:false,macdGreen:false,bollingerBreak:false,maAligned:false,maBreakout:false,patterns:[],etf0050Weight:1.5,biz:'none',volatility:0.015,trend:0.0005},
  {code:'1303',name:'南亞',industry:'傳產石化',marketCap:1250,capital:638,price:90.3,prevClose:95.5,change5d:-5.4,change20d:4.8,volume:10000000,vol5dAvg:8500000,bias20d:2.2,gap:false,redK:true,pe:15.8,pb:1.2,dividendYield:3.8,revenueMoM:4.2,revenueYoY:6.5,foreignBuyDays:2,trustBuyDays:0,majorHolderUp:false,shortSqueeze:false,kdGolden:true,macdGreen:false,bollingerBreak:false,maAligned:false,maBreakout:false,patterns:['kdGolden'],etf0050Weight:1.2,biz:'none',volatility:0.016,trend:0.0005},
  {code:'6505',name:'台塑化',industry:'傳產石化',marketCap:2100,capital:796,price:50,prevClose:50.1,change5d:-0.2,change20d:5.2,volume:7000000,vol5dAvg:6000000,bias20d:2.5,gap:false,redK:true,pe:12.5,pb:1.8,dividendYield:5.5,revenueMoM:5.2,revenueYoY:8.8,foreignBuyDays:3,trustBuyDays:1,majorHolderUp:false,shortSqueeze:false,kdGolden:false,macdGreen:true,bollingerBreak:false,maAligned:false,maBreakout:false,patterns:['macdGreen'],etf0050Weight:2.0,biz:'none',volatility:0.014,trend:0.0005},

  // 鋼鐵
  {code:'2002',name:'中鋼',industry:'鋼鐵',marketCap:1850,capital:1583,price:19,prevClose:19.1,change5d:-0.5,change20d:5.5,volume:42000000,vol5dAvg:32000000,bias20d:2.5,gap:false,redK:true,pe:22.5,pb:1.2,dividendYield:4.8,revenueMoM:4.5,revenueYoY:8.2,foreignBuyDays:2,trustBuyDays:1,majorHolderUp:false,shortSqueeze:false,kdGolden:true,macdGreen:false,bollingerBreak:false,maAligned:false,maBreakout:false,patterns:['kdGolden'],etf0050Weight:1.8,biz:'none',volatility:0.018,trend:0.0008},
  {code:'2014',name:'中鴻',industry:'鋼鐵',marketCap:180,capital:268,price:17.9,prevClose:18,change5d:-0.6,change20d:4.2,volume:8500000,vol5dAvg:7000000,bias20d:2.0,gap:false,redK:true,pe:15.2,pb:0.8,dividendYield:5.5,revenueMoM:3.8,revenueYoY:6.5,foreignBuyDays:1,trustBuyDays:0,majorHolderUp:false,shortSqueeze:false,kdGolden:false,macdGreen:false,bollingerBreak:false,maAligned:false,maBreakout:false,patterns:[],etf0050Weight:0,biz:'none',volatility:0.02,trend:0.0005},

  // 食品
  {code:'1216',name:'統一',industry:'食品',marketCap:1320,capital:568,price:71.4,prevClose:70.2,change5d:1.7,change20d:4.8,volume:5500000,vol5dAvg:4500000,bias20d:2.2,gap:false,redK:true,pe:22.5,pb:2.8,dividendYield:3.5,revenueMoM:4.5,revenueYoY:7.8,foreignBuyDays:2,trustBuyDays:1,majorHolderUp:false,shortSqueeze:false,kdGolden:true,macdGreen:false,bollingerBreak:false,maAligned:false,maBreakout:false,patterns:['kdGolden'],etf0050Weight:1.2,biz:'ecommerce',volatility:0.013,trend:0.0006},
  {code:'2912',name:'統一超',industry:'食品',marketCap:1580,capital:215,price:209,prevClose:206.5,change5d:1.2,change20d:5.5,volume:1200000,vol5dAvg:1000000,bias20d:2.5,gap:false,redK:true,pe:28.5,pb:4.5,dividendYield:3.2,revenueMoM:5.8,revenueYoY:9.5,foreignBuyDays:3,trustBuyDays:1,majorHolderUp:false,shortSqueeze:false,kdGolden:false,macdGreen:true,bollingerBreak:false,maAligned:false,maBreakout:false,patterns:['macdGreen'],etf0050Weight:1.5,biz:'ecommerce',volatility:0.012,trend:0.0007},

  // 航運
  {code:'2603',name:'長榮',industry:'航運',marketCap:3850,capital:527,price:213,prevClose:211.5,change5d:0.7,change20d:12.8,volume:18000000,vol5dAvg:12000000,bias20d:6.2,gap:true,redK:true,pe:5.8,pb:1.8,dividendYield:8.5,revenueMoM:12.8,revenueYoY:22.5,foreignBuyDays:7,trustBuyDays:4,majorHolderUp:true,shortSqueeze:false,kdGolden:true,macdGreen:true,bollingerBreak:true,maAligned:true,maBreakout:true,patterns:['wBottom','maAligned','kdGolden','bollingerBreak'],etf0050Weight:3.8,biz:'none',volatility:0.035,trend:0.003},
  {code:'2609',name:'陽明',industry:'航運',marketCap:1650,capital:559,price:52.4,prevClose:52.6,change5d:-0.4,change20d:11.5,volume:22000000,vol5dAvg:15000000,bias20d:5.5,gap:false,redK:true,pe:4.8,pb:1.2,dividendYield:10.5,revenueMoM:11.5,revenueYoY:20.8,foreignBuyDays:5,trustBuyDays:3,majorHolderUp:true,shortSqueeze:false,kdGolden:true,macdGreen:true,bollingerBreak:false,maAligned:true,maBreakout:false,patterns:['maAligned','kdGolden'],etf0050Weight:1.6,biz:'none',volatility:0.038,trend:0.0025},
  {code:'2615',name:'萬海',industry:'航運',marketCap:1120,capital:441,rate:80.9,prevClose:81.8,change5d:6.2,change20d:12.2,volume:15000000,vol5dAvg:10000000,bias20d:5.8,gap:false,redK:true,pe:5.2,pb:1.0,dividendYield:9.2,revenueMoM:10.8,revenueYoY:18.5,foreignBuyDays:4,trustBuyDays:2,majorHolderUp:false,shortSqueeze:false,kdGolden:false,macdGreen:true,bollingerBreak:false,maAligned:true,maBreakout:false,patterns:['maAligned','macdGreen'],etf0050Weight:1.0,biz:'none',volatility:0.036,trend:0.002,price:80.9},
];

// computed fields
STOCKS.forEach(s=>{
  s.volRatio=s.volume/s.vol5dAvg;
  if(!s.price&&s.rate)s.price=s.rate;
});

// ===================== PRICE HISTORY GENERATOR =====================
function seededRand(seed){let s=seed;return()=>{s=(s*9301+49297)%233280;return s/233280}}
function genHistory(stock,days=120){
  const rng=seededRand(parseInt(stock.code));
  const prices=[],opens=[],highs=[],lows=[];
  let price=stock.price*(1-stock.trend*days*0.8-0.05);
  for(let i=0;i<days;i++){
    const chg=(rng()-0.47)*stock.volatility+stock.trend;
    const open=price;
    price=Math.max(price*(1+chg),1);
    const h=Math.max(open,price)*(1+rng()*0.005);
    const l=Math.min(open,price)*(1-rng()*0.005);
    opens.push(+open.toFixed(2));
    prices.push(+price.toFixed(2));
    highs.push(+h.toFixed(2));
    lows.push(+l.toFixed(2));
  }
  return{closes:prices,opens,highs,lows};
}
function genDates(days){
  const dates=[];
  const d=new Date();
  d.setDate(d.getDate()-days+1);
  for(let i=0;i<days;i++){
    dates.push(\`\${d.getMonth()+1}/\${d.getDate()}\`);
    d.setDate(d.getDate()+1);
  }
  return dates;
}

// ===================== 資料抓取層 =====================
// Yahoo Finance / TWSE / PTT 都會遇到瀏覽器 CORS 限制。
// 建議用 taiwan_stock_server.mjs 從 localhost 開啟；Node 代理會代抓外部資料。
const PROXY = 'https://corsproxy.io/?';
const LOCAL_PROXY = '/api/proxy?url=';
const LOCAL_PROXY_ABS = 'http://127.0.0.1:8787/api/proxy?url=';

function isLocalServer() {
  const h = location.hostname;
  return location.protocol.startsWith('http') &&
    (['localhost', '127.0.0.1', '::1'].includes(h) || h.endsWith('.workers.dev'));
}

// AbortController helper（相容舊版瀏覽器，避免 AbortSignal.timeout 未支援問題）
function _abortCtrl(ms) {
  const c = new AbortController();
  setTimeout(() => c.abort(), ms);
  return c;
}

async function proxied(url, timeout=12000) {
  if (isLocalServer()) {
    const c = _abortCtrl(timeout);
    const r = await fetch(LOCAL_PROXY + encodeURIComponent(url), {signal: c.signal});
    if (!r.ok) throw new Error(\`Local proxy HTTP \${r.status}\`);
    return r;
  }

  // 即使用 file:// 開檔，只要本機 app 正在跑，也優先走 localhost 代理。
  // 這是 Yahoo Finance 即時價最穩定的路徑。
  try {
    const c = _abortCtrl(Math.min(timeout, 5000));
    const r = await fetch(LOCAL_PROXY_ABS + encodeURIComponent(url), {signal: c.signal});
    if (r.ok) return r;
  } catch(e) {}

  // file:// 開啟時所有跨域直連均被 CORS 阻擋，直接走公開 proxy
  const isFile = location.protocol === 'file:';
  if (!isFile) {
    try {
      const c = _abortCtrl(Math.min(timeout, 4000));
      const r = await fetch(url, {signal: c.signal});
      if (r.ok) return r;
    } catch(e) {}
  }
  const c = _abortCtrl(timeout);
  const r = await fetch(PROXY + encodeURIComponent(url), {signal: c.signal});
  if (!r.ok) throw new Error(\`HTTP \${r.status}\`);
  return r;
}

function parseTWSENum(s) {
  return parseFloat((s || '').replace(/,/g, '')) || 0;
}

// ── Spark 批量歷史（多股一次請求，大幅減少 API 呼叫次數）─────────────────
// items: string[] (code → .TW) 或 {code, exchange}[] (exchange='two' → .TWO)
// 回傳: { "2330": { closes: [...], meta: {...} }, ... }
async function _fetchSparkBatch(items, range='3mo') {
  const getSymbol = item => typeof item === 'string'
    ? \`\${item}.TW\`
    : \`\${item.code}.\${item.exchange === 'two' ? 'TWO' : 'TW'}\`;
  const symbols = items.map(getSymbol).join(',');
  const url = \`https://query1.finance.yahoo.com/v7/finance/spark?symbols=\${symbols}&range=\${range}&interval=1d\`;
  const result = {};
  try {
    const r    = await proxied(url, 25000);
    const data = await r.json();
    const list = data?.spark?.result || [];
    for (const item of list) {
      if (!item?.symbol || !item?.response?.[0]) continue;
      const resp   = item.response[0];
      const closes = (resp.indicators?.quote?.[0]?.close || []).filter(v => v != null && v > 0);
      const code   = item.symbol.replace(/\\.(TW|TWO)$/i, '');
      result[code] = { closes, meta: resp.meta || {} };
    }
  } catch(e) { console.warn('Spark batch 失敗：', e.message); }
  return result;
}

let _lastPriceUnixTs = 0;

function setDataTime(ts) {
  _lastPriceUnixTs = ts || _lastPriceUnixTs;
  const el = document.getElementById('dataTimeEl');
  if (!el || !_lastPriceUnixTs) return;
  const d = new Date(_lastPriceUnixTs * 1000);
  const fmt = new Intl.DateTimeFormat('zh-TW', {timeZone:'Asia/Taipei',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(d);
  el.textContent = '資料: ' + fmt;
}

function isTaiwanTradingHours() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Taipei',weekday:'short',hour:'numeric',minute:'numeric',hour12:false}).formatToParts(now);
  const get = t => parts.find(p=>p.type===t)?.value;
  const wd = get('weekday');
  if (wd==='Sat'||wd==='Sun') return false;
  const h = parseInt(get('hour')||'0'), m = parseInt(get('minute')||'0');
  const mins = h*60+m;
  return mins >= 9*60 && mins <= 13*60+30;
}

function setDataStatus(state) {
  const el = document.getElementById('dataStatusBadge');
  if (!el) return;
  const map = {
    loading: ['#9a7050','⟳ 載入報價...'],
    live:    ['#16a34a','✓ 即時報價'],
    mock:    ['#d97706','DEMO 模擬'],
    error:   ['#dc2626','⚠ 載入失敗'],
  };
  const [bg, text] = map[state] || map.mock;
  el.style.background = bg;
  el.textContent = text;
}

// ── 第一階段：TWSE 批量（單一請求，~2 秒，先顯示前日收盤）───────────
async function _loadTWSEBulk() {
  let n = 0;
  try {
    const r   = await proxied('https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL', 15000);
    const arr = await r.json();
    arr.forEach(row => {
      const stock = STOCKS.find(s => s.code === row.Code);
      if (!stock) return;
      const price = parseTWSENum(row.ClosingPrice);
      if (!price || price <= 0) return;
      const chgStr = (row.Change || '').replace(/,/g,'');
      const change = /^[X＝]$/.test(chgStr.trim()) ? 0 : (parseFloat(chgStr) || 0);
      const prev   = price - change;
      stock.price     = +price.toFixed(price >= 100 ? 1 : 2);
      stock.prevClose = prev > 0 ? +prev.toFixed(prev >= 100 ? 1 : 2) : price;
      stock.change5d  = stock.prevClose > 0
        ? +((price - stock.prevClose) / stock.prevClose * 100).toFixed(2) : 0;
      const open = parseTWSENum(row.OpeningPrice);
      stock.redK = open > 0 ? price >= open : price >= stock.prevClose;
      const vol  = parseInt((row.TradeVolume || '').replace(/,/g,'')) || 0;
      if (vol > 0) { stock.volume = vol; stock.volRatio = vol / (stock.vol5dAvg || 1); }
      n++;
    });
    console.log(\`TWSE 批量：\${n} 筆\`);
  } catch(e) { console.warn('TWSE 失敗：', e.message); }
  return n;
}

// ── 第二階段：Yahoo Finance Spark 批量（~3 秒，覆蓋為今日收盤）───────────
async function _loadYFPrices() {
  let n = 0;
  try {
    const codes = STOCKS.map(s => s.code);
    const BATCH = 20;
    for (let i = 0; i < codes.length; i += BATCH) {
      const batch     = codes.slice(i, i + BATCH);
      const batchData = await _fetchSparkBatch(batch, '1mo');
      for (const code of batch) {
        const d = batchData[code];
        if (!d?.closes?.length) continue;
        const closes = d.closes;
        const price  = d.meta?.regularMarketPrice || closes[closes.length - 1];
        const prev1  = d.meta?.regularMarketPreviousClose
                    ?? (closes.length >= 2 ? closes[closes.length - 2] : price);
        if (!price || price <= 0) continue;
        const stock = STOCKS.find(s => s.code === code);
        if (!stock) continue;
        const chgFor = (days) => {
          const base = closes.length > days ? closes[closes.length - 1 - days] : closes[0];
          return base > 0 ? +((price - base) / base * 100).toFixed(2) : 0;
        };
        stock.price     = +price.toFixed(price >= 100 ? 1 : 2);
        stock.prevClose = prev1 > 0 ? +prev1.toFixed(prev1 >= 100 ? 1 : 2) : price;
        stock.change5d  = chgFor(5);
        stock.change10d = chgFor(10);
        stock.change20d = chgFor(20);
        stock.redK      = price >= prev1;
        if (d.meta?.regularMarketTime) setDataTime(d.meta.regularMarketTime);
        n++;
      }
    }
    console.log(\`Yahoo Finance spark 即時：\${n} 筆\`);
  } catch(e) { console.warn('YF spark 失敗：', e.message); }
  return n;
}

async function loadRealPrices() {
  setDataStatus('loading');
  document.getElementById('refreshBtn').disabled = true;
  const twseN = await _loadTWSEBulk();
  const yfN   = await _loadYFPrices();
  document.getElementById('refreshBtn').disabled = false;
  const total = twseN + yfN;
  if (total > 0) { setDataStatus('live'); return true; }
  else { setDataStatus('mock'); return false; }
}

async function refreshPrices() {
  await Promise.all([loadRealPrices(), loadTWII()]);
  renderSectors();
  if (currentResults.length) renderTable(currentResults);
}

async function loadTWII() {
  // 1. Yahoo Finance ^TWII（即時，含今日盤中）
  try {
    const r    = await proxied('https://query1.finance.yahoo.com/v8/finance/chart/%5ETWII?interval=1d&range=2d');
    const data = await r.json();
    const res  = data?.chart?.result?.[0];
    if (res) {
      const meta  = res.meta;
      const price = meta.regularMarketPrice;
      const prev  = meta.regularMarketPreviousClose ?? meta.chartPreviousClose ?? price;
      if (price && price > 5000) {
        const chg  = prev > 0 ? (price - prev) / prev * 100 : (meta.regularMarketChangePercent ?? 0);
        const sign = chg >= 0 ? '▲' : '▼';
        const cls  = chg >= 0 ? 'index-up' : 'down';
        document.getElementById('twiiDisplay').innerHTML =
          \`<strong class="\${cls}">\${Math.round(price).toLocaleString()} \${sign}\${Math.abs(chg).toFixed(2)}%</strong>\`;
        return;
      }
    }
  } catch(e) {}
  // 2. TWSE MI_INDEX（備援）
  try {
    const r   = await proxied('https://openapi.twse.com.tw/v1/exchangeReport/MI_INDEX');
    const arr = await r.json();
    const row = Array.isArray(arr) && arr.find(d => (d['指數'] || '').includes('發行量加權'));
    if (row) {
      const val    = parseTWSENum(row['收盤指數']);
      const chgPct = parseTWSENum(row['漲跌百分比']);
      const isUp   = (row['漲跌'] || '').trim() === '+';
      const sign   = isUp ? '▲' : '▼';
      const cls    = isUp ? 'index-up' : 'down';
      if (val > 5000) {
        document.getElementById('twiiDisplay').innerHTML =
          \`<strong class="\${cls}">\${Math.round(val).toLocaleString()} \${sign}\${Math.abs(chgPct).toFixed(2)}%</strong>\`;
        return;
      }
    }
  } catch(e) {}
}

async function fetchStockHistory(code, range='3mo', exchange='tw') {
  const suffixes = exchange === 'two' ? ['.TWO'] : ['.TW', '.TWO'];
  const rangeToDays = { '1mo':32, '3mo':95, '6mo':185, '1y':370 };
  // Add extra buffer days so the 30-day window is always fully covered
  const numDays = typeof range === 'number' ? range + 5 : (rangeToDays[range] || 95);
  const p2 = Math.floor(Date.now() / 1000) + 86400; // include today fully
  const p1 = p2 - numDays * 86400;

  for (const suffix of suffixes) {
    const url = \`https://query1.finance.yahoo.com/v8/finance/chart/\${code}\${suffix}?interval=1d&period1=\${p1}&period2=\${p2}\`;
    try {
      const r    = await proxied(url, 12000);
      const data = await r.json();
      const res  = data?.chart?.result?.[0];
      if (!res) continue;

      const ts = res.timestamp;
      const q  = res.indicators?.quote?.[0];
      if (!ts || !ts.length || !q) continue; // guard against malformed data

      const meta   = res.meta || {};
      const labels = ts.map(t => { const d = new Date(t*1000); return \`\${d.getMonth()+1}/\${d.getDate()}\`; });
      const closes = (q.close || []).map(v => v != null ? +v.toFixed(2) : null);

      if (!closes.some(v => v !== null)) continue; // all-null closes — try next suffix

      const todayLabel = (()=>{ const _d=new Date(); return \`\${_d.getMonth()+1}/\${_d.getDate()}\`; })();
      if (labels.at(-1) !== todayLabel && meta.regularMarketPrice > 0) {
        labels.push(todayLabel);
        closes.push(+meta.regularMarketPrice.toFixed(closes.filter(Boolean)[0] >= 100 ? 1 : 2));
        if (q.volume) q.volume.push(meta.regularMarketVolume || null);
      }
      return { labels, closes, volumes: q.volume || [] };
    } catch(e) {}
  }
  return null;
}


// ===================== STATE =====================
let currentResults=[];
let sortKey='';let sortAsc=true;
let activeChart=null;
let currentPeriod=20;
let selectedStockCode=null;

// ===================== TAB SWITCHING =====================
let _sectorAutoScanned=false;
function switchTab(tab,btn){
  document.querySelectorAll('.tab-content').forEach(el=>el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el=>el.classList.remove('active'));
  document.getElementById('tab-'+tab).classList.add('active');
  btn.classList.add('active');
  if(tab==='sector'){
    renderSectors();
    if(!_sectorAutoScanned){_sectorAutoScanned=true;fullScanCorrelations();}
  }
}

// ===================== MODULE TOGGLE =====================
function toggleModule(header){
  header.classList.toggle('collapsed');
  header.nextElementSibling.classList.toggle('hidden');
}

// ===================== SCREENER LOGIC =====================
function runScreener(){
  showLoading();
  setTimeout(()=>{
    const selectedIndustries=[...document.querySelectorAll('input[name="industry"]:checked')].map(el=>el.value);
    const marketCapMin=+document.getElementById('marketCapMin').value||0;
    const capitalMax=+document.getElementById('capitalMax').value||99999;

    const nDays=+document.getElementById('nDays').value||5;
    const changeMin=+document.getElementById('changeMin').value||-99;
    const changeMax=+document.getElementById('changeMax').value||99;
    const filterVolume=document.getElementById('filterVolume').checked;
    const volMultiplier=+document.getElementById('volMultiplier').value||1.5;
    const biasMin=+document.getElementById('biasMin').value||-99;
    const biasMax=+document.getElementById('biasMax').value||99;
    const filterGap=document.getElementById('filterGap').checked;

    const patWBottom=document.getElementById('patWBottom').checked;
    const patLongLower=document.getElementById('patLongLower').checked;
    const filterMaAligned=document.getElementById('filterMaAligned').checked;
    const filterMaBreakout=document.getElementById('filterMaBreakout').checked;
    const filterKD=document.getElementById('filterKD').checked;
    const filterMACD=document.getElementById('filterMACD').checked;
    const filterBollinger=document.getElementById('filterBollinger').checked;

    const foreignDays=+document.getElementById('foreignDays').value||0;
    const trustDays=+document.getElementById('trustDays').value||0;
    const filterMajorUp=document.getElementById('filterMajorUp').checked;
    const filterShortSqueeze=document.getElementById('filterShortSqueeze').checked;

    const filterRevenue=document.getElementById('filterRevenue').checked;
    const revMoM=+document.getElementById('revMoM').value||0;
    const revYoY=+document.getElementById('revYoY').value||0;
    const peMax=+document.getElementById('peMax').value||999;
    const pbMax=+document.getElementById('pbMax').value||999;
    const yieldMin=+document.getElementById('yieldMin').value||0;
    const etfSelect=document.getElementById('etfSelect').value;

    const results=STOCKS.filter(s=>{
      if(!selectedIndustries.includes(s.industry))return false;
      if(s.marketCap<marketCapMin)return false;
      if(s.capital>capitalMax)return false;

      const chg=nDays<=7?s.change5d:nDays<=15?(s.change10d??s.change5d):(s.change20d??s.change5d);
      if(chg<changeMin||chg>changeMax)return false;
      if(filterVolume&&!(s.volRatio>=volMultiplier&&s.redK))return false;
      if(s.bias20d<biasMin||s.bias20d>biasMax)return false;
      if(filterGap&&!s.gap)return false;

      if(patWBottom&&!s.patterns.includes('wBottom'))return false;
      if(patLongLower&&!s.patterns.includes('longLower'))return false;
      if(filterMaAligned&&!s.maAligned)return false;
      if(filterMaBreakout&&!s.maBreakout)return false;
      if(filterKD&&!s.kdGolden)return false;
      if(filterMACD&&!s.macdGreen)return false;
      if(filterBollinger&&!s.bollingerBreak)return false;

      if(s.foreignBuyDays<foreignDays)return false;
      if(s.trustBuyDays<trustDays)return false;
      if(filterMajorUp&&!s.majorHolderUp)return false;
      if(filterShortSqueeze&&!s.shortSqueeze)return false;

      if(filterRevenue&&!(s.revenueMoM>=revMoM&&s.revenueYoY>=revYoY))return false;
      if(s.pe>peMax)return false;
      if(s.pb>pbMax)return false;
      if(s.dividendYield<yieldMin)return false;
      if(etfSelect==='0050'&&s.etf0050Weight===0)return false;

      return true;
    });

    currentResults=[...results];
    renderTable(currentResults);
    hideLoading();
  },600);
}

function renderTable(data){
  const placeholder=document.getElementById('screenerPlaceholder');
  const results=document.getElementById('screenerResults');
  placeholder.style.display='none';
  results.style.display='block';
  document.getElementById('resultCount').innerHTML=\`共篩選出 <strong>\${data.length}</strong> 檔股票\`;

  const etfSelect=document.getElementById('etfSelect').value;
  const tbody=document.getElementById('stockTableBody');
  tbody.innerHTML='';
  const _nDays=+(document.getElementById('nDays')?.value)||5;
  const getChg=s=>(_nDays<=7?s.change5d:(_nDays<=15?(s.change10d??s.change5d):(s.change20d??s.change5d)))??0;
  data.forEach(s=>{
    const chgClass=getChg(s)>=0?'up':'down';
    const chgSign=getChg(s)>=0?'+':'';
    const tags=buildTags(s);
    const etfCol=etfSelect?\`<td class="\${s.etf0050Weight>0?'up neutral':''}">\${s.etf0050Weight>0?s.etf0050Weight.toFixed(1)+'%':'—'}</td>\`:'';
    const tr=document.createElement('tr');
    tr.innerHTML=\`
      <td class="code-cell">\${s.code}</td>
      <td class="name-cell">\${s.name}</td>
      <td><span style="font-size:11px;color:#94a3b8">\${s.industry}</span></td>
      <td style="font-weight:600">\${s.price.toFixed(1)}</td>
      <td class="\${chgClass}">\${chgSign}\${getChg(s).toFixed(1)}%</td>
      <td class="\${s.volRatio>=1.5?'up':'neutral'}">\${s.volRatio.toFixed(2)}x</td>
      <td class="\${s.bias20d>=0?'up':'down'}">\${s.bias20d>=0?'+':''}\${s.bias20d.toFixed(1)}%</td>
      <td>\${s.pe.toFixed(1)}</td>
      <td>\${s.pb.toFixed(1)}</td>
      <td class="up">\${s.dividendYield.toFixed(1)}%</td>
      <td>\${tags}</td>
    \`;
    tr.onclick=()=>selectStock(s,tr);
    tbody.appendChild(tr);
  });
}

function buildTags(s){
  let t='';
  if(s.maAligned)t+=\`<span class="tag tag-green">多頭排列</span>\`;
  if(s.kdGolden)t+=\`<span class="tag tag-blue">KD黃金交叉</span>\`;
  if(s.macdGreen)t+=\`<span class="tag tag-green">MACD翻紅</span>\`;
  if(s.bollingerBreak)t+=\`<span class="tag tag-yellow">突破布林</span>\`;
  if(s.gap)t+=\`<span class="tag tag-yellow">跳空缺口</span>\`;
  if(s.patterns.includes('wBottom'))t+=\`<span class="tag tag-green">W底</span>\`;
  if(s.foreignBuyDays>=5)t+=\`<span class="tag tag-blue">外資連買\${s.foreignBuyDays}日</span>\`;
  if(s.shortSqueeze)t+=\`<span class="tag tag-yellow">軋空潛力</span>\`;
  return t||'—';
}

function selectStock(stock,tr){
  document.querySelectorAll('#stockTableBody tr').forEach(r=>r.classList.remove('selected'));
  tr.classList.add('selected');
  selectedStockCode=stock.code;
  showChart(stock,currentPeriod); // async, no need to await
}

async function showChart(stock, days) {
  const area = document.getElementById('chartArea');
  area.style.display = 'block';
  document.getElementById('chartCode').textContent = stock.code;
  document.getElementById('chartName').textContent = stock.name;
  const chgClass = stock.change5d >= 0 ? 'up' : 'down';
  const chgSign  = stock.change5d >= 0 ? '+' : '';
  document.getElementById('chartPrice').innerHTML =
    \`<span class="\${chgClass}">\${stock.price.toFixed(stock.price>=100?1:2)} (\${chgSign}\${stock.change5d.toFixed(2)}%)</span>\`;

  if (activeChart) activeChart.destroy();

  // Show spinner in canvas area while loading
  const canvas = document.getElementById('priceChart');
  canvas.style.opacity = '0.3';

  // Map days → Yahoo Finance range string
  const rangeMap = { 20:'1mo', 60:'3mo', 120:'6mo' };
  const range = rangeMap[days] || '3mo';

  // Try real data, fall back to generated
  let hist = await fetchStockHistory(stock.code, range);
  // Sync displayed price to last real close
  if (hist?.closes?.length) {
    const realLast = hist.closes.filter(v=>v!=null).at(-1);
    if (realLast) {
      stock.price = realLast;
      // refresh header
      const chgClass = stock.change5d >= 0 ? 'up' : 'down';
      const chgSign  = stock.change5d >= 0 ? '+' : '';
      document.getElementById('chartPrice').innerHTML =
        \`<span class="\${chgClass}">\${stock.price.toFixed(stock.price>=100?1:2)} (\${chgSign}\${stock.change5d.toFixed(2)}%)</span>\`;
    }
  }
  let isReal = !!hist;
  if (!hist) {
    const fallback = genHistory(stock, days);
    hist = { labels: genDates(days), closes: fallback.closes, volumes: null };
  }

  canvas.style.opacity = '1';
  const ctx = canvas.getContext('2d');

  // Compute gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 260);
  gradient.addColorStop(0, 'rgba(193,127,62,0.3)');
  gradient.addColorStop(1, 'rgba(193,127,62,0)');

  const validCloses  = hist.closes.filter(v => v != null && v > 0);
  const validVolumes = hist.volumes?.filter(v => v != null && v > 0) ?? [];
  const showVolume   = validVolumes.length > 0;

  if (!validCloses.length) {
    canvas.style.opacity = '1';
    ctx.fillStyle = '#475569';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('暫無歷史資料', canvas.width / 2, canvas.height / 2);
    return;
  }

  const datasets = [{
    label: '收盤價',
    data: hist.closes,
    borderColor: '#c17f3e',
    backgroundColor: gradient,
    borderWidth: 2,
    pointRadius: 0,
    fill: true,
    tension: 0.2,
    yAxisID: 'yPrice',
    spanGaps: true,
  }];

  if (showVolume) {
    datasets.push({
      label: '成交量',
      data: hist.volumes.map(v => (v && v > 0) ? Math.round(v / 1000) : null),
      type: 'bar',
      backgroundColor: 'rgba(180,150,110,0.45)',
      yAxisID: 'yVol',
      spanGaps: true,
    });
  }

  const volMax = showVolume ? Math.max(...validVolumes) / 1000 * 4 : undefined;

  activeChart = new Chart(ctx, {
    type: 'line',
    data: { labels: hist.labels, datasets },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index', intersect: false,
          callbacks: {
            label: c => c.dataset.label === '成交量'
              ? \`成交量：\${c.parsed.y?.toLocaleString() ?? '-'}張\`
              : \`收盤：\${c.parsed.y?.toFixed(c.parsed.y >= 100 ? 1 : 2) ?? '-'}\`,
          }
        },
        title: isReal
          ? { display:true, text:'資料來源：Yahoo Finance', color:'#9a7050', font:{size:10}, align:'end', padding:{top:0} }
          : { display:true, text:'模擬走勢（無法連線 Yahoo Finance）', color:'#c17f3e', font:{size:10}, align:'end', padding:{top:0} }
      },
      scales: {
        x:      { grid:{color:'#e0d4c0'}, ticks:{color:'#9a7050', maxTicksLimit:10} },
        yPrice: { grid:{color:'#e0d4c0'}, ticks:{color:'#7a4f2a'}, position:'right' },
        yVol: {
          display: showVolume,
          position: 'left',
          grid: { display: false },
          ticks: { color:'#b08060', maxTicksLimit:4, callback: v => \`\${v.toFixed(0)}k\` },
          max: volMax,
        },
      },
      interaction: { mode:'nearest', axis:'x', intersect:false },
    }
  });
  area.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

function changePeriod(days,btn){
  document.querySelectorAll('.period-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  currentPeriod=days;
  if(selectedStockCode){
    const s=STOCKS.find(x=>x.code===selectedStockCode);
    if(s)showChart(s,days); // async, no need to await
  }
}

function closeChart(){
  document.getElementById('chartArea').style.display='none';
  document.querySelectorAll('#stockTableBody tr').forEach(r=>r.classList.remove('selected'));
  selectedStockCode=null;
}

// ===================== SORT =====================
function sortTable(key){
  if(sortKey===key)sortAsc=!sortAsc;
  else{sortKey=key;sortAsc=true;}
  const sorted=[...currentResults].sort((a,b)=>{
    const av=a[key]??0, bv=b[key]??0;
    return sortAsc?(av>bv?1:-1):(av<bv?1:-1);
  });
  renderTable(sorted);
}

// ===================== LOADING =====================
function showLoading(){document.getElementById('loadingOverlay').style.display='flex'}
function hideLoading(){document.getElementById('loadingOverlay').style.display='none'}

// ===================== PTT CRAWLER =====================
const PTT_DATA = {
  '台積電': {
    code:'2330', score:74, desc:'明顯多方', articleCount:312, bullish:62.8, bearish:17.5, neutral:19.7,
    trend:'↑ 快速上升', color:'#10b981', fillColor:'linear-gradient(to top,#059669,#10b981)',
    posts:[
      {cat:'標的', title:'2330 台積電 多 CoWoS缺口不補直接上', author:'chipwave88', date:'05/28', nrec:218, sentiment:'bullish',
       content:'今天量能放大站上所有均線，外資連買第8日。CoWoS先進封裝下半年產能全滿，NVIDIA GB200訂單能見度到Q3，這波目標看前高。'},
      {cat:'新聞', title:'台積電N2良率傳達90% 外資目標價齊升', author:'news_ptt', date:'05/28', nrec:145, sentiment:'bullish',
       content:'（工商時報）多家外資上調台積電目標價，N2製程良率優於預期，AI晶片需求持續強勁。摩根士丹利維持增持評等。'},
      {cat:'心得', title:'抱著2330三年的心路歷程', author:'longterm_hold', date:'05/27', nrec:89, sentiment:'bullish',
       content:'從當初就說長期持有，中間也有很多風風雨雨，但台積電的護城河實在太深了。現在回頭看，每次的恐慌都是買點。'},
      {cat:'標的', title:'2330 注意 月KD高檔，短線乖離偏大', author:'TA_watcher', date:'05/27', nrec:52, sentiment:'bearish',
       content:'技術面警示：月KD已進入超買區，20日乖離率接近10%，短線需要整理。不建議追高，等回測5日均線再考慮。'},
      {cat:'請益', title:'現在買台積電合理嗎？跪求各位神人指引', author:'noob_investor', date:'05/26', nrec:34, sentiment:'neutral',
       content:'最近看新聞台積電一直漲，想買但又怕追高，請問現在進場的勝率怎麼樣？有沒有比較好的進場時機判斷方式？'},
      {cat:'閒聊', title:'台積電 vs NVIDIA 誰更值得長期持有', author:'globalview99', date:'05/26', nrec:41, sentiment:'neutral',
       content:'兩家公司都是AI最大受益者，但NVIDIA的護城河在軟體生態，台積電在製程壁壘。長期來看你們比較看好哪邊？'},
    ]
  },
  '聯發科': {
    code:'2454', score:68, desc:'偏多氣氛', articleCount:198, bullish:58.5, bearish:21.3, neutral:20.2,
    trend:'↑ 上升中', color:'#10b981', fillColor:'linear-gradient(to top,#059669,#34d399)',
    posts:[
      {cat:'標的', title:'2454 聯發科 多 天璣9400+殺爆高通', author:'mediatekbull', date:'05/28', nrec:134, sentiment:'bullish',
       content:'天璣9400+效能測試完全超越高通S8E，三星S26傳採用聯發科方案，加上AI手機換機潮，Q2出貨量超預期。技術面突破頸線。'},
      {cat:'新聞', title:'聯發科Q1財報亮眼 AI晶片出貨倍增', author:'fin_news', date:'05/27', nrec:98, sentiment:'bullish',
       content:'聯發科公布Q1財報，EPS達XX元，AI相關晶片出貨量年增超過100%，法人給予正面評價，股價連續突破高點。'},
      {cat:'心得', title:'聯發科空單被軋到懷疑人生', author:'short_pain', date:'05/27', nrec:203, sentiment:'bearish',
       content:'本來以為高通反攻聯發科會跌，結果越空越漲，現在已經虧損超過30%，真的不懂這個市場，只能認賠出場了。'},
      {cat:'請益', title:'聯發科跟台積電你們選哪個', author:'choosehardq', date:'05/26', nrec:56, sentiment:'neutral',
       content:'手上有一筆資金，想在聯發科跟台積電中選一個，兩個都是AI受益股，你們的看法呢？'},
    ]
  },
  '鴻海': {
    code:'2317', score:58, desc:'略偏多', articleCount:156, bullish:48.2, bearish:27.5, neutral:24.3,
    trend:'→ 持平', color:'#f59e0b', fillColor:'linear-gradient(to top,#d97706,#f59e0b)',
    posts:[
      {cat:'標的', title:'2317 鴻海 多 GB200伺服器機櫃代工吃到飽', author:'foxconn_fan', date:'05/28', nrec:88, sentiment:'bullish',
       content:'鴻海是NVIDIA GB200機櫃組裝最大廠，隨著AI資料中心擴張，伺服器業務佔比持續提升，這條線的估值遠低於廣達緯穎。'},
      {cat:'心得', title:'存鴻海5年領息，複利真香', author:'dividend_king', date:'05/27', nrec:67, sentiment:'bullish',
       content:'每年配息穩定，殖利率維持4%以上。5年下來，光是股息再投入就累積很多張。適合不想盯盤的長期投資人。'},
      {cat:'標的', title:'2317 鴻海 空 電動車進度遠不如預期', author:'ev_skeptic', date:'05/26', nrec:45, sentiment:'bearish',
       content:'鴻海MODEL C MODEL E量產進度一再延宕，電動車夢想遲遲無法兌現，本業手機代工毛利薄，等突破再進場。'},
    ]
  },
  '長榮': {
    code:'2603', score:65, desc:'偏多', articleCount:187, bullish:55.8, bearish:23.6, neutral:20.6,
    trend:'↑ 上升中', color:'#10b981', fillColor:'linear-gradient(to top,#059669,#10b981)',
    posts:[
      {cat:'標的', title:'2603 長榮 多 紅海運費再起，航運新一波', author:'shipping_pro', date:'05/28', nrec:112, sentiment:'bullish',
       content:'蘇伊士運河情況再度緊張，現貨運費週環比上漲15%，長榮現貨曝險比例高，受益最直接。加上殖利率高，長期持有。'},
      {cat:'新聞', title:'航運Q2旺季提前報到 運價上漲超預期', author:'shipping_news', date:'05/27', nrec:78, sentiment:'bullish',
       content:'亞歐航線運費指數突破年初高點，法人上調航運股目標價。長榮、陽明受惠最大，Q2獲利可期。'},
      {cat:'標的', title:'2603 長榮 短空 漲太快需要整理', author:'swing_trader', date:'05/26', nrec:43, sentiment:'bearish',
       content:'長榮近期漲幅過大，RSI進入超買，等回測10日線再買。運費景氣有週期性，不能追高。'},
    ]
  },
};

const PTT_DEFAULT = {
  code:'', score:42, desc:'中立觀望', articleCount:45, bullish:38.5, bearish:32.1, neutral:29.4,
  trend:'→ 持平', color:'#f59e0b', fillColor:'linear-gradient(to top,#d97706,#f59e0b)',
  posts:[
    {cat:'請益', title:'這支股票值得關注嗎？', author:'curious_inv', date:'05/28', nrec:12, sentiment:'neutral',
     content:'PTT股票板討論度適中，尚未有明顯多空方向，建議持續追蹤基本面與法人動向。'},
    {cat:'閒聊', title:'大盤今天走勢分析', author:'market_watcher', date:'05/27', nrec:28, sentiment:'neutral',
     content:'整體市場觀望氣氛濃厚，等待重要技術支撐確認後再決定操作方向。'},
    {cat:'心得', title:'長期持股的心態分享', author:'patient_hold', date:'05/27', nrec:19, sentiment:'bullish',
     content:'不管短線如何波動，好公司長期持有終究有回報。分享一些個人選股心得。'},
  ]
};

// ── PTT 真實爬取（嘗試）────────────────────────────────────────────
async function fetchArticleContent(url) {
  try {
    const r = await proxied(url, 8000);
    const html = await r.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const main = doc.querySelector('#main-content');
    if (!main) return '';
    // 移除發文者資訊與推文，只保留正文
    main.querySelectorAll('.article-metaline, .article-metaline-right, .push').forEach(el => el.remove());
    return (main.textContent || '').trim().slice(0, 3000);
  } catch(e) { return ''; }
}

async function fetchPTTPosts(keyword) {
  const parseEntries = (html) => {
    if (html.includes('over18') || html.includes('請您確認') || !html.includes('r-ent')) return [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return [...doc.querySelectorAll('div.r-ent')].map(el => {
      const titleEl = el.querySelector('.title a');
      if (!titleEl) return null;
      const fullTitle = titleEl.textContent.trim();
      const catMatch = fullTitle.match(/^\\[([^\\]]+)\\]/);
      const cat = catMatch ? catMatch[1] : '閒聊';
      const title = fullTitle.replace(/^\\[[^\\]]+\\]\\s*/, '');
      const author = el.querySelector('.author')?.textContent.trim() || '匿名';
      const date = el.querySelector('.date')?.textContent.trim() || '';
      const nrecEl = el.querySelector('.nrec span');
      const nrecRaw = nrecEl?.textContent.trim() || '0';
      const nrec = nrecRaw === '爆' ? 100 : nrecRaw.startsWith('X') ? -parseInt(nrecRaw.slice(1))||0 : parseInt(nrecRaw)||0;
      const href = titleEl.getAttribute('href');
      return { cat, fullTitle, title, author, date, nrec, href, link: \`https://www.ptt.cc\${href}\`, isReal: true };
    }).filter(Boolean);
  };

  const parsePttDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.trim().split('/');
    if (parts.length !== 2) return null;
    const pm = parseInt(parts[0]), pd = parseInt(parts[1]);
    if (isNaN(pm) || isNaN(pd)) return null;
    const now = new Date();
    // Use midnight so date comparisons aren't skewed by time-of-day
    let d = new Date(now.getFullYear(), pm - 1, pd, 0, 0, 0, 0);
    if (d > now) d.setFullYear(now.getFullYear() - 1);
    return d;
  };

  try {
    const now = new Date();
    // Cutoffs at midnight to avoid time-of-day drift
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const cutoff7  = new Date(today); cutoff7.setDate(today.getDate() - 7);
    const cutoff30 = new Date(today); cutoff30.setDate(today.getDate() - 30);

    const seenHref = new Set();
    const basicPosts = [];
    const MAX_PAGES = 30;

    for (let start = 1; start <= MAX_PAGES; start += 5) {
      const pageNums = [];
      for (let p = start; p < start + 5 && p <= MAX_PAGES; p++) pageNums.push(p);

      const htmls = await Promise.all(pageNums.map(async pg => {
        try {
          const r = await proxied(\`https://www.ptt.cc/bbs/Stock/search?q=\${encodeURIComponent(keyword)}&page=\${pg}\`, 10000);
          return await r.text();
        } catch(e) { return ''; }
      }));

      const batchPosts = [];
      for (const html of htmls) {
        for (const p of parseEntries(html)) {
          if (p.href && seenHref.has(p.href)) continue;
          if (p.href) seenHref.add(p.href);
          batchPosts.push(p);
        }
      }

      if (!batchPosts.length) break; // PTT has no more pages

      basicPosts.push(...batchPosts);

      // Only stop early if ALL posts with parseable dates are older than 30 days
      const dated = batchPosts.filter(p => parsePttDate(p.date) !== null);
      if (dated.length > 0 && dated.every(p => parsePttDate(p.date) < cutoff30)) break;
    }

    if (!basicPosts.length) return null;

    const posts7 = [], posts30 = [];
    for (const p of basicPosts) {
      const d = parsePttDate(p.date);
      if (!d || d < cutoff30) continue;
      if (d >= cutoff7) posts7.push(p);
      else posts30.push(p);
    }

    // Batch-fetch full content for ALL 7-day posts (batch 8 at a time for speed)
    const BATCH = 8;
    const scored7 = [];
    for (let i = 0; i < posts7.length; i += BATCH) {
      const batch = posts7.slice(i, i + BATCH);
      const results = await Promise.all(batch.map(async p => {
        const content = await fetchArticleContent(p.link);
        const sentiment = detectSentimentFull(p.fullTitle, content);
        return { ...p, content: content.slice(0, 200) || '（點擊可前往 PTT 查看完整文章）', sentiment, scored: true };
      }));
      scored7.push(...results);
    }

    // 8-30 day posts: count only, no content fetch
    const counted30 = posts30.map(p => ({
      ...p,
      content: '（點擊可前往 PTT 查看完整文章）',
      sentiment: 'neutral',
      scored: false
    }));

    return { posts7: scored7, posts30: counted30 };
  } catch(e) { return null; }
}


function detectSentimentFull(title, content) {
  if (!content) content = '';
  const fullText = title + ' ' + content;

  // [標的] 格式：多空方向寫在文章正文首行，不在標題
  if (/\\[標的\\]/.test(title)) {
    // 1. 先看標題是否已有明確方向
    if (/\\s多\\b|看多|作多|做多/.test(title)) return 'bullish';
    if (/\\s空\\b|看空|作空|做空|放空/.test(title)) return 'bearish';
    // 2. 看文章正文（PTT [標的] 格式：第一行是「多」或「空」，或「方向: 多/空」）
    const body = content.slice(0, 500);
    if (/^\\s*多\\s*$/m.test(body) || /方向[：:]\\s*多/.test(body) || /做多|看多|作多/.test(body)) return 'bullish';
    if (/^\\s*空\\s*$/m.test(body) || /方向[：:]\\s*空/.test(body) || /做空|看空|放空|作空/.test(body)) return 'bearish';
    // 3. 整篇文章關鍵字計分
    if (/看漲|看好|買進|進場|加碼|目標價上調|多頭/.test(fullText)) return 'bullish';
    if (/看跌|看壞|賣出|破底|下跌|利空|空頭/.test(fullText)) return 'bearish';
  }

  // 一般文章：根據完整正文關鍵字計分
  const bRx = /看多|做多|作多|看漲|看好|買進|低接|進場|加碼|長線|佈局|突破|創高|大漲|大幅上漲|飆漲|噴出|反彈|回升|上攻|利多|受惠|成長|目標價上調|多頭|偏多|樂觀|強勢表現/;
  const sRx = /看空|做空|作空|放空|看跌|看壞|賣出|出場|破底|下跌|大幅下跌|利空|停損|套牢|虧損|砍倉|下修|悲觀|泡沫|崩盤|空頭|偏空|弱勢|危機/;
  const bScore = (bRx.test(fullText) ? 3 : 0) + (/漲|正面|亮眼|爆量|上升/.test(fullText) ? 1 : 0);
  const sScore = (sRx.test(fullText) ? 3 : 0) + (/跌|破位|不如預期/.test(fullText) ? 1 : 0);
  if (bScore > sScore) return 'bullish';
  if (sScore > bScore) return 'bearish';
  return 'neutral';
}

// ── Main crawler entry ────────────────────────────────────────────
let socialChartInst=null, sentimentChartInst=null;

// Extended code↔name lookup (supplements the STOCKS screener array)
// Ensures PTT search always uses the company name, not the code
const STOCK_EXTRA = {
  // 金融 (not already in STOCKS)
  '2880':'華南金','2883':'開發金','2885':'元大金','2887':'台新金',
  '2888':'新光金','2889':'國票金','2890':'永豐金','2892':'第一金','5880':'合庫金',
  // 科技/電子
  '2324':'仁寶','2347':'聯強','2357':'華碩','2395':'研華','2451':'創見',
  '3045':'台灣大','3324':'雙鴻','3443':'創意','3702':'大聯大',
  '4938':'和碩','4961':'天鈺','5274':'信驊','5347':'世界先進',
  '6239':'力成','6271':'同欣電','6409':'旭隼','6531':'愛普',
  '8069':'元太','8150':'南電',
  // 傳產/基礎
  '1101':'台泥','1102':'亞泥','1210':'大成','1326':'台化','1402':'遠東新',
  '1504':'東元','2049':'上銀','2059':'川湖','2105':'正新',
  '2201':'裕隆','2207':'和泰車','2337':'旺宏',
  // 航運
  '2606':'裕民','2610':'中華航','2618':'長榮航',
  // ETF (常被討論)
  '0050':'元大台灣50','0056':'元大高股息','006208':'富邦台50',
  '00878':'國泰永續高股息','00929':'復華台灣科技優息',
};

const STOCK_MAP = (function() {
  const m = {};
  // Build from STOCKS screener array
  (typeof STOCKS !== 'undefined' ? STOCKS : []).forEach(s => {
    if (s.code && s.name) { m[s.code] = s.name; m[s.name] = s.code; }
  });
  // Add extended entries
  Object.entries(STOCK_EXTRA).forEach(([code, name]) => {
    if (!m[code]) m[code] = name;
    if (!m[name]) m[name] = code;
  });
  return m;
})();

// Given any user query, return { code, name, pttQuery }
// pttQuery is always the stock NAME so PTT search is consistent
function resolveStock(q) {
  const t = q.trim();

  // Exact code match (e.g. "2330")
  if (/^\\d{4,5}$/.test(t) && STOCK_MAP[t]) {
    return { code: t, name: STOCK_MAP[t], pttQuery: STOCK_MAP[t] };
  }

  // Exact name match (e.g. "台積電")
  if (STOCK_MAP[t] && !/^\\d+$/.test(t)) {
    return { code: STOCK_MAP[t], name: t, pttQuery: t };
  }

  // Query contains a known code
  const codeInQ = Object.keys(STOCK_MAP).find(k => /^\\d{4,5}$/.test(k) && q.includes(k));
  if (codeInQ) {
    const name = STOCK_MAP[codeInQ];
    return { code: codeInQ, name, pttQuery: name };
  }

  // Query contains a known name
  const nameInQ = Object.keys(STOCK_MAP).find(k => !/^\\d+$/.test(k) && q.includes(k));
  if (nameInQ) {
    const code = STOCK_MAP[nameInQ];
    return { code, name: nameInQ, pttQuery: nameInQ };
  }

  // Fallback: try to extract any 4-5 digit number
  const m = q.match(/\\b(\\d{4,5})\\b/);
  if (m) return { code: m[1], name: null, pttQuery: q };

  return { code: null, name: q, pttQuery: q };
}


async function runCrawler() {
  const raw_q = document.getElementById('socialSearchInput').value.trim();
  if (!raw_q) return;
  showLoading();

  // Normalize: code↔name lookup so "2330" and "台積電" give the same PTT search
  const { code, name, pttQuery } = resolveStock(raw_q);
  let stockCode = code;

  // Update search UI to show resolved name if different from raw input
  const displayLabel = name && name !== raw_q ? \`\${name}（\${raw_q}）\` : raw_q;

  // Fetch PTT (with resolved name as keyword) and price in parallel
  const [pttResult, initialPrice] = await Promise.all([
    fetchPTTPosts(pttQuery).catch(() => null),
    stockCode ? fetchStockHistory(stockCode, 30).catch(() => null) : Promise.resolve(null)
  ]);

  // If no price yet, scan PTT article titles for a stock code
  let realPriceHist = initialPrice;
  if (!realPriceHist && pttResult) {
    const triedCodes = new Set(stockCode ? [stockCode] : []);
    const allPosts = [...(pttResult.posts7 || []), ...(pttResult.posts30 || [])];
    for (const p of allPosts) {
      const titleCodes = (p.fullTitle || '').match(/\\b\\d{4,5}\\b/g) || [];
      for (const tc of titleCodes) {
        if (triedCodes.has(tc)) continue;
        triedCodes.add(tc);
        try { realPriceHist = await fetchStockHistory(tc, 30); } catch(e) {}
        if (realPriceHist) { stockCode = tc; break; }
      }
      if (realPriceHist) break;
    }
  }

  if (pttResult && (pttResult.posts7.length > 0 || pttResult.posts30.length > 0)) {
    const { posts7, posts30 } = pttResult;
    const allPosts = [...posts7, ...posts30];

    const dailyCounts = {};
    allPosts.forEach(p => {
      if (!p.date) return;
      const parts = p.date.trim().split('/');
      if (parts.length === 2) {
        const key = \`\${parseInt(parts[0])}/\${parseInt(parts[1])}\`;
        dailyCounts[key] = (dailyCounts[key] || 0) + 1;
      }
    });

    const dailySentiment = {};
    posts7.forEach(p => {
      if (!p.date) return;
      const parts = p.date.trim().split('/');
      if (parts.length === 2) {
        const key = \`\${parseInt(parts[0])}/\${parseInt(parts[1])}\`;
        if (!dailySentiment[key]) dailySentiment[key] = { b: 0, d: 0, n: 0 };
        if (p.sentiment === 'bullish') dailySentiment[key].b++;
        else if (p.sentiment === 'bearish') dailySentiment[key].d++;
        else dailySentiment[key].n++;
      }
    });

    const b7 = posts7.filter(p => p.sentiment === 'bullish').length;
    const d7 = posts7.filter(p => p.sentiment === 'bearish').length;
    const r7t = posts7.length || 1;
    const score = Math.round(50 + (b7 - d7) / r7t * 50);

    const merged = {
      posts: allPosts,
      articleCount: allPosts.length,
      bullish: +(b7 / r7t * 100).toFixed(1),
      bearish: +(d7 / r7t * 100).toFixed(1),
      neutral: +(100 - b7/r7t*100 - d7/r7t*100).toFixed(1),
      score,
      recent7Count: posts7.length,
      dailyCounts,
      dailySentiment,
      fillColor: score >= 50 ? 'rgba(192,57,43,0.7)' : 'rgba(39,174,96,0.7)',
      color: score >= 50 ? '#c0392b' : '#27ae60',
      desc: score >= 70 ? '近7日極多氣氛' : score >= 55 ? '近7日偏多' : score <= 30 ? '近7日極空氣氛' : score <= 45 ? '近7日偏空' : '近7日中立',
      trend: b7 > d7 ? '↑ 偏多' : d7 > b7 ? '↓ 偏空' : '→ 中立'
    };

    renderSocial(merged, displayLabel, true, allPosts, realPriceHist);
  } else {
    renderSocialEmpty(displayLabel, realPriceHist, pttResult === null);
  }
  hideLoading();
}



function renderSocial(data, query, isReal=false, realPosts=null, priceHist=null) {
  document.getElementById('socialPlaceholder').style.display = 'none';
  document.getElementById('socialResults').style.display = 'block';

  const stockName = Object.keys(PTT_DATA).find(k=>query.includes(k)) || query;
  const sourceTag = isReal ? '✓ 即時 PTT' : '模擬資料';
  document.getElementById('postsTitle').innerHTML =
    \`PTT 股票板：「\${stockName}」相關討論 <span style="font-size:12px;color:#64748b;font-weight:normal">\${sourceTag}</span>\`;

  document.getElementById('thermoFill').style.cssText = \`height:\${data.score}%;background:\${data.fillColor}\`;
  document.getElementById('thermoBulb').style.background = data.color;
  document.getElementById('thermoScore').textContent = data.score;
  document.getElementById('thermoScore').className = data.score >= 50 ? 'thermo-score up' : 'thermo-score down';
  document.getElementById('thermoDesc').textContent = data.desc;

  const _r7txt = data.recent7Count != null ? \` (近7日\${data.recent7Count}篇)\` : '';
  document.getElementById('statMentions').textContent = data.articleCount.toLocaleString() + ' 篇' + _r7txt;
  document.getElementById('statBullish').textContent  = data.bullish.toFixed(1) + '%';
  document.getElementById('statBearish').textContent  = data.bearish.toFixed(1) + '%';
  document.getElementById('statNeutral').textContent  = data.neutral.toFixed(1) + '%';
  document.getElementById('statTrend').textContent    = data.trend;

  // Both charts share the exact same 30-day label array
  const days30 = genDates(30);

  // --- Article count bars ---
  let postCounts;
  if (isReal && data.dailyCounts) {
    postCounts = days30.map(d => data.dailyCounts[d] || 0);
  } else {
    const rng = seededRand(data.score * 137);
    postCounts = days30.map(() => Math.round(data.articleCount / 30 * (0.4 + rng() * 1.4)));
  }

  // --- Price line aligned to days30 ---
  let priceData = null;
  if (priceHist?.labels && priceHist?.closes) {
    const priceMap = {};
    priceHist.labels.forEach((lbl, i) => { priceMap[lbl] = priceHist.closes[i]; });
    const aligned = days30.map(d => (priceMap[d] != null ? priceMap[d] : null));
    if (aligned.some(v => v !== null)) priceData = aligned;
  }

  // Padding objects — shared by reference so we can mutate them in the RAF sync
  const pad1 = { left: 0, right: 0, top: 0, bottom: 0 };
  const pad2 = { left: 0, right: 0, top: 0, bottom: 0 };

  if (socialChartInst) socialChartInst.destroy();
  const ctx1 = document.getElementById('socialChart').getContext('2d');
  const datasets1 = [
    { type:'bar', label:'文章數/日', data:postCounts, backgroundColor:'rgba(193,127,62,0.5)', yAxisID:'y1' }
  ];
  if (priceData) {
    datasets1.push({ type:'line', label:'股價走勢', data:priceData, borderColor:'#c17f3e', borderWidth:2, pointRadius:0, yAxisID:'y2', tension:0.3, spanGaps:true });
  }
  socialChartInst = new Chart(ctx1, {
    type: 'bar',
    data: { labels: days30, datasets: datasets1 },
    options: {
      responsive: true,
      layout: { padding: pad1 },
      plugins: { legend: { labels: { color:'#7a4f2a', font:{size:11} } } },
      scales: {
        x:  { grid:{color:'#e0d4c0'}, ticks:{color:'#9a7050', maxTicksLimit:8} },
        y1: { grid:{color:'#e0d4c0'}, ticks:{color:'#8b4513', precision:0}, min:0, position:'left',
              title:{display:true, text:'篇數', color:'#8b4513', font:{size:10}} },
        y2: { ticks:{color:'#27ae60'}, position:'right', grid:{display:false}, display:!!priceData }
      }
    }
  });

  // --- Sentiment bars ---
  let sentBull, sentBear, sentNeut;
  if (isReal && data.dailySentiment) {
    sentBull = days30.map(d => (data.dailySentiment[d] ? data.dailySentiment[d].b : 0));
    sentBear = days30.map(d => (data.dailySentiment[d] ? data.dailySentiment[d].d : 0));
    sentNeut = days30.map(d => (data.dailySentiment[d] ? data.dailySentiment[d].n : 0));
  } else {
    const rng2 = seededRand(data.score * 137 + 1);
    sentBull = days30.map(() => Math.max(0, Math.round(data.bullish + rng2()*12-6)));
    sentBear = days30.map(() => Math.max(0, Math.round(data.bearish + rng2()*8-4)));
    sentNeut = days30.map((_,i) => Math.max(0, 100 - sentBull[i] - sentBear[i]));
  }

  if (sentimentChartInst) sentimentChartInst.destroy();
  const ctx2 = document.getElementById('sentimentChart').getContext('2d');
  sentimentChartInst = new Chart(ctx2, {
    type: 'bar',
    data: { labels: days30, datasets: [
      { label:'多方篇數', data:sentBull, backgroundColor:'rgba(192,57,43,0.65)', stack:'s' },
      { label:'空方篇數', data:sentBear, backgroundColor:'rgba(39,174,96,0.65)',  stack:'s' },
      { label:'中立篇數', data:sentNeut, backgroundColor:'rgba(193,127,62,0.4)', stack:'s' },
    ]},
    options: {
      responsive: true,
      layout: { padding: pad2 },
      plugins: { legend: { labels: { color:'#7a4f2a', font:{size:11} } } },
      scales: {
        x: { stacked:true, grid:{color:'#e0d4c0'}, ticks:{color:'#9a7050', maxTicksLimit:8} },
        y: { stacked:true, grid:{color:'#e0d4c0'}, ticks:{color:'#9a7050', precision:0}, min:0,
             title:{display:true, text:'篇數', color:'#9a7050', font:{size:10}} }
      }
    }
  });

  // After both charts render, measure actual chartArea positions and add padding
  // so the two plots share the same left/right pixel boundaries.
  const c1snap = socialChartInst;
  const c2snap = sentimentChartInst;
  requestAnimationFrame(() => {
    if (!c1snap || !c2snap) return;
    const a1 = c1snap.chartArea;
    const a2 = c2snap.chartArea;
    if (!a1 || !a2) return;

    const tgtLeft  = Math.max(a1.left,  a2.left);   // wider left axis wins
    const tgtRight = Math.min(a1.right, a2.right);  // narrower right wins (has right axis)

    const dL1 = Math.round(tgtLeft  - a1.left);
    const dR1 = Math.round(a1.right - tgtRight);
    const dL2 = Math.round(tgtLeft  - a2.left);
    const dR2 = Math.round(a2.right - tgtRight);

    if (dL1 > 0) pad1.left  += dL1;
    if (dR1 > 0) pad1.right += dR1;
    if (dL2 > 0) pad2.left  += dL2;
    if (dR2 > 0) pad2.right += dR2;

    if (dL1 + dR1 + dL2 + dR2 > 0) {
      c1snap.update('none');
      c2snap.update('none');
    }
  });

  // Post cards
  const grid = document.getElementById('postsGrid');
  grid.innerHTML = '';
  data.posts.forEach(p => {
    const card = document.createElement('div');
    card.className = \`post-card \${p.sentiment}\`;
    const badge = p.sentiment==='bullish'?'多方':p.sentiment==='bearish'?'空方':'中立';
    const nrecClass = p.nrec < 0 ? 'ptt-nrec neg' : 'ptt-nrec';
    const nrecText = p.nrec >= 100 ? '爆' : p.nrec < 0 ? \`X\${Math.abs(p.nrec)}\` : String(p.nrec);
    const catKey = p.cat.replace(/[[\\]]/g, '');
    const linkHtml = p.link && p.isReal
      ? \`<a href="\${p.link}" target="_blank" style="color:#38bdf8;font-size:11px;margin-left:auto">↗ 原文</a>\` : '';
    const scoredBadge = p.scored
      ? '<span class="ptt-source-badge">● PTT 即時</span>'
      : '<span class="ptt-source-badge" style="color:#aaa">PTT 統計</span>';
    card.innerHTML = \`
      <div class="post-header" style="align-items:flex-start">
        <div style="flex:1">
          <div style="margin-bottom:6px">
            <span class="ptt-cat ptt-cat-\${catKey}">[\${catKey}]</span>
            <span class="post-title-text">\${p.title}</span>
          </div>
          <div class="post-meta-row">
            <span>\${p.author}</span>
            <span>\${p.date}</span>
            <span class="\${nrecClass}">推 \${nrecText}</span>
            \${linkHtml}
          </div>
        </div>
      </div>
      <div class="post-text" style="margin-top:10px">\${p.content}</div>
      <div class="post-sentiment" style="margin-top:8px">
        <span class="sentiment-badge \${p.sentiment}">\${badge}</span>
        \${scoredBadge}
      </div>
    \`;
    grid.appendChild(card);
  });
}


function renderSocialEmpty(query, priceHist, isError) {
  document.getElementById('socialPlaceholder').style.display = 'none';
  document.getElementById('socialResults').style.display = 'block';

  const statusLabel = isError
    ? '<span style="font-size:12px;color:#ef4444;font-weight:normal">PTT 連線失敗</span>'
    : '<span style="font-size:12px;color:#94a3b8;font-weight:normal">無相關文章</span>';
  document.getElementById('postsTitle').innerHTML =
    \`PTT 股票板：「\${query}」相關討論 \${statusLabel}\`;

  document.getElementById('thermoFill').style.cssText = 'height:50%;background:#bbb';
  document.getElementById('thermoBulb').style.background = '#bbb';
  document.getElementById('thermoScore').textContent = '--';
  document.getElementById('thermoScore').className = 'thermo-score';
  document.getElementById('thermoDesc').textContent = '無資料';
  document.getElementById('statMentions').textContent = '0 篇';
  document.getElementById('statBullish').textContent  = '--%';
  document.getElementById('statBearish').textContent  = '--%';
  document.getElementById('statNeutral').textContent  = '--%';
  document.getElementById('statTrend').textContent    = '--';

  // Still show stock price chart if we have price data
  const days30 = genDates(30);
  let priceData = null;
  if (priceHist?.labels && priceHist?.closes) {
    const priceMap = {};
    priceHist.labels.forEach((lbl, i) => { priceMap[lbl] = priceHist.closes[i]; });
    const aligned = days30.map(d => (priceMap[d] != null ? priceMap[d] : null));
    if (aligned.some(v => v !== null)) priceData = aligned;
  }

  if (socialChartInst) socialChartInst.destroy();
  const ctx1 = document.getElementById('socialChart').getContext('2d');
  const datasets1 = [{ type:'bar', label:'文章數/日', data:days30.map(()=>0), backgroundColor:'rgba(193,127,62,0.2)', yAxisID:'y1' }];
  if (priceData) {
    datasets1.push({ type:'line', label:'股價走勢', data:priceData, borderColor:'#c17f3e', borderWidth:2, pointRadius:0, yAxisID:'y2', tension:0.3, spanGaps:true });
  }
  socialChartInst = new Chart(ctx1, {
    type: 'bar',
    data: { labels: days30, datasets: datasets1 },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color:'#7a4f2a', font:{size:11} } } },
      scales: {
        x: { grid:{color:'#e0d4c0'}, ticks:{color:'#9a7050', maxTicksLimit:8} },
        y1: { grid:{color:'#e0d4c0'}, ticks:{color:'#8b4513', precision:0}, min:0, max:5, position:'left',
              title:{display:true, text:'篇數', color:'#8b4513', font:{size:10}} },
        y2: { ticks:{color:'#27ae60'}, position:'right', grid:{display:false}, display:!!priceData }
      }
    }
  });

  if (sentimentChartInst) sentimentChartInst.destroy();
  sentimentChartInst = null;

  const msg = isError
    ? 'PTT 暫時無法連線，請稍後再試'
    : \`PTT 股票板找不到「\${query}」的相關文章，請換個關鍵字（股票名稱或代號）\`;
  document.getElementById('postsGrid').innerHTML =
    \`<div style="padding:40px;text-align:center;color:#9a7050;font-size:15px;grid-column:1/-1">\${msg}</div>\`;
}


// ===================== SECTOR CLASSIFICATION =====================
const SECTORS=[
  {name:'晶圓代工',leader:{code:'2330',name:'台積電',price:2275,change:8.5},
    members:[
      {code:'2303',name:'聯電',price:138.5,change:3.2,corr:0.82},
      {code:'6770',name:'力積電',price:80.5,change:2.8,corr:0.71},
    ]},
  {name:'IC設計',leader:{code:'2454',name:'聯發科',price:4345,change:6.8},
    members:[
      {code:'3034',name:'聯詠',price:479,change:4.1,corr:0.88},
      {code:'2379',name:'瑞昱',price:597,change:5.2,corr:0.85},
      {code:'6415',name:'矽力-KY',price:614,change:7.8,corr:0.78},
      {code:'6770',name:'力積電',price:80.5,change:2.8,corr:0.72},
    ]},
  {name:'AI伺服器',leader:{code:'2382',name:'廣達',price:312.5,change:9.2},
    members:[
      {code:'6669',name:'緯穎',price:4955,change:10.5,corr:0.94},
      {code:'3231',name:'緯創',price:144.5,change:8.1,corr:0.91},
      {code:'2356',name:'英業達',price:64,change:7.5,corr:0.87},
      {code:'2353',name:'宏碁',price:32.2,change:4.2,corr:0.74},
    ]},
  {name:'航運',leader:{code:'2603',name:'長榮',price:213,change:6.5},
    members:[
      {code:'2609',name:'陽明',price:52.4,change:5.8,corr:0.93},
      {code:'2615',name:'萬海',price:80.9,change:6.2,corr:0.89},
    ]},
  {name:'被動元件',leader:{code:'2327',name:'國巨',price:749,change:5.8},
    members:[
      {code:'2492',name:'華新科',price:390,change:2.6,corr:0.76},
    ]},
  {name:'PCB',leader:{code:'3037',name:'欣興',price:1025,change:4.8},
    members:[
      {code:'4958',name:'臻鼎-KY',price:481,change:5.2,corr:0.88},
      {code:'2383',name:'台光電',price:5030,change:4.2,corr:0.82},
    ]},
  {name:'電源元件',leader:{code:'2308',name:'台達電',price:2375,change:5.8},
    members:[
      {code:'6415',name:'矽力-KY',price:614,change:7.8,corr:0.79},
    ]},
  {name:'金融',leader:{code:'2881',name:'富邦金',price:108.5,change:3.5},
    members:[
      {code:'2882',name:'國泰金',price:83.9,change:3.2,corr:0.91},
      {code:'2891',name:'中信金',price:59.8,change:2.2,corr:0.88},
      {code:'2884',name:'玉山金',price:30.8,change:2.8,corr:0.85},
      {code:'2886',name:'兆豐金',price:40,change:2.5,corr:0.82},
    ]},
  {name:'傳產石化',leader:{code:'1301',name:'台塑',price:45,change:2.2},
    members:[
      {code:'6505',name:'台塑化',price:50,change:2.8,corr:0.87},
      {code:'1303',name:'南亞',price:90.3,change:2.5,corr:0.84},
    ]},
  {name:'電信',leader:{code:'2412',name:'中華電',price:137,change:1.8},
    members:[
      {code:'4904',name:'遠傳',price:94.8,change:2.0,corr:0.88},
    ]},
  {name:'DRAM',leader:{code:'2408',name:'南亞科',price:324.5,change:4.0},
    members:[
      {code:'2344',name:'華邦電',price:143.5,change:-7.4,corr:0.88},
    ]},
  {name:'光學鏡頭',leader:{code:'3008',name:'大立光',price:3445,change:3.5},
    members:[
      {code:'2474',name:'可成',price:192,change:-7.9,corr:0.72},
    ]},
  {name:'封測',leader:{code:'3711',name:'日月光投控',price:621,change:3.2},
    members:[]},
];

function getLiveStock(code) {
  return STOCKS.find(s => s.code === code);
}

const CORR_BANDS = [
  {min:0.9, max:Infinity, label:'0.9+'},
  {min:0.8, max:0.9,      label:'0.8 – 0.9'},
  {min:0.7, max:0.8,      label:'0.7 – 0.8'},
  {min:0.6, max:0.7,      label:'0.6 – 0.7'},
  {min:0.5, max:0.6,      label:'0.5 – 0.6'},
  {min:0.4, max:0.5,      label:'0.4 – 0.5'},
];

let _sectorQuoteRefreshTimer = null;
let _sectorQuoteRefreshing = false;

function memberRow(m) {
  const liveM  = getLiveStock(m.code);
  const mPrice = liveM?.price ?? m.price;
  const mChg   = m.change ?? liveM?.change5d;
  const priceStr = mPrice != null ? mPrice.toFixed(mPrice >= 100 ? 1 : 2) : '--';
  const chgStr   = mChg   != null ? \`\${mChg >= 0 ? '+' : ''}\${mChg.toFixed(1)}%\` : '--';
  const mClass   = mChg   != null && mChg >= 0 ? 'up' : (mChg != null ? 'down' : '');
  return \`<div class="stock-row">
    <span class="row-code">\${m.code}</span>
    <span class="row-name">\${m.name}</span>
    <span class="row-price">\${priceStr}</span>
    <span class="row-change \${mClass}">\${chgStr}</span>
    <div class="corr-bar-wrap"><div class="corr-bar" style="width:\${Math.min(100,Math.round(m.corr*100))}%"></div></div>
    <span class="corr-label">\${m.corr.toFixed(2)}</span>
  </div>\`;
}

function renderSectors(){
  const grid = document.getElementById('sectorGrid');
  grid.innerHTML = '';
  SECTORS.forEach(sector => {
    const card = document.createElement('div');
    card.className = 'sector-card';

    const liveLeader = getLiveStock(sector.leader.code);
    const lPrice = liveLeader?.price ?? sector.leader.price;
    const lChg   = sector.leader.change ?? liveLeader?.change5d;
    const lClass = lChg >= 0 ? 'up' : 'down';
    const lSign  = lChg >= 0 ? '+' : '';

    let bandHtml = '';
    for (const band of CORR_BANDS) {
      const members = sector.members
        .filter(m => m.corr != null && m.corr >= band.min && m.corr < band.max)
        .sort((a, b) => b.corr - a.corr);
      if (members.length === 0) continue;
      bandHtml += \`<div class="corr-band-header">\${band.label}</div>\`;
      bandHtml += members.map(memberRow).join('');
    }
    if (!bandHtml) {
      bandHtml = \`<div style="padding:12px;text-align:center;color:#9a7050;font-size:13px">近 20 交易日無複合相關性 > 0.4 之成員</div>\`;
    }

    card.innerHTML = \`
      <div class="sector-card-header">
        <span class="sector-name">\${sector.name}</span>
        <span class="sector-leader-badge">龍頭</span>
      </div>
      <div class="sector-card-body">
        <div class="leader-row">
          <span class="leader-crown" style="color:#c17f3e;font-weight:700">★</span>
          <span class="row-code">\${sector.leader.code}</span>
          <span class="row-name" style="font-weight:700">\${sector.leader.name}</span>
          <span class="row-price" style="font-size:15px;font-weight:700">\${lPrice.toFixed(lPrice >= 100 ? 1 : 2)}</span>
          <span class="row-change \${lClass}" style="font-size:13px">\${lSign}\${lChg.toFixed(1)}%</span>
          <div style="width:80px"></div>
          <span class="corr-label" style="color:#c17f3e;font-weight:700">基準</span>
        </div>
        <div class="sector-col-header">
          <span style="width:48px"></span>
          <span style="flex:1">名稱</span>
          <span style="width:60px;text-align:right">股價</span>
          <span style="width:52px;text-align:right">當日漲跌</span>
          <span style="flex:1;max-width:100px"></span>
          <span style="width:32px;text-align:right">相關性</span>
        </div>
        \${bandHtml}
      </div>
    \`;
    grid.appendChild(card);
  });

  queueSectorQuoteRefresh();
}

// ===================== CORRELATION =====================
function pearson(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  if (n < 5) return null;
  const ax = xs.slice(-n), ay = ys.slice(-n);
  const mx = ax.reduce((a,b)=>a+b)/n, my = ay.reduce((a,b)=>a+b)/n;
  let num=0, dx2=0, dy2=0;
  for (let i=0;i<n;i++){const dx=ax[i]-mx,dy=ay[i]-my;num+=dx*dy;dx2+=dx*dx;dy2+=dy*dy;}
  return (dx2&&dy2) ? Math.max(-1,Math.min(1, num/Math.sqrt(dx2*dy2))) : null;
}

function logReturns(prices) {
  const r=[];
  for(let i=1;i<prices.length;i++){if(prices[i]&&prices[i-1])r.push(Math.log(prices[i]/prices[i-1]));}
  return r;
}

function kendallTau(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  if (n < 5) return null;
  let c=0, d=0;
  for (let i=0;i<n;i++) for (let j=i+1;j<n;j++) {
    const p=(xs[i]-xs[j])*(ys[i]-ys[j]);
    if (p>0) c++; else if (p<0) d++;
  }
  const t=n*(n-1)/2;
  return t ? (c-d)/t : null;
}

function winsorizedPearson(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  if (n < 5) return null;
  function clip(arr) {
    const s=[...arr].sort((a,b)=>a-b);
    const lo=s[Math.max(0,Math.floor(n*0.10))], hi=s[Math.min(n-1,Math.floor(n*0.90))];
    return arr.map(v=>Math.max(lo,Math.min(hi,v)));
  }
  return pearson(clip(xs.slice(0,n)), clip(ys.slice(0,n)));
}

function shapeSimilarity(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  if (n < 5) return null;
  const cx=[], cy=[];
  let sx=0, sy=0;
  for (let i=0;i<n;i++) { sx+=xs[i]; cx.push(sx); sy+=ys[i]; cy.push(sy); }
  function znorm(a) {
    const m=a.reduce((s,v)=>s+v)/a.length;
    const sd=Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/a.length);
    return sd>1e-10 ? a.map(v=>(v-m)/sd) : a.map(()=>0);
  }
  return pearson(znorm(cx), znorm(cy));
}

function compositeCorr(xs, ys) {
  const k=kendallTau(xs,ys), w=winsorizedPearson(xs,ys), s=shapeSimilarity(xs,ys);
  if (k===null || w===null || s===null) return null;
  return (k + w + s) / 3;
}

function quoteFromSpark(d) {
  const closes = (d?.closes || []).filter(v => v != null && v > 0);
  const price = d?.meta?.regularMarketPrice || closes.at(-1) || null;
  // Yahoo Finance 的 chartPreviousClose 是區間起始日收盤（非昨日），不可用於計算當日漲跌
  // regularMarketPreviousClose 在台股 API 回傳中通常為 undefined
  // 正確做法：比對即時價與 closes[-1] 是否相近，若相近代表今日已收盤在陣列裡，
  //           昨日收盤 = closes[-2]；否則市場仍開盤中，昨日收盤 = closes[-1]
  let prev = d?.meta?.regularMarketPreviousClose || null;
  if (!prev && closes.length >= 2) {
    const last = closes.at(-1);
    const todayInArray = price != null && last != null && Math.abs(price - last) / last < 0.01;
    prev = todayInArray ? closes.at(-2) : last;
  }
  return {
    price: price != null ? +price.toFixed(price >= 100 ? 1 : 2) : null,
    change: price != null && prev > 0 ? +((price - prev) / prev * 100).toFixed(2) : null,
  };
}

function applyQuote(target, quote) {
  if (!target || !quote) return false;
  let changed = false;
  if (quote.price != null && target.price !== quote.price) {
    target.price = quote.price;
    changed = true;
  }
  if (quote.change != null && target.change !== quote.change) {
    target.change = quote.change;
    changed = true;
  }
  return changed;
}

function collectSectorQuoteTargets() {
  const byCode = new Map();
  SECTORS.forEach(sec => {
    byCode.set(sec.leader.code, {code: sec.leader.code, target: sec.leader});
    sec.members.forEach(m => byCode.set(m.code, {
      code: m.code,
      exchange: m.exchange,
      target: m,
    }));
  });
  return [...byCode.values()];
}

function queueSectorQuoteRefresh() {
  if (_sectorQuoteRefreshTimer || _sectorQuoteRefreshing) return;
  _sectorQuoteRefreshTimer = setTimeout(() => {
    _sectorQuoteRefreshTimer = null;
    refreshSectorQuotes();
  }, 250);
}

async function refreshSectorQuotes() {
  if (_sectorQuoteRefreshing) return;
  _sectorQuoteRefreshing = true;
  let changed = false;
  try {
    const targets = collectSectorQuoteTargets();
    const BATCH = 20;
    for (let i = 0; i < targets.length; i += BATCH) {
      const batch = targets.slice(i, i + BATCH);
      const data = await _fetchSparkBatch(batch.map(x => ({code: x.code, exchange: x.exchange || 'tw'})), '5d');
      batch.forEach(item => {
        const quote = quoteFromSpark(data[item.code]);
        changed = applyQuote(item.target, quote) || changed;
      });
    }
  } catch(e) {
    console.warn('族群報價更新失敗：', e.message);
  } finally {
    _sectorQuoteRefreshing = false;
  }
  if (changed) renderSectors();
}

// Cache fetched histories to avoid duplicate requests during scan
const _histCache = {};
async function fetchHistoryCached(code, range='3mo', exchange='tw') {
  const key = \`\${code}|\${range}|\${exchange}\`;
  if (_histCache[key]) return _histCache[key];
  const h = await fetchStockHistory(code, range, exchange);
  if (h) _histCache[key] = h;
  return h;
}

// Fast initial correlation: only for pre-defined SECTORS.members
async function computeSectorCorrelations() {
  const codes = new Set();
  SECTORS.forEach(sec => {
    codes.add(sec.leader.code);
    sec.members.forEach(m => codes.add(m.code));
  });
  // 批量取得所有龍頭 + 成員的歷史（每批 20 支）
  const allCodes = [...codes];
  const hist     = {};
  const CBATCH   = 20;
  for (let i = 0; i < allCodes.length; i += CBATCH) {
    const bd = await _fetchSparkBatch(allCodes.slice(i, i + CBATCH), '3mo');
    for (const [code, d] of Object.entries(bd)) {
      if (d?.closes?.length >= 10) hist[code] = d.closes;
    }
  }
  let anyUpdate = false;
  SECTORS.forEach(sec => {
    const lPrices = hist[sec.leader.code];
    if (!lPrices || lPrices.length < 10) return;
    const lRet = logReturns(lPrices);
    sec.members.forEach(m => {
      const mPrices = hist[m.code];
      if (!mPrices || mPrices.length < 10) return;
      const corr = pearson(lRet, logReturns(mPrices));
      if (corr !== null) { m.corr = +corr.toFixed(2); anyUpdate = true; }
    });
  });
  if (anyUpdate) renderSectors();
}

// ===================== FULL TAIWAN STOCK SCAN =====================
let _scanAbort = false;

// Fetch ALL TWSE (上市) + TPEX (上櫃) stocks — no limit, full coverage
// Each entry: {code, name, exchange:'tw'|'two'}
async function fetchTWSEUniverse() {
  const all = [];

  // TWSE 上市：STOCK_DAY_ALL 含全部上市股票清單
  try {
    const r    = await proxied('https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL', 20000);
    const data = await r.json();
    if (Array.isArray(data)) {
      data.forEach(s => {
        if (!s.Code || !/^\\d{4}$/.test(s.Code) || s.Code.startsWith('00')) return;
        all.push({code: s.Code, name: s.Name || s.Code, exchange: 'tw'});
      });
      console.log(\`TWSE 上市宇宙：\${all.length} 筆\`);
    }
  } catch(e) { console.warn('TWSE universe 失敗：', e.message); }

  // TPEX 上櫃（corsproxy 可能 502，失敗則略過）
  try {
    const before = all.length;
    const r      = await proxied('https://www.tpex.org.tw/openapi/v1/tpex_mainboard_quotes', 20000);
    const data   = await r.json();
    if (Array.isArray(data)) {
      data.forEach(s => {
        const code = s.SecuritiesCompanyCode || s.Code;
        const name = s.CompanyName || s.Name || code;
        if (!code || !/^\\d{4,5}$/.test(code) || code.startsWith('00')) return;
        all.push({code, name, exchange: 'two'});
      });
      console.log(\`TPEX 上櫃宇宙：\${all.length - before} 筆\`);
    }
  } catch(e) { console.warn('TPEX universe 失敗（略過）：', e.message); }

  return all.length > 0 ? all : null;
}

async function fullScanCorrelations() {
  const btn     = document.getElementById('scanBtn');
  const wrap    = document.getElementById('scanProgWrap');
  const barFill = document.getElementById('scanBarFill');
  const lbl     = document.getElementById('scanLbl');

  // Cancel if already running
  if (btn.dataset.scanning === '1') {
    _scanAbort = true;
    btn.dataset.scanning = '0';
    btn.textContent = '全台掃描';
    wrap.style.display = 'none';
    return;
  }

  _scanAbort = false;
  btn.dataset.scanning = '1';
  btn.textContent = '取消掃描';
  wrap.style.display = 'flex';
  barFill.style.width = '0%';
  lbl.textContent = '取得台股清單中...';

  try {
    // 1. Universe
    const universe = await fetchTWSEUniverse();
    if (!universe?.length) throw new Error('無法取得台股清單，請稍後再試');
    lbl.textContent = \`共 \${universe.length} 支股票，載入龍頭歷史資料...\`;

    // 2. Fetch leader log-return series via spark batch（一次請求取得所有龍頭）
    const leaderCodes = [...new Set(SECTORS.map(s => s.leader.code))];
    const leaderData  = await _fetchSparkBatch(leaderCodes, '3mo');
    const leaderRet   = {};
    for (const code of leaderCodes) {
      const d = leaderData[code];
      if (d?.closes?.length >= 21) leaderRet[code] = logReturns(d.closes).slice(-20);
    }

    // 3. Scan universe via spark batch（20 支 / 次，~55 requests 掃完 1081 支）
    const SPARK_BATCH = 20;
    const found = Object.fromEntries(SECTORS.map(s => [s.name, []]));
    const seen  = Object.fromEntries(SECTORS.map(s => [s.name, new Set()]));

    for (let i = 0; i < universe.length; i += SPARK_BATCH) {
      if (_scanAbort) break;
      const batch = universe.slice(i, i + SPARK_BATCH);

      // 一次批量請求 50 支歷史資料（含 TPEX 用 .TWO suffix）
      const batchData = await _fetchSparkBatch(batch, '3mo');

      for (const stock of batch) {
        const d = batchData[stock.code];
        if (!d?.closes || d.closes.length < 21) continue;
        const ret = logReturns(d.closes).slice(-20);

        SECTORS.forEach(sec => {
          if (stock.code === sec.leader.code) return;
          if (seen[sec.name].has(stock.code)) return;
          const lRet = leaderRet[sec.leader.code];
          if (!lRet) return;
          const corr = compositeCorr(lRet, ret);
          if (corr !== null && corr > 0.4) {
            const quote = quoteFromSpark(d);
            seen[sec.name].add(stock.code);
            found[sec.name].push({
              code: stock.code,
              name: stock.name,
              exchange: stock.exchange,
              corr: +corr.toFixed(2),
              price: quote.price,
              change: quote.change,
            });
          }
        });
      }

      const done = Math.min(i + SPARK_BATCH, universe.length);
      const pct  = Math.round(done / universe.length * 100);
      barFill.style.width = pct + '%';
      lbl.textContent = \`掃描中 \${done} / \${universe.length}（已找到 \${Object.values(found).reduce((a,b)=>a+b.length,0)} 個相關標的）\`;

      // 每 200 支局部更新一次畫面
      if (Math.floor(i / SPARK_BATCH) % 4 === 0) {
        SECTORS.forEach(sec => {
          sec.members = [...found[sec.name]].sort((a,b) => b.corr - a.corr);
        });
        renderSectors();
      }
    }

    // Final render
    SECTORS.forEach(sec => {
      sec.members = [...found[sec.name]].sort((a,b) => b.corr - a.corr);
    });
    renderSectors();

    const total = Object.values(found).reduce((a,b) => a+b.length, 0);
    lbl.textContent = \`掃描完成！共掃描 \${universe.length} 支，找到 \${total} 個相關標的\`;
    barFill.style.width = '100%';

  } catch(e) {
    lbl.textContent = '錯誤：' + e.message;
    console.error(e);
  } finally {
    btn.dataset.scanning = '0';
    btn.textContent = '全台掃描';
    // Keep progress visible so user can read the summary; hide after 5s
    setTimeout(() => { if (!_scanAbort) wrap.style.display = 'none'; }, 6000);
  }
}

// ===================== INIT =====================
window.addEventListener('DOMContentLoaded', async () => {
  renderSectors();
  setDataStatus('loading');

  // 第一階段：TWSE 批量（~2 秒）+ 指數，完成後立即顯示篩選表格
  const twseN = await Promise.all([_loadTWSEBulk(), loadTWII()]).then(([n]) => n);
  if (twseN > 0) setDataStatus('live');
  renderSectors();
  runScreener(); // ← 用 TWSE 收盤價立即顯示，不再用硬編碼 demo 值

  // 第二階段：Yahoo Finance 即時（~15 秒，背景執行）
  _loadYFPrices().then(yfN => {
    if (yfN > 0) {
      setDataStatus('live');
      setDataTime(0); // refresh display with captured ts
      renderSectors();
      if (currentResults.length) renderTable(currentResults); // 更新為今日即時報價
    }
    computeSectorCorrelations();
    // 盤中每 60 秒自動更新
    setInterval(async () => {
      if (isTaiwanTradingHours()) {
        await refreshPrices();
      }
    }, 60000);
  });
});
</script>
</body>
</html>
`;


const allowedHosts = new Set([
  'query1.finance.yahoo.com',
  'query2.finance.yahoo.com',
  'openapi.twse.com.tw',
  'www.tpex.org.tw',
  'www.ptt.cc',
  'cdn.jsdelivr.net',
]);

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    ...headers,
  });
  res.end(body);
}

async function proxy(req, res, requestUrl) {
  const targetRaw = requestUrl.searchParams.get('url');
  if (!targetRaw) {
    send(res, 302, '', { Location: '/' });
    return;
  }

  let target;
  try {
    target = new URL(targetRaw);
  } catch {
    send(res, 400, JSON.stringify({ error: 'Invalid url parameter' }), {
      'Content-Type': 'application/json; charset=utf-8',
    });
    return;
  }

  if (target.protocol !== 'https:' || !allowedHosts.has(target.hostname)) {
    send(res, 403, JSON.stringify({ error: `Host not allowed: ${target.hostname}` }), {
      'Content-Type': 'application/json; charset=utf-8',
    });
    return;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);

  try {
    const upstream = await fetch(target, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 TaiwanStockLocalProxy/1.0',
        'Accept': 'application/json,text/html;q=0.9,*/*;q=0.8',
        'Cookie': target.hostname === 'www.ptt.cc' ? 'over18=1' : '',
      },
    });
    const body = Buffer.from(await upstream.arrayBuffer());
    send(res, upstream.status, body, {
      'Content-Type': upstream.headers.get('content-type') || 'application/octet-stream',
    });
  } catch (err) {
    const status = err.name === 'AbortError' ? 504 : 502;
    send(res, status, JSON.stringify({ error: err.message || String(err) }), {
      'Content-Type': 'application/json; charset=utf-8',
    });
  } finally {
    clearTimeout(timer);
  }
}

createServer(async (req, res) => {
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host}`);

  if (requestUrl.pathname === '/api/health') {
    send(res, 200, JSON.stringify({ ok: true, port }), {
      'Content-Type': 'application/json; charset=utf-8',
    });
    return;
  }

  if (requestUrl.pathname === '/api/proxy') {
    await proxy(req, res, requestUrl);
    return;
  }

  if (requestUrl.pathname === '/' || requestUrl.pathname === '/app') {
    send(res, 200, embeddedHtml, { 'Content-Type': 'text/html; charset=utf-8' });
    return;
  }

  send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
}).listen(port, host, () => {
  console.log(`Taiwan stock app is running at http://localhost:${port}`);
  console.log('This version is a single .mjs app file; no separate HTML file is needed.');
});
