import { FilesCollection } from 'meteor/ostrio:files';

const DaydGallery = new Meteor.Collection('dayd_gallery');

const INLINE_TYPES = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', mp4: 'video/mp4' };
const normalizeType = (type) => {
  const t = String(type || '').toLowerCase().split(';')[0].trim();
  return t === 'image/jpg' || t === 'image/pjpeg' ? 'image/jpeg' : t;
};

const storagePathSettings = Meteor.settings?.obFiles?.storagePath;

const DaydGalleryMedias = new FilesCollection({
  storagePath: storagePathSettings || '/opt/dayd_gallery',
  collectionName: 'dayd_gallery_medias',
  allowClientCode: false, // Disallow remove files from Client
  /* Membres connectés, images/mp4 ≤ 10 Mo, type MIME cohérent avec l'extension
   * (avant : anonyme accepté et type déclaré par le client servi tel quel = XSS). */
  onBeforeUpload: function (file) {
    const ext = String(file.extension || '').toLowerCase();
    if (!INLINE_TYPES[ext]) return 'Format non autorisé (mp4, gif, png, jpg, jpeg)';
    if (normalizeType(file.type) !== INLINE_TYPES[ext]) return 'Type de fichier non autorisé';
    if (file.size > 10485760) return 'Fichier trop volumineux (max 10 Mo)';
    if (Meteor.isServer && !this.userId) return 'Connexion requise';
    return true;
  },
  responseHeaders: function (responseCode, fileRef, versionRef) {
    const headers = { Connection: 'keep-alive', 'Accept-Ranges': 'bytes', 'X-Content-Type-Options': 'nosniff' };
    if (responseCode === '206') { headers.Pragma = 'private'; headers['Transfer-Encoding'] = 'chunked'; }
    if (responseCode === '400') headers['Cache-Control'] = 'no-cache';
    if (responseCode === '416') headers['Content-Range'] = `bytes */${versionRef && versionRef.size}`;
    let type = normalizeType(versionRef && versionRef.type);
    if (!type) type = INLINE_TYPES[String((versionRef && versionRef.extension) || (fileRef && fileRef.extension) || '').toLowerCase()] || '';
    if (Object.values(INLINE_TYPES).includes(type)) {
      headers['Content-Type'] = type;
    } else {
      headers['Content-Type'] = 'application/octet-stream';
      headers['Content-Disposition'] = 'attachment';
    }
    return headers;
  },
});

if (Meteor.isServer) {
  DaydGalleryMedias.denyClient();
  DaydGalleryMedias.on('afterUpload', function (fileRef) {

    if (/gif|png|jpe?g/i.test(fileRef.extension || '')) {
      dfm.createThumbnails(this, fileRef).catch(error => {
        if (error) console.error(error);
      });
    }
  });
}

export { DaydGallery, DaydGalleryMedias };