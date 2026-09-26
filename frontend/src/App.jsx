import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000');

const currency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(value);

const formatPct = (value) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [market, setMarket] = useState([]);
  const [marketFilter, setMarketFilter] = useState('All');
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE');
  const [orderForm, setOrderForm] = useState({ symbol: 'RELIANCE', qty: 10, type: 'BUY', price: 2936.45 });
  const [lang, setLang] = useState('EN');

  useEffect(() => {
    const loadDashboard = async () => {
      const res = await fetch('http://localhost:4000/api/dashboard');
      const data = await res.json();
      setDashboard(data);
      setMarket(data.watchlist || []);
      const first = data.watchlist?.[0]?.symbol || 'RELIANCE';
      setSelectedSymbol(first);
      setOrderForm((prev) => ({ ...prev, symbol: first, price: data.watchlist?.[0]?.price || prev.price }));
    };

    loadDashboard();
  }, []);

  useEffect(() => {
    socket.on('market:update', (payload) => {
      const stocks = payload.stocks || [];
      setMarket(stocks);

      if (dashboard) {
        const nextDashboard = { ...dashboard, watchlist: stocks.filter((stock) => dashboard.user.watchlist.includes(stock.symbol)) };
        setDashboard(nextDashboard);
      }
    });

    return () => socket.off('market:update');
  }, [dashboard]);

  const visibleStocks = useMemo(() => {
    if (marketFilter === 'All') return market;
    return market.filter((stock) => stock.sector === marketFilter);
  }, [market, marketFilter]);

  const selectedStock = visibleStocks.find((stock) => stock.symbol === selectedSymbol) || market[0];

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      email: form.get('email') || 'riya@example.com',
      password: form.get('password') || 'demo123'
    };

    const res = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setIsLoggedIn(true);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    const payload = {
      symbol: orderForm.symbol,
      qty: Number(orderForm.qty),
      type: orderForm.type,
      price: Number(orderForm.price)
    };

    const res = await fetch('http://localhost:4000/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      alert(`${data.order.type} order placed for ${data.order.symbol}`);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="brand-row">
            <div className="brand-logo">T</div>
            <div>
              <div className="eyebrow">TRADING APP</div>
              <h1>TradePilot</h1>
            </div>
          </div>
          <h2>Login to your account</h2>
          <form onSubmit={handleLogin} className="auth-form">
            <input name="email" type="email" defaultValue="riya@example.com" placeholder="Email" />
            <input name="password" type="password" defaultValue="demo123" placeholder="Password" />
            <button type="submit">Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return <div className="loading">Loading market data...</div>;
  }

  const summary = dashboard.summary;
  const positions = dashboard.positions || [];
  const watchlist = dashboard.watchlist || [];
  const news = dashboard.news || [];
  const notifications = dashboard.notifications || [];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-row">
          <div className="brand-logo">T</div>
          <div>
            <div className="eyebrow">TRADING APP</div>
            <h3>TradePilot</h3>
          </div>
        </div>

        <nav className="nav-menu">
          <a className="active">Overview</a>
          <a>Portfolio</a>
          <a>Watchlist</a>
          <a>Orders</a>
          <a>Insights</a>
          <a>Settings</a>
        </nav>

        <div className="mini-card">
          <small>Market status</small>
          <strong>{summary.marketStatus}</strong>
          <span>{lang === 'EN' ? 'Open session' : 'खुला सेशन'}</span>
        </div>
      </aside>

      <main className="content-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">Welcome back</p>
            <h1>{dashboard.user.name}</h1>
          </div>

          <div className="topbar-actions">
            <select value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="EN">EN</option>
              <option value="HI">HI</option>
            </select>
            <button className="ghost-btn" onClick={() => setIsLoggedIn(false)}>Logout</button>
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card primary">
            <span>Available cash</span>
            <strong>{currency(summary.totalBalance)}</strong>
            <small>+₹18,250 today</small>
          </div>
          <div className="stat-card">
            <span>Invested</span>
            <strong>{currency(summary.invested)}</strong>
            <small>{formatPct(summary.returnPct || 12.4)}</small>
          </div>
          <div className="stat-card">
            <span>P&L</span>
            <strong>{currency(summary.pnl)}</strong>
            <small>+₹3,840.25</small>
          </div>
          <div className="stat-card">
            <span>Win rate</span>
            <strong>{summary.winRate}%</strong>
            <small>Last 30 days</small>
          </div>
        </section>

        <section className="main-grid">
          <div className="panel market-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Market</p>
                <h2>Live market</h2>
              </div>
              <div className="filter-row">
                {['All', 'IT', 'Banking', 'Energy', 'FMCG'].map((filter) => (
                  <button
                    key={filter}
                    className={marketFilter === filter ? 'filter-btn active' : 'filter-btn'}
                    onClick={() => setMarketFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="ticker-list">
              {visibleStocks.map((stock) => (
                <button
                  key={stock.symbol}
                  className={selectedSymbol === stock.symbol ? 'ticker active' : 'ticker'}
                  onClick={() => {
                    setSelectedSymbol(stock.symbol);
                    setOrderForm((prev) => ({ ...prev, symbol: stock.symbol, price: stock.price }));
                  }}
                >
                  <div>
                    <strong>{stock.symbol}</strong>
                    <small>{stock.name}</small>
                  </div>
                  <div className="right-side">
                    <strong>{currency(stock.price)}</strong>
                    <span className={stock.change >= 0 ? 'up' : 'down'}>{formatPct(stock.change)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="panel order-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Quick trade</p>
                <h2>{selectedStock?.symbol || 'RELIANCE'}</h2>
              </div>
              <div className="price-badge">{currency(selectedStock?.price || 0)}</div>
            </div>

            <form onSubmit={handlePlaceOrder} className="order-form">
              <div className="field-row">
                <label>Symbol</label>
                <input value={orderForm.symbol} onChange={(e) => setOrderForm({ ...orderForm, symbol: e.target.value })} />
              </div>
              <div className="field-row">
                <label>Quantity</label>
                <input type="number" value={orderForm.qty} onChange={(e) => setOrderForm({ ...orderForm, qty: e.target.value })} />
              </div>
              <div className="field-row split">
                <label>Type</label>
                <select value={orderForm.type} onChange={(e) => setOrderForm({ ...orderForm, type: e.target.value })}>
                  <option value="BUY">Buy</option>
                  <option value="SELL">Sell</option>
                </select>
              </div>
              <div className="field-row">
                <label>Price</label>
                <input type="number" value={orderForm.price} onChange={(e) => setOrderForm({ ...orderForm, price: e.target.value })} />
              </div>

              <div className="order-summary">
                <div>
                  <span>Estimated value</span>
                  <strong>{currency(Number(orderForm.qty || 0) * Number(orderForm.price || 0))}</strong>
                </div>
              </div>

              <button type="submit" className="primary-btn">Place Order</button>
            </form>
          </div>
        </section>

        <section className="bottom-grid">
          <div className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Portfolio</p>
                <h2>Positions</h2>
              </div>
            </div>

            <div className="positions-list">
              {positions.map((position) => (
                <div key={position.symbol} className="position-row">
                  <div>
                    <strong>{position.symbol}</strong>
                    <small>{position.qty} shares</small>
                  </div>
                  <div>
                    <strong>{currency(position.ltp)}</strong>
                    <small className={position.pnl >= 0 ? 'up' : 'down'}>{currency(position.pnl)}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Watchlist</p>
                <h2>Track stocks</h2>
              </div>
            </div>

            <div className="watchlist-list">
              {watchlist.map((stock) => (
                <div key={stock.symbol} className="watch-item">
                  <div>
                    <strong>{stock.symbol}</strong>
                    <small>{stock.name}</small>
                  </div>
                  <div className={stock.change >= 0 ? 'up' : 'down'}>{formatPct(stock.change)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Alerts</p>
                <h2>Notifications</h2>
              </div>
            </div>

            <div className="notification-list">
              {notifications.map((note) => (
                <div key={note.id} className="notify-item">
                  <span className={`dot ${note.type}`}></span>
                  <p>{note.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="news-section">
          <div className="panel full-width">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Market news</p>
                <h2>Today</h2>
              </div>
            </div>

            <div className="news-grid">
              {news.map((item, index) => (
                <article key={index} className="news-item">
                  <span>{item.tag}</span>
                  <h3>{item.title}</h3>
                  <small>{item.time}</small>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
