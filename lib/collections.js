import {FilesCollection} from 'meteor/ostrio:files';

DaydGallery = new Meteor.Collection('dayd_gallery');

DaydGalleryMedias = new FilesCollection({
  storagePath: '/opt/dayd_gallery',
  collectionName: 'dayd_gallery_medias',
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload: function(file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if(file.size <= 10485760 && /mp4|gif|png|jpg|jpeg/i.test(file.extension)) {
      return true;
    } else {
      return 'Please upload image, with size equal or less than 10MB && mp4|gif|png|jpg|jpeg format';
    }
  }
});

if(Meteor.isServer) {
  DaydGalleryMedias.denyClient();
  DaydGalleryMedias.on('afterUpload', function(fileRef) {

    if(/gif|png|jpe?g/i.test(fileRef.extension || '')) {
      Dayd.createThumbnails(this, fileRef, (fileRef, error) => {
        if(error) console.error(error);
      });
    }
  });
}