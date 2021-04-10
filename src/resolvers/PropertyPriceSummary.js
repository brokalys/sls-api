import numbers from 'numbers';

export default {
  count: (prices) => prices.length,
  min: (prices) => parseInt(numbers.basic.min(prices), 10) || null,
  max: (prices) => parseInt(numbers.basic.max(prices), 10) || null,
  mean: (prices) => parseInt(numbers.statistic.mean(prices), 10) || null,
  median: (prices) => parseInt(numbers.statistic.median(prices), 10) || null,
  mode: (prices) => parseInt(numbers.statistic.mode(prices), 10) || null,
  standardDev: (prices) =>
    parseInt(numbers.statistic.standardDev(prices), 10) || null,
};
