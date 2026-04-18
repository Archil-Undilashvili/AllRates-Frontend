const fs = require('fs');
const js = fs.readFileSync('/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js', 'utf8');

console.log(js.includes('best-dot'));
const match = js.match(/let buyDisplay = isNaN\(buy\) \?.*?buy\.toFixed\(.*?\);/g);
console.log(match);
