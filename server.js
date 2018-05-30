const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

let data = [];
try {
    data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
} catch (e) {
    data = [];
}

const pageSize = 5;

const app = express(bodyParser.urlencoded({ extended: true }));

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

app.listen(8080, () => {
    console.log('Server listening at port 8080!');
});
