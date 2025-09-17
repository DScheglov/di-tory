import { createModule } from './create-module.js';
import {
  createMethodResolvers,
  decorateResolvers,
} from './decorate-resolvers.js';
import Scope from './scope.js';
import type {
  Initializers,
  ModuleBuilder,
  NotOf,
  Resolvers,
  ScopeType,
  SomeImpl,
} from './types';

type UnknownObject = Record<PropertyKey, unknown>;
type UnknownBuilderState = {
  privateResolvers: Resolvers<UnknownObject, UnknownObject, UnknownObject>;
  publicResolvers: Resolvers<UnknownObject, UnknownObject, UnknownObject>;
  initializers: Initializers<UnknownObject, UnknownObject> | null;
};

const buildersState = new WeakMap<object, UnknownBuilderState>();

const Module = <
  Pr extends object = { [key in never]: never },
  Pb extends object = { [key in never]: never },
  Params extends object = { [key in never]: never },
>(): ModuleBuilder<Pr, Pb, Params> => {
  const privateResolvers = {} as Resolvers<Pr, Pr & Pb, Params>;
  const publicResolvers = {} as Resolvers<Pb, Pr & Pb, Params>;

  const state = {
    privateResolvers,
    publicResolvers,
    initializers: null as Initializers<Pr & Pb, Params> | null,
  };

  const self = {
    private<NPr extends NotOf<Pr & Pb>, NP extends object>(
      resolvers: Resolvers<NPr, Pr & Pb, NP & Params>,
      scope?: ScopeType,
    ) {
      if (state.initializers != null) {
        throw new Error('Cannot extend initialized module');
      }
      Object.defineProperties(
        privateResolvers,
        Object.getOwnPropertyDescriptors(
          decorateResolvers(resolvers, scope ?? Scope.module),
        ),
      );
      return self as unknown;
    },

    privateImpl<Impl extends SomeImpl<Pr & Pb>>(implementation: Impl) {
      if (state.initializers != null) {
        throw new Error('Cannot extend initialized module');
      }
      Object.defineProperties(
        privateResolvers,
        Object.getOwnPropertyDescriptors(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          createMethodResolvers(implementation as any),
        ),
      );
      return self as unknown;
    },

    public<NPb extends NotOf<Pr & Pb>, NP extends object>(
      resolvers: Resolvers<NPb, Pr & Pb, NP & Params>,
      scope?: ScopeType,
    ) {
      if (state.initializers != null) {
        throw new Error('Cannot extend initialized module');
      }
      Object.defineProperties(
        publicResolvers,
        Object.getOwnPropertyDescriptors(
          decorateResolvers(resolvers, scope ?? Scope.module),
        ),
      );
      return self;
    },

    publicImpl<Impl extends SomeImpl<Pr & Pb>>(implementation: Impl) {
      if (state.initializers != null) {
        throw new Error('Cannot extend initialized module');
      }
      Object.defineProperties(
        publicResolvers,
        Object.getOwnPropertyDescriptors(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          createMethodResolvers(implementation as any),
        ),
      );
      return self;
    },

    init(initializer: Initializers<Pr & Pb, Params>) {
      state.initializers = initializer;
      return self;
    },

    create(params: Params = {} as Params): Pb {
      return createModule<Pr, Pb, Params>(
        privateResolvers,
        publicResolvers,
        state.initializers,
        params,
      );
    },
  };

  buildersState.set(self, state as UnknownBuilderState);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return self as any;
};

export default Module;
