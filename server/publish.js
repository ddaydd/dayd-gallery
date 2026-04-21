import { DaydGallery, DaydGalleryMedias } from '../lib/collections.js';

Meteor.publish("daydGalleryUser", function(user_id) {
  return DaydGallery.find({'createdBy._id': user_id});
});

Meteor.publish("daydGalleryUserMedias", function(user_id) {
  return DaydGalleryMedias.find({'userId': user_id}).cursor;
});

Meteor.publish('daydGalleryMediaOne', function(id) {
  return DaydGalleryMedias.find({_id: id}).cursor;
});