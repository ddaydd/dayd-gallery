/**
 * Created by dayd on 23 aout 2015
 */

Meteor.methods({

  galerieCreate: function(obj) {
// temporaire

    if(obj.date) obj.created = new Date(obj.date * 1000);

    var u = Meteor.users.findOne({"profile.bio.id": obj.id_pseudo});
    var user;
    if(u) {
      user = {_id: u._id, username: u.username};

      DaydGallery.insert({
        user: user,
        folder_id: obj.dossier,
        backup: obj
      });

      console.log(u.username)
      Meteor.users.update(u._id, {
        $set: {
          'settings.galerie': true
        }
      });

      console.log('galerie insert')
    }
  },

  mediabackCreate: function(obj) {
// temporaire


    MediaBack.insert(obj);

    console.log('mediabackCreate insert')

  },


  majj: function() {
    var galeries = DaydGallery.find().fetch();
    _.each(galeries, function(galerie) {
      if(galerie.foldername) {
        var media = MediaBack.findOne({id: galerie.backup.media_id});
        if(media)
          DaydGallery.update(galerie._id, {$set: {name: media.real_name}});
        if(galerie.foldername && !DaydGallery.findOne({type: 'folder', name: galerie.foldername}))
          DaydGallery.insert({type: 'folder', name: galerie.foldername, user: galerie.user});
      }
      else if(galerie.type != 'folder') {
        if(galerie.backup) {
          var media = MediaBack.findOne({id: galerie.backup.media_id});
          if(media) {
            DaydGallery.update(galerie._id, {$set: {name: media.real_name}});
          }

        }
      }
    })
  },

  linkk: function() {
    var galeries = DaydGallery.find().fetch();
    _.each(galeries, function(galerie) {
      if(galerie.type != 'folder') {
        if(galerie.name) {
          console.log(galerie.name)
          var media = DaydGalleryMedias.findOne({"original.name": galerie.name});
          if(media) {
            console.log(media)
            DaydGallery.update(galerie._id, {$set: {media_id: media._id}});
          }
          else
            console.log('not')

        }
      }
    })
    return true;
  },

  createGalerieMedias: function(media) {
    DaydGallery.insert(media);
  },

  moveGalerieMedias: function(media, folder_id) {
    if(!Meteor.userId()) return false;

    if(media.createdBy._id === Meteor.userId() || Dayd.isAdmin())
      DaydGallery.update(media._id, {$set: {folder_id: folder_id}});
  },

  deleteGalerieMedias: function(media) {
    if(!Meteor.userId()) return false;

    if(media.createdBy._id === Meteor.userId() || Dayd.isAdmin())
      DaydGallery.remove(media._id);
  },

  createGalerieFolder: function(folder) {
    DaydGallery.insert(folder);
  },

  activateStatusMyGalerie: function(status) {
    Meteor.users.update(this.userId, {$set: {"settings.galerie": status}})
  },

  lastMedia: function() {
    return findAMedia();
  }
});

const findAMedia = function() {
  const gs = DaydGallery.find({media_id: {'$exists': true}}).fetch();
  if(!gs.length) return false;
  const idRnd = Math.floor((Math.random() * gs.length));
  const d = DaydGalleryMedias.findOne(gs[idRnd].media_id).get();
  if(d) {
    d.createdBy = gs[idRnd].createdBy;
    d.folder_id = gs[idRnd].folder_id;
    return d;
  }
  else return findAMedia();
};