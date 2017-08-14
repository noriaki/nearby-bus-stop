import Crawler from './lib/crawler';
import { createConnection } from '../common/db';
import {
  timetableSchema,
  generateIdentifier,
  dayNameEnum,
} from '../common/db/models';

Crawler.crawl(async (crawler) => {
  const dayId = 1;
  const poleNo = 1;
  const routeId = /* 184; */ 46;
  const stopId = 1251;

  await crawler.visit(Crawler.buildPath({
    daydiv: dayId, poleno: poleNo, routecode: routeId, stopid: stopId,
  }));

  const stopName = await crawler.getBusStopName();
  const routeName = await crawler.getRouteName();
  const destName = await crawler.getDestinationName();
  const subDests = await crawler.getSubDestinationName();
  const version = await crawler.getTimeTableVersion();
  const timetable = await crawler.getTimeTable();

  return {
    stopId,
    stopName,
    poleNo,
    routeId,
    routeName,
    dests: {
      '*': destName,
      ...subDests,
    },
    version,
    dayId,
    dayName: dayNameEnum[dayId],
    timetable,
  };
}).then(async (results) => {
  const connection = createConnection();
  const Timetable = connection.model('Timetable', timetableSchema);

  const { stopId, poleNo, routeId, dayId } = results;
  const identifier = generateIdentifier({ stopId, poleNo, routeId, dayId });

  const { timetable } = await Timetable.findOneAndUpdate(
    { identifier },
    { ...results, identifier },
    { new: true, upsert: true }
  );

  console.log({ timetable, results });
}).then(() => process.exit()).catch(error => console.log(error));

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});
