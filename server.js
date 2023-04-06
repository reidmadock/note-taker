const express = require('express');
const path = require('path');

const port = 3001;

const app = express();

app.use(express.static('public'));

app.get('/notes' , (req,res) => {
    res.json(`${req.method} test request received`);
    console.info(`${req.method} test log to server`)
})

app.listen(port, () => 
    console.log(`App listening at http://localhost:${port}`)
);