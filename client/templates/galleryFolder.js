/**
 * Created by Dayd on 05/04/2016.
 */

Template.daydGalleryFolder.onCreated(function() {
  Session.set('folderIds', []);
});

Template.daydGalleryFolder.helpers({

  'mediaFolder': function() {
    var g = DaydGallery.findOne({folder_id: this._id});
    if(g) {
      var folderIds = Session.get('folderIds');
      if(folderIds.indexOf(g.media_id) === -1) {
        folderIds.push(g.media_id);
        Session.set('folderIds', folderIds);
      }
      return DaydGalleryMedias.findOne(g.media_id);
    }
  }

});

Template.daydGalleryFolder.events({

  'click .deleteMedia': function(e, tpl) {
    e.preventDefault();
    Meteor.call('deleteGalerieMedias', this, function(err, res) {
    });
  }

});