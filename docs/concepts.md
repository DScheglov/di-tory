# Concepts

- [Module](#module)
- [Module Builder](#module-builder)
- [Visibility](#visibility)
- [Resolver](#resolver)
- [Lifecycle (Scope)](#lifecycle-scope)
- [Implementation](#implementation)
- [Initializers](#initializers)

## Module

A container for instances of "Services," which are created on demand with
resolving their dependencies.

In the example above, the module `app` contains instances of `Logger`,
`UserRepository`, and `AuthService` services. The `signIn` function is a
module method.

## Module Builder

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

## Visibility

Defines whether an instance or method could be accessed from outside the module:

- **Public**: An instance or a method that can be accessed from outside the module.
- **Private**: An instance that can only be accessed within the module by
  providing it to a **Resolver** or **Implementation**.

In the example above all service instances are private, and the `signIn` method
is public.

## Resolver

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

## Lifecycle (Scope)

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

## Implementation

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

## Initializers

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