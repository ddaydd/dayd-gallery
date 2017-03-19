/**
 * Created by Dayd on 05/04/2016.
 */

Template.daydGalleryUserCase.onCreated(function() {
  Session.set('folderIds', []);
});

Template.daydGalleryUserCase.helpers({

  media: function() {
    var g = DaydGallery.findOne({"user._id": this._id, type: {$ne: 'folder'}});
    if(g) {
      var folderIds = Session.get('folderIds');
      if(folderIds.indexOf(g.media_id) === -1) {
        folderIds.push(g.media_id);
        Session.set('folderIds', folderIds);
      }
      return Medias.findOne(g.media_id);
    }
  },

  nbCommentaires: function() {
    var that = this;
    Meteor.call('nbCommentaires', 'media', this._id, function(err, res) {
      Session.set('nbc' + 'media' + that._id, res);
    });
    return Session.get('nbc' + 'media' + this._id);
  }

});

Template.daydGalleryUserCaseFolder.onCreated(function() {
  Session.set('folderIds', []);
});

Template.daydGalleryUserCaseFolder.helpers({

  'mediaFolder': function() {
    var g = DaydGallery.findOne({folder_id: this._id});
    if(g) {
      var folderIds = Session.get('folderIds');
      if(folderIds.indexOf(g.media_id) === -1) {
        folderIds.push(g.media_id);
        Session.set('folderIds', folderIds);
      }
      return Medias.findOne(g.media_id);
    }
  }

});

Template.daydGalleryUserCaseMedia.helpers({

  media: function() {
    return Medias.findOne(this.media_id);
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
    console.log(this);
    var t = DaydGallery.find({type: 'folder', "user._id": this.user._id});
    console.log(t.fetch());
    return t
  },

});

Template.daydGalleryUserCaseMedia.events({

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
