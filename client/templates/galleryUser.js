if(typeof(Dayd) === 'undefined') Dayd = {};

Template.daydGalleryUser.onCreated(function() {
  Session.set('galerie-edit', '');

  this.subscribe('daydGalleryUser', this.data.username);
});

Template.daydGalleryUser.onRendered(function() {
  let instance = this;
  instance.autorun(function() {
    Router.current().originalUrl; // pour la réactivité
    if(Template.instance().subscriptionsReady())
      Tracker.afterFlush(function() { // #each dom ready
        Dayd.viewer = new Viewer(document.getElementById('images'), {url: 'data-original'});
      });
  })
});

Template.daydGalleryUser.helpers({

  pageGalleryUserId: function() {
    const u = this.userId ? this.userId : '';
    const f = this.folderId ? this.folderId : '';
    return 'daydGallery_' + u + '_' + f;
  },

  hasGalerie: function() {
    const u = Meteor.user();
    if(!u) return false;
    return u.profile && u.profile.galerie;
  },

  medias: function() {
    let search = {type: {$ne: 'folder'}, "createdBy._id": this.userId, folder_id: {$in: [null, '']}};
    if(this.folderId) search.folder_id = this.folderId;
    return DaydGallery.find(search, {sort: {createdAt: '-1'}});
  },

  withFolders: function() {
    return !this.folderId
  },

  folderName: function() {
    const g = DaydGallery.findOne(this.folderId);
    return g ? g.name : '';
  },

  folders: function() {
    return DaydGallery.find({type: 'folder', "createdBy._id": this.userId});
  },

  isMyGallery: function() {
    if(!Meteor.user()) return false;
    // if(Dayd.core.isAdmin()) return true;
    return this.userId === Meteor.userId();
  }

});

Template.daydGalleryUser.events({

  'click .galerie-edit': function() {
    Session.set('galerie-edit', !Session.get('galerie-edit'));
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