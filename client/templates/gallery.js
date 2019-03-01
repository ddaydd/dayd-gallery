Template.daydGallery.onCreated(function() {
  this.subscribe('daydGallery');
  Session.set('folderIds', []);
});

Template.daydGallery.helpers({

  usersGalerie: function() {
    return Meteor.users.find({"profile.galerie": true});
  },

  media: function() {
    const g = DaydGallery.findOne({"createdBy._id": this._id, type: {$ne: 'folder'}});
    if(g) return DaydGalleryMedias.findOne(g.media_id);
  },

  hasGalerie: function() {
    const u = Meteor.user();
    if(!u) return true;
    return u.profile && u.profile.galerie;
  },

  // media: function() {
  //   var g = DaydGallery.findOne({"user._id": this._id, type: {$ne: 'folder'}});
  //   if(g) {
  //     var folderIds = Session.get('folderIds');
  //     if(folderIds.indexOf(g.media_id) === -1) {
  //       folderIds.push(g.media_id);
  //       Session.set('folderIds', folderIds);
  //     }
  //     return DaydGalleryMedias.findOne(g.media_id);
  //   }
  // },

  nbCommentaires: function() {
    const that = this;
    Meteor.call('nbCommentaires', 'media', this._id, function(err, res) {
      Session.set('nbc' + 'media' + that._id, res);
    });
    return Session.get('nbc' + 'media' + this._id);
  }

});

Template.daydGallery.events({

  'click .enableGalerie': function() {
    Meteor.call('activateStatusMyGalerie', true, function(err, res) {
    });
  }
});
