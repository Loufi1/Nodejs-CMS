const http = require('http');
const { HttpStatusCode } = require('./http-status-code');

class api {
    routes = [];
    middlewares = [];
    index = -1;

    constructor() {
        this.middlewares.push({
            callback: (req, res, next) => { next(req, res); }
        });
        this.server = http.createServer((req, res) => {
            this.middlewares[this.middlewares.length - 1].next = (req, res) => {
                this._redirect(req, res);
            };
            this.middlewares[0].callback(req, res, this.middlewares[0].next);
        });
    }

    _recalibrateMiddleware() {
        for (let i = this.middlewares.length - 1; i >= 0; i = i - 1) {
            this.middlewares[i].next = this.middlewares[i + 1]
              ? (req, res) => this.middlewares[i + 1].callback(req, res, this.middlewares[i + 1].next)
              : undefined;
        }
    }

    use(callback) {
        this.middlewares.push({
            callback
        });
        this._recalibrateMiddleware();
    }

    listen(port, hostname, callback) {
        this.server.listen(port, hostname, callback);
    }

    routing(path, callback) {
        callback(path, this);
    }

    get(route, callback) {
        this.routes.push({
            route: route,
            callback: callback,
            method: 'GET',
        });
    }

    post(route, callback) {
        this.routes.push({
            route: route,
            callback: callback,
            method: 'POST',
        });
    }

    put(route, callback) {
        this.routes.push({
            route: route,
            callback: callback,
            method: 'PUT',
        });
    }

    patch(route, callback) {
        this.routes.push({
            route: route,
            callback: callback,
            method: 'PATCH',
        });
    }

    delete(route, callback) {
        this.routes.push({
            route: route,
            callback: callback,
            method: 'DELETE',
        });
    }

    _uniformize(path) { return path.endsWith('/') ? path : path + '/'; }

    async _redirect(req, res) {
        this.index = this.routes.findIndex(
          elem => this._uniformize(elem.route) === this._uniformize(req.url) && elem.method === req.method
        );
        if (this.index !== -1) {
            try {
                await this.routes[this.index].callback(req, res)
            } catch (e) {
                console.error(e);
                res.statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR;
                res.end();
            }
        } else {
            res.statusCode = HttpStatusCode.NOT_FOUND;
            res.end();
        }
    }
}

module.exports.api = api;
