import { Schema } from 'mongoose';

export const dayNameEnum = {
  1: '平日',
  2: '土曜',
  3: '休日',
};

export const scheduleSchema = new Schema({
  hour: {
    type: Number,
    min: 0,
    max: 23,
  },
  minutes: [{
    type: Number,
    min: 0,
    max: 59,
  }],
  sub: Object,
});

export const timetableSchema = new Schema({
  identifier: {
    type: String,
    index: true,
    match: /^\d+-\d-\d+-[1-3]$/, // '{stopId}-{poleNo}-{routeId}-{dayId}'
  },
  stopId: Number,
  stopName: String,
  poleNo: Number,
  routeId: Number,
  routeName: String,
  dests: Object,
  version: String,
  dayId: {
    type: Number,
    min: [...Object.keys(dayNameEnum)].shift(),
    max: [...Object.keys(dayNameEnum)].pop(),
  },
  dayName: {
    type: String,
    enum: Object.values(dayNameEnum),
  },
  timetable: [scheduleSchema],
});

export const generateIdentifier = ({ stopId, poleNo, routeId, dayId }) => {
  if (isNaN(stopId) || isNaN(poleNo) || isNaN(routeId) || isNaN(dayId)) {
    throw new Error('Require {stopId}, {poleNo}, {routeId}, {dayId}');
  }
  return `${stopId}-${poleNo}-${routeId}-${dayId}`;
};

export default {
  scheduleSchema,
  timetableSchema,
  generateIdentifier,
  dayNameEnum,
};
