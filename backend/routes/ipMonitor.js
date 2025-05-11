const express = require('express');
const router = express.Router();
const ping = require('ping');

let deviceStatus = {
  isAlive: false,
  lastChanged: new Date(),
  latency: 0
};

router.get('/check-ip', async (req, res) => {
  try {
    const { ip } = req.query;
    if (!ip) {
      return res.status(400).json({ error: 'IP address is required' });
    }

    const pingResult = await ping.promise.probe(ip, {
      timeout: 2,
      extra: ['-c', '1'],
    });

    const now = new Date();
    
    // Update status only if it changed
    if (pingResult.alive !== deviceStatus.isAlive) {
      deviceStatus = {
        isAlive: pingResult.alive,
        lastChanged: now,
        latency: pingResult.time
      };
    }

    res.json({
      isAlive: deviceStatus.isAlive,
      upSince: deviceStatus.isAlive ? deviceStatus.lastChanged : null,
      downSince: !deviceStatus.isAlive ? deviceStatus.lastChanged : null,
      latency: deviceStatus.latency
    });
  } catch (error) {
    console.error('Ping error:', error);
    res.status(500).json({ error: 'Failed to ping device' });
  }
});

module.exports = router;