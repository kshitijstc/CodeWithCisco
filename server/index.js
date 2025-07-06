// basic backend setup

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';


const app = express();
app.use(cors());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

const server = http.createServer(app);
// Define a simple route
app.get('/', (req, res) => {
  res.send('Hello World!');
});
const PORT= process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});





