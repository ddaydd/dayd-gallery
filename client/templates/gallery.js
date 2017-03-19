Template.daydGallery.onCreated(function() {
  this.subscribe('daydGallery');
});

Template.daydGallery.helpers({

  'usersGalerie': function() {
    return Meteor.users.find({"settings.galerie": true});
  },

  'media': function() {
    var g = DaydGallery.findOne({"user._id": this._id, type: {$ne: 'folder'}});
    if(g)
      return Medias.findOne(g.media_id);
  },

  'hasNotGalerie': function() {
    if(!Meteor.userId())
      return false;

    return !Meteor.user().settings || !Meteor.user().settings.galerie;
  }

});

Template.daydGallery.events({

  'click .enableGalerie': function() {
    Meteor.call('activateStatusMyGalerie', true, function(err, res) {
    });
  }
});
