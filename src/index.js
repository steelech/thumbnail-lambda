const AWS = require('aws-sdk');
// const gm = require('gm').subClass({ imageMagick: true });
const util = require('util');

const s3 = new AWS.S3();

const uploadThumbnail = (srcKey, data) => {
  const Bucket = `erica-charlie-pics-thumbnails`;
  const Key = `thumbnail-${srcKey}`;

  uploadImage(Bucket, Key, data)
    .then(() => console.log('thumbnail upload successful'))
    .catch(err => console.log(`error uploading thumbnail: ${err}`));
};

const uploadSlideshowSized = (srcKey, data) => {
  const Bucket = `erica-charlie-pics-slideshow`;
  const Key = `slideshow-${srcKey}`;

  uploadImage(Bucket, Key, data)
    .then(() => console.log('slidshow upload successful'))
    .catch(err => console.log(`error uploading slideshow: ${err}`));
};

const downloadImage = (Bucket, Key) => {
  // download the image from S3
  var params = {
    Bucket,
    Key
  };
  return new Promise((resolve, reject) => {
    s3.getObject(params, (err, response) => {
      if (err) {
        console.log('ERROR: ', err);
        reject(err);
      } else {
        resolve(response);
      }
    });
  });
};

const uploadImage = (Bucket, Key, response) => {
  const params = {
    Bucket,
    Key,
    Body: response.Body,
    ACL: 'public-read',
    ContentType: response.ContentType
  };
  // upload the image to S3
  return new Promise((resolve, reject) => {
    s3.putObject(params, (perr, pres) => {
      if (perr) {
        reject(perr);
      } else {
        resolve();
      }
    });
  });
};

exports.handler = (event, context, callback) => {
  console.log(
    'Reading options from event:\n',
    util.inspect(event, { depth: 5 })
  );
  const srcBucket = event.Records[0].s3.bucket.name;
  const srcKey = event.Records[0].s3.object.key;
  const thumbnailDestBucket = `erica-charlie-pics-thumbnails`;
  const thumbnailDestKey = `thumbnail-${srcKey}`;

  console.log(`srcBucket: ${srcBucket}`);
  console.log(`srcKey: ${srcKey}`);
  downloadImage(srcBucket, srcKey)
    .then(response => {
      uploadThumbnail(srcKey, response);
      uploadSlideshowSized(srcKey, response);
    })
    .catch(error => {
      console.log('ERROR: ', error);
    });

  callback(null, 'Hello from Lambda');
};
