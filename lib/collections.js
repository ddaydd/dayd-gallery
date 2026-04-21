import { FilesCollection } from 'meteor/ostrio:files';

const DaydGallery = new Meteor.Collection('dayd_gallery');

const storagePathSettings = Meteor.settings?.obFiles?.storagePath;

const DaydGalleryMedias = new FilesCollection({
  storagePath: storagePathSettings || '/opt/dayd_gallery',
  collectionName: 'dayd_gallery_medias',
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload: function (file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size <= 10485760 && /mp4|gif|png|jpg|jpeg/i.test(file.extension)) {
      return true;
    }
    else {
      return 'Please upload image, with size equal or less than 10MB && mp4|gif|png|jpg|jpeg format';
    }
  },
});

if (Meteor.isServer) {
  DaydGalleryMedias.denyClient();
  DaydGalleryMedias.on('afterUpload', function (fileRef) {

    if (/gif|png|jpe?g/i.test(fileRef.extension || '')) {
      dfm.createThumbnails(this, fileRef).catch(error => {
        if (error) console.error(error);
      });
    }
  });
}

export { DaydGallery, DaydGalleryMedias };