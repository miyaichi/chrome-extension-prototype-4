[**DOM Workbench v1.0.0**](../../../README.md) • **Docs**

***

[DOM Workbench v1.0.0](../../../modules.md) / [lib/shareAsPDF](../README.md) / shareAsPDF

# Function: shareAsPDF()

> **shareAsPDF**(`imageData`, `comment`, `url`, `startTag`, `styleModifications`): `Promise`\<`true`\>

Shares the content as a PDF document.

## Parameters

• **imageData**: `string`

The image data to be included in the PDF.

• **comment**: `string`

A comment to be included in the PDF.

• **url**: `string`

The URL to be included in the PDF.

• **startTag**: `string`

The start tag for the PDF content.

• **styleModifications**: `string`

Style modifications to be applied to the PDF content.

## Returns

`Promise`\<`true`\>

A promise that resolves to true if the PDF is successfully created.

## Throws

Will throw an error if imageData or url is not provided.

## Defined in

src/lib/shareAsPDF.ts:227
