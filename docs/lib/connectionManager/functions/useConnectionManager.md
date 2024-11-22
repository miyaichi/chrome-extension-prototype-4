[**DOM Workbench v1.0.0**](../../../README.md) • **Docs**

***

[DOM Workbench v1.0.0](../../../modules.md) / [lib/connectionManager](../README.md) / useConnectionManager

# Function: useConnectionManager()

> **useConnectionManager**(): `object`

A hook that provides access to ConnectionManager instance methods

## Returns

`object`

An object containing message sending and subscription methods

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

Subscribes to messages of a specific type with a handler function

#### Type Parameters

• **T**

The type of the message payload

#### Parameters

• **messageType**: [`MessageType`](../type-aliases/MessageType.md)

The type of message to subscribe to

• **handler**

The handler function to be called when a message is received

#### Returns

`Function`

A function to unsubscribe the handler

##### Returns

`void`

## Defined in

src/lib/connectionManager.ts:359
