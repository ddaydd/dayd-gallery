if(typeof (Dayd) === 'undefined') Dayd = {};

Template.daydGalleryUser.onCreated(function() {
  Session.set('galerie-edit', '');

  this.subscribe('daydGalleryUser', this.data.username);
});

Template.daydGalleryUser.onRendered(function() {
  let instance = this;
  instance.autorun(function() {
    const cr = Router.current(); // pour la réactivité et l'image affiché
    if(Template.instance().subscriptionsReady()) {
      Tracker.afterFlush(function() { // #each dom ready
        // Call Gridder
        $('.gridder-show').remove();
        const $gridder = $('.gridder');
        $gridder.gridderExpander({
          scroll: true,
          scrollOffset: 30,
          scrollTo: "listitem", // panel or listitem
          animationSpeed: 400,
          animationEasing: "easeInOutExpo",
          showNav: false, // Show Navigation
          nextText: "", // Next button text
          prevText: "", // Previous button text
          closeText: "", // Close button text
          onStart: function() {
            //Gridder Inititialized
            if(cr.params.query.imgId) {
              Meteor.setTimeout(function() {
                $('[data-griddercontent="#gridder_' + cr.params.query.imgId + '"]').trigger("click");
              }, 100);
            }
          },
          onContent: function() {
            //Gridder Content Loaded
          },
          onClosed: function() {
            //Gridder Closed
          }
        });
      });
    }
  })
});

Template.daydGalleryUser.onDestroyed(function() {

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