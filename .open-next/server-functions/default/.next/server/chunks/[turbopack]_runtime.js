const RUNTIME_PUBLIC_PATH = "server/chunks/[turbopack]_runtime.js";
const RELATIVE_ROOT_PATH = "..";
const ASSET_PREFIX = "/";
/**
 * This file contains runtime types and functions that are shared between all
 * TurboPack ECMAScript runtimes.
 *
 * It will be prepended to the runtime code of each runtime.
 */ /* eslint-disable @typescript-eslint/no-unused-vars */ /// <reference path="./runtime-types.d.ts" />
const REEXPORTED_OBJECTS = new WeakMap();
/**
 * Constructs the `__turbopack_context__` object for a module.
 */ function Context(module, exports) {
    this.m = module;
    // We need to store this here instead of accessing it from the module object to:
    // 1. Make it available to factories directly, since we rewrite `this` to
    //    `__turbopack_context__.e` in CJS modules.
    // 2. Support async modules which rewrite `module.exports` to a promise, so we
    //    can still access the original exports object from functions like
    //    `esmExport`
    // Ideally we could find a new approach for async modules and drop this property altogether.
    this.e = exports;
}
const contextPrototype = Context.prototype;
const hasOwnProperty = Object.prototype.hasOwnProperty;
const toStringTag = typeof Symbol !== 'undefined' && Symbol.toStringTag;
function defineProp(obj, name, options) {
    if (!hasOwnProperty.call(obj, name)) Object.defineProperty(obj, name, options);
}
function getOverwrittenModule(moduleCache, id) {
    let module = moduleCache[id];
    if (!module) {
        // This is invoked when a module is merged into another module, thus it wasn't invoked via
        // instantiateModule and the cache entry wasn't created yet.
        module = createModuleObject(id);
        moduleCache[id] = module;
    }
    return module;
}
/**
 * Creates the module object. Only done here to ensure all module objects have the same shape.
 */ function createModuleObject(id) {
    return {
        exports: {},
        error: undefined,
        id,
        namespaceObject: undefined
    };
}
const BindingTag_Value = 0;
/**
 * Adds the getters to the exports object.
 */ function esm(exports, bindings) {
    defineProp(exports, '__esModule', {
        value: true
    });
    if (toStringTag) defineProp(exports, toStringTag, {
        value: 'Module'
    });
    let i = 0;
    while(i < bindings.length){
        const propName = bindings[i++];
        const tagOrFunction = bindings[i++];
        if (typeof tagOrFunction === 'number') {
            if (tagOrFunction === BindingTag_Value) {
                defineProp(exports, propName, {
                    value: bindings[i++],
                    enumerable: true,
                    writable: false
                });
            } else {
                throw new Error(`unexpected tag: ${tagOrFunction}`);
            }
        } else {
            const getterFn = tagOrFunction;
            if (typeof bindings[i] === 'function') {
                const setterFn = bindings[i++];
                defineProp(exports, propName, {
                    get: getterFn,
                    set: setterFn,
                    enumerable: true
                });
            } else {
                defineProp(exports, propName, {
                    get: getterFn,
                    enumerable: true
                });
            }
        }
    }
    Object.seal(exports);
}
/**
 * Makes the module an ESM with exports
 */ function esmExport(bindings, id) {
    let module;
    let exports;
    if (id != null) {
        module = getOverwrittenModule(this.c, id);
        exports = module.exports;
    } else {
        module = this.m;
        exports = this.e;
    }
    module.namespaceObject = exports;
    esm(exports, bindings);
}
contextPrototype.s = esmExport;
function ensureDynamicExports(module, exports) {
    let reexportedObjects = REEXPORTED_OBJECTS.get(module);
    if (!reexportedObjects) {
        REEXPORTED_OBJECTS.set(module, reexportedObjects = []);
        module.exports = module.namespaceObject = new Proxy(exports, {
            get (target, prop) {
                if (hasOwnProperty.call(target, prop) || prop === 'default' || prop === '__esModule') {
                    return Reflect.get(target, prop);
                }
                for (const obj of reexportedObjects){
                    const value = Reflect.get(obj, prop);
                    if (value !== undefined) return value;
                }
                return undefined;
            },
            ownKeys (target) {
                const keys = Reflect.ownKeys(target);
                for (const obj of reexportedObjects){
                    for (const key of Reflect.ownKeys(obj)){
                        if (key !== 'default' && !keys.includes(key)) keys.push(key);
                    }
                }
                return keys;
            }
        });
    }
    return reexportedObjects;
}
/**
 * Dynamically exports properties from an object
 */ function dynamicExport(object, id) {
    let module;
    let exports;
    if (id != null) {
        module = getOverwrittenModule(this.c, id);
        exports = module.exports;
    } else {
        module = this.m;
        exports = this.e;
    }
    const reexportedObjects = ensureDynamicExports(module, exports);
    if (typeof object === 'object' && object !== null) {
        reexportedObjects.push(object);
    }
}
contextPrototype.j = dynamicExport;
function exportValue(value, id) {
    let module;
    if (id != null) {
        module = getOverwrittenModule(this.c, id);
    } else {
        module = this.m;
    }
    module.exports = value;
}
contextPrototype.v = exportValue;
function exportNamespace(namespace, id) {
    let module;
    if (id != null) {
        module = getOverwrittenModule(this.c, id);
    } else {
        module = this.m;
    }
    module.exports = module.namespaceObject = namespace;
}
contextPrototype.n = exportNamespace;
function createGetter(obj, key) {
    return ()=>obj[key];
}
/**
 * @returns prototype of the object
 */ const getProto = Object.getPrototypeOf ? (obj)=>Object.getPrototypeOf(obj) : (obj)=>obj.__proto__;
