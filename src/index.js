const moment = require('moment');

exports.handler = (event, context, callback) => {
  console.log('moment: ', moment().format('MMMM Do YYYY, h:mm:ss a'));
  console.log('I finally figured it out ');
  callback(null, 'Hello from Lambda');
};
