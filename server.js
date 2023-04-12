const express = require('express');
const path = require('path');
const fs = require('fs');

const uuid = require('./helpers/uuid'); //credit to bootcamp for providing this helper function

const port = process.env.PORT || 3001;

const app = express();

app.use(express.static('public'));
app.use(express.json()); // parsing data from POST requires this line
app.use(express.urlencoded({ extended: true }));

app.get('/notes', (req, res) => {
    // change to notes.html webpage
    res.sendFile(path.join(__dirname, 'public/notes.html'));
});

app.get('/api/notes', (req, res) => {
    // read in file from the json acting as our database, send back the data as a string
    fs.readFile('./db/db.json', 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
        } else {
            res.send(data);
        }
    });
});

app.post('/api/notes', (req, res) => {
    // deconstruct variables out of the request body
    const {title, text} = req.body;

    /* check to see if the fields were populated, even though they should be
    as the frontend is set not to show a save button if the fields are empty */
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
                // add new entry into the object array
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

        res.status(201).json(response);
    } else {
        res.status(500).json('Error storing new note');
    }
})
/* This took forever to fix, turns out it's cause in the db I had id called "note_id" but the provided index
file only parsed for "id" when making the request therefor the requests were empty */
app.delete('/api/notes/:id', (req, res) => {
    const curId = req.params.id;
    // make sure an ID was sent with DELETE request
    if (curId) {
        fs.readFile('./db/db.json', 'utf-8', (err, data) => {
            if (err) {
                console.error(err);
            } else {
                let allNotes = JSON.parse(data);

                allNotes = allNotes.filter(({id}) => id !== curId);
                
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