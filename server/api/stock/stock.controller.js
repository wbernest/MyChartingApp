/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/stocks              ->  index
 * POST    /api/stocks              ->  create
 * GET     /api/stocks/:id          ->  show
 * PUT     /api/stocks/:id          ->  upsert
 * PATCH   /api/stocks/:id          ->  patch
 * DELETE  /api/stocks/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Stock from './stock.model';
const YahooFinanceAPI = require('yahoo-finance-data');
const api = new YahooFinanceAPI({
  key: 'dj0yJmk9VDRQQkNZclp1YlNoJmQ9WVdrOVJHOVdUWGhWTnpnbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD0wNQ--',
  secret: '22fdf5c2e7f15bca09045b71a1bb28dbc0e7b06d'
});

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      // eslint-disable-next-line prefer-reflect
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Stocks
export function index(req, res) {
  return Stock.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Stock from the DB
export function show(req, res) {
  api
  .getHistoricalData(req.params.id, '1d', '1y')
  .then(respondWithResult(res))
  .catch(handleError(res));
}

// Creates a new Stock in the DB
export function create(req, res) {
  return Stock.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Stock in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Stock.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Stock in the DB
export function patch(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Stock.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Stock from the DB
export function destroy(req, res) {
  return Stock.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
