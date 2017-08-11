const moment = require('moment');

exports.handler = (event, context, callback) => {
  console.log('moment: ', moment().format('MMMM Do YYYY, h:mm:ss a'));
  console.log('finally');
  callback(null, 'Hello from Lambda');
};
