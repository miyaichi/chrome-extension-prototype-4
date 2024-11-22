[**DOM Workbench v1.0.0**](../../../README.md) • **Docs**

***

[DOM Workbench v1.0.0](../../../modules.md) / [lib/connectionManager](../README.md) / Message

# Interface: Message\<T\>

Interface representing a message that can be sent between different contexts

## Type Parameters

• **T** = `any`

The type of the payload

## Properties

### id

> **id**: `string`

The unique identifier for the message

#### Defined in

src/lib/connectionManager.ts:35

***

### payload

> **payload**: `T`

The payload of the message

#### Defined in

src/lib/connectionManager.ts:39

***

### source

> **source**: [`Context`](../type-aliases/Context.md)

The source context of the message

#### Defined in

src/lib/connectionManager.ts:41

***

### target?

> `optional` **target**: [`Context`](../type-aliases/Context.md)

The target context of the message (optional)

#### Defined in

src/lib/connectionManager.ts:43

***

### timestamp

> **timestamp**: `number`

The timestamp when the message was created

#### Defined in

src/lib/connectionManager.ts:45

***

### type

> **type**: [`MessageType`](../type-aliases/MessageType.md)

The type of the message

#### Defined in

src/lib/connectionManager.ts:37
