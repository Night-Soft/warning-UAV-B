import express from 'express';
const app = express();
const port = process.env.PORT || 4000

app.get('/', (req, res) => {
    res.send("<h1>Warning UAV B ✅</h1>");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});