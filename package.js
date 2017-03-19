Package.describe({
  name: 'dayd:gallery',
  version: '0.0.3',
  // Brief, one-line summary of the package.
  summary: "Medias Gallery",
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/ddaydd/gallery.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md',
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.3');

  api.use([
    'mongo',
    'accounts-base',
    'twbs:bootstrap@3.3.6'
  ]);

  api.use("templating", "client");

  api.add_files([
    'client/templates/gallery.html',
    'client/templates/gallery.js',
    'client/templates/galleryUser.html',
    'client/templates/galleryUser.js',
    'client/templates/media-case.html',
    'client/templates/media-case.js'
  ], ['client']);
  api.add_files(['lib/collections.js'], ['server', 'client']);
  api.add_files(['server/publish.js', 'server/methods.js'], ['server']);

  api.export(['DaydGallery', 'daydGalleryLast']);
});
