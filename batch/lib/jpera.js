export const parse = (str) => {
  const regexp =
    /^平成(元|0?[1-9]|[1-9]\d)年(0?[1-9]|1[0-2])月(0?[1-9]|[12]\d|3[01])日$/;
  const m = str.match(regexp);
  if (m && m.length === 4) {
    const year = (m[1] === '元' ? 1 : parseInt(m[1], 10)) + 1988;
    return new Date(year, parseInt(m[2], 10) - 1, parseInt(m[3], 10));
  }
  return null;
};

export default { parse };
