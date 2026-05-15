type ExtensionDataContext = {
  registerSetting: (setting: Record<string, unknown>) => void;
};

type AdminApp = {
  extensionData?: {
    for: (extensionId: string) => ExtensionDataContext;
  };
  initializers?: {
    add: (key: string, callback: () => void) => void;
  };
  translator?: {
    trans: (key: string, parameters?: Record<string, string | number>) => string;
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

const DEFAULT_MAX_PENDING = 6;
const DEFAULT_FLOOD_LIMIT = 3;
const DEFAULT_POST_FLOOD_LIMIT = 0;
const DEFAULT_FLOOD_INTERVAL_MINUTES = 5;

if (canRegisterSettings) {
  app.initializers.add('peopleinside-antiflood', () => {
    const defaultPendingLimitMessage = app.translator.trans('peopleinside-antiflood.forum.error.pending_limit');
    const defaultFloodLimitMessage = app.translator.trans('peopleinside-antiflood.forum.error.flood_limit', {
      minutes: DEFAULT_FLOOD_INTERVAL_MINUTES,
    });

    const settings = [
      {
      setting: 'peopleinside-antiflood.max_pending',
      label: app.translator.trans('peopleinside-antiflood.admin.settings.max_pending_label'),
      help: app.translator.trans('peopleinside-antiflood.admin.settings.max_pending_help'),
      type: 'number',
      min: 1,
      placeholder: String(DEFAULT_MAX_PENDING),
      },
      {
      setting: 'peopleinside-antiflood.flood_limit',
      label: app.translator.trans('peopleinside-antiflood.admin.settings.flood_limit_label'),
      help: app.translator.trans('peopleinside-antiflood.admin.settings.flood_limit_help'),
      type: 'number',
      min: 1,
      placeholder: String(DEFAULT_FLOOD_LIMIT),
      },
      {
      setting: 'peopleinside-antiflood.post_flood_limit',
      label: app.translator.trans('peopleinside-antiflood.admin.settings.post_flood_limit_label'),
      help: app.translator.trans('peopleinside-antiflood.admin.settings.post_flood_limit_help'),
      type: 'number',
      min: 0,
      placeholder: String(DEFAULT_POST_FLOOD_LIMIT),
      },
      {
      setting: 'peopleinside-antiflood.flood_interval_minutes',
      label: app.translator.trans('peopleinside-antiflood.admin.settings.flood_interval_minutes_label'),
      help: app.translator.trans('peopleinside-antiflood.admin.settings.flood_interval_minutes_help'),
      type: 'number',
      min: 1,
      placeholder: String(DEFAULT_FLOOD_INTERVAL_MINUTES),
      },
      {
      setting: 'peopleinside-antiflood.pending_limit_message',
      label: app.translator.trans('peopleinside-antiflood.admin.settings.pending_limit_message_label'),
      help: `${app.translator.trans('peopleinside-antiflood.admin.settings.pending_limit_message_help')} ${app.translator.trans('peopleinside-antiflood.admin.settings.default_message_preview')}: ${defaultPendingLimitMessage}`,
      type: 'textarea',
      placeholder: defaultPendingLimitMessage,
      },
      {
      setting: 'peopleinside-antiflood.flood_limit_message',
      label: app.translator.trans('peopleinside-antiflood.admin.settings.flood_limit_message_label'),
      help: `${app.translator.trans('peopleinside-antiflood.admin.settings.flood_limit_message_help')} ${app.translator.trans('peopleinside-antiflood.admin.settings.default_message_preview')}: ${defaultFloodLimitMessage}`,
      type: 'textarea',
      placeholder: defaultFloodLimitMessage,
      },
    ];

    const processedExtensionData = new Set<ExtensionDataContext>();

    for (const extensionId of EXTENSION_IDS) {
      const extension = app.extensionData.for(extensionId);
      if (processedExtensionData.has(extension)) {
        continue;
      }
      processedExtensionData.add(extension);

      for (const setting of settings) {
        extension.registerSetting(setting);
      }
    }
  });
} else if (typeof console !== 'undefined' && typeof console.warn === 'function') {
  console.warn('[peopleinside-antiflood] Unable to initialize admin settings: admin app API not available.');
}
