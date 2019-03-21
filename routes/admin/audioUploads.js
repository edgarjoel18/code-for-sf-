var AWS = require('aws-sdk');



function uploadMusic(req, article, callback) {
  if (req.files && req.files.music) {
    const key = `audio/music/${uuid()}/original.${mime.extension(req.files.music.mimetype)}`;
    if (process.env.AWS_S3_BUCKET) {
      var s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_S3_BUCKET_REGION
      });
      if (article && article.pictureUrl && article.pictureUrl != '') {
        //// delete existing picture, if any
        s3.deleteObject({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: article.pictureUrl.substring(process.env.AWS_S3_BASE_URL.length + 1)
        }, function(err, data) {
          if (err) {
            console.log(err);
          }
        });
      }
      //// store in S3
      s3.putObject({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: req.files.music.data,
        ACL: 'public-read'
      }, function(err, data) {
        if (err) {
          console.log(err);
          callback();
        } else {
          callback(`${process.env.AWS_S3_BASE_URL}/${key}`);
        }
      });
    } else {
      if (article) {
        //// delete existing picture, if any
        if (article.pictureUrl && article.pictureUrl != '') {
          const dest = `${path.resolve(__dirname, '../../public')}${article.pictureUrl}`;
          rimraf(path.dirname(dest), function(err) {
            console.log(err);
          });
        }
      }
      //// store in local file system for development, in public
      const dest = `${path.resolve(__dirname, '../../public/uploads')}/${key}`;
      mkdirp.sync(path.dirname(dest));
      req.files.picture.mv(dest, function(err) {
        if (err) {
          console.log(err);
          callback();
        } else {
          callback(`/uploads/${key}`);
        }
      });
    }
  } else {
    callback();
  }
}

router.get('/new', function(req, res, next) {
  models.Category.all().then(function(categories) {
    res.render('admin/articles/new', {
      layout: 'admin/layout',
      title: 'New Article',
      article: models.Article.build(),
      categories: categories,
      moment: moment
    });
  });
});


//edit the upload to delete
router.get('/:id/edit', function(req, res, next){
  models.Category.all().then(function(categories) {
    models.Article.findById(req.params.id).then(function(article){
      res.render('admin/articles/edit', {
        layout: 'admin/layout',
        title: 'Edit Article',
        article: article,
        categories: categories,
        moment: moment
      });
    });
  });
});