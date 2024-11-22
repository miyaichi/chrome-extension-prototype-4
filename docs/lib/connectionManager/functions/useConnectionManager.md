[**DOM Workbench v1.0.0**](../../../README.md) • **Docs**

***

[DOM Workbench v1.0.0](../../../modules.md) / [lib/connectionManager](../README.md) / useConnectionManager

# Function: useConnectionManager()

> **useConnectionManager**(): `object`

The default settings for the application

## Returns

`object`

### sendMessage()

> **sendMessage**: \<`T`\>(`type`, `payload`, `target`?) => `Promise`\<`void`\>

Sends a message to the specified target context

#### Type Parameters

• **T**

#### Parameters

• **type**: [`MessageType`](../type-aliases/MessageType.md)

• **payload**: `T`

• **target?**: [`Context`](../type-aliases/Context.md)

#### Returns

`Promise`\<`void`\>

### subscribe()

> **subscribe**: \<`T`\>(`messageType`, `handler`) => () => `void`

#### Type Parameters

• **T**

#### Parameters

• **messageType**: [`MessageType`](../type-aliases/MessageType.md)

• **handler**

#### Returns

`Function`

##### Returns

`void`

## Defined in

src/lib/connectionManager.ts:342
