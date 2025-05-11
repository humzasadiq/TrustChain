require('dotenv').config();
const express = require('express');
const app = express();
const routes = require('./routes');
const ipMonitorRoutes = require('../routes/ipMonitor');
var cors = require('cors')

app.use(cors())
app.use(express.json());
app.use('/api', routes);
app.use('/api', ipMonitorRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
