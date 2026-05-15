import app from 'flarum/admin/app';

app.initializers.add('peopleinside-antiflood', () => {
  app.extensionData
    .for('peopleinside-antiflood')

    .registerSetting({
      setting: 'peopleinside-antiflood.max_pending',
      label: app.translator.trans('peopleinside-antiflood.admin.settings.max_pending_label'),
      help: app.translator.trans('peopleinside-antiflood.admin.settings.max_pending_help'),
      type: 'number',
      min: 1,
    })

    .registerSetting({
      setting: 'peopleinside-antiflood.flood_limit',
      label: app.translator.trans('peopleinside-antiflood.admin.settings.flood_limit_label'),
      help: app.translator.trans('peopleinside-antiflood.admin.settings.flood_limit_help'),
      type: 'number',
      min: 1,
    })

    .registerSetting({
      setting: 'peopleinside-antiflood.post_flood_limit',
      label: app.translator.trans('peopleinside-antiflood.admin.settings.post_flood_limit_label'),
      help: app.translator.trans('peopleinside-antiflood.admin.settings.post_flood_limit_help'),
      type: 'number',
      min: 0,
    })

    .registerSetting({
      setting: 'peopleinside-antiflood.flood_interval_minutes',
      label: app.translator.trans('peopleinside-antiflood.admin.settings.flood_interval_minutes_label'),
      help: app.translator.trans('peopleinside-antiflood.admin.settings.flood_interval_minutes_help'),
      type: 'number',
      min: 1,
    })

    .registerSetting({
      setting: 'peopleinside-antiflood.pending_limit_message',
      label: app.translator.trans('peopleinside-antiflood.admin.settings.pending_limit_message_label'),
      help: app.translator.trans('peopleinside-antiflood.admin.settings.pending_limit_message_help'),
      type: 'textarea',
    })

    .registerSetting({
      setting: 'peopleinside-antiflood.flood_limit_message',
      label: app.translator.trans('peopleinside-antiflood.admin.settings.flood_limit_message_label'),
      help: app.translator.trans('peopleinside-antiflood.admin.settings.flood_limit_message_help'),
      type: 'textarea',
    });
});
