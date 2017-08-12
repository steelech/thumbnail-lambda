const AWS = require('aws-sdk');
// const gm = require('gm').subClass({ imageMagick: true });
const util = require('util');

exports.handler = (event, context, callback) => {
  console.log(
    'Reading options from event:\n',
    util.inspect(event, { depth: 5 })
  );
  const srcBucket = event.Records[0].s3.bucket.name;
  const srcKey = event.Records[0].s3.object.key;

  console.log(`srcBucket: ${srcBucket}`);
  console.log(`srcKey: ${srcKey}`);

  callback(null, 'Hello from Lambda');
};
