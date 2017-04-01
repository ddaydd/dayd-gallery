DaydGallery = new Meteor.Collection('dayd_gallery');

const createThumb = function(fileObj, readStream, writeStream) {
  gm(readStream, fileObj.name())
    .resize('150', '150', '^')
    .gravity('Center')
    .crop('150', '150')
    .repage(150, 150, 0, 0)
    .stream().pipe(writeStream);
};

DaydGalleryMedias = new FS.Collection("dayd_gallery_medias", {
  stores: [
    new FS.Store.FileSystem("daydGalleryMedias", {path: "/opt/dayd_gallery/medias"}),
    new FS.Store.FileSystem("daydGalleryMediasTn", {transformWrite: createThumb, path: "/opt/dayd_gallery/tn"})
  ]
});

DaydGalleryMedias.allow({
  insert: function(userId, docs, fields, modifier) {
    /* // FIXME: user and doc checks ,
     return true to allow update */

    return userId;
  },
  update: function(userId, docs, fields, modifier) {
    /* // FIXME: user and doc checks ,
     return true to allow update */
    return userId
  },
  remove: function(userId, docs, fields, modifier) {
    return userId
  },
  download: function(userId, docs, fields, modifier) {
    return true;
  }
});