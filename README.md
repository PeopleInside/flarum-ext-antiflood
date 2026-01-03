# AntiFlood Extension for Flarum

**AntiFlood** is a Flarum extension designed to limit topic and post flooding and ensure that users do not exceed a specific number of pending approvals. This extension also fixes emoji rendering in code blocks for Flarum 1.8 and 2.0.

## Features

### Flood Protection
- Limits the creation of **maximum 3 topics per 5 minutes** for each user.
- Blocks topic/post creation if there are already **5 posts or topics pending approval**.

### Emoji Support in Code Blocks
- **Fixes emoji display in multi-line code blocks** - Emojis are now properly displayed in both single-line and multi-line code blocks
- Works with all standard emojis (🌟🌻🎄🎅🏽 etc.)
- Automatic detection and rendering of emojis in code syntax
- Compatible with Flarum 1.8 and 2.0

## Installation

### 1. Install via Composer

In your Flarum root directory, run the following command:

```bash
composer require peopleinside/flarum-ext-antiflood
```

### 2. Update via Composer

```bash
composer update peopleinside/flarum-ext-antiflood
```

### 3. Uninstall via Composer

```bash
composer remove peopleinside/flarum-ext-antiflood
```

Packagist link: https://packagist.org/packages/peopleinside/flarum-ext-antiflood

## Building from Source

If you want to build the extension from source:

```bash
npm install
npm run build
```

The extension comes pre-compiled, so building is only necessary if you modify the JavaScript/TypeScript source files.
