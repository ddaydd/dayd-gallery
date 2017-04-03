const bound = Meteor.bindEnvironment(function(callback) {
  return callback();
});

const fs = Npm.require('fs-extra');
const gm = Npm.require('gm');

createThumbnails = (collection, fileRef, cb) => {
  // check(fileRef, Object);

  let isLast = false;
  const finish = (error) => {
    bound(() => {
      if(error) {
        console.error('[_app.createThumbnails] [finish]', error);
        cb && cb(void 0, error);
      } else {
        if(isLast) {
          cb && cb(fileRef);
        }
      }
      return true;
    });
  };

  fs.exists(fileRef.path, (exists) => {
    bound(() => {
      if(!exists) throw new Meteor.Error('File ' + fileRef.path + ' not found in [createThumbnails] Method');
      const image = gm(fileRef.path);
      const sizes = {
        preview: {
          width: 150,
          square: true
        },
        thumbnail40: {
          width: 40,
          square: true
        }
      };

      image.size(function(error, features) {
        bound(() => {
          if(error) {
            console.error('[_app.createThumbnails] [_.each sizes]');
            console.error(error);
            return finish(Meteor.Error('[_app.createThumbnails] [_.each sizes]', error));
          }

          let i = 0;
          collection.collection.update(fileRef._id, {
            $set: {
              'meta.width': features.width,
              'meta.height': features.height
            }
          });

          _.each(sizes, (size, name) => {
            const path = (collection.storagePath(fileRef)) + '/' + name + '-' + fileRef._id + '.' + fileRef.extension;
            const copyPaste = () => {
              fs.copy(fileRef.path, path, (fsCopyError) => {
                bound(() => {
                  if(fsCopyError) {
                    console.error('[_app.createThumbnails] [_.each sizes] [fs.copy]', fsCopyError);
                    return finish(fsCopyError);
                  }

                  const upd = {$set: {}};
                  upd['$set']['versions.' + name] = {
                    path: path,
                    size: fileRef.size,
                    type: fileRef.type,
                    extension: fileRef.extension,
                    meta: {
                      width: features.width,
                      height: features.height
                    }
                  };
                  collection.collection.update(fileRef._id, upd, (colUpdError) => {
                    ++i;
                    if(i === Object.keys(sizes).length) {
                      isLast = true;
                    }
                    finish(colUpdError);
                  });
                });
              });
            };

            if(/gif|png|jpe?g/i.test(fileRef.extension)) {
              const img = gm(fileRef.path)
                .define('filter:support=2')
                .define('jpeg:fancy-upsampling=false')
                .define('jpeg:fancy-upsampling=off')
                .define('png:compression-filter=5')
                .define('png:compression-level=9')
                .define('png:compression-strategy=1')
                .define('png:exclude-chunk=all')
                .autoOrient()
                .noProfile()
                .strip()
                .dither(false)
                .filter('Triangle');

              const updateAndSave = (upNSaveError) => {
                bound(() => {
                  if(upNSaveError) {
                    console.error('[_app.createThumbnails] [_.each sizes] [img.resize]', upNSaveError);
                    return finish(upNSaveError);
                  }
                  fs.stat(path, (fsStatError, stat) => {
                    if(fsStatError) {
                      console.error('[_app.createThumbnails] [_.each sizes] [img.resize] [fs.stat]', fsStatError);
                      return finish(fsStatError);
                    }
                    bound(() => {
                      gm(path).size((gmSizeError, imgInfo) => {
                        bound(() => {
                          if(gmSizeError) {
                            console.error('[_app.createThumbnails] [_.each sizes] [img.resize] [fs.stat] [gm(path).size]', gmSizeError);
                            return finish(gmSizeError);
                          }
                          const upd = {$set: {}};
                          upd['$set']['versions.' + name] = {
                            path: path,
                            size: stat.size,
                            type: fileRef.type,
                            extension: fileRef.extension,
                            meta: {
                              width: imgInfo.width,
                              height: imgInfo.height
                            }
                          };

                          collection.collection.update(fileRef._id, upd, (colUpdError) => {
                            ++i;
                            if(i === Object.keys(sizes).length) {
                              isLast = true;
                            }
                            finish(colUpdError);
                          });
                        });
                      });
                    });
                  });
                });
              };

              if(!size.square) {
                if(features.width > size.width) {
                  img.resize(size.width).interlace('Line').write(path, updateAndSave);
                } else {
                  copyPaste();
                }
              } else {
                const x = size.width;
                img.resize(x, x, '^')
                  .gravity('Center')
                  .crop(x, x)
                  .repage(x, x, 0, 0).write(path, updateAndSave);
              }
            } else {
              copyPaste();
            }
          });
        });
      });
    });
  });
  return true;
};
