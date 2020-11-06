const http = require('http');
const url = require('url');
const { Http2ServerResponse } = require('http2');
const { HttpStatusCode } = require('./utils/http-status-code');

class api {
    routes = [];
    index = -1;

    constructor() {
        this.server = http.createServer((req, res) => {
            res.setHeader('Content-Type', 'application/json');

            console.log('routes:', this.routes)
            const { pathname, query } = url.parse(req.url, true);
            req.url = pathname;
            req.query = query;

            if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' ) {
                this._parseBody(req, res);
            } else {
                this._redirect(req, res);
            }
        });
    }

    _parseBody(req, res) {
        let body = [];
        req
          .on('data', (d) => {
              body.push(d);
          })
          .on('end', () => {
              body = Buffer.concat(body).toString();
              req.body = JSON.parse(body);
              this._redirect(req, res);
          });
    }

    _uniformize(path) { return path.endsWith('/') ? path : path + '/'; }

    _redirect(req, res) {
        this.index = this.routes.findIndex(
          elem => this._uniformize(elem.route) === this._uniformize(req.url) && elem.method === req.method
        );
        if (this.index !== -1) {
            try {
                this.routes[this.index].callback(req, res)
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
}

module.exports.api = api;
