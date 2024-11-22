[**DOM Workbench v1.0.0**](../../../README.md) • **Docs**

***

[DOM Workbench v1.0.0](../../../modules.md) / [lib/settings](../README.md) / useSettings

# Function: useSettings()

> **useSettings**(): `object`

Custom React hook to manage settings state

## Returns

`object`

An object containing the settings state and management functions

### error

> **error**: `null` \| `string`

Error message if settings operations failed

### loading

> **loading**: `boolean`

Indicates if settings are currently being loaded

### settings

> **settings**: [`Settings`](../interfaces/Settings.md)

Current application settings

### updateSettings()

> **updateSettings**: (`newSettings`) => `Promise`\<`void`\>

Function to update settings with partial changes

#### Parameters

• **newSettings**: `Partial`\<[`Settings`](../interfaces/Settings.md)\>

#### Returns

`Promise`\<`void`\>

## Defined in

src/lib/settings.ts:72
