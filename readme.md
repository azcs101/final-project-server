# Final Project Server

Final Project Server application.

## Usage
1. Install dependencies:
```
npm install
```

2. Run server:
```
npm start
```

## API

#### `GET /` -> Fetch movies by page and search string

Query Parameters:

* page: Current page, *default: 1*
* search: Search string; Searches **only** the title

Output:

* data: array -> Movie data (spec: MovieListItem)
* pagination: object -> Pagination (spec: Pagination)

Example:

```
GET /?page=2&search=Galaxy
{
    "data": [
        { "id": 1, "title": "Galaxy Warriors", "year": 2018, "genre": "Adventure", "poster": "poster2.jpg" },
        { "id": 2, "title": "Guardians of Galaxy", "year": 2017, "genre": "Action", "poster": "poster1.jpg" },
        ...
    ],
    pagination: {
        next: 3,
        prev: 1
    }
}
```

---

#### `POST /` -> Insert new movie

Body: FormData
* spec: MovieSpec w/o ID

Output:
* spec: MovieSpec w/ newly added ID
Error:
* spec: ErrorSpec
* error codes:
    * 400 -> Bad Request (e.g "Title not found")

---

#### `GET /:id` -> Fetch movie by ID

Output:
* spec: MovieSpec

Error:
* spec: ErrorSpec
* error codes:
    * 404 -> Not Found

Example:

```
GET /2
{
    "title": "Guardians of Galaxy",
    "year": "2017",
    "poster": "poster1.jpg",
    "genre": "Action",
    "plot": "Loren ipsum"
}
```

---

#### `PUT /:id` -> Update movie

Body: FormData
* spec: MovieSpec

Output:
* spec: MovieSpec

Error:
* spec: ErrorSpec
* error codes:
    * 404 -> Not Found
    * 400 -> Bad Request

*Note: This method can update multiple fields. Fields that are not present in request body will NOT removed; just ignored*

---

#### `DELETE /:id` -> Delete movie

Output:
* status: 200

Error:
* spec: ErrorSpec
* error codes:
    * 404 -> Not Found

## Specs

#### MovieSpec

```
{
    id: integer,
    title: string,
    year: string|integer,
    genre: string,
    plot: string,
    poster: string|file
}
```

#### MovieListSpec

```
{
    id: integer,
    title: string,
    year: string|integer,
    genre: string,
    poster: string|file
}
```

#### ErrorSpec

```
{
    message: string,
    status: integer
}
```
