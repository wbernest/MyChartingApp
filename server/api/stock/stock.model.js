'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './stock.events';

var StockSchema = new mongoose.Schema({
  name: String,
  info: String,
  active: Boolean
});

registerEvents(StockSchema);
export default mongoose.model('Stock', StockSchema);
