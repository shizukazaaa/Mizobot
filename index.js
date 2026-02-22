const express = require('express');
const line = require('@line/bot-sdk');

const app = express();

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const client = new line.Client(config);

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result));
});

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const text = (event.message.text || '').trim();

  // รับเฉพาะ "เลข 4 หลัก" เท่านั้น เช่น 1567
  if (!/^\d{4}$/.test(text)) {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: 'พิมพ์เลข 4 หลัก เช่น 1567'
    });
  }

  const ab = parseInt(text.slice(0, 2), 10); // สองตัวหน้า
  const cd = parseInt(text.slice(2, 4), 10); // สองตัวท้าย (เปอร์เซ็นต์)

  const result = ab * (cd / 100);
  const resultStr = result.toFixed(2); // แสดง 2 ตำแหน่ง

  // เด่น = เลขตัวที่สองของจำนวนเต็มก่อนจุด (เช่น 10.05 -> "0")
  const intPart = resultStr.split('.')[0]; // เช่น "10"
  const lead = intPart.length >= 2 ? intPart[1] : intPart[0];

  const reply = `${lead} ✅\n${ab}*${cd}%=${resultStr}`;

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: reply
  });
}

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running...');
});
