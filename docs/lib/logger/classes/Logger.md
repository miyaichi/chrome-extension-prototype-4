[**DOM Workbench v1.0.0**](../../../README.md) • **Docs**

***

[DOM Workbench v1.0.0](../../../modules.md) / [lib/logger](../README.md) / Logger

# Class: Logger

## Constructors

### new Logger()

> **new Logger**(`context`): [`Logger`](Logger.md)

Creates an instance of Logger with a specific context

#### Parameters

• **context**: `string`

The context for the logger instance

#### Returns

[`Logger`](Logger.md)

#### Defined in

src/lib/logger.ts:18

## Methods

### debug()

> **debug**(`message`, ...`args`): `void`

Logs a debug message if the current log level is 'debug'

#### Parameters

• **message**: `string`

The message to log

• ...**args**: `any`[]

Additional arguments to log

#### Returns

`void`

#### Defined in

src/lib/logger.ts:42

***

### error()

> **error**(`message`, ...`args`): `void`

Logs an error message if the current log level is 'error'

#### Parameters

• **message**: `string`

The message to log

• ...**args**: `any`[]

Additional arguments to log

#### Returns

`void`

#### Defined in

src/lib/logger.ts:75

***

### log()

> **log**(`message`, ...`args`): `void`

Logs an info message if the current log level is 'info' or lower

#### Parameters

• **message**: `string`

The message to log

• ...**args**: `any`[]

Additional arguments to log

#### Returns

`void`

#### Defined in

src/lib/logger.ts:53

***

### warn()

> **warn**(`message`, ...`args`): `void`

Logs a warning message if the current log level is 'warn' or lower

#### Parameters

• **message**: `string`

The message to log

• ...**args**: `any`[]

Additional arguments to log

#### Returns

`void`

#### Defined in

src/lib/logger.ts:64

***

### setLogLevel()

> `static` **setLogLevel**(`level`): `void`

Sets the global log level for all Logger instances

#### Parameters

• **level**: [`LogLevel`](../../settings/type-aliases/LogLevel.md)

The log level to set

#### Returns

`void`

#### Defined in

src/lib/logger.ts:24
