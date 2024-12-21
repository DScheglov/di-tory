# DI-TORY

**di-tory** is a lightweight dependency injection library for TypeScript.
It provides a flexible and type-safe way to configure and instantiate application
modules with clearly defined dependencies, all while keeping code organized
and maintainable.

With **di-tory**, you can easily define modules, manage life cycles, and inject
parameters at runtime, ensuring that your application components remain decoupled
and testable.

## Table of Contents

- [Installation](#installation)
- [Example Usage](#example-usage)
- [Concepts](#concepts)
  - [Module](#module)
  - [Module Builder](#module-builder)
  - [Visibility](#visibility)
  - [Resolver](#resolver)
  - [Lifecycle (Scope)](#lifecycle-scope)
  - [Implementation](#implementation)
  - [Initializers](#initializers)
- [Module Builder API](#module-builder-api)
  - [`Module()` Factory](#module-factory)
  - [`.private(resolvers, scope?)` Method](#privateresolvers-scope-method)
  - [`.public(resolvers, scope?)` Method](#publicresolvers-scope-method)
  - [`.privateImpl(implementation)` Method](#privateimplimplementation-method)
  - [`.publicImpl(implementation)` Method](#publicimplimplementation-method)
  - [`.init(initializers)` Method](#initinitializers-method)
  - [`.create(params)` Method](#createparams-method)
- [Life Cycles](#life-cycles)

## Installation

```ts
npm install di-tory
```

## Example Usage

Below is a simple usage example. Notice how the `Module` function lets you define private and public dependencies and then create instances with runtime parameters.

```ts
import { Module } from 'di-tory';

interface IInfoLogger {
  info(message: string): void;
}

type User = {
  id: string;
  name: string;
  passwordHash: string;
};

interface IUserRepository {
  getUser(userName: string): Promise<User>;
}

interface IAuthService {
  authenticate(userName: string, password: string): Promise<User>;
}

class Logger implements IInfoLogger {
  constructor(public level: string) {}
  info(message: string) {
    if (this.level !== 'debug') return;
    console.log(message);
  }
}

class UserRepository implements IUserRepository {
  async getUser(userName: string) {
    return {
      id: '1',
      name: userName,
      passwordHash: 'password',
    };
  }
}

class AuthService implements IAuthService {
  constructor(private userRepo: IUserRepository) {}

  async authenticate(userName: string, password: string) {
    const user = await this.userRepo.getUser(userName);

    if (user.passwordHash !== password) {
      throw new Error('Invalid password');
    }

    return user;
  }
}

type SignInDependencies = {
  logger: IInfoLogger;
  authService: Pick<IAuthService, 'authenticate'>;
};

function signIn(
  { authService, logger }: SignInDependencies,
  userName: string,
  password: string,
) {
  logger.info(`Authenticating user: ${userName}`);
  return authService.authenticate(userName, password);
}

const App = Module()
  .private({
    logger: (_, { logLevel }: { logLevel: string }) => new Logger(logLevel),
  })
  .private({
    userRepository: () => new UserRepository(),
  })
  .private({
    authService: ({ userRepository }) => new AuthService(userRepository),
  })
  .publicImpl({
    signIn,
  });

async function main() {
  const app = App.create({ logLevel: 'debug' });
  const user = await app.signIn('user', 'password');

  console.log(user);
}

main().catch(console.error);
```

## Concepts

### Module

A container for instances of "Services," which are created on demand with
resolving their dependencies.

In the example above, the module `app` contains instances of `Logger`,
`UserRepository`, and `AuthService` services. The `signIn` function is a
module method.

### Module Builder

An object that describes the module's structure by defining its resolvers
and implementation. The module builder serves as the composition root for
the module.

In the example above, the `App` object is a module builder:

```ts
const App = Module()
  .private({
    logger: (_, { logLevel }: { logLevel: string }) => new Logger(logLevel),
  })
  .private({
    userRepository: () => new UserRepository(),
  })
  .private({
    authService: ({ userRepository }) => new AuthService(userRepository),
  })
  .publicImpl({
    signIn,
  });
```

The `ModuleBuilder` allows to create a module with the `create` method:

```ts
const app = App.create({ logLevel: 'debug' });
```

### Visibility

Defines whether an instance or method could be accessed from outside the module:

- **Public**: An instance or a method that can be accessed from outside the module.
- **Private**: An instance that can only be accessed within the module by
  providing it to a **Resolver** or **Implementation**.

In the example above all service instances are private, and the `signIn` method
is public.

### Resolver

A function that accepts the module and returns a new instance.
A resolver also accepts creation-time parameters, which must be provided when
the module is created.

In the example above the following functions are resolvers:

```ts
(_, { logLevel }: { logLevel: string }) => new Logger(logLevel)
```

```ts
() => new UserRepository()
```

```ts
({ userRepository }) => new AuthService(userRepository)
```

The resolver is exactly the place where we define how to resolve the dependencies
of a service.

The resolver function signature is:

```ts
type Resolver<M extends object, Params extends object, R> = {
  (injection: M, params: Params): R;
};
```

The object containing resolvers has type `Resolvers`:

```ts
export type Resolvers<
  Items extends object,
  M extends object,
  Params extends object,
> = {
  [Item in keyof Items]: Resolver<M, Params, Items[Item]>;
};
```

Where:

- `Items`: An object (name to type mapping) of instances to resolve.
- `M`: An object (name to type mapping) of instances or methods available for injection.
- `Params`: An object with Module creation time parameters.

The usual practice for resolvers is to use some "wrapper" like "asValue", "asClass",
or "asFactory" (or "asFunction") to define the way to create the instance.

For example `awilix` uses the following approach:

```ts
container.register({
  logLevel: asValue('debug'),
  logger: asClass(Logger),
  userRepository: asClass(UserRepository),
  authService: asClass(AuthService)
    .inject(({ userRepository }) => ({ userRepository })
  ),
});
```

Such "wrappers" hide resolvers under the hood. **di-tory** doesn't do so, making
the dependency resolution process more explicit, additionally allowing to avoid
the "Constrained Construction" anti-pattern, when the injectable class is forced
to have a constructor with specific parameters.

What's about **Don't use `new` principle**?

In the context of dependency injection, the "Don't use `new` principle" means
that we should not use the `new` operator to create instances of dependencies
directly in our services, because it breaks the Dependency Inversion Principle,
making your services tightly coupled to their dependencies.

In the composition root, we should create instances of our services in the way
assumed when the services were designed.

So, don't worry about using `new` in resolvers. It's the right place to use it.

### Lifecycle (Scope)

A scope is where the instances are stored. The resolution scope can be:

- **Singleton**: The instance is created once and shared between all modules created with the same builder.
- **Module**: The instance is created once per module (default).
- **Async**: The instance is created once per "async running".
- **Transient**: The instance is created every time it is requested.

The dependent non-singleton instance inherits the shortest scope of its dependencies.
That means if some instance is declared as a "module" or "async" scoped, but at least
one of its dependencies is declared as "transient", the instance also will be
"transient"

This description is a bit simplified. The actual behavior is a bit more complex and
is described in the "life Cycles" section of the documentation.

In the example above, all instances are "module" scoped, because it's the default
scope and we didn't specify any other.

### Implementation

A set of module methods that accept an object referencing the module's
instances as the first parameter and additional parameters as the rest.
Implementations can be public or private.

In the example above the `signIn` method is a part of the public implementation.

The implementation is a way to implement Inversion of Control (IoC) wide then
just for dependency injection.

To reach the IoC principle, we can refactor our example in the following way:

```ts
type MainDependencies = {
  signIn: (userName: string, password: string) => Promise<User>;
};

async function main({ signIn }: MainDependencies) {
  const user = await signIn('user', 'password');

  console.log(user);
}

const App = Module()
  .private({
    logger: (_, { logLevel }: { logLevel: string }) => new Logger(logLevel),
  })
  .private({
    userRepository: () => new UserRepository(),
  })
  .private({
    authService: ({ userRepository }) => new AuthService(userRepository),
  })
  .privateImpl({
    signIn,
  }).
  .publicImpl({
    run: main,
  });

const app = App.create({ logLevel: 'debug' });

app.run().catch(console.error);
```

### Initializers

A set of functions that are called after the correspondent instance is created.
The main purpose of initializers is to get able to resolve the circular dependencies.

**Important**!!: if you have a circular dependency, maybe you do something wrong.

In the example above, we can define the following initializers:

```ts
interface IServiceA {}
interface IServiceB {}

class ServiceA {
  constructor(private serviceB: IServiceB) {}
}

class ServiceB {
  private serviceA: IServiceA | null = null;
  constructor() {}
  setServiceA(serviceA: IServiceA) {
    this.serviceA = serviceA;
  }
}

const App = Module()
  .private({
    serviceA: ({ serviceB }) => new ServiceA(serviceB),
  })
  .private({
    serviceB: () => new ServiceB(),
  })
  .init({
    serviceB({ serviceA }) {
      // this refers to the instance of ServiceB
      this.setServiceA(serviceA);
    },
  });
```

## Module Builder API

### `Module()` Factory

Creates a new module builder.

Signature:

```ts
function Module<
  Pr extends object, Pb extends object, Params extends object,
>(): ModuleBuilder<Pr, Pb, Params>
```

Where the type parameters are:

- `Pr = {}`: An object (name to type mapping) of private instances or methods.
- `Pb = {}`: An object (name to type mapping) of public instances or methods.
- `Params = {}`: An object with Module creation time parameters.

```ts
const Main = Module(); // Main is a ModuleBuilder<{}, {}, {}>
```

**Important!**: Considering that type of the `Main` is defined as a type of the
expression result, you should define module structure with the same expression
where you create the module.

So, the following code will not work:

```ts
const Main = Module();

Main
  .private({
    logger: (_, { logLevel }: { logLevel: string }) => new Logger(logLevel),
  })
  .private({
    userRepository: () => new UserRepository(),
  })
  .private({
    authService: ({ userRepository }) => new AuthService(userRepository),
  })
  .publicImpl({
    signIn,
  });
```

Despite the fact that all Main items are defined the type of the `Main` is lost.

### `.private(resolvers, scope?)` Method

Defines one or more resolvers for private instances.

Signature:

```ts
interface ModuleBuilder<Pr extends object, Pb extends object, Params extends object> {

  private<NPr, NP>(
    resolvers: Resolvers<NPr, Pr & Pb, NP & Params>,
    scope?: ScopeType,
  ): ModuleBuilder<Pr & NPr, Pb, NP & Params>

}
```

Where the type parameters are:

- `NPr`: An object (name to type mapping) of new private instances.
- `NP`: An object with new Module creation time parameters.
- `scope = 'module'`: The scope of the instances.

and the arguments are:

- `resolvers`: An object (name to type mapping) of resolvers.
- `scope = 'module'`: The scope of the instances.

```ts
const Main = Module()
  .private({
    logger: (_, { logLevel }: { logLevel: string }) => new Logger(logLevel),
  })
  .private({
    userRepository: () => new UserRepository(),
  })
  .private({
    authService: ({ userRepository }) => new AuthService(userRepository),
  });
```

The resolvers in each `.private` call can access the instances or methods defined in the
previous `.private`, `.public`, `.privateImpl` and `.publicImpl` calls.

### `.public(resolvers, scope?)` Method

Defines one or more resolvers for public instances.

Signature:

```ts
interface ModuleBuilder<Pr extends object, Pb extends object, Params extends object> {

  public<NPb, NP>(
    resolvers: Resolvers<NPb, Pr & Pb, NP & Params>,
    scope?: ScopeType,
  ): ModuleBuilder<Pr, Pb & NPb, NP & Params>

}
```

Where the type parameters are:

- `NPb`: An object (name to type mapping) of new public instances.
- `NP`: An object with new Module creation time parameters.
- `scope = 'module'`: The scope of the instances.

and the arguments are:

- `resolvers`: An object (name to type mapping) of resolvers.
- `scope = 'module'`: The scope of the instances.

```ts
const Main = Module()
  .public({
    // Not Recommended, just for example
    // exposing private authService as public with name auth
    auth: ({ authService }) => authService,
  });
```

The resolvers in each `.public` call can access the instances or methods defined in the
previous `.private`, `.public`, `.privateImpl` and `.publicImpl` calls.

### `.privateImpl(implementation)` Method

Defines one or more private methods.

Signature:

```ts
interface ModuleBuilder<Pr extends object, Pb extends object, Params extends object> {

  privateImpl<Impl extends SomeImpl<Pr & Pb>>(
    implementation: Impl,
  ): ModuleBuilder<Pr & MethodsOf<Impl, Pr & Pb>, Pb, Params>;

}

type SomeImpl<M extends object> = {
  [key: string]: (self: M, ...args: never[]) => unknown;
};

type MethodsOf<Impl extends SomeImpl<M>, M extends object> = {
  [key in keyof Impl]: Impl[key] extends (self: M, ...args: infer A) => infer R
    ? (...args: A) => R
    : never;
};
```

Where the type parameters are:

- `Impl`: An object (name to type mapping) of methods, that accepts Module as a first parameter.
- `M`: An object (name to type mapping) of instances or methods available for injection.

and the argument is:

- `implementation`: An object (name to type mapping) of methods.

```ts
const Main = Module()
  .privateImpl({
    signIn,
  });
```

The methods in each `.privateImpl` call can access the instances or methods defined in the  
previous `.private`, `.public`, `.privateImpl` and `.publicImpl` calls.

**Note**: The methods defined with `.privateImpl` are in `module` scope, even if they
use `transient` or `async` scoped instances. It's because the injection is done at
the moment of the method call, not at the moment of method resolved as a Module item.

The Module methods could be used as a callbacks without any additional binding.

### `.publicImpl(implementation)` Method

Defines one or more public methods.

Signature:

```ts
interface ModuleBuilder<Pr extends object, Pb extends object, Params extends object> {

  publicImpl<Impl extends SomeImpl<Pr & Pb>>(
    implementation: Impl,
  ): ModuleBuilder<Pr, Pb & MethodsOf<Impl, Pr & Pb>, Params>;

}
```

Where the type parameters are:

- `Impl`: An object (name to type mapping) of methods, that accepts Module as a first parameter.
- `M`: An object (name to type mapping) of instances or methods available for injection.

and the argument is:

- `implementation`: An object (name to type mapping) of methods.

```ts
const Main = Module()
  .publicImpl({
    signIn,
  });
```

The methods in each `.publicImpl` call can access the instances or methods defined in the
previous `.private`, `.public`, `.privateImpl` and `.publicImpl` calls.

**Note**: The methods defined with `.publicImpl` are in `module` scope, even if they
use `transient` or `async` scoped instances. It's because the injection is done at
the moment of the method call, not at the moment of method resolved as a Module item.

The Module methods could be used as a callbacks without any additional binding.

### `.init(initializers)` Method

Defines one or more initializers.

Signature:

```ts
interface ModuleBuilder<Pr extends object, Pb extends object, Params extends object> {

  init(initializers: Initializers<Pr & Pb, Params>): ICreatable<Pb, Params>

}
```

Where the `Initializers` type is:

```ts
export type Initializers<M, Params> = {
  [Item in keyof M]?: (this: M[Item], module: Omit<M, Item>, params: Params) => void;
}
```

**Important!**: The `.init` method returns the same module builder as before, but
its type is narrowed to `ICreatable` interface, which is a subset of `ModuleBuilder`
and exclusively allows to create a module by calling the `create` method.

```ts
interface ICreatable<Pb extends object, Params extends object> {
  create(params: Params): Pb;
}
```

### `.create(params)` Method

Creates a module with the provided parameters.

Signature:

```ts
interface ICreatable<Pb extends object, Params extends object> {

  create(params: Params): Pb;

}
```

No module item is created during the module creation. The first item is created
when it is requested.

## Life Cycles

*... Coming soon ...*
