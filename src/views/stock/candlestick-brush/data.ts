export type StockPoint = [string, number, number, number, number, number];

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function generateMockStockData() {
  const startDate = new Date("2016-01-04T00:00:00");
  const result: StockPoint[] = [];
  let currentPrice = 18250;
  let dayOffset = 0;

  while (result.length < 260) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + dayOffset);
    dayOffset += 1;

    const weekDay = currentDate.getDay();
    if (weekDay === 0 || weekDay === 6) continue;

    const trend = Math.sin(result.length / 11) * 140;
    const noise = Math.cos(result.length / 5) * 45;
    const drift = Math.sin(result.length / 23) * 18;
    const open = +(currentPrice + noise * 0.35).toFixed(2);
    const close = +(open + trend * 0.08 + drift).toFixed(2);
    const low = +(Math.min(open, close) - 45 - Math.abs(noise) * 0.25).toFixed(2);
    const high = +(Math.max(open, close) + 45 + Math.abs(trend) * 0.06).toFixed(2);
    const volume = Math.round(
      120000000 +
        Math.abs(trend) * 320000 +
        Math.abs(noise) * 180000 +
        (result.length % 7) * 3500000
    );

    result.push([formatDate(currentDate), open, close, low, high, volume]);
    currentPrice = close;
  }

  return result;
}

export const mockStockData = generateMockStockData();
