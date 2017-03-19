Template.daydGalleryUser.onCreated(function() {
  Session.set('galerie-edit', '');

  this.subscribe('daydGalleryUser', this.data.username)
});

Template.daydGalleryUser.onRendered(function() {

  $('#images').viewer({url: 'data-original'});
  this.autorun(function() {
    var change = Router.current().originalUrl;
    $('#images').viewer('destroy');
    setTimeout(function() {
      $('#images').viewer({url: 'data-original'});
    }, 200);
  })
});

Template.daydGalleryUser.helpers({

  hasNotGalerie: function() {
    if(!Meteor.userId())
      return false;

    return !Meteor.user().settings || !Meteor.user().settings.galerie;
  },

  membre: function() {
    return Meteor.users.findOne({"username": this.username});
  },

  medias: function() {
    var search = {type: {$ne: 'folder'}, "user.username": this.username, folder_id: ''};
    if(this.folder) {
      var folder = DaydGallery.findOne({type: 'folder', "user.username": this.username, name: this.folder});
      search.folder_id = folder._id;
    }
    return DaydGallery.find(search);
  },

  withFolders: function() {
    return !this.folder
  },

  'folders': function() {
    return DaydGallery.find({type: 'folder', "user.username": this.username});
  },

  isMyGallery: function() {
    if(!Meteor.user)
      return false;

    if(isAdmin())
      return true;

    return this.username === Meteor.user().username;
  }

});

Template.daydGalleryUser.events({

  'click .galerie-edit': function() {
    Session.set('galerie-edit', !Session.get('galerie-edit'));
  },

  'submit #createFolder': function(e, tpl) {
    e.preventDefault();

    var form = tpl.$('form#createFolder').serializeJSON();

    var user = Meteor.user();
    form.user = {
      _id: user._id,
      username: user.username
    };

    Meteor.call('createGalerieFolder', form, function(err) {

    });
  },

  'submit #upload': function(e, tpl) {
    e.preventDefault();

    var folder = DaydGallery.findOne({type: 'folder', "user.username": this.username, name: this.folder});
    var folder_id = '';
    if(folder)
      folder_id = folder._id;

    var files = $('#addImage')[0].files;

    var user = {}
    if(isAdmin()) {
      var u = Meteor.users.findOne({username: this.username});
      if(!u) return;
      user._id = u._id;
      user.username = u.username;
    }
    else {
      user._id = Meteor.user()._id;
      user.username = Meteor.user().username;
    }

    for(var i = 0, ln = files.length; i < ln; i++) {
      Medias.insert(files[i], function(err, fileObj) {
        if(err)
          console.log(err)
        else {
          var media = {
            folder_id: folder_id,
            name: fileObj.original.name,
            user: user,
            media_id: fileObj._id
          };

          Meteor.call('createGalerieMedias', media, function(err) {
            if(err) {
              console.log(err)
            }
            else {
              $('form')[0].reset();
            }
          });
        }
      });
    }
  },

  'click .deleteMedia': function(e, tpl) {
    e.preventDefault();

    Meteor.call('deleteGalerieMedias', this, function(err, res) {

    });
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
