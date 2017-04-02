/**
 * Created by Dayd on 05/04/2016.
 */

Template.daydGalleryFolder.onCreated(function() {
  Session.set('folderIds', []);
});

Template.daydGalleryFolder.helpers({

  // link: function(){
  //   console.log(this);
  //   console.log(this.link);
  //   console.log(this.link('preview'));
  //   return this.link('preview');
  // },

  mediaFolder: function() {
    const g = DaydGallery.findOne({folder_id: this._id});
    if(g) {
      let folderIds = Session.get('folderIds');
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