/** Prototypes that are not expanded for exports */ const LEAF_PROTOTYPES = [
    null,
    getProto({}),
    getProto([]),
    getProto(getProto)
];
/**
 * @param raw
 * @param ns
 * @param allowExportDefault
 *   * `false`: will have the raw module as default export
 *   * `true`: will have the default property as default export
 */ function interopEsm(raw, ns, allowExportDefault) {
    const bindings = [];
    let defaultLocation = -1;
    for(let current = raw; (typeof current === 'object' || typeof current === 'function') && !LEAF_PROTOTYPES.includes(current); current = getProto(current)){
        for (const key of Object.getOwnPropertyNames(current)){
            bindings.push(key, createGetter(raw, key));
            if (defaultLocation === -1 && key === 'default') {
                defaultLocation = bindings.length - 1;
            }
        }
    }
    // this is not really correct
    // we should set the `default` getter if the imported module is a `.cjs file`
    if (!(allowExportDefault && defaultLocation >= 0)) {
        // Replace the binding with one for the namespace itself in order to preserve iteration order.
        if (defaultLocation >= 0) {
            // Replace the getter with the value
            bindings.splice(defaultLocation, 1, BindingTag_Value, raw);
        } else {
            bindings.push('default', BindingTag_Value, raw);
        }
    }
    esm(ns, bindings);
    return ns;
}
function createNS(raw) {
    if (typeof raw === 'function') {
        return function(...args) {
            return raw.apply(this, args);
        };
    } else {
        return Object.create(null);
    }
}
function esmImport(id) {
    const module = getOrInstantiateModuleFromParent(id, this.m);
    // any ES module has to have `module.namespaceObject` defined.
    if (module.namespaceObject) return module.namespaceObject;
    // only ESM can be an async module, so we don't need to worry about exports being a promise here.
    const raw = module.exports;
    return module.namespaceObject = interopEsm(raw, createNS(raw), raw && raw.__esModule);
}
contextPrototype.i = esmImport;
function asyncLoader(moduleId) {
    const loader = this.r(moduleId);
    return loader(esmImport.bind(this));
}
contextPrototype.A = asyncLoader;
// Add a simple runtime require so that environments without one can still pass
// `typeof require` CommonJS checks so that exports are correctly registered.
const runtimeRequire = // @ts-ignore
typeof require === 'function' ? require : function require1() {
    throw new Error('Unexpected use of runtime require');
};
contextPrototype.t = runtimeRequire;
function commonJsRequire(id) {
    return getOrInstantiateModuleFromParent(id, this.m).exports;
}
contextPrototype.r = commonJsRequire;
/**
 * Remove fragments and query parameters since they are never part of the context map keys
 *
 * This matches how we parse patterns at resolving time.  Arguably we should only do this for
 * strings passed to `import` but the resolve does it for `import` and `require` and so we do
 * here as well.
 */ function parseRequest(request) {
    // Per the URI spec fragments can contain `?` characters, so we should trim it off first
    // https://datatracker.ietf.org/doc/html/rfc3986#section-3.5
    const hashIndex = request.indexOf('#');
    if (hashIndex !== -1) {
        request = request.substring(0, hashIndex);
    }
    const queryIndex = request.indexOf('?');
    if (queryIndex !== -1) {
        request = request.substring(0, queryIndex);
    }
    return request;
}
/**
 * `require.context` and require/import expression runtime.
 */ function moduleContext(map) {
    function moduleContext(id) {
        id = parseRequest(id);
        if (hasOwnProperty.call(map, id)) {
            return map[id].module();
        }
        const e = new Error(`Cannot find module '${id}'`);
        e.code = 'MODULE_NOT_FOUND';
        throw e;
    }
    moduleContext.keys = ()=>{
        return Object.keys(map);
    };
    moduleContext.resolve = (id)=>{
        id = parseRequest(id);
        if (hasOwnProperty.call(map, id)) {
            return map[id].id();
        }
        const e = new Error(`Cannot find module '${id}'`);
        e.code = 'MODULE_NOT_FOUND';
        throw e;
    };
    moduleContext.import = async (id)=>{
        return await moduleContext(id);
    };
    return moduleContext;
}
contextPrototype.f = moduleContext;
/**
 * Returns the path of a chunk defined by its data.
 */ function getChunkPath(chunkData) {
    return typeof chunkData === 'string' ? chunkData : chunkData.path;
}
function isPromise(maybePromise) {
    return maybePromise != null && typeof maybePromise === 'object' && 'then' in maybePromise && typeof maybePromise.then === 'function';
}
function isAsyncModuleExt(obj) {
    return turbopackQueues in obj;
}
function createPromise() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej)=>{
        reject = rej;
        resolve = res;
    });
    return {
        promise,
        resolve: resolve,
        reject: reject
    };
}
// Load the CompressedmoduleFactories of a chunk into the `moduleFactories` Map.
// The CompressedModuleFactories format is
// - 1 or more module ids
// - a module factory function
// So walking this is a little complex but the flat structure is also fast to
// traverse, we can use `typeof` operators to distinguish the two cases.
function installCompressedModuleFactories(chunkModules, offset, moduleFactories, newModuleId) {
    let i = offset;
    while(i < chunkModules.length){
        let moduleId = chunkModules[i];
        let end = i + 1;
        // Find our factory function
        while(end < chunkModules.length && typeof chunkModules[end] !== 'function'){
            end++;
        }
        if (end === chunkModules.length) {
            throw new Error('malformed chunk format, expected a factory function');
        }
        // Each chunk item has a 'primary id' and optional additional ids. If the primary id is already
        // present we know all the additional ids are also present, so we don't need to check.
        if (!moduleFactories.has(moduleId)) {
            const moduleFactoryFn = chunkModules[end];
            applyModuleFactoryName(moduleFactoryFn);
            newModuleId?.(moduleId);
            for(; i < end; i++){
                moduleId = chunkModules[i];
                moduleFactories.set(moduleId, moduleFactoryFn);
            }
        }
        i = end + 1; // end is pointing at the last factory advance to the next id or the end of the array.
    }
}
// everything below is adapted from webpack
// https://github.com/webpack/webpack/blob/6be4065ade1e252c1d8dcba4af0f43e32af1bdc1/lib/runtime/AsyncModuleRuntimeModule.js#L13
const turbopackQueues = Symbol('turbopack queues');
const turbopackExports = Symbol('turbopack exports');
const turbopackError = Symbol('turbopack error');
function resolveQueue(queue) {
    if (queue && queue.status !== 1) {
        queue.status = 1;
        queue.forEach((fn)=>fn.queueCount--);
        queue.forEach((fn)=>fn.queueCount-- ? fn.queueCount++ : fn());
    }
}
function wrapDeps(deps) {
    return deps.map((dep)=>{
        if (dep !== null && typeof dep === 'object') {
            if (isAsyncModuleExt(dep)) return dep;
            if (isPromise(dep)) {
                const queue = Object.assign([], {
                    status: 0
                });
                const obj = {
                    [turbopackExports]: {},
                    [turbopackQueues]: (fn)=>fn(queue)
                };
                dep.then((res)=>{
                    obj[turbopackExports] = res;
                    resolveQueue(queue);
                }, (err)=>{
                    obj[turbopackError] = err;
                    resolveQueue(queue);
                });
                return obj;
            }
        }
        return {
            [turbopackExports]: dep,
            [turbopackQueues]: ()=>{}
        };
    });
}
function asyncModule(body, hasAwait) {
    const module = this.m;
    const queue = hasAwait ? Object.assign([], {
        status: -1
    }) : undefined;
    const depQueues = new Set();
    const { resolve, reject, promise: rawPromise } = createPromise();
    const promise = Object.assign(rawPromise, {
        [turbopackExports]: module.exports,
        [turbopackQueues]: (fn)=>{
            queue && fn(queue);
            depQueues.forEach(fn);
            promise['catch'](()=>{});
        }
    });
    const attributes = {
        get () {
            return promise;
        },
        set (v) {
            // Calling `esmExport` leads to this.
            if (v !== promise) {
                promise[turbopackExports] = v;
            }
        }
    };
    Object.defineProperty(module, 'exports', attributes);
    Object.defineProperty(module, 'namespaceObject', attributes);
    function handleAsyncDependencies(deps) {
        const currentDeps = wrapDeps(deps);
        const getResult = ()=>currentDeps.map((d)=>{
                if (d[turbopackError]) throw d[turbopackError];
                return d[turbopackExports];
            });
        const { promise, resolve } = createPromise();
        const fn = Object.assign(()=>resolve(getResult), {
            queueCount: 0
        });
        function fnQueue(q) {
            if (q !== queue && !depQueues.has(q)) {
                depQueues.add(q);
                if (q && q.status === 0) {
                    fn.queueCount++;
                    q.push(fn);
                }
            }
        }
        currentDeps.map((dep)=>dep[turbopackQueues](fnQueue));
        return fn.queueCount ? promise : getResult();
    }
    function asyncResult(err) {
        if (err) {
            reject(promise[turbopackError] = err);
        } else {
            resolve(promise[turbopackExports]);
        }
        resolveQueue(queue);
    }
    body(handleAsyncDependencies, asyncResult);
    if (queue && queue.status === -1) {
        queue.status = 0;
    }
}
contextPrototype.a = asyncModule;
/**
 * A pseudo "fake" URL object to resolve to its relative path.
 *
 * When UrlRewriteBehavior is set to relative, calls to the `new URL()` will construct url without base using this
 * runtime function to generate context-agnostic urls between different rendering context, i.e ssr / client to avoid
 * hydration mismatch.
 *
 * This is based on webpack's existing implementation:
 * https://github.com/webpack/webpack/blob/87660921808566ef3b8796f8df61bd79fc026108/lib/runtime/RelativeUrlRuntimeModule.js
 */ const relativeURL = function relativeURL(inputUrl) {
    const realUrl = new URL(inputUrl, 'x:/');
    const values = {};
    for(const key in realUrl)values[key] = realUrl[key];
    values.href = inputUrl;
    values.pathname = inputUrl.replace(/[?#].*/, '');
    values.origin = values.protocol = '';
    values.toString = values.toJSON = (..._args)=>inputUrl;
    for(const key in values)Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        value: values[key]
    });
};
relativeURL.prototype = URL.prototype;
contextPrototype.U = relativeURL;
/**
 * Utility function to ensure all variants of an enum are handled.
 */ function invariant(never, computeMessage) {
    throw new Error(`Invariant: ${computeMessage(never)}`);
}
/**
 * A stub function to make `require` available but non-functional in ESM.
 */ function requireStub(_moduleId) {
    throw new Error('dynamic usage of require is not supported');
}
contextPrototype.z = requireStub;
// Make `globalThis` available to the module in a way that cannot be shadowed by a local variable.
contextPrototype.g = globalThis;
function applyModuleFactoryName(factory) {
    // Give the module factory a nice name to improve stack traces.
    Object.defineProperty(factory, 'name', {
        value: 'module evaluation'
    });
}
/// <reference path="../shared/runtime-utils.ts" />
/// A 'base' utilities to support runtime can have externals.
/// Currently this is for node.js / edge runtime both.
/// If a fn requires node.js specific behavior, it should be placed in `node-external-utils` instead.
async function externalImport(id) {
    let raw;
    try {
        switch (id) {
  case "next/dist/compiled/@vercel/og/index.node.js":
    raw = await import("next/dist/compiled/@vercel/og/index.edge.js");
    break;
  default:
    raw = await import(id);
};
    } catch (err) {
        // TODO(alexkirsz) This can happen when a client-side module tries to load
        // an external module we don't provide a shim for (e.g. querystring, url).
        // For now, we fail semi-silently, but in the future this should be a
        // compilation error.
        throw new Error(`Failed to load external module ${id}: ${err}`);
    }
    if (raw && raw.__esModule && raw.default && 'default' in raw.default) {
        return interopEsm(raw.default, createNS(raw), true);
    }
    return raw;
}
contextPrototype.y = externalImport;
function externalRequire(id, thunk, esm = false) {
    let raw;
    try {
        raw = thunk();
    } catch (err) {
        // TODO(alexkirsz) This can happen when a client-side module tries to load
        // an external module we don't provide a shim for (e.g. querystring, url).
        // For now, we fail semi-silently, but in the future this should be a
        // compilation error.
        throw new Error(`Failed to load external module ${id}: ${err}`);
    }
    if (!esm || raw.__esModule) {
        return raw;
    }
    return interopEsm(raw, createNS(raw), true);
}
externalRequire.resolve = (id, options)=>{
    return require.resolve(id, options);
};
contextPrototype.x = externalRequire;
/* eslint-disable @typescript-eslint/no-unused-vars */ const path = require('path');
const relativePathToRuntimeRoot = path.relative(RUNTIME_PUBLIC_PATH, '.');
// Compute the relative path to the `distDir`.
const relativePathToDistRoot = path.join(relativePathToRuntimeRoot, RELATIVE_ROOT_PATH);
const RUNTIME_ROOT = path.resolve(__filename, relativePathToRuntimeRoot);
// Compute the absolute path to the root, by stripping distDir from the absolute path to this file.
const ABSOLUTE_ROOT = path.resolve(__filename, relativePathToDistRoot);
/**
 * Returns an absolute path to the given module path.
 * Module path should be relative, either path to a file or a directory.
 *
 * This fn allows to calculate an absolute path for some global static values, such as
 * `__dirname` or `import.meta.url` that Turbopack will not embeds in compile time.
 * See ImportMetaBinding::code_generation for the usage.
 */ function resolveAbsolutePath(modulePath) {
    if (modulePath) {
        return path.join(ABSOLUTE_ROOT, modulePath);
    }
    return ABSOLUTE_ROOT;
}
Context.prototype.P = resolveAbsolutePath;
/* eslint-disable @typescript-eslint/no-unused-vars */ /// <reference path="../shared/runtime-utils.ts" />
function readWebAssemblyAsResponse(path) {
    const { createReadStream } = require('fs');
    const { Readable } = require('stream');
    const stream = createReadStream(path);
    // @ts-ignore unfortunately there's a slight type mismatch with the stream.
    return new Response(Readable.toWeb(stream), {
        headers: {
            'content-type': 'application/wasm'
        }
    });
}
async function compileWebAssemblyFromPath(path) {
    const response = readWebAssemblyAsResponse(path);
    return await WebAssembly.compileStreaming(response);
}
async function instantiateWebAssemblyFromPath(path, importsObj) {
    const response = readWebAssemblyAsResponse(path);
    const { instance } = await WebAssembly.instantiateStreaming(response, importsObj);
    return instance.exports;
}
/* eslint-disable @typescript-eslint/no-unused-vars */ /// <reference path="../shared/runtime-utils.ts" />
/// <reference path="../shared-node/base-externals-utils.ts" />
/// <reference path="../shared-node/node-externals-utils.ts" />
/// <reference path="../shared-node/node-wasm-utils.ts" />
var SourceType = /*#__PURE__*/ function(SourceType) {
    /**
   * The module was instantiated because it was included in an evaluated chunk's
   * runtime.
   * SourceData is a ChunkPath.
   */ SourceType[SourceType["Runtime"] = 0] = "Runtime";
    /**
   * The module was instantiated because a parent module imported it.
   * SourceData is a ModuleId.
   */ SourceType[SourceType["Parent"] = 1] = "Parent";
    return SourceType;
}(SourceType || {});
process.env.TURBOPACK = '1';
const nodeContextPrototype = Context.prototype;
const url = require('url');
const moduleFactories = new Map();
nodeContextPrototype.M = moduleFactories;
const moduleCache = Object.create(null);
nodeContextPrototype.c = moduleCache;
/**
 * Returns an absolute path to the given module's id.
 */ function resolvePathFromModule(moduleId) {
    const exported = this.r(moduleId);
    const exportedPath = exported?.default ?? exported;
    if (typeof exportedPath !== 'string') {
        return exported;
    }
    const strippedAssetPrefix = exportedPath.slice(ASSET_PREFIX.length);
    const resolved = path.resolve(RUNTIME_ROOT, strippedAssetPrefix);
    return url.pathToFileURL(resolved).href;
}
nodeContextPrototype.R = resolvePathFromModule;
function loadRuntimeChunk(sourcePath, chunkData) {
    if (typeof chunkData === 'string') {
        loadRuntimeChunkPath(sourcePath, chunkData);
    } else {
        loadRuntimeChunkPath(sourcePath, chunkData.path);
    }
}
const loadedChunks = new Set();
const unsupportedLoadChunk = Promise.resolve(undefined);
const loadedChunk = Promise.resolve(undefined);
const chunkCache = new Map();
function clearChunkCache() {
    chunkCache.clear();
}
function loadRuntimeChunkPath(sourcePath, chunkPath) {
    if (!isJs(chunkPath)) {
        // We only support loading JS chunks in Node.js.
        // This branch can be hit when trying to load a CSS chunk.
        return;
    }
    if (loadedChunks.has(chunkPath)) {
        return;
    }
    try {
        const resolved = path.resolve(RUNTIME_ROOT, chunkPath);
        const chunkModules = requireChunk(chunkPath);
        installCompressedModuleFactories(chunkModules, 0, moduleFactories);
        loadedChunks.add(chunkPath);
    } catch (cause) {
        let errorMessage = `Failed to load chunk ${chunkPath}`;
        if (sourcePath) {
            errorMessage += ` from runtime for chunk ${sourcePath}`;
        }
        const error = new Error(errorMessage, {
            cause
        });
        error.name = 'ChunkLoadError';
        throw error;
    }
}
function loadChunkAsync(chunkData) {
    const chunkPath = typeof chunkData === 'string' ? chunkData : chunkData.path;
    if (!isJs(chunkPath)) {
        // We only support loading JS chunks in Node.js.
        // This branch can be hit when trying to load a CSS chunk.
        return unsupportedLoadChunk;
    }
    let entry = chunkCache.get(chunkPath);
    if (entry === undefined) {
        try {
            // resolve to an absolute path to simplify `require` handling
            const resolved = path.resolve(RUNTIME_ROOT, chunkPath);
            // TODO: consider switching to `import()` to enable concurrent chunk loading and async file io
            // However this is incompatible with hot reloading (since `import` doesn't use the require cache)
            const chunkModules = requireChunk(chunkPath);
            installCompressedModuleFactories(chunkModules, 0, moduleFactories);
            entry = loadedChunk;
        } catch (cause) {
            const errorMessage = `Failed to load chunk ${chunkPath} from module ${this.m.id}`;
            const error = new Error(errorMessage, {
                cause
            });
            error.name = 'ChunkLoadError';
            // Cache the failure promise, future requests will also get this same rejection
            entry = Promise.reject(error);
        }
        chunkCache.set(chunkPath, entry);
    }
    // TODO: Return an instrumented Promise that React can use instead of relying on referential equality.
    return entry;
}
contextPrototype.l = loadChunkAsync;
function loadChunkAsyncByUrl(chunkUrl) {
    const path1 = url.fileURLToPath(new URL(chunkUrl, RUNTIME_ROOT));
    return loadChunkAsync.call(this, path1);
}
contextPrototype.L = loadChunkAsyncByUrl;
function loadWebAssembly(chunkPath, _edgeModule, imports) {
    const resolved = path.resolve(RUNTIME_ROOT, chunkPath);
    return instantiateWebAssemblyFromPath(resolved, imports);
}
contextPrototype.w = loadWebAssembly;
function loadWebAssemblyModule(chunkPath, _edgeModule) {
    const resolved = path.resolve(RUNTIME_ROOT, chunkPath);
    return compileWebAssemblyFromPath(resolved);
}
contextPrototype.u = loadWebAssemblyModule;
function getWorkerBlobURL(_chunks) {
    throw new Error('Worker blobs are not implemented yet for Node.js');
}
nodeContextPrototype.b = getWorkerBlobURL;
function instantiateModule(id, sourceType, sourceData) {
    const moduleFactory = moduleFactories.get(id);
    if (typeof moduleFactory !== 'function') {
        // This can happen if modules incorrectly handle HMR disposes/updates,
        // e.g. when they keep a `setTimeout` around which still executes old code
        // and contains e.g. a `require("something")` call.
        let instantiationReason;
        switch(sourceType){
            case 0:
                instantiationReason = `as a runtime entry of chunk ${sourceData}`;
                break;
            case 1:
                instantiationReason = `because it was required from module ${sourceData}`;
                break;
            default:
                invariant(sourceType, (sourceType)=>`Unknown source type: ${sourceType}`);
        }
        throw new Error(`Module ${id} was instantiated ${instantiationReason}, but the module factory is not available.`);
    }
    const module1 = createModuleObject(id);
    const exports = module1.exports;
    moduleCache[id] = module1;
    const context = new Context(module1, exports);
    // NOTE(alexkirsz) This can fail when the module encounters a runtime error.
    try {
        moduleFactory(context, module1, exports);
    } catch (error) {
        module1.error = error;
        throw error;
    }
    module1.loaded = true;
    if (module1.namespaceObject && module1.exports !== module1.namespaceObject) {
        // in case of a circular dependency: cjs1 -> esm2 -> cjs1
        interopEsm(module1.exports, module1.namespaceObject);
    }
    return module1;
}
/**
 * Retrieves a module from the cache, or instantiate it if it is not cached.
 */ // @ts-ignore
