[**DOM Workbench v1.0.0**](../../../README.md) • **Docs**

***

[DOM Workbench v1.0.0](../../../modules.md) / [lib/connectionManager](../README.md) / ConnectionManager

# Class: ConnectionManager

## Methods

### addMessageHandler()

> **addMessageHandler**(`type`, `handler`): `void`

Adds a message handler for a specific message type

#### Parameters

• **type**: [`MessageType`](../type-aliases/MessageType.md)

The type of message to handle

• **handler**

The handler function for the message

#### Returns

`void`

#### Defined in

src/lib/connectionManager.ts:260

***

### removeMessageHandler()

> **removeMessageHandler**(`type`, `handler`): `void`

Removes a message handler for a specific message type

#### Parameters

• **type**: [`MessageType`](../type-aliases/MessageType.md)

The type of message to remove the handler for

• **handler**

The handler function to remove

#### Returns

`void`

#### Defined in

src/lib/connectionManager.ts:272

***

### sendMessage()

> **sendMessage**\<`T`\>(`type`, `payload`, `target`?): `Promise`\<`void`\>

Sends a message to the specified target context

#### Type Parameters

• **T**

#### Parameters

• **type**: [`MessageType`](../type-aliases/MessageType.md)

• **payload**: `T`

• **target?**: [`Context`](../type-aliases/Context.md)

#### Returns

`Promise`\<`void`\>

#### Defined in

src/lib/connectionManager.ts:228

***

### setContext()

> **setContext**(`context`): `void`

#### Parameters

• **context**: [`Context`](../type-aliases/Context.md)

#### Returns

`void`

#### Defined in

src/lib/connectionManager.ts:109

***

### subscribe()

> **subscribe**\<`T`\>(`messageType`, `handler`): () => `void`

#### Type Parameters

• **T**

#### Parameters

• **messageType**: [`MessageType`](../type-aliases/MessageType.md)

• **handler**

#### Returns

`Function`

##### Returns

`void`

#### Defined in

src/lib/connectionManager.ts:282

***

### getInstance()

> `static` **getInstance**(): [`ConnectionManager`](ConnectionManager.md)

Gets the singleton instance of the ConnectionManager

#### Returns

[`ConnectionManager`](ConnectionManager.md)

The singleton instance of the ConnectionManager

#### Defined in

src/lib/connectionManager.ts:102
