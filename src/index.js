const AWS = require('aws-sdk');
const gm = require('gm').subClass({ imageMagick: true });
const util = require('util');

const s3 = new AWS.S3();

const contentTypes = {
  'image/png': 'png',
  'image/jpeg': 'jpeg'
};

const resizeImage = (maxHeight, maxWidth, image) => {
  return new Promise((resolve, reject) => {
    gm(image.Body).size((err, size) => {
      var scalingFactor = Math.min(
        maxWidth / size.width,
        maxHeight / size.height
      );

      var width = scalingFactor * size.width;
      var height = scalingFactor * size.height;

      const params = {
        width,
        height,
        customArgs: ['-define', 'jpeg:extent=500kb']
      };

      gm(image.Body)
        .resize(width, height)
        .toBuffer(contentTypes[image.ContentType], (err, buffer) => {
          if (err) {
            reject(err);
          } else {
            resolve(buffer);
          }
        });
    });
  });
};

const uploadThumbnail = (srcKey, data) => {
  const Bucket = `erica-charlie-pics-thumbnails`;
  const Key = `thumbnail-${srcKey}`;
  const ContentType = data.ContentType;

  resizeImage(200, 200, data)
    .then(buffer => uploadImage(Bucket, Key, buffer, ContentType))
    .catch(err => {
      console.log(`error resizing image: ${err}`);
    })
    .then(() => console.log('thumbnail upload successful'))
    .catch(err => console.log(`error uploading thumbnail: ${err}`));
};

const uploadSlideshowSized = (srcKey, data) => {
  const Bucket = `erica-charlie-pics-slideshow`;
  const Key = `slideshow-${srcKey}`;
  const ContentType = data.ContentType;

  resizeImage(400, 400, data)
    .then(buffer => uploadImage(Bucket, Key, buffer, ContentType))
    .catch(err => {
      console.log(`error resizing image: ${err}`);
    })
    .then(() => console.log('slideshow upload successful'))
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
        console.log(`RESPONSE: ${util.inspect(response, { depth: 5 })}`);
        resolve(response);
      }
    });
  });
};

const uploadImage = (Bucket, Key, buffer, ContentType) => {
  const params = {
    Bucket,
    Key,
    Body: buffer,
    ACL: 'public-read',
    ContentType: ContentType
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
  const srcKey = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, ' ')
  );
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
