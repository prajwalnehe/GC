const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { seedAdminUser } = require('./utils/seedAdmin');
const Proposal = require('./models/Proposal');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/leads', require('./routes/leadRoutes'));
app.use('/api/follow-ups', require('./routes/followUpRoutes'));
app.use('/api/proposals', require('./routes/proposalRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Growwcode CRM API is running' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5500;

const startServer = async () => {
  await connectDB();
  await seedAdminUser();
  await Proposal.updateMany({ status: 'Draft' }, { $set: { status: 'Pending' } });
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the other process and restart.`);
      process.exit(1);
    }
    throw err;
  });
};

startServer();
