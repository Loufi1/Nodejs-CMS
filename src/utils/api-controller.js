const http = require('http');
const { HttpStatusCode } = require('./http-status-code');

class api {
    routes = [];
    paramRoutes = [];
    middlewares = [];

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
        (route.includes(':') ? this.paramRoutes : this.routes).push({
            route: route,
            callback: callback,
            method: 'GET',
        });
    }

    post(route, callback) {
        (route.includes(':') ? this.paramRoutes : this.routes).push({
            route: route,
            callback: callback,
            method: 'POST',
        });
    }

    put(route, callback) {
        (route.includes(':') ? this.paramRoutes : this.routes).push({
            route: route,
            callback: callback,
            method: 'PUT',
        });
    }

    patch(route, callback) {
        (route.includes(':') ? this.paramRoutes : this.routes).push({
            route: route,
            callback: callback,
            method: 'PATCH',
        });
    }

    delete(route, callback) {
        (route.includes(':') ? this.paramRoutes : this.routes).push({
            route: route,
            callback: callback,
            method: 'DELETE',
        });
    }

    _uniformize(path) { return path.endsWith('/') ? path : path + '/'; }

    async _callRoute(req, res, callback) {
        try {
            await callback(req, res)
        } catch (e) {
            console.error(e);
            res.statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR;
            res.end();
        }
    }

    async _redirect(req, res) {
        const index = this.routes.findIndex(
          elem => this._uniformize(elem.route) === this._uniformize(req.url) && elem.method === req.method
        );
        if (index !== -1) {
            this._callRoute(req, res, this.routes[index].callback)
        } else {
            this._redirectParamRoutes(req, res);
        }
    }

    async _redirectParamRoutes(req, res) {
        const index = this.paramRoutes.findIndex(
          elem => {
              if (elem.method !== req.method) return false;
              const urlArray = this._uniformize(req.url).split('/');
              const routeArray = this._uniformize(elem.route).split('/');
              if (urlArray.length !== routeArray.length) return false;
              let match = true;
              routeArray.forEach((e, i) => {
                  if (e.includes(':')) return;
                  if (e !== urlArray[i]) match = false;
              });
              req.params = {};
              if (match) {
                  routeArray.forEach((e, i) => {
                      if (e.includes(':')) req.params = { ...req.params, [e.substring(1)]: urlArray[i] }
                  });
                  return true;
              }
              return false;
          }
        );
        if (index !== -1) {
            this._callRoute(req, res, this.paramRoutes[index].callback);
        } else {
            res.statusCode = HttpStatusCode.NOT_FOUND;
            res.end();
        }
    }

}

module.exports.api = api;
