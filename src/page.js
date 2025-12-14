import { LastSendedMessages } from "./ForwardController.js";
import { TARGET_CHANNEL, TG_TOKEN } from "./config.js";

import express from 'express';
const app = express();
const port = process.env.PORT || 4000;

app.get('/', (req, res) => {
  res.send("<h1>Warning UAV B ✅</h1>");
});

app.get('/pass', (req, res) => {
  const lastSendedMessages = LastSendedMessages.instance;
  let text;
  lastSendedMessages.forEach(message => {
    text += `<h3>${message}</h3><br>`
  });
  res.send(text);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

app.post("/compare", (req, res) => {
  console.log('app post compare', req.body);
  if (!req.body.COEF) {
    console.log('Wrong data', req.body);
    res.send(JSON.stringify({ error: "Wrong data" }));
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

  res.sendStatus(200);
  res.send(JSON.stringify({ succesWrite: true }));
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