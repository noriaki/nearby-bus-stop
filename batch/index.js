import Crawler from './crawler';

Crawler.crawl(async (crawler) => {
  const dayIds = [1, 2, 3];
  const poleNo = 1;
  const routeId = 184;
  const stopId = 1251;

  let info = {};
  /* eslint-disable no-await-in-loop */
  for (const dayId of dayIds) {
    await crawler.visit(Crawler.buildPath({
      daydiv: dayId, poleno: poleNo, routecode: routeId, stopid: stopId,
    }));

    if (dayId === dayIds[0]) {
      const routeName = await crawler.getRouteName();
      const stopName = await crawler.getBusStopName();
      const destName = await crawler.getDestinationName();

      info = {
        stop: {
          id: stopId,
          name: stopName,
        },
        pole: {
          id: poleNo,
        },
        route: {
          id: routeId,
          name: routeName,
        },
        dest: {
          name: destName,
        },
        table: [],
      };
    }

    const timeTable = await crawler.getTimeTable();
    info.table.push({
      day: {
        id: dayId,
        name: days[dayId],
      },
      data: timeTable,
    });
  }
  /* eslint-enable no-await-in-loop */

  console.log(JSON.stringify(info));
});

const days = {
  1: '平日',
  2: '土曜',
  3: '休日',
};

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});
