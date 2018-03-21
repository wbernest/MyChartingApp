'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './thing.events';

var ThingSchema = new mongoose.Schema({
  name: String,
  color: String
});

registerEvents(ThingSchema);
export default mongoose.model('Thing', ThingSchema);
