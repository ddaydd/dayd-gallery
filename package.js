Package.describe({
  name: 'dayd:gallery',
  version: '0.0.4',
  // Brief, one-line summary of the package.
  summary: "Medias Gallery",
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/ddaydd/gallery.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md',
});

Npm.depends({
  'fs-extra': '2.1.2',
  'gm': '1.23.0'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.3');

  api.use([
    'mongo',
    'less@2.7.9',
    'accounts-base',
    'ecmascript',
    'ostrio:files@1.7.3'
  ]);

  api.use("templating", "client");

  api.add_files([
    'client/stylesheets/main.less',
    'client/lib/helpers.js',
    'client/templates/gallery.html',
    'client/templates/gallery.js',
    'client/templates/galleryFolder.html',
    'client/templates/galleryFolder.js',
    'client/templates/galleryMedia.html',
    'client/templates/galleryMedia.js',
    'client/templates/galleryEdit.html',
    'client/templates/galleryEdit.js',
    'client/templates/galleryUser.html',
    'client/templates/galleryUser.js'
  ], ['client']);
  api.add_files(['lib/collections.js'], ['server', 'client']);
  api.add_files([
    'server/publish.js',
    'server/methods.js',
    'server/image-processing.js'
  ], ['server']);

  api.export(['DaydGallery', 'DaydGalleryMedias', 'daydGalleryLast']);
});