import { LastSendedMessages } from "./ForwardController.js";
import { TARGET_CHANNEL, TG_TOKEN } from "./config.js";

import express from 'express';
import cors from'cors';

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send("<h1>Warning UAV B ✅</h1>");
});

app.get('/pass', (req, res) => {
  const lastSendedMessages = LastSendedMessages.instance;
  let text;
  lastSendedMessages.forEach(({message, time}) => {
    let date = new Date(Number(date)).toLocaleString();
    text =+ `<h4>${time}</h4>`;
    text += `<span>${message}</span><br>`
  });
  res.send(text);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

app.post("/compare", cors(corsOptionsForCompare), (req, res) => {
  console.log('app post compare', req.body);
  if (!req.body.COEF) {
    console.log('Wrong data', req.body);
    res.status(400).json({ error: "Wrong data" });
    return;
  }
  //const data = JSON.stringify(req.body);
  const message = createDataAsMessage(req.body);
  compareData.set(Date.now(), data);

  console.log(data)
  fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TARGET_CHANNEL,
      text: message
    })
  });

  res.status(200).json({ succesWrite: true });

});

const createDataAsMessage = (data) => {
  return Object.keys(data).reduce((text, current, index) => {
    if (index === 5) return text;
    if (index === 0) {
      text.push(`**Similarity: ${data.similarity}\nCoef: ${data.COEF}**\n`);
      return text;
    }

    const val = Object.entries(data[current]).reduce((textArr, currentArr, index) => {
      textArr.push(currentArr.join(": "))
      return textArr; // energy
    }, []).join(`,\n       `);

    text.push(`\n    __${current}__:\n       ${val}`); //midddle

    return text;
  }, []).join("");
}