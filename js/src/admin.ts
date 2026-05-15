type AdminApp = {
  extensionData?: {
    for: (extensionId: string) => {
      registerSetting: (setting: Record<string, unknown>) => void;
    };
  };
  initializers?: {
    add: (key: string, callback: () => void) => void;
  };
  translator?: {
    trans: (key: string) => string;
  };
};

type FlarumGlobal = {
  core?: {
    compat?: Record<string, AdminApp>;
  };
  reg?: {
    get: (namespace: string, id: string) => AdminApp | undefined;
  };
};

const EXTENSION_IDS = ['peopleinside-antiflood', 'peopleinside-flarum-ext-antiflood'] as const;

const flarumGlobal =
  typeof globalThis !== 'undefined' ? (globalThis as { flarum?: FlarumGlobal }).flarum : undefined;
const app =
  flarumGlobal?.core?.compat?.['admin/app'] ??
  flarumGlobal?.reg?.get('core', 'admin/app');

const canRegisterSettings =
  app &&
  typeof app.initializers?.add === 'function' &&
  typeof app.extensionData?.for === 'function' &&
  typeof app.translator?.trans === 'function';

if (canRegisterSettings) {
  app.initializers.add('peopleinside-antiflood', () => {
    const settings = [
      {
      setting: 'peopleinside-antiflood.max_pending',
      label: app.translator.trans('peopleinside-antiflood.admin.settings.max_pending_label'),
      help: app.translator.trans('peopleinside-antiflood.admin.settings.max_pending_help'),
      type: 'number',
      min: 1,
      },
      {
      setting: 'peopleinside-antiflood.flood_limit',
      label: app.translator.trans('peopleinside-antiflood.admin.settings.flood_limit_label'),
      help: app.translator.trans('peopleinside-antiflood.admin.settings.flood_limit_help'),
      type: 'number',
      min: 1,
      },
      {
      setting: 'peopleinside-antiflood.post_flood_limit',
      label: app.translator.trans('peopleinside-antiflood.admin.settings.post_flood_limit_label'),
      help: app.translator.trans('peopleinside-antiflood.admin.settings.post_flood_limit_help'),
      type: 'number',
      min: 0,
      },
      {
      setting: 'peopleinside-antiflood.flood_interval_minutes',
      label: app.translator.trans('peopleinside-antiflood.admin.settings.flood_interval_minutes_label'),
      help: app.translator.trans('peopleinside-antiflood.admin.settings.flood_interval_minutes_help'),
      type: 'number',
      min: 1,
      },
      {
      setting: 'peopleinside-antiflood.pending_limit_message',
      label: app.translator.trans('peopleinside-antiflood.admin.settings.pending_limit_message_label'),
      help: app.translator.trans('peopleinside-antiflood.admin.settings.pending_limit_message_help'),
      type: 'textarea',
      },
      {
      setting: 'peopleinside-antiflood.flood_limit_message',
      label: app.translator.trans('peopleinside-antiflood.admin.settings.flood_limit_message_label'),
      help: app.translator.trans('peopleinside-antiflood.admin.settings.flood_limit_message_help'),
      type: 'textarea',
      },
    ];

    const registeredExtensions = new Set<object>();

    for (const extensionId of EXTENSION_IDS) {
      const extension = app.extensionData.for(extensionId);
      if (registeredExtensions.has(extension as object)) {
        continue;
      }
      registeredExtensions.add(extension as object);

      for (const setting of settings) {
        extension.registerSetting(setting);
      }
    }
  });
} else if (typeof console !== 'undefined' && typeof console.warn === 'function') {
  console.warn('[peopleinside-antiflood] Unable to initialize admin settings: admin app API not available.');
}
