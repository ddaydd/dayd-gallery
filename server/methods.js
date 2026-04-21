/**
 * Created by dayd on 23 aout 2015
 */

import { DaydGallery, DaydGalleryMedias } from '../lib/collections.js';

Meteor.methods({

  galerieCreate: async function (obj) {
    // temporaire

    if (obj.date) obj.created = new Date(obj.date * 1000);

    var u = await Meteor.users.findOneAsync({ "profile.bio.id": obj.id_pseudo });
    var user;
    if (u) {
      user = { _id: u._id, username: u.username };

      DaydGallery.insert({
        user: user,
        folder_id: obj.dossier,
        backup: obj
      });

      console.log(u.username)
      await Meteor.users.updateAsync(u._id, {
        $set: {
          'profile.galerie': true
        }
      });

      console.log('galerie insert')
    }
  },

  mediabackCreate: async function (obj) {
    // temporaire


    await MediaBack.insertAsync(obj);

    console.log('mediabackCreate insert')

  },

  debugTemp: async function () {
    // temporaire

    const medias = await DaydGallery.find().fetchAsync();
    medias.forEach(async function (m) {
      console.log(m);
      await DaydGalleryMedias.updateAsync({ name: m.name }, { $set: { userId: m.createdBy._id } });
    });
  },

  majj: async function () {
    var galeries = await DaydGallery.find().fetchAsync();
    _.each(galeries, async function (galerie) {
      if (galerie.foldername) {
        var media = await MediaBack.findOneAsync({ id: galerie.backup.media_id });
        if (media)
          await DaydGallery.updateAsync(galerie._id, { $set: { name: media.real_name } });
        if (galerie.foldername && !await DaydGallery.findOneAsync({ type: 'folder', name: galerie.foldername }))
          DaydGallery.insert({ type: 'folder', name: galerie.foldername, user: galerie.user });
      }
      else if (galerie.type != 'folder') {
        if (galerie.backup) {
          var media = await MediaBack.findOneAsync({ id: galerie.backup.media_id });
          if (media)
            await DaydGallery.updateAsync(galerie._id, { $set: { name: media.real_name } });
        }
      }
    })
  },

  linkk: function () {
    var galeries = DaydGallery.find().fetch();
    _.each(galeries, function (galerie) {
      if (galerie.type != 'folder') {
        if (galerie.name) {
          console.log(galerie.name)
          var media = DaydGalleryMedias.findOne({ "original.name": galerie.name });
          if (media) {
            console.log(media)
            DaydGallery.update(galerie._id, { $set: { media_id: media._id } });
          }
          else
            console.log('not')

        }
      }
    })
    return true;
  },

  createGalerieMedias: function (media) {
    DaydGallery.insert(media);
  },

  moveGalerieMedias: async function (media, folder_id) {
    if (!Meteor.userId()) return false;

    if (media.createdBy._id === Meteor.userId() || await dfm.isAdminAsync())
      await DaydGallery.updateAsync(media._id, { $set: { folder_id: folder_id } });
  },

  deleteGalerieMedias: async function (media) {
    if (!Meteor.userId()) return false;

    if (media.createdBy._id === Meteor.userId() || await dfm.isAdminAsync())
      await DaydGallery.removeAsync(media._id);
  },

  createGalerieFolder: function (folder) {
    DaydGallery.insert(folder);
  },

  activateStatusMyGalerie: function (status) {
    Meteor.users.update(this.userId, { $set: { "profile.galerie": status } })
  },

  findOneMediaGallery: async function (options) {
    return await findAMedia(options);
  },
});

const findAMedia = async function (options = {}) {
  let ga;
  if (options.query && options.query.userId) {
    ga = [options.query.userId];
  } else {
    ga = await Meteor.users.find({ "profile.galerie": true }, { fields: { _id: 1 } })
      .mapAsync(u => u._id);
  }
  const gs = await DaydGallery.find({ media_id: { '$exists': true }, "createdBy._id": { $in: ga } }).fetchAsync();
  if (!gs.length) return false;
  const idRnd = Math.floor((Math.random() * gs.length));
  const d = await DaydGalleryMedias.collection.findOneAsync(gs[idRnd].media_id);
  if (d) {
    d.createdBy = gs[idRnd].createdBy;
    d.folder_id = gs[idRnd].folder_id;
    return d;
  }
  return false;
};