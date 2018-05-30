const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.resolve(__dirname, 'posters'))
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, `${Date.now()}-${file.originalname}`)
    }
});

const upload = multer({ storage });

const fs = require('fs');

let data = [];
try {
    data = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data.json'), 'utf8'));
} catch (e) {
    data = [];
}

const pageSize = 5;

const app = express(bodyParser.urlencoded({ extended: true }));

app.use('/posters', express.static(path.resolve(__dirname, 'posters')));

app.get('/', (req, res) => {
    let page = req.query.page && req.query.page > 0 ? parseInt(req.query.page) : 1;
    const totalPages = Math.ceil(data.length / pageSize);
    if (page > totalPages) {
        page = totalPages;
    }
    const pagedData = data.slice(pageSize * (page - 1), page * pageSize);
    const pagination = {};
    if (page < totalPages) {
        pagination.next = page + 1;
    }

    if (page > 1) {
        pagination.prev = page - 1;
    }
    res.send({
        data: pagedData,
        pagination
    });
});

app.post('/', upload.single('poster'), (req, res) => {
    const { title, year, plot, genre } = req.body;
    const file = req.file;

    try {
        if (!title) {
            throw 'No title';
        }

        if (!year) {
            throw 'No year';
        }

        if (!plot) {
            throw 'No plot';
        }

        if (!genre) {
            throw 'No genre';
        }

        if (!file) {
            throw 'No poster';
        }

        const newData = {
            id: data[data.length - 1].id + 1, title, year, plot, genre, poster: `/posters/${file.filename}`
        };

        data.push(newData);

        res.send({
            id: newData.id
        });
    } catch (error) {
        res.status(400);
        res.send({ error });
    }
});

app.get('/:id', (req, res) => {

    res.send({});
});


app.put('/:id', (req, res) => {

    res.send({});
});

app.delete('/:id', (req, res) => {

    res.send({});
});

app.listen(8080, () => {
    console.log('Server listening at port 8080!');
});
