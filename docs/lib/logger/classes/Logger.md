[**DOM Workbench v1.0.0**](../../../README.md) • **Docs**

***

[DOM Workbench v1.0.0](../../../modules.md) / [lib/logger](../README.md) / Logger

# Class: Logger

A logger class that provides context-aware logging functionality with configurable log levels.
Supports logging at error, warn, info, and debug levels with message context prefixing.

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

src/lib/logger.ts:22

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

src/lib/logger.ts:46

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

src/lib/logger.ts:79

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

src/lib/logger.ts:57

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

src/lib/logger.ts:68

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

src/lib/logger.ts:28
