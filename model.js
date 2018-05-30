const fs = require('fs');
const path = require('path');

class Model {

    constructor() {
        this.data = [];
        try {
            this.data = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data.json'), 'utf8'));
        } catch (e) {
            this.data = [];
        }    
    }

    persistData(cb) {
        fs.writeFile(path.resolve(__dirname, 'data.json'), JSON.stringify(this.data), 'utf8', cb);
    }

    getPagedData(page) {
        return this.data.slice(Model.pageSize * (page - 1), page * Model.pageSize).map(({ plot, ...rest }) => rest);
    }

    getMovieById(id) {
        const found = this.data.find(e => e.id === id);
        if (found === undefined) {
            throw { message: 'Not found', status: 404 };
        }
        return found;
    }

    insert(data, callback) {
        const { title, year, plot, genre, file } = data;

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

        this.data.push({
            id: this.getIncrement(),
            title, year, plot, genre, poster: `/posters/${file.filename}`
        });
        this.persistData(() => {
            callback(this.data[this.data.length - 1]);
        });
    }

    update(id, data, callback) {
        const found = this.data.findIndex(e => e.id === id);
        if (found === -1) {
            throw { message: 'Not found', status: 404 };
        }

        if (data.id) {
            throw { message: 'Cannot change ID', status: 400 };
        }

        const { title, year, plot, genre, file } = data;

        if (title) {
            this.data[found].title = title;
        }

        if (year) {
            this.data[found].year = year;
        }

        if (plot) {
            this.data[found].plot = plot;
        }

        if (genre) {
            this.data[found].genre = genre;
        }

        if (file) {
            this.data[found].poster = `/posters/${file.filename}`;
        }

        this.persistData(() => {
            callback(this.data[found]);
        });
    }

    delete(id, callback) {
        const found = this.data.findIndex(e => e.id === id);
        if (found === -1) {
            throw { message: 'Not found', status: 404 };
        }

        this.data.splice(found, 1);
        this.persistData(callback);
    }

    getIncrement() {
        return this.data.length > 0 ? this.data[this.data.length - 1].id + 1 : 1;
    }

    totalPages() {
        return Math.ceil(this.data.length / Model.pageSize);
    }
}

Model.pageSize = 10;

exports.Model = Model;
