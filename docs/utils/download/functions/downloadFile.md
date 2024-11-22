[**DOM Workbench v1.0.0**](../../../README.md) • **Docs**

***

[DOM Workbench v1.0.0](../../../modules.md) / [utils/download](../README.md) / downloadFile

# Function: downloadFile()

> **downloadFile**(`blob`, `filename`, `options`): `Promise`\<`void`\>

Downloads a file using the Chrome downloads API

## Parameters

• **blob**: `Blob`

The file data as a Blob

• **filename**: `string`

The name of the file to be saved

• **options** = `{}`

Optional settings for the download

• **options.saveAs?**: `boolean`

Whether to show the save as dialog (default is false)

## Returns

`Promise`\<`void`\>

A promise that resolves when the download is initiated

## Defined in

src/utils/download.ts:11
