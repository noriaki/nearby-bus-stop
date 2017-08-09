import Crawler from './crawler';

Crawler.crawl(async (crawler) => {
  const dayIds = [1, 2, 3];
  const poleNo = 1;
  const routeId = 184;
  const stopId = 1251;

  const info = await dayIds.reduce(async (ret, dayId, index) => {
    await crawler.visit(Crawler.buildPath({
      daydiv: dayId, poleno: poleNo, routecode: routeId, stopid: stopId,
    }));

    let tmp = await ret;
    if (index === 0) {
      const routeName = await crawler.getRouteName();
      const stopName = await crawler.getBusStopName();
      const destName = await crawler.getDestinationName();

      tmp = {
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
    tmp.table.push({
      day: {
        id: dayId,
        name: days[dayId],
      },
      data: timeTable,
    });

    return tmp;
  }, Promise.resolve({}));

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
