import qs from 'querystring';
import Chromy from 'chromy';
import moji from 'moji';
import flatten from 'lodash/flatten';

class Crawler extends Chromy {
  host = 'tobus.jp'
  origin = `https://${this.host}`

  static buildPath = ({ daydiv, poleno, routecode, stopid }) => {
    const q = qs.stringify({
      ln: 'ja', dispdiv: 0, daydiv, poleno, routecode, stopid,
    });
    return `/sp/blsys/stop/time?${q}`;
  }

  getLocation = () => this.evaluate(() => window.location)

  getCurrentURL = async () => (
    this.client &&
      (await this.client.Page.getResourceTree()).frameTree.frame.url
  )

  getRouteName = async () => {
    const routeNodeId = await this.querySelector('.icn_gr');
    const routeName = (await this.text(routeNodeId)).trim();
    return moji(routeName).convert('ZE', 'HE').toString();
  }

  getBusStopName = async () => {
    const busStopNodeId = await this.querySelector('.title_bl');
    return (await this.text(busStopNodeId)).trim();
  }

  getDestinationName = async () => {
    const destNodeId = await this.querySelector('.mb5');
    const dest = (await this.text(destNodeId)).trim();
    const m = /^行先:(.*)行$/.exec(dest);
    if (m && m.length > 1) { return m[1]; }
    return null;
  }

  getTimeTable = async () => {
    const innerTableNodeIds = await this.querySelectorAll('table.inner');
    return Promise.all(innerTableNodeIds.map(async (nodeId) => {
      const hourNodeId = await this.querySelector('tr.top > th', nodeId);
      const hour = parseInt(await this.text(hourNodeId), 10);
      const minuteTableNodeIds = await this.querySelectorAll('table', nodeId);
      const minuteNodeIds = await Promise.all(minuteTableNodeIds.map(
        minuteTableNodeId => this.querySelectorAll('td', minuteTableNodeId)
      ));
      const minutes = (await Promise.all(
        flatten(minuteNodeIds).map(async (minuteNodeId) => {
          const minute = await this.text(minuteNodeId);
          return parseInt(minute, 10);
        })
      )).filter(n => !Number.isNaN(n));
      return { hour, minutes };
    }));
  }

  querySelector = async (selector, contextNodeId) => {
    const { nodeId } = await this.performQuerySelector(
      'querySelector', selector, contextNodeId
    );
    return nodeId;
  }
  querySelectorAll = async (selector, contextNodeId) => {
    const { nodeIds } = await this.performQuerySelector(
      'querySelectorAll', selector, contextNodeId
    );
    return nodeIds;
  }
  performQuerySelector = async (method, selector, contextNodeId) => {
    const nodeId = (
      !contextNodeId ?
        (await this.client.DOM.getDocument()).root.nodeId : contextNodeId
    );
    return this.client.DOM[method]({ nodeId, selector });
  }

  text = async (nodeId) => {
    const { value } = await this.getAttribute('innerText', nodeId);
    return value;
  }
  getAttribute = async (name, nodeId) => {
    const { object: { objectId } } = await this.client.DOM.resolveNode({ nodeId });
    const { result } = await this.client.Runtime.getProperties({ objectId });
    return result.find(prop => prop.name === name).value;
  }

  visit = async (url, options) => {
    const targetUrl = url.startsWith('/') ? `${this.origin}${url}` : url;
    if (targetUrl !== await this.getCurrentURL()) {
      await this.goto(targetUrl, options);
    }
  }

  static async crawl(operation = () => {}, options = {}, chromyOptions = {}) {
    const defaultChromyOptions = { waitTimeout: 10 * 1000 };
    const defaultOptions = {
      debug: false,
      blockImages: true,
      blockUrls: [],
      emulateDevice: null,
    };
    const finalOptions = { ...defaultOptions, ...options };
    const finalChromyOptions = { ...defaultChromyOptions, ...chromyOptions };

    if (finalOptions.debug) { finalChromyOptions.visible = true; }

    const crawler = new this(finalChromyOptions);

    try {
      // set blocking urls
      const blockUrls = finalOptions.blockUrls;
      if (finalOptions.blockImages) {
        blockUrls.push('*.png', '*.jpg', '*.jpeg', '*.gif', '*.webp');
      }
      await crawler.blockUrls(blockUrls);

      // set emulation mobile name
      if (finalOptions.emulateDevice) {
        await crawler.emulate(finalOptions.emulateDevice);
      }

      // exec function
      await operation(crawler, finalOptions);

      // finalize
      await crawler.close();
    } catch (error) {
      console.error(error);
      await crawler.close();
    }
  }
}

export default Crawler;
