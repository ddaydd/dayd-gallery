// daydGalleryUser
Template.daydGalleryEdit.onCreated(function() {
  this.currentUpload = new ReactiveVar(false);
});

Template.daydGalleryEdit.helpers({

  withFolders: function() {
    return !this.folderId
  },

  currentUpload: function() {
    return Template.instance().currentUpload.get();
  }

});

Template.daydGalleryEdit.events({

  'submit #createFolder': function(e, tpl) {
    e.preventDefault();

    let form = tpl.$('form#createFolder').serializeJSON();

    const u = Meteor.user();
    form.createdBy = {
      _id: u._id,
      username: u.username
    };
    form.createdAt = new Date();

    Meteor.call('createGalerieFolder', form, function(err) {
      if(err) console.error(err);
    });
  },

  'change #fileInput': function(e, template) {
    if(e.currentTarget.files && e.currentTarget.files[0]) {
      const upload = DaydGalleryMedias.insert({
        file: e.currentTarget.files[0],
        streams: 'dynamic',
        chunkSize: 'dynamic'
      }, false);

      upload.on('start', function() {
        template.currentUpload.set(this);
      });

      const user = {
        _id: this.userId,
        username: Dayd.core.getUsername(this.userId)
      };

      const that = this;
      upload.on('end', function(error, fileObj) {
        if(error) {
          alert('Error during upload: ' + error);
        } else {
          console.log('File "' + fileObj.name + '" successfully uploaded');

          const media = {
            folder_id: that.folderId,
            name: fileObj.name,
            createdBy: user,
            media_id: fileObj._id,
            createdAt: new Date()
          };
          Meteor.call('createGalerieMedias', media, function(err) {
            if(err) console.error(err);
            // else $('form#upload')[0].reset();
          });
        }
        template.currentUpload.set(false);
      });

      upload.start();
    }
  }

});