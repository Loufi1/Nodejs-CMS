const http = require('http');

class api {
    routes = [];
    index = -1;

    constructor() {
        this.server = http.createServer((req, res) => {
            this.index = this.routes.findIndex(elem => elem.route === req.url && elem.method === req.method);
            if (this.index !== -1) { this.routes[this.index].callback(req, res) }
        });
    }

    listen(port, hostname, callback) {
        this.server.listen(port, hostname, callback);
    }

    get(route, callback) {
        this.routes.push({
            route: route,
            callback: callback,
            method: 'GET',
        })
    }
}

module.exports.api = api;