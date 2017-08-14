import { parse } from '../jpera';

describe('jpera.parse', () => {
  describe('should returning `null` when invalid argument', () => {
    it('era name `昭和`', () => {
      const era = '昭和59年2月11日';
      expect(parse(era)).toBeNull();
    });

    it('`yaer` is 0', () => {
      const era = '平成0年2月11日';
      expect(parse(era)).toBeNull();
    });

    it('`month` is 0', () => {
      const era = '平成11年0月11日';
      expect(parse(era)).toBeNull();
    });

    it('`day` is 0', () => {
      const era = '平成11年2月0日';
      expect(parse(era)).toBeNull();
    });

    it('`yaer` out of range', () => {
      const era = '平成123年2月11日';
      expect(parse(era)).toBeNull();
    });

    it('`month` out of range', () => {
      const era = '平成11年13月11日';
      expect(parse(era)).toBeNull();
    });

    it('`day` out of range', () => {
      const era = '平成11年2月39日';
      expect(parse(era)).toBeNull();
    });
  });

  describe('should returning Date', () => {
    it('era `平成元年`', () => {
      const era = '平成元年1月8日';
      const expected = new Date(1989, 0, 8);
      expect(parse(era)).toEqual(expected);
    });

    it('zero padding value `平成09年01月01日`', () => {
      const era = '平成09年01月01日';
      const expected = new Date(1997, 0, 1);
      expect(parse(era)).toEqual(expected);
    });

    it('boundary values of `平成29年1月1日`', () => {
      const era = '平成29年1月1日';
      const expected = new Date(2017, 0, 1);
      expect(parse(era)).toEqual(expected);
    });

    it('boundary values of `平成29年12月31日`', () => {
      const era = '平成29年12月31日';
      const expected = new Date(2017, 11, 31);
      expect(parse(era)).toEqual(expected);
    });
  });
});
