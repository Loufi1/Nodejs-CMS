const http = require('http');
const { Http2ServerResponse } = require('http2');
const { HttpStatusCode } = require('./utils/http-error');

class api {
    routes = [];
    index = -1;

    constructor() {
        this.server = http.createServer((req, res) => {
            res.setHeader('Content-Type', 'application/json');
            if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' ) {
                let body = [];
                req
                  .on('data', (d) => {
                      body.push(d);
                  })
                  .on('end', () => {
                      body = Buffer.concat(body).toString();
                      req.body = JSON.parse(body);
                      this.redirect(req, res);
                  });
            } else {
                this.redirect(req, res)
            }
        });
    }

    redirect(req, res) {
        this.index = this.routes.findIndex(elem => elem.route === req.url && elem.method === req.method);
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

    duplicate(route, callback, method) {
        if (route.endsWith('/')) {
            this.routes.push({
                route: route.slice(0, -1),
                callback: callback,
                method: method,
            });
        } else {
            this.routes.push({
                route: route + '/',
                callback: callback,
                method: method,
            })
        }
    }

    get(route, callback) {
        this.routes.push({
            route: route,
            callback: callback,
            method: 'GET',
        });
        this.duplicate(route, callback, 'GET');
    }

    post(route, callback) {
        this.routes.push({
            route: route,
            callback: callback,
            method: 'POST',
        });
        this.duplicate(route, callback, 'POST');
    }

    put(route, callback) {
        this.routes.push({
            route: route,
            callback: callback,
            method: 'PUT',
        });
        this.duplicate(route, callback, 'PUT');
    }

    patch(route, callback) {
        this.routes.push({
            route: route,
            callback: callback,
            method: 'PATCH',
        });
        this.duplicate(route, callback, 'PATCH');
    }

    delete(route, callback) {
        this.routes.push({
            route: route,
            callback: callback,
            method: 'DELETE',
        });
        this.duplicate(route, callback, 'DELETE');
    }

}

module.exports.api = api;
