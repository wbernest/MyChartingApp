/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import Thing from '../api/thing/thing.model';
import config from './environment/';

export default function seedDatabaseIfNeeded() {
  if(config.seedDB) {
    Thing.find({}).remove()
      .then(() => {
        let thing = Thing.create({
          name: 'B',
          color: ''
        }, {
          name: 'GOOG',
          color: ''
        }, {
          name: 'AAPL',
          color: ''
        });
        return thing;
      })
      .then(() => console.log('finished populating things'))
      .catch(err => console.log('error populating things', err));
  }
}
