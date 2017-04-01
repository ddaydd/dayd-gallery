Template.daydGalleryUser.onCreated(function() {
  Session.set('galerie-edit', '');

  this.subscribe('daydGalleryUser', this.data.username);
});

Template.daydGalleryUser.onRendered(function() {

  $('#images').viewer({url: 'data-original'});
  this.autorun(function() {
    let change = Router.current().originalUrl;
    $('#images').viewer('destroy');
    setTimeout(function() {
      $('#images').viewer({url: 'data-original'});
    }, 200);
  })
});

Template.daydGalleryUser.helpers({

  hasNotGalerie: function() {
    if(!Meteor.userId()) return false;
    return !Meteor.user().settings || !Meteor.user().settings.galerie;
  },

  medias: function() {
    let search = {type: {$ne: 'folder'}, "user._id": this.userId, folder_id: {$in: [null, '']}};
    if(this.folderId) search.folder_id = this.folderId;
    return DaydGallery.find(search);
  },

  withFolders: function() {
    return !this.folderId
  },

  folderName: function() {
    const g = DaydGallery.findOne(this.folderId);
    return g ? g.name : '';
  },

  folders: function() {
    return DaydGallery.find({type: 'folder', "user._id": this.userId});
  },

  isMyGallery: function() {
    if(!Meteor.user()) return false;
    if(Dayd.isAdmin()) return true;
    return this.username === Meteor.user().username;
  }

});

Template.daydGalleryUser.events({

  'click .galerie-edit': function() {
    Session.set('galerie-edit', !Session.get('galerie-edit'));
  },

  'submit #createFolder': function(e, tpl) {
    e.preventDefault();

    let form = tpl.$('form#createFolder').serializeJSON();

    const u = Meteor.user();
    form.user = {
      _id: u._id,
      username: u.username
    };

    Meteor.call('createGalerieFolder', form, function(err) {

    });
  },

  'submit #upload': function(e, tpl) {
    e.preventDefault();

    const files = $('#addImage')[0].files;
    let user = {};
    if(Dayd.isAdmin()) {
      const u = Meteor.users.findOne({username: this.username});
      if(!u) return;
      user._id = u._id;
      user.username = u.username;
    }
    else {
      user._id = Meteor.user()._id;
      user.username = Dayd.getUsername(Meteor.userId());
    }

    const that = this;
    for(let i = 0, ln = files.length; i < ln; i++) {
      DaydGalleryMedias.insert(files[i], function(err, fileObj) {
        if(err) console.log(err);
        else {
          const media = {
            folder_id: that.folderId,
            name: fileObj.original.name,
            user: user,
            media_id: fileObj._id
          };
          Meteor.call('createGalerieMedias', media, function(err) {
            if(err) console.log(err);
            else $('form#upload')[0].reset();
          });
        }
      });
    }
  },

  'click .disableGalerie': function() {
    Meteor.call('activateStatusMyGalerie', false, function(err, res) {
    });
  },

  'click .enableGalerie': function() {
    Meteor.call('activateStatusMyGalerie', true, function(err, res) {
    });
  }
});

// daydGalleryUser
Template.daydGalleryUser.onCreated(function() {
  this.currentUpload = new ReactiveVar(false);
});

Template.daydGalleryUser.helpers({
  currentUpload: function() {
    return Template.instance().currentUpload.get();
  }
});

Template.daydGalleryUser.events({
  'change #fileInput': function(e, template) {
    if(e.currentTarget.files && e.currentTarget.files[0]) {
      // We upload only one file, in case
      // multiple files were selected
      var upload = DaydGalleryMedias.insert({
        file: e.currentTarget.files[0],
        streams: 'dynamic',
        chunkSize: 'dynamic'
      }, false);

      upload.on('start', function() {
        template.currentUpload.set(this);
      });

      const user = {
        _id: this.userId,
        username: Dayd.getUsername(this.userId)
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
            user: user,
            media_id: fileObj._id
          };
          Meteor.call('createGalerieMedias', media, function(err) {
            if(err) console.log(err);
            // else $('form#upload')[0].reset();
          });
        }
        template.currentUpload.set(false);
      });

      upload.start();
    }
  }
});