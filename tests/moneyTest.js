import { formatCurrency } from '../scripts/utils/money.js';

console.log('test suite: formatCurrency');

if (formatCurrency(2095) === '20.95') {
  console.log('Case 2095', 'passed');
} else {
  console.log('Case 2095', 'failed!');
}

if (formatCurrency(0) === '0.00') {
  console.log('Case 0', 'passed');
} else {
  console.log('Case 0', 'failed!');
}

if (formatCurrency(2000.5) === '20.01') {
  console.log('Case 2000.5', 'passed');
} else {
  console.log('Case 2000.5', 'failed!');
}
