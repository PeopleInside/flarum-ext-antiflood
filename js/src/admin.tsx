import type Mithril from 'mithril';

type ExtensionDataContext = {
  registerSetting: (setting: unknown) => void;
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

type AdminSettingsPageContext = {
  buildSettingComponent: (setting: Record<string, unknown>) => Mithril.Children;
  setting: (key: string, fallback?: string, label?: unknown) => (value?: string) => string;
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
    const resetButtonLabel = app.translator.trans('peopleinside-antiflood.admin.settings.reset_button');

    const createResettableSetting = (setting: Record<string, unknown>) => {
      const settingKey = String(setting.setting ?? '');
      const settingLabel = setting.label;

      return function (this: AdminSettingsPageContext) {
        const builtSetting = this.buildSettingComponent(setting);
        const resetSetting = this.setting(settingKey, '', settingLabel);

        return (
          <div className="peopleinside-antiflood-setting-with-reset">
            <div className="peopleinside-antiflood-setting-with-reset-field">{builtSetting}</div>
            <button
              type="button"
              className="Button"
              onclick={(event: MouseEvent) => {
                event.preventDefault();
                resetSetting('');
              }}
            >
              {resetButtonLabel}
            </button>
          </div>
        );
      };
    };

    const settings = [
      createResettableSetting({
        setting: 'peopleinside-antiflood.max_pending',
        label: app.translator.trans('peopleinside-antiflood.admin.settings.max_pending_label'),
        help: app.translator.trans('peopleinside-antiflood.admin.settings.max_pending_help'),
        type: 'number',
        min: 1,
        placeholder: String(DEFAULT_MAX_PENDING),
      }),
      createResettableSetting({
        setting: 'peopleinside-antiflood.flood_limit',
        label: app.translator.trans('peopleinside-antiflood.admin.settings.flood_limit_label'),
        help: app.translator.trans('peopleinside-antiflood.admin.settings.flood_limit_help'),
        type: 'number',
        min: 1,
        placeholder: String(DEFAULT_FLOOD_LIMIT),
      }),
      createResettableSetting({
        setting: 'peopleinside-antiflood.post_flood_limit',
        label: app.translator.trans('peopleinside-antiflood.admin.settings.post_flood_limit_label'),
        help: app.translator.trans('peopleinside-antiflood.admin.settings.post_flood_limit_help'),
        type: 'number',
        min: 0,
        placeholder: String(DEFAULT_POST_FLOOD_LIMIT),
      }),
      createResettableSetting({
        setting: 'peopleinside-antiflood.flood_interval_minutes',
        label: app.translator.trans('peopleinside-antiflood.admin.settings.flood_interval_minutes_label'),
        help: app.translator.trans('peopleinside-antiflood.admin.settings.flood_interval_minutes_help'),
        type: 'number',
        min: 1,
        placeholder: String(DEFAULT_FLOOD_INTERVAL_MINUTES),
      }),
      createResettableSetting({
        setting: 'peopleinside-antiflood.pending_limit_message',
        label: app.translator.trans('peopleinside-antiflood.admin.settings.pending_limit_message_label'),
        help: app.translator.trans('peopleinside-antiflood.admin.settings.pending_limit_message_help_with_default', {
          defaultMessage: defaultPendingLimitMessage,
        }),
        type: 'textarea',
        placeholder: defaultPendingLimitMessage,
      }),
      createResettableSetting({
        setting: 'peopleinside-antiflood.flood_limit_message',
        label: app.translator.trans('peopleinside-antiflood.admin.settings.flood_limit_message_label'),
        help: app.translator.trans('peopleinside-antiflood.admin.settings.flood_limit_message_help_with_default', {
          defaultMessage: defaultFloodLimitMessage,
        }),
        type: 'textarea',
        placeholder: defaultFloodLimitMessage,
      }),
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
