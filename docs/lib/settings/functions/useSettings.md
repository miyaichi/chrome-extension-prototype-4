[**DOM Workbench v1.0.0**](../../../README.md) • **Docs**

***

[DOM Workbench v1.0.0](../../../modules.md) / [lib/settings](../README.md) / useSettings

# Function: useSettings()

> **useSettings**(): `object`

Custom React hook to manage settings state

## Returns

`object`

An object containing the settings, loading state, and error state

### error

> **error**: `null` \| `string`

### loading

> **loading**: `boolean`

### settings

> **settings**: [`Settings`](../interfaces/Settings.md)

### updateSettings()

> **updateSettings**: (`newSettings`) => `Promise`\<`void`\>

#### Parameters

• **newSettings**: `Partial`\<[`Settings`](../interfaces/Settings.md)\>

#### Returns

`Promise`\<`void`\>

## Defined in

src/lib/settings.ts:69
