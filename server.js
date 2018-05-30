const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const { catchHTTPError } = require('./errors.js');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.resolve(__dirname, 'posters'))
    },
    filename: (req, file, cb) => {
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

const getIncrement = () => data.length > 0 ? data[data.length - 1].id + 1 : 1;

const persistData = (cb) => {
    fs.writeFile(path.resolve(__dirname, 'data.json'), JSON.stringify(data), 'utf8', cb);
}

const pageSize = 10;

const app = express(bodyParser.urlencoded({ extended: true }));

app.use('/posters', express.static(path.resolve(__dirname, 'posters')));

app.get('/', (req, res) => {
    let page = req.query.page && req.query.page > 0 ? parseInt(req.query.page) : 1;
    const totalPages = Math.ceil(data.length / pageSize);
    if (page > totalPages) {
        page = totalPages;
    }
    const pagedData = data.slice(pageSize * (page - 1), page * pageSize).map(({ plot, ...rest }) => rest);
    const pagination = { prev: null, next: null };

    if (page > 1) {
        pagination.prev = page - 1;
    }

    if (page < totalPages) {
        pagination.next = page + 1;
    }

    res.send({
        data: pagedData,
        pagination
    });
});

app.post('/', upload.single('poster'), (req, res) => {
    try {

        if (!req.body) {
            throw { message: 'Empty', status: 400 };
        }

        const { title, year, plot, genre } = req.body;
        const file = req.file;

        if (!title) {
            throw { message: 'No title', status: 400 };
        }

        if (!year) {
            throw { message: 'No year', status: 400 };
        }

        if (!plot) {
            throw { message: 'No plot', status: 400 };
        }

        if (!genre) {
            throw { message: 'No genre', status: 400 };
        }

        if (!file) {
            throw { message: 'No poster', status: 400 };
        }

        const newData = {
            id: getIncrement(), title, year, plot, genre, poster: `/posters/${file.filename}`
        };

        data.push(newData);
        persistData(() => {
            res.send(newData);
        });
    } catch (error) {
        catchHTTPError(res, error);
    }
});

app.get('/:id', (req, res) => {
    try {
        const movieId = parseInt(req.params.id);
        const found = data.find(e => e.id === movieId);
        if (found === undefined) {
            throw { message: 'Not found', status: 404 };
        }

        res.send(found);
    } catch (error) {
        catchHTTPError(res, error);
    }
});


app.put('/:id', upload.single('poster'), (req, res) => {
    try {
        const movieId = parseInt(req.params.id);
        const found = data.findIndex(e => e.id === movieId);
        if (found === -1) {
            throw { message: 'Not found', status: 404 };
        }

        if (!req.body) {
            throw { message: 'Empty', status: 400 };
        }

        const { id, title, year, plot, genre } = req.body;
        const file = req.file;

        if (id) {
            throw { message: 'Cannot change ID', status: 400 };
        }

        if (title) {
            data[found].title = title;
        }

        if (year) {
            data[found].year = year;
        }

        if (plot) {
            data[found].plot = plot;
        }

        if (genre) {
            data[found].genre = genre;
        }

        if (file) {
            data[found].poster = `/posters/${file.filename}`;
        }

        persistData(() => {
            res.send(data[found]);
        });
    } catch (error) {
        catchHTTPError(res, error);
    }
});

app.delete('/:id', (req, res) => {
    try {
        const movieId = parseInt(req.params.id);
        const found = data.findIndex(e => e.id === movieId);
        if (found === -1) {
            throw { message: 'Not found', status: 404 };
        }

        data.splice(found, 1);

        persistData(() => {
            res.send({ status: 200 });
        });
    } catch (error) {
        catchHTTPError(res, error);
    }
});

app.listen(8080, () => {
    console.log('Server listening at port 8080!');
});
