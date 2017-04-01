/**
 * Created by Dayd on 05/04/2016.
 */

Template.daydGalleryMedia.helpers({

  media: function() {
    return DaydGalleryMedias.findOne(this.media_id);
  },

  nbCommentaires: function() {
    var that = this;
    Meteor.call('nbCommentaires', 'media', this._id, function(err, res) {
      Session.set('nbc' + 'media' + that._id, res);
    });
    var nb = Session.get('nbc' + 'media' + this._id)
    return nb ? nb : '.';
  },

  isCommentsShowed: function() {
    return Session.get('comment-showed') === this._id ? 'comment-active' : '';
  },

  folders: function() {
    return DaydGallery.find({type: 'folder', "user._id": this.user._id});
  },

});

Template.daydGalleryMedia.events({

  'click .comment-all': function(e, tpl) {
    return false;
  },

  'click .comment': function(e, tpl) {
    if(Session.get('comment-showed') === this._id)
      Session.set('comment-showed', '');
    else
      Session.set('comment-showed', this._id)
  },

  'change [name=moveMedia]': function(e, tpl) {
    e.preventDefault();

    var folder_id = $(e.currentTarget).val();
    if(folder_id === "select") return;
    Meteor.call('moveGalerieMedias', this, folder_id, function(err, res) {
    });
  },

  'click .deleteMedia': function(e, tpl) {
    e.preventDefault();
    Meteor.call('deleteGalerieMedias', this, function(err, res) {
    });
  },
});
