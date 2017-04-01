import { FilesCollection } from 'meteor/ostrio:files';

DaydGallery = new Meteor.Collection('dayd_gallery');

const createThumb = function(fileObj, readStream, writeStream) {
  gm(readStream, fileObj.name())
    .resize('150', '150', '^')
    .gravity('Center')
    .crop('150', '150')
    .repage(150, 150, 0, 0)
    .stream().pipe(writeStream);
};

DaydGalleryMedias = new FilesCollection({
  storagePath: '/opt/dayd_gallery2',
  collectionName: 'dayd_gallery_medias',
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload: function (file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size <= 10485760 && /png|jpg|jpeg/i.test(file.extension)) {
      return true;
    } else {
      return 'Please upload image, with size equal or less than 10MB';
    }
  }
});

// if (Meteor.isClient) {
//   console.log('yo');
//   Meteor.subscribe('files.images.all');
// }

// if (Meteor.isServer) {
//   Meteor.publish(null, function () {
//     return DaydGalleryMedias.find({});
//   });
// }


// DaydGalleryMedias.allow({
//   insert: function(userId, docs, fields, modifier) {
//     /* // FIXME: user and doc checks ,
//      return true to allow update */
//
//     return userId;
//   },
//   update: function(userId, docs, fields, modifier) {
//     /* // FIXME: user and doc checks ,
//      return true to allow update */
//     return userId
//   },
//   remove: function(userId, docs, fields, modifier) {
//     return userId
//   },
//   download: function(userId, docs, fields, modifier) {
//     return true;
//   }
// });