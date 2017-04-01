Meteor.publish(null, function() {
  return DaydGallery.find({}, {limit: 1});
});

Meteor.publish("daydGallery", function() {
  return DaydGallery.find({});
});

Meteor.publish("daydGalleryUser", function(username) {
  return DaydGallery.find({'user.username': username});
});

// Meteor.publish(null, function() {
//   return DaydGalleryMedias.find({});
// });

Meteor.publish(null, function() {
  return DaydGallery.find();
});

Meteor.publish(null, function () {
  return DaydGalleryMedias.find().cursor;
});