const express = require('express');
const line = require('@line/bot-sdk');

const app = express();
app.use(express.json());

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const client = new line.Client(config);

app.get('/', (req, res) => {
  res.status(200).send('OK');
});

// 🔥 ไม่มี line.middleware ตรงนี้
app.post('/webhook', async (req, res) => {
  res.sendStatus(200);

  try {
    const events = req.body.events || [];

    for (const event of events) {
      if (event.type !== 'message' || event.message.type !== 'text') continue;

      const text = event.message.text.trim();

      if (/^\d{4}$/.test(text)) {
        const a = parseInt(text.slice(0, 2), 10);
        const b = parseInt(text.slice(2, 4), 10);

        const result = (a * (b / 100)).toFixed(2);
        const beforeDot = result.split('.')[0];
        const den = beforeDot.length >= 2 ? beforeDot[1] : '-';

        const replyText = `${den} ✅\n${a}*${b}%=${result}`;

        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: replyText
        });
      }
    }
  } catch (err) {
    console.error(err);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running...');
});
