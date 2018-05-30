const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const { Model } = require('./model');
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

const model = new Model();
const app = express(bodyParser.urlencoded({ extended: true }));

app.use('/posters', express.static(path.resolve(__dirname, 'posters')));

app.get('/', (req, res) => {
    let page = req.query.page && req.query.page > 0 ? parseInt(req.query.page) : 1;
    const search = req.query.search ? req.query.search : null;
    const pagedData = model.getPagedData(page, search);
    res.send(pagedData);
});

app.post('/', upload.single('poster'), (req, res) => {
    try {
        if (!req.body) {
            throw { message: 'Empty', status: 400 };
        }

        model.insert({
            ...req.body, file: req.file
        }, (newData) => {
            res.send(newData);
        });
    } catch (error) {
        catchHTTPError(res, error);
    }
});

app.get('/:id', (req, res) => {
    try {
        const found = model.getMovieById(parseInt(req.params.id));
        res.send(found);
    } catch (error) {
        catchHTTPError(res, error);
    }
});

app.put('/:id', upload.single('poster'), (req, res) => {
    try {
        if (!req.body) {
            throw { message: 'Empty', status: 400 };
        }

        model.update(parseInt(req.params.id), {
            ...req.body, file: req.file
        }, (newData) => {
            res.send(newData);
        });
    } catch (error) {
        catchHTTPError(res, error);
    }
});

app.delete('/:id', (req, res) => {
    try {
        model.delete(parseInt(req.params.id), () => {
            res.send({ status: 200 });
        })
    } catch (error) {
        catchHTTPError(res, error);
    }
});

app.listen(8080, () => {
    console.log('Server listening at port 8080!');
});