function getOrInstantiateModuleFromParent(id, sourceModule) {
    const module1 = moduleCache[id];
    if (module1) {
        if (module1.error) {
            throw module1.error;
        }
        return module1;
    }
    return instantiateModule(id, 1, sourceModule.id);
}
/**
 * Instantiates a runtime module.
 */ function instantiateRuntimeModule(chunkPath, moduleId) {
    return instantiateModule(moduleId, 0, chunkPath);
}
/**
 * Retrieves a module from the cache, or instantiate it as a runtime module if it is not cached.
 */ // @ts-ignore TypeScript doesn't separate this module space from the browser runtime
function getOrInstantiateRuntimeModule(chunkPath, moduleId) {
    const module1 = moduleCache[moduleId];
    if (module1) {
        if (module1.error) {
            throw module1.error;
        }
        return module1;
    }
    return instantiateRuntimeModule(chunkPath, moduleId);
}
const regexJsUrl = /\.js(?:\?[^#]*)?(?:#.*)?$/;
/**
 * Checks if a given path/URL ends with .js, optionally followed by ?query or #fragment.
 */ function isJs(chunkUrlOrPath) {
    return regexJsUrl.test(chunkUrlOrPath);
}
module.exports = (sourcePath)=>({
        m: (id)=>getOrInstantiateRuntimeModule(sourcePath, id),
        c: (chunkData)=>loadRuntimeChunk(sourcePath, chunkData)
    });


//# sourceMappingURL=%5Bturbopack%5D_runtime.js.map

  function requireChunk(chunkPath) {
    switch(chunkPath) {
      case "server/chunks/ssr/[externals]_shiki_1e31ec87._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/[externals]_shiki_1e31ec87._.js");
      case "server/chunks/ssr/[externals]_shiki_engine_javascript_971e8bc3._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/[externals]_shiki_engine_javascript_971e8bc3._.js");
      case "server/chunks/ssr/[externals]_shiki_engine_oniguruma_d18a107f._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/[externals]_shiki_engine_oniguruma_d18a107f._.js");
      case "server/chunks/ssr/[externals]_shiki_wasm_df6ea110._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/[externals]_shiki_wasm_df6ea110._.js");
      case "server/chunks/ssr/[root-of-the-server]__15600e29._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__15600e29._.js");
      case "server/chunks/ssr/[root-of-the-server]__1690ee0d._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1690ee0d._.js");
      case "server/chunks/ssr/[root-of-the-server]__42889ac0._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__42889ac0._.js");
      case "server/chunks/ssr/[root-of-the-server]__53fe7259._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__53fe7259._.js");
      case "server/chunks/ssr/[root-of-the-server]__cfaf11e9._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__cfaf11e9._.js");
      case "server/chunks/ssr/[root-of-the-server]__dae80fc1._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__dae80fc1._.js");
      case "server/chunks/ssr/[root-of-the-server]__de41d436._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__de41d436._.js");
      case "server/chunks/ssr/[root-of-the-server]__f4ee5d0a._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__f4ee5d0a._.js");
      case "server/chunks/ssr/[turbopack]_runtime.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/[turbopack]_runtime.js");
      case "server/chunks/ssr/_next-internal_server_app__not-found_page_actions_554ec2bf.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app__not-found_page_actions_554ec2bf.js");
      case "server/chunks/ssr/node_modules_18e270d6._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_18e270d6._.js");
      case "server/chunks/ssr/node_modules_256e9ddd._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_256e9ddd._.js");
      case "server/chunks/ssr/node_modules_26f30891._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_26f30891._.js");
      case "server/chunks/ssr/node_modules_612e083c._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_612e083c._.js");
      case "server/chunks/ssr/node_modules_8eb6d623._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_8eb6d623._.js");
      case "server/chunks/ssr/node_modules_f382a5e4._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_f382a5e4._.js");
      case "server/chunks/ssr/node_modules_fumadocs-core_dist_18664853._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_fumadocs-core_dist_18664853._.js");
      case "server/chunks/ssr/node_modules_fumadocs-core_dist_56f59633._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_fumadocs-core_dist_56f59633._.js");
      case "server/chunks/ssr/node_modules_fumadocs-core_dist_8d7082d9._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_fumadocs-core_dist_8d7082d9._.js");
      case "server/chunks/ssr/node_modules_fumadocs-core_dist_c73b5339._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_fumadocs-core_dist_c73b5339._.js");
      case "server/chunks/ssr/node_modules_fumadocs-core_dist_fetch-IBTWQCJR_38824ca3.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_fumadocs-core_dist_fetch-IBTWQCJR_38824ca3.js");
      case "server/chunks/ssr/node_modules_fumadocs-core_dist_mixedbread-RAHDVXGJ_4ab402be.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_fumadocs-core_dist_mixedbread-RAHDVXGJ_4ab402be.js");
      case "server/chunks/ssr/node_modules_fumadocs-core_dist_static-A2YJ5TXV_73e28560.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_fumadocs-core_dist_static-A2YJ5TXV_73e28560.js");
      case "server/chunks/ssr/node_modules_fumadocs-ui_dist_components_dialog_search-default_191935dd.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_fumadocs-ui_dist_components_dialog_search-default_191935dd.js");
      case "server/chunks/ssr/node_modules_next_dist_4b9a0874._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_4b9a0874._.js");
      case "server/chunks/ssr/node_modules_next_dist_client_components_9774470f._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_client_components_9774470f._.js");
      case "server/chunks/ssr/node_modules_next_dist_client_components_builtin_forbidden_45780354.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_client_components_builtin_forbidden_45780354.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_65a7265e.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_65a7265e.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_eedfc1fd._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_eedfc1fd._.js");
      case "server/chunks/ssr/[externals]_fs_promises_0bfe4114._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/[externals]_fs_promises_0bfe4114._.js");
      case "server/chunks/ssr/[root-of-the-server]__16f2fbf1._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__16f2fbf1._.js");
      case "server/chunks/ssr/[root-of-the-server]__81a3b203._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__81a3b203._.js");
      case "server/chunks/ssr/[root-of-the-server]__b06de0ce._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__b06de0ce._.js");
      case "server/chunks/ssr/[root-of-the-server]__caeafb80._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__caeafb80._.js");
      case "server/chunks/ssr/[root-of-the-server]__f804d701._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__f804d701._.js");
      case "server/chunks/ssr/[root-of-the-server]__fcd1724e._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__fcd1724e._.js");
      case "server/chunks/ssr/_4435c7ce._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/_4435c7ce._.js");
      case "server/chunks/ssr/_c8f75894._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/_c8f75894._.js");
      case "server/chunks/ssr/_db09fbd2._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/_db09fbd2._.js");
      case "server/chunks/ssr/_f6249475._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/_f6249475._.js");
      case "server/chunks/ssr/_f8ca66f6._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/_f8ca66f6._.js");
      case "server/chunks/ssr/_next-internal_server_app_[___slug]_page_actions_3407a922.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_[___slug]_page_actions_3407a922.js");
      case "server/chunks/ssr/a9bf9_mermaid_dist_chunks_mermaid_core_kanban-definition-3W4ZIXB7_mjs_e9f9e50e._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/a9bf9_mermaid_dist_chunks_mermaid_core_kanban-definition-3W4ZIXB7_mjs_e9f9e50e._.js");
      case "server/chunks/ssr/a9bf9_mermaid_dist_chunks_mermaid_core_requirementDiagram-UZGBJVZJ_mjs_4e41b2e7._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/a9bf9_mermaid_dist_chunks_mermaid_core_requirementDiagram-UZGBJVZJ_mjs_4e41b2e7._.js");
      case "server/chunks/ssr/a9bf9_mermaid_dist_chunks_mermaid_core_timeline-definition-IT6M3QCI_mjs_036f7982._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/a9bf9_mermaid_dist_chunks_mermaid_core_timeline-definition-IT6M3QCI_mjs_036f7982._.js");
      case "server/chunks/ssr/d4b1c_modules_mermaid_dist_chunks_mermaid_core_gitGraphDiagram-NY62KEGX_mjs_3329d5cf._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/d4b1c_modules_mermaid_dist_chunks_mermaid_core_gitGraphDiagram-NY62KEGX_mjs_3329d5cf._.js");
      case "server/chunks/ssr/d4b1c_modules_mermaid_dist_chunks_mermaid_core_journeyDiagram-XKPGCS4Q_mjs_3fb6cca3._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/d4b1c_modules_mermaid_dist_chunks_mermaid_core_journeyDiagram-XKPGCS4Q_mjs_3fb6cca3._.js");
      case "server/chunks/ssr/d4b1c_modules_mermaid_dist_chunks_mermaid_core_quadrantDiagram-AYHSOK5B_mjs_8f9e8f86._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/d4b1c_modules_mermaid_dist_chunks_mermaid_core_quadrantDiagram-AYHSOK5B_mjs_8f9e8f86._.js");
      case "server/chunks/ssr/d4b1c_modules_mermaid_dist_chunks_mermaid_core_sankeyDiagram-TZEHDZUN_mjs_d725702a._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/d4b1c_modules_mermaid_dist_chunks_mermaid_core_sankeyDiagram-TZEHDZUN_mjs_d725702a._.js");
      case "server/chunks/ssr/d4b1c_modules_mermaid_dist_chunks_mermaid_core_sequenceDiagram-WL72ISMW_mjs_911fe28e._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/d4b1c_modules_mermaid_dist_chunks_mermaid_core_sequenceDiagram-WL72ISMW_mjs_911fe28e._.js");
      case "server/chunks/ssr/d4b1c_modules_mermaid_dist_chunks_mermaid_core_xychartDiagram-PRI3JC2R_mjs_86df3889._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/d4b1c_modules_mermaid_dist_chunks_mermaid_core_xychartDiagram-PRI3JC2R_mjs_86df3889._.js");
      case "server/chunks/ssr/node_modules_04b632e2._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_04b632e2._.js");
      case "server/chunks/ssr/node_modules_09ab4612._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_09ab4612._.js");
      case "server/chunks/ssr/node_modules_0fd3c5cd._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_0fd3c5cd._.js");
      case "server/chunks/ssr/node_modules_3507b41a._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_3507b41a._.js");
      case "server/chunks/ssr/node_modules_42c23399._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_42c23399._.js");
      case "server/chunks/ssr/node_modules_45bce0e1._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_45bce0e1._.js");
      case "server/chunks/ssr/node_modules_45dbe7fa._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_45dbe7fa._.js");
      case "server/chunks/ssr/node_modules_4a89d976._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_4a89d976._.js");
      case "server/chunks/ssr/node_modules_573ee9b5._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_573ee9b5._.js");
      case "server/chunks/ssr/node_modules_5aeced28._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_5aeced28._.js");
      case "server/chunks/ssr/node_modules_5e5a372d._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_5e5a372d._.js");
      case "server/chunks/ssr/node_modules_650e9bb9._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_650e9bb9._.js");
      case "server/chunks/ssr/node_modules_659ddc1f._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_659ddc1f._.js");
      case "server/chunks/ssr/node_modules_6710df3a._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_6710df3a._.js");
      case "server/chunks/ssr/node_modules_69ff4c9e._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_69ff4c9e._.js");
      case "server/chunks/ssr/node_modules_6afd1240._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_6afd1240._.js");
      case "server/chunks/ssr/node_modules_6ece6f1e._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_6ece6f1e._.js");
      case "server/chunks/ssr/node_modules_6f351e1e._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_6f351e1e._.js");
      case "server/chunks/ssr/node_modules_6f46bb6a._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_6f46bb6a._.js");
      case "server/chunks/ssr/node_modules_7399a1d6._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_7399a1d6._.js");
      case "server/chunks/ssr/node_modules_748f438e._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_748f438e._.js");
      case "server/chunks/ssr/node_modules_764f63f7._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_764f63f7._.js");
      case "server/chunks/ssr/node_modules_7f13834b._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_7f13834b._.js");
      case "server/chunks/ssr/node_modules_8144eadd._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_8144eadd._.js");
      case "server/chunks/ssr/node_modules_8f051951._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_8f051951._.js");
      case "server/chunks/ssr/node_modules_949dd740._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_949dd740._.js");
      case "server/chunks/ssr/node_modules_98906f9a._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_98906f9a._.js");
      case "server/chunks/ssr/node_modules_99e55fde._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_99e55fde._.js");
      case "server/chunks/ssr/node_modules_ad85352d._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_ad85352d._.js");
      case "server/chunks/ssr/node_modules_b3096cbf._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_b3096cbf._.js");
      case "server/chunks/ssr/node_modules_beff3af0._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_beff3af0._.js");
      case "server/chunks/ssr/node_modules_c100d0c4._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_c100d0c4._.js");
      case "server/chunks/ssr/node_modules_c872a4da._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_c872a4da._.js");
      case "server/chunks/ssr/node_modules_c8eb2f6c._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_c8eb2f6c._.js");
      case "server/chunks/ssr/node_modules_cb54fb0c._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_cb54fb0c._.js");
      case "server/chunks/ssr/node_modules_cytoscape_dist_cytoscape_esm_mjs_23845db3._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_cytoscape_dist_cytoscape_esm_mjs_23845db3._.js");
      case "server/chunks/ssr/node_modules_d3-scale_src_e02ef77f._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_d3-scale_src_e02ef77f._.js");
      case "server/chunks/ssr/node_modules_d3-shape_src_arc_fb1ac087.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_d3-shape_src_arc_fb1ac087.js");
      case "server/chunks/ssr/node_modules_dagre-d3-es_src_dagre_index_3582f3d0.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_dagre-d3-es_src_dagre_index_3582f3d0.js");
      case "server/chunks/ssr/node_modules_dfb02392._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_dfb02392._.js");
      case "server/chunks/ssr/node_modules_e245e4a8._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_e245e4a8._.js");
      case "server/chunks/ssr/node_modules_e935ea9f._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_e935ea9f._.js");
      case "server/chunks/ssr/node_modules_e96180ec._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_e96180ec._.js");
      case "server/chunks/ssr/node_modules_ef806160._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_ef806160._.js");
      case "server/chunks/ssr/node_modules_fumadocs-core_dist_e9b71aa4._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_fumadocs-core_dist_e9b71aa4._.js");
      case "server/chunks/ssr/node_modules_katex_dist_katex_mjs_d037b3b1._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_katex_dist_katex_mjs_d037b3b1._.js");
      case "server/chunks/ssr/node_modules_lodash-es_08b265be._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_lodash-es_08b265be._.js");
      case "server/chunks/ssr/node_modules_lodash-es_34a76a76._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_lodash-es_34a76a76._.js");
      case "server/chunks/ssr/node_modules_lodash-es_53e3fb30._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_lodash-es_53e3fb30._.js");
      case "server/chunks/ssr/node_modules_lodash-es_abf1faf0._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_lodash-es_abf1faf0._.js");
      case "server/chunks/ssr/node_modules_lodash-es_c773f28f._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_lodash-es_c773f28f._.js");
      case "server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_1f73a830._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_1f73a830._.js");
      case "server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_4cfa6360._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_4cfa6360._.js");
      case "server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_663ac803._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_663ac803._.js");
      case "server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_blockDiagram-VD42YOAC_mjs_62c34e8e._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_blockDiagram-VD42YOAC_mjs_62c34e8e._.js");
      case "server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_c4Diagram-YG6GDRKO_mjs_b035b46a._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_c4Diagram-YG6GDRKO_mjs_b035b46a._.js");
      case "server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_chunk-ABZYJK2D_mjs_d3046d80._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_chunk-ABZYJK2D_mjs_d3046d80._.js");
      case "server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_chunk-B4BG7PRW_mjs_3664e7cd._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_chunk-B4BG7PRW_mjs_3664e7cd._.js");
      case "server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_chunk-DI55MBZ5_mjs_759296f7._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_chunk-DI55MBZ5_mjs_759296f7._.js");
      case "server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_chunk-FMBD7UC4_mjs_4f485529._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_chunk-FMBD7UC4_mjs_4f485529._.js");
      case "server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_chunk-JA3XYJ7Z_mjs_ec9997f8._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_chunk-JA3XYJ7Z_mjs_ec9997f8._.js");
      case "server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_chunk-JZLCHNYA_mjs_c0a0a2bd._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_chunk-JZLCHNYA_mjs_c0a0a2bd._.js");
      case "server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_chunk-MI3HLSF2_mjs_f6fc3931._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_chunk-MI3HLSF2_mjs_f6fc3931._.js");
      case "server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_chunk-QXUST7PY_mjs_159fba97._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_chunk-QXUST7PY_mjs_159fba97._.js");
      case "server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_chunk-S3R3BYOJ_mjs_dbeeb277._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_chunk-S3R3BYOJ_mjs_dbeeb277._.js");
      case "server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_chunk-TZMSLE5B_mjs_8436a62a._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_chunk-TZMSLE5B_mjs_8436a62a._.js");
      case "server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_dagre-6UL2VRFP_mjs_0a8f58bf._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_dagre-6UL2VRFP_mjs_0a8f58bf._.js");
      case "server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_diagram-PSM6KHXK_mjs_7d5c4350._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_diagram-PSM6KHXK_mjs_7d5c4350._.js");
      case "server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_ef601841._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_ef601841._.js");
      case "server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_erDiagram-Q2GNP2WA_mjs_f999a5a7._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_erDiagram-Q2GNP2WA_mjs_f999a5a7._.js");
      case "server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_f78d2dc4._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_f78d2dc4._.js");
      case "server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_flowDiagram-NV44I4VS_mjs_07ef83ae._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_flowDiagram-NV44I4VS_mjs_07ef83ae._.js");
      case "server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_stateDiagram-FKZM4ZOC_mjs_f2282a26._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_mermaid_dist_chunks_mermaid_core_stateDiagram-FKZM4ZOC_mjs_f2282a26._.js");
      case "server/chunks/ssr/node_modules_next_dist_client_components_builtin_global-error_ece394eb.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_client_components_builtin_global-error_ece394eb.js");
      case "server/chunks/ssr/node_modules_next_dist_client_components_builtin_unauthorized_15817684.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_client_components_builtin_unauthorized_15817684.js");
      case "server/chunks/ssr/node_modules_next_dist_compiled_fc907e31._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_compiled_fc907e31._.js");
      case "server/chunks/ssr/src_components_docs-layout-wrapper_tsx_f3ab22f2._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/src_components_docs-layout-wrapper_tsx_f3ab22f2._.js");
      case "server/chunks/ssr/[root-of-the-server]__19dfcc50._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__19dfcc50._.js");
      case "server/chunks/ssr/_next-internal_server_app__global-error_page_actions_75761787.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app__global-error_page_actions_75761787.js");
      case "server/chunks/ssr/node_modules_next_dist_08570d7f._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_08570d7f._.js");
      case "server/chunks/[externals]_fs_promises_0bfe4114._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/[externals]_fs_promises_0bfe4114._.js");
      case "server/chunks/[root-of-the-server]__25cc41f9._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__25cc41f9._.js");
      case "server/chunks/[root-of-the-server]__3c29c14a._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__3c29c14a._.js");
      case "server/chunks/[root-of-the-server]__b4a084c6._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__b4a084c6._.js");
      case "server/chunks/[root-of-the-server]__d00d5417._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__d00d5417._.js");
      case "server/chunks/[turbopack]_runtime.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/[turbopack]_runtime.js");
      case "server/chunks/_0807e440._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/_0807e440._.js");
      case "server/chunks/_next-internal_server_app_api_chat_route_actions_ac0c75e3.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_chat_route_actions_ac0c75e3.js");
      case "server/chunks/node_modules_next_dist_compiled_4eebc3df._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/node_modules_next_dist_compiled_4eebc3df._.js");
      case "server/chunks/[root-of-the-server]__85109717._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__85109717._.js");
      case "server/chunks/_c3c2f75f._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/_c3c2f75f._.js");
      case "server/chunks/_next-internal_server_app_api_search_route_actions_4244da48.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_search_route_actions_4244da48.js");
      case "server/chunks/[root-of-the-server]__5335f916._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__5335f916._.js");
      case "server/chunks/_next-internal_server_app_llms-full_txt_route_actions_f19e783e.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_llms-full_txt_route_actions_f19e783e.js");
      case "server/chunks/[root-of-the-server]__810576e3._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__810576e3._.js");
      case "server/chunks/_1c923d6d._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/_1c923d6d._.js");
      case "server/chunks/_next-internal_server_app_llms_mdx_[[___slug]]_route_actions_41084dd6.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_llms_mdx_[[___slug]]_route_actions_41084dd6.js");
      case "server/chunks/ssr/[root-of-the-server]__91dcf595._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__91dcf595._.js");
      case "server/chunks/ssr/_c1309523._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/_c1309523._.js");
      case "server/chunks/ssr/_next-internal_server_app_page_actions_39d4fc33.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_page_actions_39d4fc33.js");
      case "server/chunks/ssr/node_modules_de837a4a._.js": return require("/Users/growthacker/projects/docs-kyzn/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_de837a4a._.js");
      default:
        throw new Error(`Not found ${chunkPath}`);
    }
  }
