import Crawler from './lib/crawler';
import { createConnection } from '../common/db';
import {
  timetableSchema,
  generateIdentifier,
  dayNameEnum,
} from '../common/db/models';
import sources from './sources';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

Crawler.crawl(async (crawler) => {
  const dayIds = Object.keys(dayNameEnum);
  const results = [];

  /* eslint-disable no-await-in-loop */
  for (const source of sources) {
    for (const dayId of dayIds) {
      const { stopId, poleNo, routeId } = source;

      await crawler.visit(Crawler.buildPath({
        daydiv: dayId, poleno: poleNo, routecode: routeId, stopid: stopId,
      }));

      try {
        const stopName = await crawler.getBusStopName();
        const routeName = await crawler.getRouteName();
        const destName = await crawler.getDestinationName();
        const subDests = await crawler.getSubDestinationName();
        const version = await crawler.getTimeTableVersion();
        const timetable = await crawler.getTimeTable();

        results.push({
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
        });
      } catch (error) {
        console.error('%s: %s', error.name, error.message);
        console.error({
          daydiv: dayId, poleno: poleNo, routecode: routeId, stopid: stopId,
        });
      }

      await sleep(500);
    }
  }
  /* eslint-enable no-await-in-loop */

  return results;
}).then(async (results) => {
  const connection = createConnection();
  const Timetable = connection.model('Timetable', timetableSchema);

  /* eslint-disable no-await-in-loop */
  for (const result of results) {
    const { stopId, poleNo, routeId, dayId } = result;

    const identifier = generateIdentifier({ stopId, poleNo, routeId, dayId });

    /* const { timetable } = */await Timetable.findOneAndUpdate(
      { identifier },
      { ...result, identifier },
      { new: true, upsert: true }
    );

    // console.log({ timetable, results });
  }
  /* eslint-enable no-await-in-loop */
}).then(() => process.exit()).catch(error => console.log(error));

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});
