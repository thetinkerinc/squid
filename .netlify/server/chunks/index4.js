import { Z as current_component, x as setContext, _ as getContext, $ as hasContext, S as once, y as pop, w as push, G as bind_props, R as spread_attributes } from "./index.js";
import { w as writable, i as get$1 } from "./exports.js";
import { clsx } from "clsx";
import parse from "style-to-object";
import { o as on } from "./events.js";
import { computePosition, offset, shift, flip, size, arrow, hide, limitShift } from "@floating-ui/dom";
import { N as NO_TRANSLATE_ATTRIBUTE } from "./constants.js";
function lifecycle_function_unavailable(name) {
  const error = new Error(`lifecycle_function_unavailable
\`${name}(...)\` is not available on the server
https://svelte.dev/e/lifecycle_function_unavailable`);
  error.name = "Svelte error";
  throw error;
}
function onDestroy(fn) {
  var context = (
    /** @type {Component} */
    current_component
  );
  (context.d ??= []).push(fn);
}
function mount() {
  lifecycle_function_unavailable("mount");
}
function unmount() {
  lifecycle_function_unavailable("unmount");
}
async function tick() {
}
const PARAGLIDE_CONTEXT_KEY = {};
const getParaglideContext = () => {
  return (
    /** @type { ParaglideContext<T> | undefined}*/
    getContext(PARAGLIDE_CONTEXT_KEY)
  );
};
const setParaglideContext = (context) => {
  setContext(PARAGLIDE_CONTEXT_KEY, context);
};
function getTranslationFunctions() {
  const ctx = getParaglideContext();
  function translateAttribute(value, lang_value) {
    if (typeof value !== "string") return value;
    if (!ctx) return value;
    return ctx.translateHref(value, lang_value);
  }
  function handleAttributes(attrs, attribute_translations) {
    if (attrs[NO_TRANSLATE_ATTRIBUTE]) return attrs;
    for (const { attribute_name, lang_attribute_name } of attribute_translations) {
      if (attribute_name in attrs) {
        const attr = attrs[attribute_name];
        const lang_attr = lang_attribute_name ? attrs[lang_attribute_name] : void 0;
        attrs[attribute_name] = translateAttribute(
          attr,
          typeof lang_attr === "string" ? lang_attr : void 0
        );
      }
    }
    return attrs;
  }
  return [translateAttribute, handleAttributes];
}
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
const isBrowser$1 = typeof document !== "undefined";
function clientWritable(initialValue) {
  const store = writable(initialValue);
  function set(value) {
    if (isBrowser$1) {
      store.set(value);
    }
  }
  function update(updater) {
    if (isBrowser$1) {
      store.update(updater);
    }
  }
  return {
    subscribe: store.subscribe,
    set,
    update
  };
}
let toastsCounter = 0;
function createToastState() {
  const toasts = clientWritable([]);
  const heights = clientWritable([]);
  function addToast(data) {
    toasts.update((prev) => [data, ...prev]);
  }
  function create(data) {
    const { message: message2, ...rest } = data;
    const id = typeof data?.id === "number" || data.id && data.id?.length > 0 ? data.id : toastsCounter++;
    const dismissable = data.dismissable === void 0 ? true : data.dismissable;
    const type = data.type === void 0 ? "default" : data.type;
    const $toasts = get$1(toasts);
    const alreadyExists = $toasts.find((toast2) => {
      return toast2.id === id;
    });
    if (alreadyExists) {
      toasts.update((prev) => prev.map((toast2) => {
        if (toast2.id === id) {
          return {
            ...toast2,
            ...data,
            id,
            title: message2,
            dismissable,
            type,
            updated: true
          };
        }
        return {
          ...toast2,
          updated: false
        };
      }));
    } else {
      addToast({ ...rest, id, title: message2, dismissable, type });
    }
    return id;
  }
  function dismiss(id) {
    if (id === void 0) {
      toasts.update((prev) => prev.map((toast2) => ({ ...toast2, dismiss: true })));
      return;
    }
    toasts.update((prev) => prev.map((toast2) => toast2.id === id ? { ...toast2, dismiss: true } : toast2));
    return id;
  }
  function remove(id) {
    if (id === void 0) {
      toasts.set([]);
      return;
    }
    toasts.update((prev) => prev.filter((toast2) => toast2.id !== id));
    return id;
  }
  function message(message2, data) {
    return create({ ...data, type: "default", message: message2 });
  }
  function error(message2, data) {
    return create({ ...data, type: "error", message: message2 });
  }
  function success(message2, data) {
    return create({ ...data, type: "success", message: message2 });
  }
  function info(message2, data) {
    return create({ ...data, type: "info", message: message2 });
  }
  function warning(message2, data) {
    return create({ ...data, type: "warning", message: message2 });
  }
  function loading(message2, data) {
    return create({ ...data, type: "loading", message: message2 });
  }
  function promise(promise2, data) {
    if (!data) {
      return;
    }
    let id = void 0;
    if (data.loading !== void 0) {
      id = create({
        ...data,
        promise: promise2,
        type: "loading",
        message: data.loading
      });
    }
    const p = promise2 instanceof Promise ? promise2 : promise2();
    let shouldDismiss = id !== void 0;
    p.then((response) => {
      if (response && typeof response.ok === "boolean" && !response.ok) {
        shouldDismiss = false;
        const message2 = typeof data.error === "function" ? (
          // @ts-expect-error: Incorrect response type
          data.error(`HTTP error! status: ${response.status}`)
        ) : data.error;
        create({ id, type: "error", message: message2 });
      } else if (data.success !== void 0) {
        shouldDismiss = false;
        const message2 = (
          // @ts-expect-error: TODO: Better function checking
          typeof data.success === "function" ? data.success(response) : data.success
        );
        create({ id, type: "success", message: message2 });
      }
    }).catch((error2) => {
      if (data.error !== void 0) {
        shouldDismiss = false;
        const message2 = (
          // @ts-expect-error: TODO: Better function checking
          typeof data.error === "function" ? data.error(error2) : data.error
        );
        create({ id, type: "error", message: message2 });
      }
    }).finally(() => {
      if (shouldDismiss) {
        dismiss(id);
        id = void 0;
      }
      data.finally?.();
    });
    return id;
  }
  function custom(component, data) {
    const id = data?.id || toastsCounter++;
    create({ component, id, ...data });
    return id;
  }
  function removeHeight(id) {
    heights.update((prev) => prev.filter((height) => height.toastId !== id));
  }
  function setHeight(data) {
    const exists = get$1(heights).find((el) => el.toastId === data.toastId);
    if (exists === void 0) {
      heights.update((prev) => [data, ...prev]);
      return;
    }
    heights.update((prev) => prev.map((el) => {
      if (el.toastId === data.toastId) {
        return data;
      } else {
        return el;
      }
    }));
  }
  function reset() {
    toasts.set([]);
    heights.set([]);
  }
  return {
    // methods
    create,
    addToast,
    dismiss,
    remove,
    message,
    error,
    success,
    info,
    warning,
    loading,
    promise,
    custom,
    removeHeight,
    setHeight,
    reset,
    // stores
    toasts,
    heights
  };
}
const toastState = createToastState();
function toastFunction(message, data) {
  return toastState.create({
    message,
    ...data
  });
}
const basicToast = toastFunction;
const toast = Object.assign(basicToast, {
  success: toastState.success,
  info: toastState.info,
  warning: toastState.warning,
  error: toastState.error,
  custom: toastState.custom,
  message: toastState.message,
  promise: toastState.promise,
  dismiss: toastState.dismiss,
  loading: toastState.loading
});
const useEffect = (subscribe) => ({ subscribe });
function isFunction(value) {
  return typeof value === "function";
}
function isObject(value) {
  return value !== null && typeof value === "object";
}
const CLASS_VALUE_PRIMITIVE_TYPES = ["string", "number", "bigint", "boolean"];
function isClassValue(value) {
  if (value === null || value === void 0)
    return true;
  if (CLASS_VALUE_PRIMITIVE_TYPES.includes(typeof value))
    return true;
  if (Array.isArray(value))
    return value.every((item) => isClassValue(item));
  if (typeof value === "object") {
    if (Object.getPrototypeOf(value) !== Object.prototype)
      return false;
    return true;
  }
  return false;
}
const BoxSymbol = Symbol("box");
const isWritableSymbol = Symbol("is-writable");
function isBox(value) {
  return isObject(value) && BoxSymbol in value;
}
function isWritableBox(value) {
  return box.isBox(value) && isWritableSymbol in value;
}
function box(initialValue) {
  let current = initialValue;
  return {
    [BoxSymbol]: true,
    [isWritableSymbol]: true,
    get current() {
      return current;
    },
    set current(v) {
      current = v;
    }
  };
}
function boxWith(getter, setter) {
  const derived = getter();
  if (setter) {
    return {
      [BoxSymbol]: true,
      [isWritableSymbol]: true,
      get current() {
        return derived;
      },
      set current(v) {
        setter(v);
      }
    };
  }
  return {
    [BoxSymbol]: true,
    get current() {
      return getter();
    }
  };
}
function boxFrom(value) {
  if (box.isBox(value)) return value;
  if (isFunction(value)) return box.with(value);
  return box(value);
}
function boxFlatten(boxes) {
  return Object.entries(boxes).reduce(
    (acc, [key, b]) => {
      if (!box.isBox(b)) {
        return Object.assign(acc, { [key]: b });
      }
      if (box.isWritableBox(b)) {
        Object.defineProperty(acc, key, {
          get() {
            return b.current;
          },
          set(v) {
            b.current = v;
          }
        });
      } else {
        Object.defineProperty(acc, key, {
          get() {
            return b.current;
          }
        });
      }
      return acc;
    },
    {}
  );
}
function toReadonlyBox(b) {
  if (!box.isWritableBox(b)) return b;
  return {
    [BoxSymbol]: true,
    get current() {
      return b.current;
    }
  };
}
box.from = boxFrom;
box.with = boxWith;
box.flatten = boxFlatten;
box.readonly = toReadonlyBox;
box.isBox = isBox;
box.isWritableBox = isWritableBox;
function composeHandlers(...handlers) {
  return function(e) {
    for (const handler of handlers) {
      if (!handler)
        continue;
      if (e.defaultPrevented)
        return;
      if (typeof handler === "function") {
        handler.call(this, e);
      } else {
        handler.current?.call(this, e);
      }
    }
  };
}
const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char))
    return void 0;
  return char !== char.toLowerCase();
}
function splitByCase(str) {
  const parts = [];
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = STR_SPLITTERS.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function pascalCase(str) {
  if (!str)
    return "";
  return splitByCase(str).map((p) => upperFirst(p)).join("");
}
function camelCase(str) {
  return lowerFirst(pascalCase(str || ""));
}
function upperFirst(str) {
  return str ? str[0].toUpperCase() + str.slice(1) : "";
}
function lowerFirst(str) {
  return str ? str[0].toLowerCase() + str.slice(1) : "";
}
function cssToStyleObj(css) {
  if (!css)
    return {};
  const styleObj = {};
  function iterator(name, value) {
    if (name.startsWith("-moz-") || name.startsWith("-webkit-") || name.startsWith("-ms-") || name.startsWith("-o-")) {
      styleObj[pascalCase(name)] = value;
      return;
    }
    if (name.startsWith("--")) {
      styleObj[name] = value;
      return;
    }
    styleObj[camelCase(name)] = value;
  }
  parse(css, iterator);
  return styleObj;
}
function executeCallbacks(...callbacks) {
  return (...args) => {
    for (const callback of callbacks) {
      if (typeof callback === "function") {
        callback(...args);
      }
    }
  };
}
function createParser(matcher, replacer) {
  const regex = RegExp(matcher, "g");
  return (str) => {
    if (typeof str !== "string") {
      throw new TypeError(`expected an argument of type string, but got ${typeof str}`);
    }
    if (!str.match(regex))
      return str;
    return str.replace(regex, replacer);
  };
}
const camelToKebab = createParser(/[A-Z]/, (match) => `-${match.toLowerCase()}`);
function styleToCSS(styleObj) {
  if (!styleObj || typeof styleObj !== "object" || Array.isArray(styleObj)) {
    throw new TypeError(`expected an argument of type object, but got ${typeof styleObj}`);
  }
  return Object.keys(styleObj).map((property) => `${camelToKebab(property)}: ${styleObj[property]};`).join("\n");
}
function styleToString(style = {}) {
  return styleToCSS(style).replace("\n", " ");
}
const srOnlyStyles = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  borderWidth: "0",
  transform: "translateX(-100%)"
};
const srOnlyStylesString = styleToString(srOnlyStyles);
function isEventHandler(key) {
  return key.length > 2 && key.startsWith("on") && key[2] === key[2]?.toLowerCase();
}
function mergeProps(...args) {
  const result = { ...args[0] };
  for (let i = 1; i < args.length; i++) {
    const props = args[i];
    for (const key in props) {
      const a = result[key];
      const b = props[key];
      const aIsFunction = typeof a === "function";
      const bIsFunction = typeof b === "function";
      if (aIsFunction && typeof bIsFunction && isEventHandler(key)) {
        const aHandler = a;
        const bHandler = b;
        result[key] = composeHandlers(aHandler, bHandler);
      } else if (aIsFunction && bIsFunction) {
        result[key] = executeCallbacks(a, b);
      } else if (key === "class") {
        const aIsClassValue = isClassValue(a);
        const bIsClassValue = isClassValue(b);
        if (aIsClassValue && bIsClassValue) {
          result[key] = clsx(a, b);
        } else if (aIsClassValue) {
          result[key] = clsx(a);
        } else if (bIsClassValue) {
          result[key] = clsx(b);
        }
      } else if (key === "style") {
        const aIsObject = typeof a === "object";
        const bIsObject = typeof b === "object";
        const aIsString = typeof a === "string";
        const bIsString = typeof b === "string";
        if (aIsObject && bIsObject) {
          result[key] = { ...a, ...b };
        } else if (aIsObject && bIsString) {
          const parsedStyle = cssToStyleObj(b);
          result[key] = { ...a, ...parsedStyle };
        } else if (aIsString && bIsObject) {
          const parsedStyle = cssToStyleObj(a);
          result[key] = { ...parsedStyle, ...b };
        } else if (aIsString && bIsString) {
          const parsedStyleA = cssToStyleObj(a);
          const parsedStyleB = cssToStyleObj(b);
          result[key] = { ...parsedStyleA, ...parsedStyleB };
        } else if (aIsObject) {
          result[key] = a;
        } else if (bIsObject) {
          result[key] = b;
        } else if (aIsString) {
          result[key] = a;
        } else if (bIsString) {
          result[key] = b;
        }
      } else {
        result[key] = b !== void 0 ? b : a;
      }
    }
  }
  if (typeof result.style === "object") {
    result.style = styleToString(result.style).replaceAll("\n", " ");
  }
  if (result.hidden !== true) {
    result.hidden = void 0;
    delete result.hidden;
  }
  if (result.disabled !== true) {
    result.disabled = void 0;
    delete result.disabled;
  }
  return result;
}
const defaultWindow = void 0;
function getActiveElement(document2) {
  let activeElement = document2.activeElement;
  while (activeElement?.shadowRoot) {
    const node = activeElement.shadowRoot.activeElement;
    if (node === activeElement)
      break;
    else
      activeElement = node;
  }
  return activeElement;
}
function createSubscriber(_) {
  return () => {
  };
}
class ActiveElement {
  #document;
  #subscribe;
  constructor(options = {}) {
    const {
      window: window2 = defaultWindow,
      document: document2 = window2?.document
    } = options;
    if (window2 === void 0) return;
    this.#document = document2;
    this.#subscribe = createSubscriber();
  }
  get current() {
    this.#subscribe?.();
    if (!this.#document) return null;
    return getActiveElement(this.#document);
  }
}
new ActiveElement();
function runWatcher(sources, flush, effect, options = {}) {
  const { lazy = false } = options;
}
function watch(sources, effect, options) {
  runWatcher(sources, "post", effect, options);
}
function watchPre(sources, effect, options) {
  runWatcher(sources, "pre", effect, options);
}
watch.pre = watchPre;
class ElementSize {
  #size = { width: 0, height: 0 };
  constructor(node, options = { box: "border-box" }) {
    options.window ?? defaultWindow;
    this.#size = {
      width: options.initialSize?.width ?? 0,
      height: options.initialSize?.height ?? 0
    };
  }
  get current() {
    return this.#size;
  }
  get width() {
    return this.#size.width;
  }
  get height() {
    return this.#size.height;
  }
}
class Context {
  #name;
  #key;
  /**
   * @param name The name of the context.
   * This is used for generating the context key and error messages.
   */
  constructor(name) {
    this.#name = name;
    this.#key = Symbol(name);
  }
  /**
   * The key used to get and set the context.
   *
   * It is not recommended to use this value directly.
   * Instead, use the methods provided by this class.
   */
  get key() {
    return this.#key;
  }
  /**
   * Checks whether this has been set in the context of a parent component.
   *
   * Must be called during component initialisation.
   */
  exists() {
    return hasContext(this.#key);
  }
  /**
   * Retrieves the context that belongs to the closest parent component.
   *
   * Must be called during component initialisation.
   *
   * @throws An error if the context does not exist.
   */
  get() {
    const context = getContext(this.#key);
    if (context === void 0) {
      throw new Error(`Context "${this.#name}" not found`);
    }
    return context;
  }
  /**
   * Retrieves the context that belongs to the closest parent component,
   * or the given fallback value if the context does not exist.
   *
   * Must be called during component initialisation.
   */
  getOr(fallback) {
    const context = getContext(this.#key);
    if (context === void 0) {
      return fallback;
    }
    return context;
  }
  /**
   * Associates the given value with the current component and returns it.
   *
   * Must be called during component initialisation.
   */
  set(context) {
    return setContext(this.#key, context);
  }
}
function useRefById({
  id,
  ref,
  deps = () => true,
  onRefChange,
  getRootNode
}) {
  watch([() => id.current, deps], ([_id]) => {
    const rootNode = getRootNode?.() ?? document;
    const node = rootNode?.getElementById(_id);
    if (node) ref.current = node;
    else ref.current = null;
    onRefChange?.(ref.current);
  });
}
function getDataOpenClosed(condition) {
  return condition ? "open" : "closed";
}
function getAriaDisabled(condition) {
  return condition ? "true" : "false";
}
function getAriaReadonly(condition) {
  return condition ? "true" : "false";
}
function getAriaExpanded(condition) {
  return condition ? "true" : "false";
}
function getDataDisabled(condition) {
  return condition ? "" : void 0;
}
function getAriaRequired(condition) {
  return condition ? "true" : "false";
}
function getAriaSelected(condition) {
  return condition ? "true" : "false";
}
function getAriaChecked(checked, indeterminate) {
  return checked ? "true" : "false";
}
function getAriaHidden(condition) {
  return condition ? "true" : void 0;
}
function getDataInvalid(condition) {
  return condition ? "" : void 0;
}
function getDataReadonly(condition) {
  return condition ? "" : void 0;
}
function getDataSelected(condition) {
  return condition ? "" : void 0;
}
function getDataUnavailable(condition) {
  return condition ? "" : void 0;
}
function getDisabled(condition) {
  return condition ? true : void 0;
}
function getRequired(condition) {
  return condition ? true : void 0;
}
const isBrowser = typeof document !== "undefined";
const isIOS = getIsIOS();
function getIsIOS() {
  return isBrowser && window?.navigator?.userAgent && (/iP(ad|hone|od)/.test(window.navigator.userAgent) || // The new iPad Pro Gen3 does not identify itself as iPad, but as Macintosh.
  window?.navigator?.maxTouchPoints > 2 && /iPad|Macintosh/.test(window?.navigator.userAgent));
}
function isHTMLElement(element) {
  return element instanceof HTMLElement;
}
function isElement(element) {
  return element instanceof Element;
}
function isFocusVisible(element) {
  return element.matches(":focus-visible");
}
function isNotNull(value) {
  return value !== null;
}
function isSelectableInput(element) {
  return element instanceof HTMLInputElement && "select" in element;
}
function isElementHidden(node, stopAt) {
  if (getComputedStyle(node).visibility === "hidden")
    return true;
  while (node) {
    if (stopAt !== void 0 && node === stopAt)
      return false;
    if (getComputedStyle(node).display === "none")
      return true;
    node = node.parentElement;
  }
  return false;
}
globalThis.bitsIdCounter ??= { current: 0 };
function useId(prefix = "bits") {
  globalThis.bitsIdCounter.current++;
  return `${prefix}-${globalThis.bitsIdCounter.current}`;
}
function noop() {
}
function addEventListener(target, event, handler, options) {
  const events = Array.isArray(event) ? event : [event];
  events.forEach((_event) => target.addEventListener(_event, handler, options));
  return () => {
    events.forEach((_event) => target.removeEventListener(_event, handler, options));
  };
}
class CustomEventDispatcher {
  eventName;
  options;
  constructor(eventName, options = { bubbles: true, cancelable: true }) {
    this.eventName = eventName;
    this.options = options;
  }
  createEvent(detail) {
    return new CustomEvent(this.eventName, {
      ...this.options,
      detail
    });
  }
  dispatch(element, detail) {
    const event = this.createEvent(detail);
    element.dispatchEvent(event);
    return event;
  }
  listen(element, callback, options) {
    const handler = (event) => {
      callback(event);
    };
    return on(element, this.eventName, handler, options);
  }
}
function get(valueOrGetValue) {
  return typeof valueOrGetValue === "function" ? valueOrGetValue() : valueOrGetValue;
}
function getDPR(element) {
  if (typeof window === "undefined") return 1;
  const win = element.ownerDocument.defaultView || window;
  return win.devicePixelRatio || 1;
}
function roundByDPR(element, value) {
  const dpr = getDPR(element);
  return Math.round(value * dpr) / dpr;
}
function getFloatingContentCSSVars(name) {
  return {
    [`--bits-${name}-content-transform-origin`]: `var(--bits-floating-transform-origin)`,
    [`--bits-${name}-content-available-width`]: `var(--bits-floating-available-width)`,
    [`--bits-${name}-content-available-height`]: `var(--bits-floating-available-height)`,
    [`--bits-${name}-anchor-width`]: `var(--bits-floating-anchor-width)`,
    [`--bits-${name}-anchor-height`]: `var(--bits-floating-anchor-height)`
  };
}
function useFloating(options) {
  get(options.open) ?? true;
  const middlewareOption = get(options.middleware);
  const transformOption = get(options.transform) ?? true;
  const placementOption = get(options.placement) ?? "bottom";
  const strategyOption = get(options.strategy) ?? "absolute";
  const reference = options.reference;
  let x = 0;
  let y = 0;
  const floating = box(null);
  let strategy = strategyOption;
  let placement = placementOption;
  let middlewareData = {};
  let isPositioned = false;
  const floatingStyles = (() => {
    const initialStyles = { position: strategy, left: "0", top: "0" };
    if (!floating.current) {
      return initialStyles;
    }
    const xVal = roundByDPR(floating.current, x);
    const yVal = roundByDPR(floating.current, y);
    if (transformOption) {
      return {
        ...initialStyles,
        transform: `translate(${xVal}px, ${yVal}px)`,
        ...getDPR(floating.current) >= 1.5 && { willChange: "transform" }
      };
    }
    return {
      position: strategy,
      left: `${xVal}px`,
      top: `${yVal}px`
    };
  })();
  function update() {
    if (reference.current === null || floating.current === null) return;
    computePosition(reference.current, floating.current, {
      middleware: middlewareOption,
      placement: placementOption,
      strategy: strategyOption
    }).then((position) => {
      x = position.x;
      y = position.y;
      strategy = position.strategy;
      placement = position.placement;
      middlewareData = position.middlewareData;
      isPositioned = true;
    });
  }
  return {
    floating,
    reference,
    get strategy() {
      return strategy;
    },
    get placement() {
      return placement;
    },
    get middlewareData() {
      return middlewareData;
    },
    get isPositioned() {
      return isPositioned;
    },
    get floatingStyles() {
      return floatingStyles;
    },
    get update() {
      return update;
    }
  };
}
const OPPOSITE_SIDE = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right"
};
class FloatingRootState {
  anchorNode = box(null);
  customAnchorNode = box(null);
  triggerNode = box(null);
  constructor() {
  }
}
class FloatingContentState {
  opts;
  root;
  // nodes
  contentRef = box(null);
  wrapperRef = box(null);
  arrowRef = box(null);
  // ids
  arrowId = box(useId());
  #transformedStyle = once(() => {
    if (typeof this.opts.style === "string") return cssToStyleObj(this.opts.style);
    if (!this.opts.style) return {};
  });
  #updatePositionStrategy = void 0;
  #arrowSize = new ElementSize(() => this.arrowRef.current ?? void 0);
  #arrowWidth = once(() => this.#arrowSize?.width ?? 0);
  #arrowHeight = once(() => this.#arrowSize?.height ?? 0);
  #desiredPlacement = once(() => this.opts.side?.current + (this.opts.align.current !== "center" ? `-${this.opts.align.current}` : ""));
  #boundary = once(() => Array.isArray(this.opts.collisionBoundary.current) ? this.opts.collisionBoundary.current : [this.opts.collisionBoundary.current]);
  #hasExplicitBoundaries = once(() => this.#boundary().length > 0);
  get hasExplicitBoundaries() {
    return this.#hasExplicitBoundaries();
  }
  #detectOverflowOptions = once(() => ({
    padding: this.opts.collisionPadding.current,
    boundary: this.#boundary().filter(isNotNull),
    altBoundary: this.hasExplicitBoundaries
  }));
  get detectOverflowOptions() {
    return this.#detectOverflowOptions();
  }
  #availableWidth = void 0;
  #availableHeight = void 0;
  #anchorWidth = void 0;
  #anchorHeight = void 0;
  #middleware = once(() => [
    offset({
      mainAxis: this.opts.sideOffset.current + this.#arrowHeight(),
      alignmentAxis: this.opts.alignOffset.current
    }),
    this.opts.avoidCollisions.current && shift({
      mainAxis: true,
      crossAxis: false,
      limiter: this.opts.sticky.current === "partial" ? limitShift() : void 0,
      ...this.detectOverflowOptions
    }),
    this.opts.avoidCollisions.current && flip({ ...this.detectOverflowOptions }),
    size({
      ...this.detectOverflowOptions,
      apply: ({ rects, availableWidth, availableHeight }) => {
        const { width: anchorWidth, height: anchorHeight } = rects.reference;
        this.#availableWidth = availableWidth;
        this.#availableHeight = availableHeight;
        this.#anchorWidth = anchorWidth;
        this.#anchorHeight = anchorHeight;
      }
    }),
    this.arrowRef.current && arrow({
      element: this.arrowRef.current,
      padding: this.opts.arrowPadding.current
    }),
    transformOrigin({
      arrowWidth: this.#arrowWidth(),
      arrowHeight: this.#arrowHeight()
    }),
    this.opts.hideWhenDetached.current && hide({
      strategy: "referenceHidden",
      ...this.detectOverflowOptions
    })
  ].filter(Boolean));
  get middleware() {
    return this.#middleware();
  }
  floating;
  #placedSide = once(() => getSideFromPlacement(this.floating.placement));
  get placedSide() {
    return this.#placedSide();
  }
  #placedAlign = once(() => getAlignFromPlacement(this.floating.placement));
  get placedAlign() {
    return this.#placedAlign();
  }
  #arrowX = once(() => this.floating.middlewareData.arrow?.x ?? 0);
  get arrowX() {
    return this.#arrowX();
  }
  #arrowY = once(() => this.floating.middlewareData.arrow?.y ?? 0);
  get arrowY() {
    return this.#arrowY();
  }
  #cannotCenterArrow = once(() => this.floating.middlewareData.arrow?.centerOffset !== 0);
  get cannotCenterArrow() {
    return this.#cannotCenterArrow();
  }
  contentZIndex;
  #arrowBaseSide = once(() => OPPOSITE_SIDE[this.placedSide]);
  get arrowBaseSide() {
    return this.#arrowBaseSide();
  }
  #wrapperProps = once(() => ({
    id: this.opts.wrapperId.current,
    "data-bits-floating-content-wrapper": "",
    style: {
      ...this.floating.floatingStyles,
      // keep off page when measuring
      transform: this.floating.isPositioned ? this.floating.floatingStyles.transform : "translate(0, -200%)",
      minWidth: "max-content",
      zIndex: this.contentZIndex,
      "--bits-floating-transform-origin": `${this.floating.middlewareData.transformOrigin?.x} ${this.floating.middlewareData.transformOrigin?.y}`,
      "--bits-floating-available-width": `${this.#availableWidth}px`,
      "--bits-floating-available-height": `${this.#availableHeight}px`,
      "--bits-floating-anchor-width": `${this.#anchorWidth}px`,
      "--bits-floating-anchor-height": `${this.#anchorHeight}px`,
      // hide the content if using the hide middleware and should be hidden
      ...this.floating.middlewareData.hide?.referenceHidden && {
        visibility: "hidden",
        "pointer-events": "none"
      },
      ...this.#transformedStyle()
    },
    // Floating UI calculates logical alignment based the `dir` attribute
    dir: this.opts.dir.current
  }));
  get wrapperProps() {
    return this.#wrapperProps();
  }
  #props = once(() => ({
    "data-side": this.placedSide,
    "data-align": this.placedAlign,
    style: styleToString({
      ...this.#transformedStyle()
      // if the FloatingContent hasn't been placed yet (not all measurements done)
    })
  }));
  get props() {
    return this.#props();
  }
  #arrowStyle = once(() => ({
    position: "absolute",
    left: this.arrowX ? `${this.arrowX}px` : void 0,
    top: this.arrowY ? `${this.arrowY}px` : void 0,
    [this.arrowBaseSide]: 0,
    "transform-origin": {
      top: "",
      right: "0 0",
      bottom: "center 0",
      left: "100% 0"
    }[this.placedSide],
    transform: {
      top: "translateY(100%)",
      right: "translateY(50%) rotate(90deg) translateX(-50%)",
      bottom: "rotate(180deg)",
      left: "translateY(50%) rotate(-90deg) translateX(50%)"
    }[this.placedSide],
    visibility: this.cannotCenterArrow ? "hidden" : void 0
  }));
  get arrowStyle() {
    return this.#arrowStyle();
  }
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    if (opts.customAnchor) {
      this.root.customAnchorNode.current = opts.customAnchor.current;
    }
    watch(() => opts.customAnchor.current, (customAnchor) => {
      this.root.customAnchorNode.current = customAnchor;
    });
    useRefById({
      id: this.opts.wrapperId,
      ref: this.wrapperRef,
      deps: () => this.opts.enabled.current
    });
    useRefById({
      id: this.opts.id,
      ref: this.contentRef,
      deps: () => this.opts.enabled.current
    });
    this.floating = useFloating({
      strategy: () => this.opts.strategy.current,
      placement: () => this.#desiredPlacement(),
      middleware: () => this.middleware,
      reference: this.root.anchorNode,
      open: () => this.opts.enabled.current
    });
    watch(() => this.contentRef.current, (contentNode) => {
      if (!contentNode) return;
      this.contentZIndex = window.getComputedStyle(contentNode).zIndex;
    });
  }
}
class FloatingAnchorState {
  opts;
  root;
  ref = box(null);
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    if (opts.virtualEl && opts.virtualEl.current) {
      root.triggerNode = box.from(opts.virtualEl.current);
    } else {
      useRefById({
        id: opts.id,
        ref: this.ref,
        onRefChange: (node) => {
          root.triggerNode.current = node;
        }
      });
    }
  }
}
const FloatingRootContext = new Context("Floating.Root");
const FloatingContentContext = new Context("Floating.Content");
function useFloatingRootState() {
  return FloatingRootContext.set(new FloatingRootState());
}
function useFloatingContentState(props) {
  return FloatingContentContext.set(new FloatingContentState(props, FloatingRootContext.get()));
}
function useFloatingAnchorState(props) {
  return new FloatingAnchorState(props, FloatingRootContext.get());
}
function transformOrigin(options) {
  return {
    name: "transformOrigin",
    options,
    fn(data) {
      const { placement, rects, middlewareData } = data;
      const cannotCenterArrow = middlewareData.arrow?.centerOffset !== 0;
      const isArrowHidden = cannotCenterArrow;
      const arrowWidth = isArrowHidden ? 0 : options.arrowWidth;
      const arrowHeight = isArrowHidden ? 0 : options.arrowHeight;
      const [placedSide, placedAlign] = getSideAndAlignFromPlacement(placement);
      const noArrowAlign = { start: "0%", center: "50%", end: "100%" }[placedAlign];
      const arrowXCenter = (middlewareData.arrow?.x ?? 0) + arrowWidth / 2;
      const arrowYCenter = (middlewareData.arrow?.y ?? 0) + arrowHeight / 2;
      let x = "";
      let y = "";
      if (placedSide === "bottom") {
        x = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`;
        y = `${-arrowHeight}px`;
      } else if (placedSide === "top") {
        x = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`;
        y = `${rects.floating.height + arrowHeight}px`;
      } else if (placedSide === "right") {
        x = `${-arrowHeight}px`;
        y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`;
      } else if (placedSide === "left") {
        x = `${rects.floating.width + arrowHeight}px`;
        y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`;
      }
      return { data: { x, y } };
    }
  };
}
function getSideAndAlignFromPlacement(placement) {
  const [side, align = "center"] = placement.split("-");
  return [side, align];
}
function getSideFromPlacement(placement) {
  return getSideAndAlignFromPlacement(placement)[0];
}
function getAlignFromPlacement(placement) {
  return getSideAndAlignFromPlacement(placement)[1];
}
function Floating_layer($$payload, $$props) {
  push();
  let { children } = $$props;
  useFloatingRootState();
  children?.($$payload);
  $$payload.out += `<!---->`;
  pop();
}
function boxAutoReset(defaultValue, afterMs = 1e4, onChange = noop) {
  let timeout = null;
  let value = defaultValue;
  function resetAfter() {
    return window.setTimeout(
      () => {
        value = defaultValue;
        onChange(defaultValue);
      },
      afterMs
    );
  }
  return box.with(() => value, (v) => {
    value = v;
    onChange(v);
    if (timeout) clearTimeout(timeout);
    timeout = resetAfter();
  });
}
function Floating_layer_anchor($$payload, $$props) {
  push();
  let { id, children, virtualEl } = $$props;
  useFloatingAnchorState({
    id: box.with(() => id),
    virtualEl: box.with(() => virtualEl)
  });
  children?.($$payload);
  $$payload.out += `<!---->`;
  pop();
}
function useGraceArea(opts) {
  const enabled = opts.enabled();
  const isPointerInTransit = boxAutoReset(false, 300, (value) => {
    if (enabled) {
      opts.setIsPointerInTransit?.(value);
    }
  });
  let pointerGraceArea = null;
  function handleRemoveGraceArea() {
    pointerGraceArea = null;
    isPointerInTransit.current = false;
  }
  function handleCreateGraceArea(e, hoverTarget) {
    const currentTarget = e.currentTarget;
    if (!isHTMLElement(currentTarget)) return;
    const exitPoint = { x: e.clientX, y: e.clientY };
    const exitSide = getExitSideFromRect(exitPoint, currentTarget.getBoundingClientRect());
    const paddedExitPoints = getPaddedExitPoints(exitPoint, exitSide);
    const hoverTargetPoints = getPointsFromRect(hoverTarget.getBoundingClientRect());
    const graceArea = getHull([...paddedExitPoints, ...hoverTargetPoints]);
    pointerGraceArea = graceArea;
    isPointerInTransit.current = true;
  }
  watch(
    [
      opts.triggerNode,
      opts.contentNode,
      opts.enabled
    ],
    ([triggerNode, contentNode, enabled2]) => {
      if (!triggerNode || !contentNode || !enabled2) return;
      const handleTriggerLeave = (e) => {
        handleCreateGraceArea(e, contentNode);
      };
      const handleContentLeave = (e) => {
        handleCreateGraceArea(e, triggerNode);
      };
      return executeCallbacks(on(triggerNode, "pointerleave", handleTriggerLeave), on(contentNode, "pointerleave", handleContentLeave));
    }
  );
  watch(() => pointerGraceArea, () => {
    const handleTrackPointerGrace = (e) => {
      if (!pointerGraceArea) return;
      const target = e.target;
      if (!isElement(target)) return;
      const pointerPosition = { x: e.clientX, y: e.clientY };
      const hasEnteredTarget = opts.triggerNode()?.contains(target) || opts.contentNode()?.contains(target);
      const isPointerOutsideGraceArea = !isPointInPolygon(pointerPosition, pointerGraceArea);
      if (hasEnteredTarget) {
        handleRemoveGraceArea();
      } else if (isPointerOutsideGraceArea) {
        handleRemoveGraceArea();
        opts.onPointerExit();
      }
    };
    return on(document, "pointermove", handleTrackPointerGrace);
  });
  return { isPointerInTransit };
}
function getExitSideFromRect(point, rect) {
  const top = Math.abs(rect.top - point.y);
  const bottom = Math.abs(rect.bottom - point.y);
  const right = Math.abs(rect.right - point.x);
  const left = Math.abs(rect.left - point.x);
  switch (Math.min(top, bottom, right, left)) {
    case left:
      return "left";
    case right:
      return "right";
    case top:
      return "top";
    case bottom:
      return "bottom";
    default:
      throw new Error("unreachable");
  }
}
function getPaddedExitPoints(exitPoint, exitSide, padding = 5) {
  const tipPadding = padding * 1.5;
  switch (exitSide) {
    case "top":
      return [
        {
          x: exitPoint.x - padding,
          y: exitPoint.y + padding
        },
        { x: exitPoint.x, y: exitPoint.y - tipPadding },
        {
          x: exitPoint.x + padding,
          y: exitPoint.y + padding
        }
      ];
    case "bottom":
      return [
        {
          x: exitPoint.x - padding,
          y: exitPoint.y - padding
        },
        { x: exitPoint.x, y: exitPoint.y + tipPadding },
        {
          x: exitPoint.x + padding,
          y: exitPoint.y - padding
        }
      ];
    case "left":
      return [
        {
          x: exitPoint.x + padding,
          y: exitPoint.y - padding
        },
        { x: exitPoint.x - tipPadding, y: exitPoint.y },
        {
          x: exitPoint.x + padding,
          y: exitPoint.y + padding
        }
      ];
    case "right":
      return [
        {
          x: exitPoint.x - padding,
          y: exitPoint.y - padding
        },
        { x: exitPoint.x + tipPadding, y: exitPoint.y },
        {
          x: exitPoint.x - padding,
          y: exitPoint.y + padding
        }
      ];
  }
}
function getPointsFromRect(rect) {
  const { top, right, bottom, left } = rect;
  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom }
  ];
}
function isPointInPolygon(point, polygon) {
  const { x, y } = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersect = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
function getHull(points) {
  const newPoints = points.slice();
  newPoints.sort((a, b) => {
    if (a.x < b.x) return -1;
    else if (a.x > b.x) return 1;
    else if (a.y < b.y) return -1;
    else if (a.y > b.y) return 1;
    else return 0;
  });
  return getHullPresorted(newPoints);
}
function getHullPresorted(points) {
  if (points.length <= 1) return points.slice();
  const upperHull = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    while (upperHull.length >= 2) {
      const q = upperHull[upperHull.length - 1];
      const r = upperHull[upperHull.length - 2];
      if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x)) upperHull.pop();
      else break;
    }
    upperHull.push(p);
  }
  upperHull.pop();
  const lowerHull = [];
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i];
    while (lowerHull.length >= 2) {
      const q = lowerHull[lowerHull.length - 1];
      const r = lowerHull[lowerHull.length - 2];
      if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x)) lowerHull.pop();
      else break;
    }
    lowerHull.push(p);
  }
  lowerHull.pop();
  if (upperHull.length === 1 && lowerHull.length === 1 && upperHull[0].x === lowerHull[0].x && upperHull[0].y === lowerHull[0].y) return upperHull;
  else return upperHull.concat(lowerHull);
}
function useTimeoutFn(cb, interval, options = {}) {
  const { immediate = true } = options;
  const isPending = box(false);
  let timer;
  function clear() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }
  function stop() {
    isPending.current = false;
    clear();
  }
  function start(...args) {
    clear();
    isPending.current = true;
    timer = setTimeout(
      () => {
        isPending.current = false;
        timer = null;
        cb(...args);
      },
      interval
    );
  }
  if (immediate) {
    isPending.current = true;
    if (isBrowser) start();
  }
  return {
    isPending: box.readonly(isPending),
    start,
    stop
  };
}
const TOOLTIP_CONTENT_ATTR = "data-tooltip-content";
const TOOLTIP_TRIGGER_ATTR = "data-tooltip-trigger";
const TooltipOpenEvent = new CustomEventDispatcher("bits.tooltip.open", { bubbles: false, cancelable: false });
class TooltipProviderState {
  opts;
  isOpenDelayed = true;
  isPointerInTransit = box(false);
  #timerFn;
  constructor(opts) {
    this.opts = opts;
    this.#timerFn = useTimeoutFn(
      () => {
        this.isOpenDelayed = true;
      },
      this.opts.skipDelayDuration.current,
      { immediate: false }
    );
  }
  #startTimer = () => {
    this.#timerFn.start();
  };
  #clearTimer = () => {
    this.#timerFn.stop();
  };
  onOpen = () => {
    this.#clearTimer();
    this.isOpenDelayed = false;
  };
  onClose = () => {
    this.#startTimer();
  };
}
class TooltipRootState {
  opts;
  provider;
  #delayDuration = once(() => this.opts.delayDuration.current ?? this.provider.opts.delayDuration.current);
  get delayDuration() {
    return this.#delayDuration();
  }
  #disableHoverableContent = once(() => this.opts.disableHoverableContent.current ?? this.provider.opts.disableHoverableContent.current);
  get disableHoverableContent() {
    return this.#disableHoverableContent();
  }
  #disableCloseOnTriggerClick = once(() => this.opts.disableCloseOnTriggerClick.current ?? this.provider.opts.disableCloseOnTriggerClick.current);
  get disableCloseOnTriggerClick() {
    return this.#disableCloseOnTriggerClick();
  }
  #disabled = once(() => this.opts.disabled.current ?? this.provider.opts.disabled.current);
  get disabled() {
    return this.#disabled();
  }
  #ignoreNonKeyboardFocus = once(() => this.opts.ignoreNonKeyboardFocus.current ?? this.provider.opts.ignoreNonKeyboardFocus.current);
  get ignoreNonKeyboardFocus() {
    return this.#ignoreNonKeyboardFocus();
  }
  contentNode = null;
  triggerNode = null;
  #wasOpenDelayed = false;
  #timerFn;
  #stateAttr = once(() => {
    if (!this.opts.open.current) return "closed";
    return this.#wasOpenDelayed ? "delayed-open" : "instant-open";
  });
  get stateAttr() {
    return this.#stateAttr();
  }
  constructor(opts, provider) {
    this.opts = opts;
    this.provider = provider;
    this.#timerFn = useTimeoutFn(
      () => {
        this.#wasOpenDelayed = true;
        this.opts.open.current = true;
      },
      this.delayDuration ?? 0,
      { immediate: false }
    );
    watch(() => this.delayDuration, () => {
      if (this.delayDuration === void 0) return;
      this.#timerFn = useTimeoutFn(
        () => {
          this.#wasOpenDelayed = true;
          this.opts.open.current = true;
        },
        this.delayDuration,
        { immediate: false }
      );
    });
    watch(() => this.opts.open.current, (isOpen) => {
      if (!this.provider.onClose) return;
      if (isOpen) {
        this.provider.onOpen();
        TooltipOpenEvent.dispatch(document);
      } else {
        this.provider.onClose();
      }
    });
  }
  handleOpen = () => {
    this.#timerFn.stop();
    this.#wasOpenDelayed = false;
    this.opts.open.current = true;
  };
  handleClose = () => {
    this.#timerFn.stop();
    this.opts.open.current = false;
  };
  #handleDelayedOpen = () => {
    this.#timerFn.start();
  };
  onTriggerEnter = () => {
    this.#handleDelayedOpen();
  };
  onTriggerLeave = () => {
    if (this.disableHoverableContent) {
      this.handleClose();
    } else {
      this.#timerFn.stop();
    }
  };
}
class TooltipTriggerState {
  opts;
  root;
  #isPointerDown = box(false);
  #hasPointerMoveOpened = false;
  #isDisabled = once(() => this.opts.disabled.current || this.root.disabled);
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    useRefById({
      ...opts,
      onRefChange: (node) => {
        this.root.triggerNode = node;
      }
    });
  }
  handlePointerUp = () => {
    this.#isPointerDown.current = false;
  };
  #onpointerup = () => {
    if (this.#isDisabled()) return;
    this.#isPointerDown.current = false;
  };
  #onpointerdown = () => {
    if (this.#isDisabled()) return;
    this.#isPointerDown.current = true;
    document.addEventListener(
      "pointerup",
      () => {
        this.handlePointerUp();
      },
      { once: true }
    );
  };
  #onpointermove = (e) => {
    if (this.#isDisabled()) return;
    if (e.pointerType === "touch") return;
    if (this.#hasPointerMoveOpened || this.root.provider.isPointerInTransit.current) return;
    this.root.onTriggerEnter();
    this.#hasPointerMoveOpened = true;
  };
  #onpointerleave = () => {
    if (this.#isDisabled()) return;
    this.root.onTriggerLeave();
    this.#hasPointerMoveOpened = false;
  };
  #onfocus = (e) => {
    if (this.#isPointerDown.current || this.#isDisabled()) return;
    if (this.root.ignoreNonKeyboardFocus && !isFocusVisible(e.currentTarget)) return;
    this.root.handleOpen();
  };
  #onblur = () => {
    if (this.#isDisabled()) return;
    this.root.handleClose();
  };
  #onclick = () => {
    if (this.root.disableCloseOnTriggerClick || this.#isDisabled()) return;
    this.root.handleClose();
  };
  #props = once(() => ({
    id: this.opts.id.current,
    "aria-describedby": this.root.opts.open.current ? this.root.contentNode?.id : void 0,
    "data-state": this.root.stateAttr,
    "data-disabled": getDataDisabled(this.#isDisabled()),
    "data-delay-duration": `${this.root.delayDuration}`,
    [TOOLTIP_TRIGGER_ATTR]: "",
    tabindex: this.#isDisabled() ? void 0 : 0,
    disabled: this.opts.disabled.current,
    onpointerup: this.#onpointerup,
    onpointerdown: this.#onpointerdown,
    onpointermove: this.#onpointermove,
    onpointerleave: this.#onpointerleave,
    onfocus: this.#onfocus,
    onblur: this.#onblur,
    onclick: this.#onclick
  }));
  get props() {
    return this.#props();
  }
}
class TooltipContentState {
  opts;
  root;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    useRefById({
      ...opts,
      onRefChange: (node) => {
        this.root.contentNode = node;
      },
      deps: () => this.root.opts.open.current
    });
    useGraceArea({
      triggerNode: () => this.root.triggerNode,
      contentNode: () => this.root.contentNode,
      enabled: () => this.root.opts.open.current && !this.root.disableHoverableContent,
      onPointerExit: () => {
        this.root.handleClose();
      },
      setIsPointerInTransit: (value) => {
        this.root.provider.isPointerInTransit.current = value;
      }
    });
  }
  onInteractOutside = (e) => {
    if (isElement(e.target) && this.root.triggerNode?.contains(e.target) && this.root.disableCloseOnTriggerClick) {
      e.preventDefault();
      return;
    }
    this.opts.onInteractOutside.current(e);
    if (e.defaultPrevented) return;
    this.root.handleClose();
  };
  onEscapeKeydown = (e) => {
    this.opts.onEscapeKeydown.current?.(e);
    if (e.defaultPrevented) return;
    this.root.handleClose();
  };
  onOpenAutoFocus = (e) => {
    e.preventDefault();
  };
  onCloseAutoFocus = (e) => {
    e.preventDefault();
  };
  #snippetProps = once(() => ({ open: this.root.opts.open.current }));
  get snippetProps() {
    return this.#snippetProps();
  }
  #props = once(() => ({
    id: this.opts.id.current,
    "data-state": this.root.stateAttr,
    "data-disabled": getDataDisabled(this.root.disabled),
    style: { pointerEvents: "auto", outline: "none" },
    [TOOLTIP_CONTENT_ATTR]: ""
  }));
  get props() {
    return this.#props();
  }
  popperProps = {
    onInteractOutside: this.onInteractOutside,
    onEscapeKeydown: this.onEscapeKeydown,
    onOpenAutoFocus: this.onOpenAutoFocus,
    onCloseAutoFocus: this.onCloseAutoFocus
  };
}
const TooltipProviderContext = new Context("Tooltip.Provider");
const TooltipRootContext = new Context("Tooltip.Root");
function useTooltipProvider(props) {
  return TooltipProviderContext.set(new TooltipProviderState(props));
}
function useTooltipRoot(props) {
  return TooltipRootContext.set(new TooltipRootState(props, TooltipProviderContext.get()));
}
function useTooltipTrigger(props) {
  return new TooltipTriggerState(props, TooltipRootContext.get());
}
function useTooltipContent(props) {
  return new TooltipContentState(props, TooltipRootContext.get());
}
function Tooltip($$payload, $$props) {
  push();
  let {
    open = false,
    onOpenChange = noop,
    disabled,
    delayDuration,
    disableCloseOnTriggerClick,
    disableHoverableContent,
    ignoreNonKeyboardFocus,
    children
  } = $$props;
  useTooltipRoot({
    open: box.with(() => open, (v) => {
      open = v;
      onOpenChange(v);
    }),
    delayDuration: box.with(() => delayDuration),
    disableCloseOnTriggerClick: box.with(() => disableCloseOnTriggerClick),
    disableHoverableContent: box.with(() => disableHoverableContent),
    ignoreNonKeyboardFocus: box.with(() => ignoreNonKeyboardFocus),
    disabled: box.with(() => disabled)
  });
  Floating_layer($$payload, {
    children: ($$payload2) => {
      children?.($$payload2);
      $$payload2.out += `<!---->`;
    }
  });
  bind_props($$props, { open });
  pop();
}
function Tooltip_trigger($$payload, $$props) {
  push();
  let {
    children,
    child,
    id = useId(),
    disabled = false,
    type = "button",
    ref = null,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const triggerState = useTooltipTrigger({
    id: box.with(() => id),
    disabled: box.with(() => disabled ?? false),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, triggerState.props, { type });
  const paraglide_sveltekit_translate_attribute_pass_translationFunctions = getTranslationFunctions();
  const [
    paraglide_sveltekit_translate_attribute_pass_translateAttribute,
    paraglide_sveltekit_translate_attribute_pass_handle_attributes
  ] = paraglide_sveltekit_translate_attribute_pass_translationFunctions;
  Floating_layer_anchor($$payload, {
    id,
    children: ($$payload2) => {
      if (child) {
        $$payload2.out += "<!--[-->";
        child($$payload2, { props: mergedProps });
        $$payload2.out += `<!---->`;
      } else {
        $$payload2.out += "<!--[!-->";
        $$payload2.out += `<button${spread_attributes(
          {
            ...paraglide_sveltekit_translate_attribute_pass_handle_attributes({ ...mergedProps }, [{ attribute_name: "formaction" }])
          },
          null
        )}>`;
        children?.($$payload2);
        $$payload2.out += `<!----></button>`;
      }
      $$payload2.out += `<!--]-->`;
    }
  });
  bind_props($$props, { ref });
  pop();
}
function Tooltip_provider($$payload, $$props) {
  push();
  let {
    children,
    delayDuration = 700,
    disableCloseOnTriggerClick = false,
    disableHoverableContent = false,
    disabled = false,
    ignoreNonKeyboardFocus = false,
    skipDelayDuration = 300
  } = $$props;
  useTooltipProvider({
    delayDuration: box.with(() => delayDuration),
    disableCloseOnTriggerClick: box.with(() => disableCloseOnTriggerClick),
    disableHoverableContent: box.with(() => disableHoverableContent),
    disabled: box.with(() => disabled),
    ignoreNonKeyboardFocus: box.with(() => ignoreNonKeyboardFocus),
    skipDelayDuration: box.with(() => skipDelayDuration)
  });
  children?.($$payload);
  $$payload.out += `<!---->`;
  pop();
}
const Root = Tooltip;
const Trigger = Tooltip_trigger;
const Provider = Tooltip_provider;
export {
  srOnlyStylesString as A,
  getDataReadonly as B,
  Context as C,
  getDataDisabled as D,
  getDataInvalid as E,
  getAriaDisabled as F,
  getAriaHidden as G,
  getAriaReadonly as H,
  getDataSelected as I,
  getDataUnavailable as J,
  getAriaSelected as K,
  boxAutoReset as L,
  getRequired as M,
  getDisabled as N,
  isIOS as O,
  Provider as P,
  useFloatingContentState as Q,
  getAriaRequired as R,
  getAriaChecked as S,
  Floating_layer as T,
  Floating_layer_anchor as U,
  useTooltipContent as V,
  getFloatingContentCSSVars as W,
  Root as X,
  Trigger as Y,
  toast as Z,
  tick as a,
  box as b,
  cn as c,
  getDataOpenClosed as d,
  executeCallbacks as e,
  useRefById as f,
  getTranslationFunctions as g,
  getAriaExpanded as h,
  isBrowser as i,
  useId as j,
  mount as k,
  unmount as l,
  mergeProps as m,
  noop as n,
  onDestroy as o,
  addEventListener as p,
  isElement as q,
  isSelectableInput as r,
  setParaglideContext as s,
  toastState as t,
  useEffect as u,
  isElementHidden as v,
  watch as w,
  CustomEventDispatcher as x,
  isHTMLElement as y,
  composeHandlers as z
};
