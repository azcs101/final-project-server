exports.catchHTTPError = (res, error) => {
    if (error.status) {
        res.status(error.status);
        res.send(error);
    } else {
        res.status(500);
        res.send({ message: 'Internal error', status: 500 });
        console.error(error);
    }
}
