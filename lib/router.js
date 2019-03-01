Router.route('daydGallery', {
  path: '/gallery'
});

Router.route('daydGalleryUser', {
  path: '/gallery/:userId/:folderId?',
  data: function() {
    return {userId: this.params.userId, folderId: this.params.folderId, query: this.params.query}
  }
});