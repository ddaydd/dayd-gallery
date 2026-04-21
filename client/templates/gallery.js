Template.daydGallery.onCreated(function() {
  Session.set('folderIds', []);
});

Template.daydGallery.helpers({

  usersGalerie: function() {
    return Meteor.users.find({"profile.galerie": true});
  },

  media: function() {
    const user = this;
    if(!Session.get('dayd_gallery_user_folder_' + user._id))
      Meteor.call('findOneMediaGallery', {query: {userId: user._id}}, function(err, media) {
        if(!err) {
          Session.set('dayd_gallery_user_folder_' + user._id, media);
          Meteor.subscribe('daydGalleryMediasOne', media._id);
        }
        else console.log(err);
      });
    return Session.get('dayd_gallery_user_folder_' + user._id);
    // const g = DaydGallery.findOne({"createdBy._id": this._id, type: {$ne: 'folder'}});
    // if(g) return DaydGalleryMedias.findOne(g.media_id);
  },

  hasGalerie: function() {
    const u = Meteor.user();
    if(!u) return true;
    return u.profile && u.profile.galerie;
  },

  nbCommentaires: function() {
    const that = this;
    Meteor.call('nbCommentaires', 'media', this._id, function(err, res) {
      Session.set('nbc' + 'media' + that._id, res);
    });
    return Session.get('nbc' + 'media' + this._id);
  },

});

Template.daydGallery.events({

  'click .enableGalerie': function() {
    Meteor.call('activateStatusMyGalerie', true, function(err, res) {
    });
  },
});
