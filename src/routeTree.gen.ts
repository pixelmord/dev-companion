/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as AuthedImport } from './routes/_authed'
import { Route as IndexImport } from './routes/index'
import { Route as SignInSplatImport } from './routes/sign-in.$'
import { Route as ExampleChatImport } from './routes/example.chat'
import { Route as DemoTanstackQueryImport } from './routes/demo.tanstack-query'
import { Route as DemoTableImport } from './routes/demo.table'
import { Route as DemoStoreImport } from './routes/demo.store'
import { Route as DemoConvexImport } from './routes/demo.convex'
import { Route as DemoClerkImport } from './routes/demo.clerk'
import { Route as AuthedTasksImport } from './routes/_authed/tasks'
import { Route as AuthedDashboardImport } from './routes/_authed/dashboard'
import { Route as AuthedBoardsImport } from './routes/_authed/boards'
import { Route as ExampleGuitarsIndexImport } from './routes/example.guitars/index'
import { Route as ExampleGuitarsGuitarIdImport } from './routes/example.guitars/$guitarId'
import { Route as DemoStartServerFuncsImport } from './routes/demo.start.server-funcs'
import { Route as DemoStartApiRequestImport } from './routes/demo.start.api-request'
import { Route as DemoSentryTestingImport } from './routes/demo.sentry.testing'
import { Route as DemoFormSimpleImport } from './routes/demo.form.simple'
import { Route as DemoFormAddressImport } from './routes/demo.form.address'
import { Route as AuthedBoardsBoardIdImport } from './routes/_authed/boards.$boardId'

// Create/Update Routes

