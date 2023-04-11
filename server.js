const express = require('express');
const path = require('path');
const fs = require('fs');

const uuid = require('./helpers/uuid'); //credit to bootcamp for providing this helper function

const port = 3001;

const app = express();

app.use(express.static('public'));
app.use(express.json()); // parsing data from POST requires this line
app.use(express.urlencoded({ extended: true }));

app.get('/notes', (req, res) => {
    // res.json(`${req.method} test request received`);
    console.info(`${req.method} test log to server`)
    res.sendFile(path.join(__dirname, 'public/notes.html'));
});

app.get('/api/notes', (req, res) => {
    // console.info(`${req.method} test api path from server`);

    fs.readFile('./db/db.json', 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
        } else {
            res.send(data);
        }
    });
});

app.post('/api/notes', (req, res) => {
    // res.json(`${req.method} test post received`);
    console.info(`${req.method} Log data to server console`)

    const {title, text} = req.body;

    if(title && text) {
        const newNote = {
            title,
            text,
            id: uuid(),
        }

        fs.readFile('./db/db.json', 'utf-8', (err, data) => {
            if (err) {
                console.error(err);
            } else {
                const allNotes = JSON.parse(data);

                allNotes.push(newNote);

                fs.writeFile('./db/db.json', JSON.stringify(allNotes, null, 4), (err) => {
                    err ? console.error('Error writing', err) : console.info('Write successful');
                });
            }
        });

        const response = {
            status: 'success',
            body: newNote,
        };

        console.log(response);
        res.status(201).json(response);
    } else {
        res.status(500).json('Error storing new note');
    }
})
/* This took forever to fix, turns out it's cause in the db I had id called "note_id" but the provided index
file only parsed for "id" when making the request therefor the requests were empty */
app.delete('/api/notes/:id', (req, res) => {
    // const id = req.params.id;
    const curId = req.params.id;
    
    if (curId) {
        fs.readFile('./db/db.json', 'utf-8', (err, data) => {
            if (err) {
                console.error(err);
            } else {
                let allNotes = JSON.parse(data);
                // console.info(allNotes);
                allNotes = allNotes.filter(({id}) => id !== curId);
                // console.info(allNotes);
                
                fs.writeFile('./db/db.json', JSON.stringify(allNotes, null, 4), (err) => {
                    err ? console.error('Error writing', err) : console.info('Delete/write successful');
                });

             }
        });

        const response = {
            status: 'success',
            body: curId,
        };

        res.status(201).json(response);

    } else {
        res.status(500).json('Error deleting note');
    }
});

app.listen(port, () => 
    console.log(`App listening at http://localhost:${port}`)
);