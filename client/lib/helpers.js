if(typeof(Dayd) === 'undefined') Dayd = {};

import 'bootstrap/dist/css/bootstrap.css';
import 'viewerjs/dist/viewer.css';

Viewer = require('viewerjs');

Template.registerHelper("isGalerieEditing", function() {
  return Session.get('galerie-edit');
});

Template.registerHelper("isGalerieEditingClass", function() {
  return Session.get('galerie-edit') ? 'gallery-is-editing' : '';
});