const AuthedRoute = AuthedImport.update({
  id: '/_authed',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const SignInSplatRoute = SignInSplatImport.update({
  id: '/sign-in/$',
  path: '/sign-in/$',
  getParentRoute: () => rootRoute,
} as any)

const ExampleChatRoute = ExampleChatImport.update({
  id: '/example/chat',
  path: '/example/chat',
  getParentRoute: () => rootRoute,
} as any)

const DemoTanstackQueryRoute = DemoTanstackQueryImport.update({
  id: '/demo/tanstack-query',
  path: '/demo/tanstack-query',
  getParentRoute: () => rootRoute,
} as any)

const DemoTableRoute = DemoTableImport.update({
  id: '/demo/table',
  path: '/demo/table',
  getParentRoute: () => rootRoute,
} as any)

const DemoStoreRoute = DemoStoreImport.update({
  id: '/demo/store',
  path: '/demo/store',
  getParentRoute: () => rootRoute,
} as any)

const DemoConvexRoute = DemoConvexImport.update({
  id: '/demo/convex',
  path: '/demo/convex',
  getParentRoute: () => rootRoute,
} as any)

const DemoClerkRoute = DemoClerkImport.update({
  id: '/demo/clerk',
  path: '/demo/clerk',
  getParentRoute: () => rootRoute,
} as any)

const AuthedTasksRoute = AuthedTasksImport.update({
  id: '/tasks',
  path: '/tasks',
  getParentRoute: () => AuthedRoute,
} as any)

const AuthedDashboardRoute = AuthedDashboardImport.update({
  id: '/dashboard',
  path: '/dashboard',
  getParentRoute: () => AuthedRoute,
} as any)

const AuthedBoardsRoute = AuthedBoardsImport.update({
  id: '/boards',
  path: '/boards',
  getParentRoute: () => AuthedRoute,
} as any)

const ExampleGuitarsIndexRoute = ExampleGuitarsIndexImport.update({
  id: '/example/guitars/',
  path: '/example/guitars/',
  getParentRoute: () => rootRoute,
} as any)

const ExampleGuitarsGuitarIdRoute = ExampleGuitarsGuitarIdImport.update({
  id: '/example/guitars/$guitarId',
  path: '/example/guitars/$guitarId',
  getParentRoute: () => rootRoute,
} as any)

const DemoStartServerFuncsRoute = DemoStartServerFuncsImport.update({
  id: '/demo/start/server-funcs',
  path: '/demo/start/server-funcs',
  getParentRoute: () => rootRoute,
} as any)

const DemoStartApiRequestRoute = DemoStartApiRequestImport.update({
  id: '/demo/start/api-request',
  path: '/demo/start/api-request',
  getParentRoute: () => rootRoute,
} as any)

const DemoSentryTestingRoute = DemoSentryTestingImport.update({
  id: '/demo/sentry/testing',
  path: '/demo/sentry/testing',
  getParentRoute: () => rootRoute,
} as any)

const DemoFormSimpleRoute = DemoFormSimpleImport.update({
  id: '/demo/form/simple',
  path: '/demo/form/simple',
  getParentRoute: () => rootRoute,
} as any)

const DemoFormAddressRoute = DemoFormAddressImport.update({
  id: '/demo/form/address',
  path: '/demo/form/address',
  getParentRoute: () => rootRoute,
} as any)

const AuthedBoardsBoardIdRoute = AuthedBoardsBoardIdImport.update({
  id: '/$boardId',
  path: '/$boardId',
  getParentRoute: () => AuthedBoardsRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/_authed': {
      id: '/_authed'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof AuthedImport
      parentRoute: typeof rootRoute
    }
    '/_authed/boards': {
      id: '/_authed/boards'
      path: '/boards'
      fullPath: '/boards'
      preLoaderRoute: typeof AuthedBoardsImport
      parentRoute: typeof AuthedImport
    }
    '/_authed/dashboard': {
      id: '/_authed/dashboard'
      path: '/dashboard'
      fullPath: '/dashboard'
      preLoaderRoute: typeof AuthedDashboardImport
      parentRoute: typeof AuthedImport
    }
    '/_authed/tasks': {
      id: '/_authed/tasks'
      path: '/tasks'
      fullPath: '/tasks'
      preLoaderRoute: typeof AuthedTasksImport
      parentRoute: typeof AuthedImport
    }
    '/demo/clerk': {
      id: '/demo/clerk'
      path: '/demo/clerk'
      fullPath: '/demo/clerk'
      preLoaderRoute: typeof DemoClerkImport
      parentRoute: typeof rootRoute
    }
    '/demo/convex': {
      id: '/demo/convex'
      path: '/demo/convex'
      fullPath: '/demo/convex'
      preLoaderRoute: typeof DemoConvexImport
      parentRoute: typeof rootRoute
    }
    '/demo/store': {
      id: '/demo/store'
      path: '/demo/store'
      fullPath: '/demo/store'
      preLoaderRoute: typeof DemoStoreImport
      parentRoute: typeof rootRoute
    }
    '/demo/table': {
      id: '/demo/table'
      path: '/demo/table'
      fullPath: '/demo/table'
      preLoaderRoute: typeof DemoTableImport
      parentRoute: typeof rootRoute
    }
    '/demo/tanstack-query': {
      id: '/demo/tanstack-query'
      path: '/demo/tanstack-query'
      fullPath: '/demo/tanstack-query'
      preLoaderRoute: typeof DemoTanstackQueryImport
      parentRoute: typeof rootRoute
    }
    '/example/chat': {
      id: '/example/chat'
      path: '/example/chat'
      fullPath: '/example/chat'
      preLoaderRoute: typeof ExampleChatImport
      parentRoute: typeof rootRoute
    }
    '/sign-in/$': {
      id: '/sign-in/$'
      path: '/sign-in/$'
      fullPath: '/sign-in/$'
      preLoaderRoute: typeof SignInSplatImport
      parentRoute: typeof rootRoute
    }
    '/_authed/boards/$boardId': {
      id: '/_authed/boards/$boardId'
      path: '/$boardId'
      fullPath: '/boards/$boardId'
      preLoaderRoute: typeof AuthedBoardsBoardIdImport
      parentRoute: typeof AuthedBoardsImport
    }
    '/demo/form/address': {
      id: '/demo/form/address'
      path: '/demo/form/address'
      fullPath: '/demo/form/address'
      preLoaderRoute: typeof DemoFormAddressImport
      parentRoute: typeof rootRoute
    }
    '/demo/form/simple': {
      id: '/demo/form/simple'
      path: '/demo/form/simple'
      fullPath: '/demo/form/simple'
      preLoaderRoute: typeof DemoFormSimpleImport
      parentRoute: typeof rootRoute
    }
    '/demo/sentry/testing': {
      id: '/demo/sentry/testing'
      path: '/demo/sentry/testing'
      fullPath: '/demo/sentry/testing'
      preLoaderRoute: typeof DemoSentryTestingImport
      parentRoute: typeof rootRoute
    }
    '/demo/start/api-request': {
      id: '/demo/start/api-request'
      path: '/demo/start/api-request'
      fullPath: '/demo/start/api-request'
      preLoaderRoute: typeof DemoStartApiRequestImport
      parentRoute: typeof rootRoute
    }
    '/demo/start/server-funcs': {
      id: '/demo/start/server-funcs'
      path: '/demo/start/server-funcs'
      fullPath: '/demo/start/server-funcs'
      preLoaderRoute: typeof DemoStartServerFuncsImport
      parentRoute: typeof rootRoute
    }
    '/example/guitars/$guitarId': {
      id: '/example/guitars/$guitarId'
      path: '/example/guitars/$guitarId'
      fullPath: '/example/guitars/$guitarId'
      preLoaderRoute: typeof ExampleGuitarsGuitarIdImport
      parentRoute: typeof rootRoute
    }
    '/example/guitars/': {
      id: '/example/guitars/'
      path: '/example/guitars'
      fullPath: '/example/guitars'
      preLoaderRoute: typeof ExampleGuitarsIndexImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

interface AuthedBoardsRouteChildren {
  AuthedBoardsBoardIdRoute: typeof AuthedBoardsBoardIdRoute
}

const AuthedBoardsRouteChildren: AuthedBoardsRouteChildren = {
  AuthedBoardsBoardIdRoute: AuthedBoardsBoardIdRoute,
}

const AuthedBoardsRouteWithChildren = AuthedBoardsRoute._addFileChildren(
  AuthedBoardsRouteChildren,
)

interface AuthedRouteChildren {
  AuthedBoardsRoute: typeof AuthedBoardsRouteWithChildren
  AuthedDashboardRoute: typeof AuthedDashboardRoute
  AuthedTasksRoute: typeof AuthedTasksRoute
}

const AuthedRouteChildren: AuthedRouteChildren = {
  AuthedBoardsRoute: AuthedBoardsRouteWithChildren,
  AuthedDashboardRoute: AuthedDashboardRoute,
  AuthedTasksRoute: AuthedTasksRoute,
}

const AuthedRouteWithChildren =
  AuthedRoute._addFileChildren(AuthedRouteChildren)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '': typeof AuthedRouteWithChildren
  '/boards': typeof AuthedBoardsRouteWithChildren
  '/dashboard': typeof AuthedDashboardRoute
  '/tasks': typeof AuthedTasksRoute
  '/demo/clerk': typeof DemoClerkRoute
  '/demo/convex': typeof DemoConvexRoute
  '/demo/store': typeof DemoStoreRoute
  '/demo/table': typeof DemoTableRoute
  '/demo/tanstack-query': typeof DemoTanstackQueryRoute
  '/example/chat': typeof ExampleChatRoute
  '/sign-in/$': typeof SignInSplatRoute
  '/boards/$boardId': typeof AuthedBoardsBoardIdRoute
  '/demo/form/address': typeof DemoFormAddressRoute
  '/demo/form/simple': typeof DemoFormSimpleRoute
  '/demo/sentry/testing': typeof DemoSentryTestingRoute
  '/demo/start/api-request': typeof DemoStartApiRequestRoute
  '/demo/start/server-funcs': typeof DemoStartServerFuncsRoute
  '/example/guitars/$guitarId': typeof ExampleGuitarsGuitarIdRoute
  '/example/guitars': typeof ExampleGuitarsIndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '': typeof AuthedRouteWithChildren
  '/boards': typeof AuthedBoardsRouteWithChildren
  '/dashboard': typeof AuthedDashboardRoute
  '/tasks': typeof AuthedTasksRoute
  '/demo/clerk': typeof DemoClerkRoute
  '/demo/convex': typeof DemoConvexRoute
  '/demo/store': typeof DemoStoreRoute
  '/demo/table': typeof DemoTableRoute
  '/demo/tanstack-query': typeof DemoTanstackQueryRoute
  '/example/chat': typeof ExampleChatRoute
  '/sign-in/$': typeof SignInSplatRoute
  '/boards/$boardId': typeof AuthedBoardsBoardIdRoute
  '/demo/form/address': typeof DemoFormAddressRoute
  '/demo/form/simple': typeof DemoFormSimpleRoute
  '/demo/sentry/testing': typeof DemoSentryTestingRoute
  '/demo/start/api-request': typeof DemoStartApiRequestRoute
  '/demo/start/server-funcs': typeof DemoStartServerFuncsRoute
  '/example/guitars/$guitarId': typeof ExampleGuitarsGuitarIdRoute
  '/example/guitars': typeof ExampleGuitarsIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/_authed': typeof AuthedRouteWithChildren
  '/_authed/boards': typeof AuthedBoardsRouteWithChildren
  '/_authed/dashboard': typeof AuthedDashboardRoute
  '/_authed/tasks': typeof AuthedTasksRoute
  '/demo/clerk': typeof DemoClerkRoute
  '/demo/convex': typeof DemoConvexRoute
  '/demo/store': typeof DemoStoreRoute
  '/demo/table': typeof DemoTableRoute
  '/demo/tanstack-query': typeof DemoTanstackQueryRoute
  '/example/chat': typeof ExampleChatRoute
  '/sign-in/$': typeof SignInSplatRoute
  '/_authed/boards/$boardId': typeof AuthedBoardsBoardIdRoute
  '/demo/form/address': typeof DemoFormAddressRoute
  '/demo/form/simple': typeof DemoFormSimpleRoute
  '/demo/sentry/testing': typeof DemoSentryTestingRoute
  '/demo/start/api-request': typeof DemoStartApiRequestRoute
  '/demo/start/server-funcs': typeof DemoStartServerFuncsRoute
  '/example/guitars/$guitarId': typeof ExampleGuitarsGuitarIdRoute
  '/example/guitars/': typeof ExampleGuitarsIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | ''
    | '/boards'
    | '/dashboard'
    | '/tasks'
    | '/demo/clerk'
    | '/demo/convex'
    | '/demo/store'
    | '/demo/table'
    | '/demo/tanstack-query'
    | '/example/chat'
    | '/sign-in/$'
    | '/boards/$boardId'
    | '/demo/form/address'
    | '/demo/form/simple'
    | '/demo/sentry/testing'
    | '/demo/start/api-request'
    | '/demo/start/server-funcs'
    | '/example/guitars/$guitarId'
    | '/example/guitars'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | ''
    | '/boards'
    | '/dashboard'
    | '/tasks'
    | '/demo/clerk'
    | '/demo/convex'
    | '/demo/store'
    | '/demo/table'
    | '/demo/tanstack-query'
    | '/example/chat'
    | '/sign-in/$'
    | '/boards/$boardId'
    | '/demo/form/address'
    | '/demo/form/simple'
    | '/demo/sentry/testing'
    | '/demo/start/api-request'
    | '/demo/start/server-funcs'
    | '/example/guitars/$guitarId'
    | '/example/guitars'
  id:
    | '__root__'
    | '/'
    | '/_authed'
    | '/_authed/boards'
    | '/_authed/dashboard'
    | '/_authed/tasks'
    | '/demo/clerk'
    | '/demo/convex'
    | '/demo/store'
    | '/demo/table'
    | '/demo/tanstack-query'
    | '/example/chat'
    | '/sign-in/$'
    | '/_authed/boards/$boardId'
    | '/demo/form/address'
    | '/demo/form/simple'
    | '/demo/sentry/testing'
    | '/demo/start/api-request'
    | '/demo/start/server-funcs'
    | '/example/guitars/$guitarId'
    | '/example/guitars/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AuthedRoute: typeof AuthedRouteWithChildren
  DemoClerkRoute: typeof DemoClerkRoute
  DemoConvexRoute: typeof DemoConvexRoute
  DemoStoreRoute: typeof DemoStoreRoute
  DemoTableRoute: typeof DemoTableRoute
  DemoTanstackQueryRoute: typeof DemoTanstackQueryRoute
  ExampleChatRoute: typeof ExampleChatRoute
  SignInSplatRoute: typeof SignInSplatRoute
  DemoFormAddressRoute: typeof DemoFormAddressRoute
  DemoFormSimpleRoute: typeof DemoFormSimpleRoute
  DemoSentryTestingRoute: typeof DemoSentryTestingRoute
  DemoStartApiRequestRoute: typeof DemoStartApiRequestRoute
  DemoStartServerFuncsRoute: typeof DemoStartServerFuncsRoute
  ExampleGuitarsGuitarIdRoute: typeof ExampleGuitarsGuitarIdRoute
  ExampleGuitarsIndexRoute: typeof ExampleGuitarsIndexRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AuthedRoute: AuthedRouteWithChildren,
  DemoClerkRoute: DemoClerkRoute,
  DemoConvexRoute: DemoConvexRoute,
  DemoStoreRoute: DemoStoreRoute,
  DemoTableRoute: DemoTableRoute,
  DemoTanstackQueryRoute: DemoTanstackQueryRoute,
  ExampleChatRoute: ExampleChatRoute,
  SignInSplatRoute: SignInSplatRoute,
  DemoFormAddressRoute: DemoFormAddressRoute,
  DemoFormSimpleRoute: DemoFormSimpleRoute,
  DemoSentryTestingRoute: DemoSentryTestingRoute,
  DemoStartApiRequestRoute: DemoStartApiRequestRoute,
  DemoStartServerFuncsRoute: DemoStartServerFuncsRoute,
  ExampleGuitarsGuitarIdRoute: ExampleGuitarsGuitarIdRoute,
  ExampleGuitarsIndexRoute: ExampleGuitarsIndexRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/_authed",
        "/demo/clerk",
        "/demo/convex",
        "/demo/store",
        "/demo/table",
        "/demo/tanstack-query",
        "/example/chat",
        "/sign-in/$",
        "/demo/form/address",
        "/demo/form/simple",
        "/demo/sentry/testing",
        "/demo/start/api-request",
        "/demo/start/server-funcs",
        "/example/guitars/$guitarId",
        "/example/guitars/"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/_authed": {
      "filePath": "_authed.tsx",
      "children": [
        "/_authed/boards",
        "/_authed/dashboard",
        "/_authed/tasks"
      ]
    },
    "/_authed/boards": {
      "filePath": "_authed/boards.tsx",
      "parent": "/_authed",
      "children": [
        "/_authed/boards/$boardId"
      ]
    },
    "/_authed/dashboard": {
      "filePath": "_authed/dashboard.tsx",
      "parent": "/_authed"
    },
    "/_authed/tasks": {
      "filePath": "_authed/tasks.tsx",
      "parent": "/_authed"
    },
    "/demo/clerk": {
      "filePath": "demo.clerk.tsx"
    },
    "/demo/convex": {
      "filePath": "demo.convex.tsx"
    },
    "/demo/store": {
      "filePath": "demo.store.tsx"
    },
    "/demo/table": {
      "filePath": "demo.table.tsx"
    },
    "/demo/tanstack-query": {
      "filePath": "demo.tanstack-query.tsx"
    },
    "/example/chat": {
      "filePath": "example.chat.tsx"
    },
    "/sign-in/$": {
      "filePath": "sign-in.$.tsx"
    },
    "/_authed/boards/$boardId": {
      "filePath": "_authed/boards.$boardId.tsx",
      "parent": "/_authed/boards"
    },
    "/demo/form/address": {
      "filePath": "demo.form.address.tsx"
    },
    "/demo/form/simple": {
      "filePath": "demo.form.simple.tsx"
    },
    "/demo/sentry/testing": {
      "filePath": "demo.sentry.testing.tsx"
    },
    "/demo/start/api-request": {
      "filePath": "demo.start.api-request.tsx"
    },
    "/demo/start/server-funcs": {
      "filePath": "demo.start.server-funcs.tsx"
    },
    "/example/guitars/$guitarId": {
      "filePath": "example.guitars/$guitarId.tsx"
    },
    "/example/guitars/": {
      "filePath": "example.guitars/index.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
