# Module Builder API

- [`Module()` Factory](#module-factory)
- [`.private(resolvers, scope?)` Method](#privateresolvers-scope-method)
- [`.public(resolvers, scope?)` Method](#publicresolvers-scope-method)
- [`.privateImpl(implementation)` Method](#privateimplimplementation-method)
- [`.publicImpl(implementation)` Method](#publicimplimplementation-method)
- [`.init(initializers)` Method](#initinitializers-method)
- [`.create(params)` Method](#createparams-method)

## `Module()` Factory

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

## `.private(resolvers, scope?)` Method

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

## `.public(resolvers, scope?)` Method

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

## `.privateImpl(implementation)` Method

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

## `.publicImpl(implementation)` Method

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

## `.init(initializers)` Method

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

## `.create(params)` Method

Creates a module with the provided parameters.

Signature:

```ts
interface ICreatable<Pb extends object, Params extends object> {

  create(params: Params): Pb;

}
```

No module item is created during the module creation. The first item is created
when it is requested.
