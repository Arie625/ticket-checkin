import express from 'express';
import cors from 'cors';
import { getTickets, logCheckin } from './googleSheets.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/tickets', async (req, res) => {
  try {
    const tickets = await getTickets();
    res.json(tickets);
  } catch (err) {
    res.status(500).send('Failed to fetch tickets');
  }
});

app.post('/checkin', async (req, res) => {
  const { ticketId, fullName, method } = req.body;

  try {
    await logCheckin(ticketId, fullName, method);
    res.send('Check-in logged successfully');
  } catch (err) {
    res.status(500).send('Failed to log check-in');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
