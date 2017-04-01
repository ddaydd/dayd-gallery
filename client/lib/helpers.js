Template.registerHelper("isGalerieEditing", function() {
  return Session.get('galerie-edit');
});

Template.registerHelper("isGalerieEditingClass", function() {
  return Session.get('galerie-edit') ? 'gallery-is-editing' : '';
});