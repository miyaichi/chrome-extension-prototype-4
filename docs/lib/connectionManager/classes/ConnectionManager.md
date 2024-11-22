[**DOM Workbench v1.0.0**](../../../README.md) • **Docs**

***

[DOM Workbench v1.0.0](../../../modules.md) / [lib/connectionManager](../README.md) / ConnectionManager

# Class: ConnectionManager

A singleton class that manages connections and message passing between different contexts
in a Chrome extension (background, content scripts, and side panel).
Handles connection management, reconnection logic, and message broadcasting.

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

src/lib/connectionManager.ts:269

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

src/lib/connectionManager.ts:281

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

src/lib/connectionManager.ts:237

***

### setContext()

> **setContext**(`context`): `void`

Sets the context for the ConnectionManager instance and reinitializes connections

#### Parameters

• **context**: [`Context`](../type-aliases/Context.md)

The new context to set ('content', 'background', or 'sidepanel')

#### Returns

`void`

#### Defined in

src/lib/connectionManager.ts:118

***

### subscribe()

> **subscribe**\<`T`\>(`messageType`, `handler`): () => `void`

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

#### Defined in

src/lib/connectionManager.ts:298

***

### getInstance()

> `static` **getInstance**(): [`ConnectionManager`](ConnectionManager.md)

Gets the singleton instance of the ConnectionManager

#### Returns

[`ConnectionManager`](ConnectionManager.md)

The singleton instance of the ConnectionManager

#### Defined in

src/lib/connectionManager.ts:107
