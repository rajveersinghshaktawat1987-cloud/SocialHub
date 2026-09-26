import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

const PORT = Number(process.env.PORT) || 4000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

const user = {
  id: 1,
  name: 'Riya Sharma',
  email: 'riya@example.com',
  phone: '+91 98765 43210',
  balance: 125000,
  invested: 94000,
  returnPct: 12.4,
  watchlist: ['RELIANCE', 'TCS', 'INFY', 'SBIN'],
  profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80'
};

const marketStocks = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2936.45, change: 1.82, volume: '18.2M', sector: 'Energy', high: 2985.5, low: 2895.2, pe: 28.4 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3824.15, change: -0.66, volume: '9.1M', sector: 'IT', high: 3890.2, low: 3760.1, pe: 31.8 },
  { symbol: 'INFY', name: 'Infosys', price: 1568.7, change: 1.12, volume: '12.6M', sector: 'IT', high: 1604.8, low: 1545.2, pe: 29.4 },
  { symbol: 'SBIN', name: 'State Bank of India', price: 847.9, change: 0.85, volume: '27.8M', sector: 'Banking', high: 853.4, low: 834.3, pe: 11.7 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1725.4, change: -0.34, volume: '14.2M', sector: 'Banking', high: 1748.6, low: 1689.1, pe: 18.8 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', price: 1205.2, change: 1.28, volume: '16.5M', sector: 'Banking', high: 1228.9, low: 1186.3, pe: 18.1 },
  { symbol: 'ITC', name: 'ITC', price: 447.3, change: 0.42, volume: '30.3M', sector: 'FMCG', high: 451.5, low: 439.8, pe: 25.6 },
  { symbol: 'LTIM', name: 'LTIMindtree', price: 5412.8, change: -1.14, volume: '2.1M', sector: 'IT', high: 5530.4, low: 5316.3, pe: 33.9 }
];

const positions = [
  { symbol: 'RELIANCE', qty: 15, avgPrice: 2810, ltp: 2936.45, pnl: 1896.75 },
  { symbol: 'INFY', qty: 20, avgPrice: 1480, ltp: 1568.7, pnl: 1774 },
  { symbol: 'SBIN', qty: 35, avgPrice: 810, ltp: 847.9, pnl: 1326.5 }
];

const orders = [
  { id: 101, symbol: 'RELIANCE', type: 'BUY', qty: 15, price: 2936.45, status: 'Executed', time: '09:42 AM' },
  { id: 102, symbol: 'INFY', type: 'SELL', qty: 10, price: 1568.7, status: 'Executed', time: '10:15 AM' },
  { id: 103, symbol: 'TCS', type: 'BUY', qty: 5, price: 3824.15, status: 'Pending', time: '11:05 AM' }
];

const news = [
  { title: 'Sensex gains as banks and energy stocks lead the rally', tag: 'Market', time: '12 min ago' },
  { title: 'IT firms signal higher deal wins in Q3 guidance', tag: 'Tech', time: '42 min ago' },
  { title: 'RBI policy watch keeps traders on edge ahead of Friday', tag: 'Economy', time: '1 hr ago' },
  { title: 'Metal prices stabilize as China demand expectations improve', tag: 'Commodities', time: '2 hr ago' }
];

const notifications = [
  { id: 1, text: 'RELIANCE crossed your target price', type: 'alert' },
  { id: 2, text: 'Your portfolio is up 12.4% this month', type: 'success' },
  { id: 3, text: 'Market opened strong, watch banking sector', type: 'info' }
];

function getDashboardPayload() {
  const totalPnl = positions.reduce((sum, item) => sum + item.pnl, 0);
  return {
    user,
    summary: {
      totalBalance: user.balance,
      invested: user.invested,
      pnl: totalPnl,
      dailyChange: 3840.25,
      winRate: 68,
      marketStatus: 'Open'
    },
    positions,
    orders,
    watchlist: marketStocks.filter((stock) => user.watchlist.includes(stock.symbol)),
    news,
    notifications
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, status: 'healthy' });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  return res.json({
    message: 'Login successful',
    user,
    token: 'demo-token-123'
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  return res.status(201).json({
    message: 'User registered successfully',
    user: {
      ...user,
      name,
      email
    },
    token: 'demo-token-123'
  });
});

app.get('/api/dashboard', (_req, res) => {
  res.json(getDashboardPayload());
});

app.get('/api/market', (_req, res) => {
  res.json({ stocks: marketStocks });
});

app.get('/api/watchlist', (_req, res) => {
  res.json({ watchlist: marketStocks.filter((stock) => user.watchlist.includes(stock.symbol)) });
});

app.post('/api/watchlist', (req, res) => {
  const { symbol } = req.body || {};

  if (!symbol) {
    return res.status(400).json({ message: 'Symbol is required.' });
  }

  if (!user.watchlist.includes(symbol)) {
    user.watchlist.push(symbol);
  }

  return res.json({ watchlist: marketStocks.filter((stock) => user.watchlist.includes(stock.symbol)) });
});

app.get('/api/portfolio', (_req, res) => {
  res.json({ positions, holdingsValue: 98750, totalPnl: positions.reduce((sum, item) => sum + item.pnl, 0) });
});

app.post('/api/order', (req, res) => {
  const { symbol, qty, type, price } = req.body || {};

  if (!symbol || !qty || !type || !price) {
    return res.status(400).json({ message: 'All order fields are required.' });
  }

  const order = {
    id: Date.now(),
    symbol,
    type,
    qty,
    price,
    status: 'Executed',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  orders.unshift(order);

  return res.status(201).json({ message: 'Order placed successfully', order });
});

app.get('/api/news', (_req, res) => {
  res.json({ news });
});

app.get('/api/notifications', (_req, res) => {
  res.json({ notifications });
});

app.get('/api/admin/summary', (_req, res) => {
  res.json({
    totalUsers: 12480,
    activeTrades: 345,
    netFlow: '₹12.8 Cr',
    volatility: 'Moderate',
    avgTurnover: '₹44.2 Cr',
    marketMood: 'Bullish'
  });
});

function updateMarket() {
  marketStocks.forEach((stock) => {
    const drift = (Math.random() - 0.5) * 35;
    const nextPrice = Math.max(stock.price + drift, 1);
    stock.price = Number(nextPrice.toFixed(2));
    stock.change = Number((((stock.price - (stock.price / 1.01)) * 100) / (stock.price / 1.01)).toFixed(2));
    stock.volume = `${(Math.random() * 30 + 5).toFixed(1)}M`;
  });

  io.emit('market:update', { stocks: marketStocks });
}

setInterval(updateMarket, 2500);

io.on('connection', (socket) => {
  socket.emit('market:update', { stocks: marketStocks });
  socket.emit('welcome', { message: 'Connected to trading market feed' });
});

server.listen(PORT, () => {
  console.log(`Trading app backend running on http://localhost:${PORT}`);
});
