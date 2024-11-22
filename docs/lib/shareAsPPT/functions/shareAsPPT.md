[**DOM Workbench v1.0.0**](../../../README.md) • **Docs**

***

[DOM Workbench v1.0.0](../../../modules.md) / [lib/shareAsPPT](../README.md) / shareAsPPT

# Function: shareAsPPT()

> **shareAsPPT**(`imageData`, `comment`, `url`, `startTag`, `styleModifications`): `Promise`\<`true`\>

Shares the content as a PPT document.

## Parameters

• **imageData**: `string`

The image data to be included in the PPT.

• **comment**: `string`

A comment to be included in the PPT.

• **url**: `string`

The URL to be included in the PPT.

• **startTag**: `string`

The start tag for the PPT content.

• **styleModifications**: `string`

Style modifications to be applied to the PPT content.

## Returns

`Promise`\<`true`\>

A promise that resolves to true if the PPT is successfully created.

## Throws

Will throw an error if imageData or url is not provided.

## Defined in

src/lib/shareAsPPT.ts:124
