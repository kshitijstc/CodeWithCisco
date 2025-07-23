const express = require('express');
const si = require('systeminformation');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/metrics', async (req, res) => {
  const cpu = await si.currentLoad();
  const mem = await si.mem();
  const disk = await si.fsSize();
  const net = await si.networkStats();

  res.json({
    cpu: cpu.currentLoad,
    memory: (mem.active / mem.total) * 100,
    disk: disk[0].use, // percent used
    network: net[0].rx_sec / 1024, // KB/s received
    packetsIn: net[0].rx_packets,
    packetsOut: net[0].tx_packets
  });
});

app.listen(5000, () => console.log('Metrics API running on port 5000'));