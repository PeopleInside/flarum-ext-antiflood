(() => {
  const app = flarum.core.compat['admin/app'].default;

  app.initializers.add('peopleinside-antiflood', () => {
    const extension = app.extensionData.for('peopleinside-antiflood');

    extension.registerSetting({
      setting: 'peopleinside-antiflood.pending_limit_message',
      label: app.translator.trans('peopleinside-antiflood.admin.settings.pending_limit_message_label'),
      help: app.translator.trans('peopleinside-antiflood.admin.settings.pending_limit_message_help'),
      type: 'text',
      default: app.translator.trans('peopleinside-antiflood.forum.error.pending_limit'),
    });

    extension.registerSetting({
      setting: 'peopleinside-antiflood.flood_limit_message',
      label: app.translator.trans('peopleinside-antiflood.admin.settings.flood_limit_message_label'),
      help: app.translator.trans('peopleinside-antiflood.admin.settings.flood_limit_message_help'),
      type: 'text',
      default: app.translator.trans('peopleinside-antiflood.forum.error.flood_limit', { minutes: 5 }),
    });
  });
})();
