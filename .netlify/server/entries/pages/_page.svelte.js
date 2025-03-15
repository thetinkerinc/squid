import { w as push, y as pop, S as once, G as bind_props, R as spread_attributes, T as getAllContexts, N as spread_props, U as run, P as escape_html, V as copy_payload, W as assign_payload, A as ensure_array_like, M as clsx$1, X as element, J as attr_class, Y as stringify, I as sanitize_props, Q as rest_props, F as fallback, O as slot, B as attr, E as head } from "../../chunks/index.js";
import { a as tick, b as box, i as isBrowser, w as watch, e as executeCallbacks, C as Context, d as getDataOpenClosed, f as useRefById, h as getAriaExpanded, n as noop, j as useId, m as mergeProps, g as getTranslationFunctions, k as mount, l as unmount, p as addEventListener, q as isElement, r as isSelectableInput, v as isElementHidden, x as CustomEventDispatcher, y as isHTMLElement, z as composeHandlers, A as srOnlyStylesString, B as getDataReadonly, D as getDataDisabled, E as getDataInvalid, F as getAriaDisabled, G as getAriaHidden, H as getAriaReadonly, I as getDataSelected, J as getDataUnavailable, K as getAriaSelected, L as boxAutoReset, M as getRequired, N as getDisabled, O as isIOS, Q as useFloatingContentState, R as getAriaRequired, S as getAriaChecked, T as Floating_layer, U as Floating_layer_anchor, V as useTooltipContent, W as getFloatingContentCSSVars, X as Root$2, Y as Trigger$1, Z as toast } from "../../chunks/index4.js";
import { p as page } from "../../chunks/index5.js";
import { l as local } from "../../chunks/index.svelte.js";
import { P as PUBLIC_APP_URL, a as auth } from "../../chunks/auth.js";
import { clsx } from "clsx";
import "style-to-object";
import { o as on } from "../../chunks/events.js";
import { twMerge } from "tailwind-merge";
import { isTabbable } from "tabbable";
import dayjs from "dayjs";
import { i as invalidateAll } from "../../chunks/client.js";
import * as _ from "radashi";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { tv } from "tailwind-variants";
import { CalendarDateTime, CalendarDate, getLocalTimeZone, ZonedDateTime, parseZonedDateTime, parseDateTime, parseDate, toCalendar, getDayOfWeek, DateFormatter, startOfMonth, endOfMonth, isSameDay, isSameMonth, isToday, now } from "@internationalized/date";
import "echarts";
function useDebounce(callback, wait = 250) {
  let context = null;
  function debounced(...args) {
    if (context) {
      if (context.timeout) {
        clearTimeout(context.timeout);
      }
    } else {
      let resolve;
      let reject;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      context = {
        timeout: null,
        runner: null,
        promise,
        resolve,
        reject
      };
    }
    context.runner = async () => {
      if (!context) return;
      const ctx = context;
      context = null;
      try {
        ctx.resolve(await callback.apply(this, args));
      } catch (error) {
        ctx.reject(error);
      }
    };
    context.timeout = setTimeout(context.runner, typeof wait === "function" ? wait() : wait);
    return context.promise;
  }
  debounced.cancel = async () => {
    if (!context || context.timeout === null) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (!context || context.timeout === null) return;
    }
    clearTimeout(context.timeout);
    context.reject("Cancelled");
    context = null;
  };
  debounced.runScheduledNow = async () => {
    if (!context || !context.timeout) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (!context || !context.timeout) return;
    }
    clearTimeout(context.timeout);
    context.timeout = null;
    await context.runner?.();
  };
  Object.defineProperty(debounced, "pending", {
    enumerable: true,
    get() {
      return !!context?.timeout;
    }
  });
  return debounced;
}
class IsMounted {
  #isMounted = false;
  constructor() {
  }
  get current() {
    return this.#isMounted;
  }
}
class Previous {
  #previous = void 0;
  #curr;
  constructor(getter) {
  }
  get current() {
    return this.#previous;
  }
}
function afterSleep(ms, cb) {
  return setTimeout(cb, ms);
}
function afterTick(fn) {
  tick().then(fn);
}
const ARROW_DOWN = "ArrowDown";
const ARROW_LEFT = "ArrowLeft";
const ARROW_RIGHT = "ArrowRight";
const ARROW_UP = "ArrowUp";
const END = "End";
const ENTER = "Enter";
const ESCAPE = "Escape";
const HOME = "Home";
const PAGE_DOWN = "PageDown";
const PAGE_UP = "PageUp";
const SPACE = " ";
const TAB = "Tab";
function getElemDirection(elem) {
  const style = window.getComputedStyle(elem);
  const direction = style.getPropertyValue("direction");
  return direction;
}
function getNextKey(dir = "ltr", orientation = "horizontal") {
  return {
    horizontal: dir === "rtl" ? ARROW_LEFT : ARROW_RIGHT,
    vertical: ARROW_DOWN
  }[orientation];
}
function getPrevKey(dir = "ltr", orientation = "horizontal") {
  return {
    horizontal: dir === "rtl" ? ARROW_RIGHT : ARROW_LEFT,
    vertical: ARROW_UP
  }[orientation];
}
function getDirectionalKeys(dir = "ltr", orientation = "horizontal") {
  if (!["ltr", "rtl"].includes(dir))
    dir = "ltr";
  if (!["horizontal", "vertical"].includes(orientation))
    orientation = "horizontal";
  return {
    nextKey: getNextKey(dir, orientation),
    prevKey: getPrevKey(dir, orientation)
  };
}
function useRovingFocus(props) {
  const currentTabStopId = box(null);
  function getCandidateNodes() {
    if (!isBrowser) return [];
    const node = document.getElementById(props.rootNodeId.current);
    if (!node) return [];
    if (props.candidateSelector) {
      const candidates = Array.from(node.querySelectorAll(props.candidateSelector));
      return candidates;
    } else {
      const candidates = Array.from(node.querySelectorAll(`[${props.candidateAttr}]:not([data-disabled])`));
      return candidates;
    }
  }
  function focusFirstCandidate() {
    const items = getCandidateNodes();
    if (!items.length) return;
    items[0]?.focus();
  }
  function handleKeydown(node, e, both = false) {
    const rootNode = document.getElementById(props.rootNodeId.current);
    if (!rootNode || !node) return;
    const items = getCandidateNodes();
    if (!items.length) return;
    const currentIndex = items.indexOf(node);
    const dir = getElemDirection(rootNode);
    const { nextKey, prevKey } = getDirectionalKeys(dir, props.orientation.current);
    const loop = props.loop.current;
    const keyToIndex = {
      [nextKey]: currentIndex + 1,
      [prevKey]: currentIndex - 1,
      [HOME]: 0,
      [END]: items.length - 1
    };
    if (both) {
      const altNextKey = nextKey === ARROW_DOWN ? ARROW_RIGHT : ARROW_DOWN;
      const altPrevKey = prevKey === ARROW_UP ? ARROW_LEFT : ARROW_UP;
      keyToIndex[altNextKey] = currentIndex + 1;
      keyToIndex[altPrevKey] = currentIndex - 1;
    }
    let itemIndex = keyToIndex[e.key];
    if (itemIndex === void 0) return;
    e.preventDefault();
    if (itemIndex < 0 && loop) {
      itemIndex = items.length - 1;
    } else if (itemIndex === items.length && loop) {
      itemIndex = 0;
    }
    const itemToFocus = items[itemIndex];
    if (!itemToFocus) return;
    itemToFocus.focus();
    currentTabStopId.current = itemToFocus.id;
    props.onCandidateFocus?.(itemToFocus);
    return itemToFocus;
  }
  function getTabIndex(node) {
    const items = getCandidateNodes();
    const anyActive = currentTabStopId.current !== null;
    if (node && !anyActive && items[0] === node) {
      currentTabStopId.current = node.id;
      return 0;
    } else if (node?.id === currentTabStopId.current) {
      return 0;
    }
    return -1;
  }
  return {
    setCurrentTabStopId(id) {
      currentTabStopId.current = id;
    },
    getTabIndex,
    handleKeydown,
    focusFirstCandidate,
    currentTabStopId
  };
}
function useStateMachine(initialState, machine) {
  const state = box(initialState);
  function reducer(event) {
    const nextState = machine[state.current][event];
    return nextState ?? state.current;
  }
  const dispatch = (event) => {
    state.current = reducer(event);
  };
  return { state, dispatch };
}
function usePresence(present, id) {
  let styles = {};
  let prevAnimationNameState = "none";
  const initialState = present.current ? "mounted" : "unmounted";
  let node = null;
  const prevPresent = new Previous(() => present.current);
  watch([() => id.current, () => present.current], ([id2, present2]) => {
    if (!id2 || !present2) return;
    afterTick(() => {
      node = document.getElementById(id2);
    });
  });
  const { state, dispatch } = useStateMachine(initialState, {
    mounted: {
      UNMOUNT: "unmounted",
      ANIMATION_OUT: "unmountSuspended"
    },
    unmountSuspended: { MOUNT: "mounted", ANIMATION_END: "unmounted" },
    unmounted: { MOUNT: "mounted" }
  });
  watch(() => present.current, (currPresent) => {
    if (!node) {
      node = document.getElementById(id.current);
    }
    if (!node) return;
    const hasPresentChanged = currPresent !== prevPresent.current;
    if (!hasPresentChanged) return;
    const prevAnimationName = prevAnimationNameState;
    const currAnimationName = getAnimationName(node);
    if (currPresent) {
      dispatch("MOUNT");
    } else if (currAnimationName === "none" || styles.display === "none") {
      dispatch("UNMOUNT");
    } else {
      const isAnimating = prevAnimationName !== currAnimationName;
      if (prevPresent && isAnimating) {
        dispatch("ANIMATION_OUT");
      } else {
        dispatch("UNMOUNT");
      }
    }
  });
  function handleAnimationEnd(event) {
    if (!node) node = document.getElementById(id.current);
    if (!node) return;
    const currAnimationName = getAnimationName(node);
    const isCurrentAnimation = currAnimationName.includes(event.animationName) || currAnimationName === "none";
    if (event.target === node && isCurrentAnimation) {
      dispatch("ANIMATION_END");
    }
  }
  function handleAnimationStart(event) {
    if (!node) node = document.getElementById(id.current);
    if (!node) return;
    if (event.target === node) {
      prevAnimationNameState = getAnimationName(node);
    }
  }
  watch(() => state.current, () => {
    if (!node) node = document.getElementById(id.current);
    if (!node) return;
    const currAnimationName = getAnimationName(node);
    prevAnimationNameState = state.current === "mounted" ? currAnimationName : "none";
  });
  watch(() => node, (node2) => {
    if (!node2) return;
    styles = getComputedStyle(node2);
    return executeCallbacks(on(node2, "animationstart", handleAnimationStart), on(node2, "animationcancel", handleAnimationEnd), on(node2, "animationend", handleAnimationEnd));
  });
  const isPresentDerived = ["mounted", "unmountSuspended"].includes(state.current);
  return {
    get current() {
      return isPresentDerived;
    }
  };
}
function getAnimationName(node) {
  return node ? getComputedStyle(node).animationName || "none" : "none";
}
function Presence_layer($$payload, $$props) {
  push();
  let { present, forceMount, presence, id } = $$props;
  const isPresent = usePresence(box.with(() => present), box.with(() => id));
  if (forceMount || present || isPresent.current) {
    $$payload.out += "<!--[-->";
    presence?.($$payload, { present: isPresent });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  pop();
}
function createAttrs(variant) {
  return {
    content: `data-${variant}-content`,
    trigger: `data-${variant}-trigger`,
    overlay: `data-${variant}-overlay`,
    title: `data-${variant}-title`,
    description: `data-${variant}-description`,
    close: `data-${variant}-close`,
    cancel: `data-${variant}-cancel`,
    action: `data-${variant}-action`
  };
}
class DialogRootState {
  opts;
  triggerNode = null;
  titleNode = null;
  contentNode = null;
  descriptionNode = null;
  contentId = void 0;
  titleId = void 0;
  triggerId = void 0;
  descriptionId = void 0;
  cancelNode = null;
  #attrs = once(() => createAttrs(this.opts.variant.current));
  get attrs() {
    return this.#attrs();
  }
  constructor(opts) {
    this.opts = opts;
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }
  handleOpen() {
    if (this.opts.open.current) return;
    this.opts.open.current = true;
  }
  handleClose() {
    if (!this.opts.open.current) return;
    this.opts.open.current = false;
  }
  #sharedProps = once(() => ({
    "data-state": getDataOpenClosed(this.opts.open.current)
  }));
  get sharedProps() {
    return this.#sharedProps();
  }
}
class DialogTriggerState {
  opts;
  root;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    useRefById({
      ...opts,
      onRefChange: (node) => {
        this.root.triggerNode = node;
        this.root.triggerId = node?.id;
      }
    });
    this.onclick = this.onclick.bind(this);
    this.onkeydown = this.onkeydown.bind(this);
  }
  onclick(e) {
    if (this.opts.disabled.current) return;
    if (e.button > 0) return;
    this.root.handleOpen();
  }
  onkeydown(e) {
    if (this.opts.disabled.current) return;
    if (e.key === SPACE || e.key === ENTER) {
      e.preventDefault();
      this.root.handleOpen();
    }
  }
  #props = once(() => ({
    id: this.opts.id.current,
    "aria-haspopup": "dialog",
    "aria-expanded": getAriaExpanded(this.root.opts.open.current),
    "aria-controls": this.root.contentId,
    [this.root.attrs.trigger]: "",
    onkeydown: this.onkeydown,
    onclick: this.onclick,
    disabled: this.opts.disabled.current ? true : void 0,
    ...this.root.sharedProps
  }));
  get props() {
    return this.#props();
  }
}
class DialogActionState {
  opts;
  root;
  #attr = once(() => this.root.attrs.action);
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    useRefById(opts);
  }
  #props = once(() => ({
    id: this.opts.id.current,
    [this.#attr()]: "",
    ...this.root.sharedProps
  }));
  get props() {
    return this.#props();
  }
}
class DialogTitleState {
  opts;
  root;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    useRefById({
      ...opts,
      onRefChange: (node) => {
        this.root.titleNode = node;
        this.root.titleId = node?.id;
      },
      deps: () => this.root.opts.open.current
    });
  }
  #props = once(() => ({
    id: this.opts.id.current,
    role: "heading",
    "aria-level": this.opts.level.current,
    [this.root.attrs.title]: "",
    ...this.root.sharedProps
  }));
  get props() {
    return this.#props();
  }
}
class DialogDescriptionState {
  opts;
  root;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    useRefById({
      ...opts,
      deps: () => this.root.opts.open.current,
      onRefChange: (node) => {
        this.root.descriptionNode = node;
        this.root.descriptionId = node?.id;
      }
    });
  }
  #props = once(() => ({
    id: this.opts.id.current,
    [this.root.attrs.description]: "",
    ...this.root.sharedProps
  }));
  get props() {
    return this.#props();
  }
}
class DialogContentState {
  opts;
  root;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    useRefById({
      ...opts,
      deps: () => this.root.opts.open.current,
      onRefChange: (node) => {
        this.root.contentNode = node;
        this.root.contentId = node?.id;
      }
    });
  }
  #snippetProps = once(() => ({ open: this.root.opts.open.current }));
  get snippetProps() {
    return this.#snippetProps();
  }
  #props = once(() => ({
    id: this.opts.id.current,
    role: this.root.opts.variant.current === "alert-dialog" ? "alertdialog" : "dialog",
    "aria-modal": "true",
    "aria-describedby": this.root.descriptionId,
    "aria-labelledby": this.root.titleId,
    [this.root.attrs.content]: "",
    style: {
      pointerEvents: "auto",
      outline: this.root.opts.variant.current === "alert-dialog" ? "none" : void 0
    },
    tabindex: this.root.opts.variant.current === "alert-dialog" ? -1 : void 0,
    ...this.root.sharedProps
  }));
  get props() {
    return this.#props();
  }
}
class DialogOverlayState {
  opts;
  root;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    useRefById({
      ...opts,
      deps: () => this.root.opts.open.current
    });
  }
  #snippetProps = once(() => ({ open: this.root.opts.open.current }));
  get snippetProps() {
    return this.#snippetProps();
  }
  #props = once(() => ({
    id: this.opts.id.current,
    [this.root.attrs.overlay]: "",
    style: { pointerEvents: "auto" },
    ...this.root.sharedProps
  }));
  get props() {
    return this.#props();
  }
}
class AlertDialogCancelState {
  opts;
  root;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.onclick = this.onclick.bind(this);
    this.onkeydown = this.onkeydown.bind(this);
    useRefById({
      ...opts,
      deps: () => this.root.opts.open.current,
      onRefChange: (node) => {
        this.root.cancelNode = node;
      }
    });
  }
  onclick(e) {
    if (this.opts.disabled.current) return;
    if (e.button > 0) return;
    this.root.handleClose();
  }
  onkeydown(e) {
    if (this.opts.disabled.current) return;
    if (e.key === SPACE || e.key === ENTER) {
      e.preventDefault();
      this.root.handleClose();
    }
  }
  #props = once(() => ({
    id: this.opts.id.current,
    [this.root.attrs.cancel]: "",
    onclick: this.onclick,
    onkeydown: this.onkeydown,
    tabindex: 0,
    ...this.root.sharedProps
  }));
  get props() {
    return this.#props();
  }
}
const DialogRootContext = new Context("Dialog.Root");
function useDialogRoot(props) {
  return DialogRootContext.set(new DialogRootState(props));
}
function useDialogTrigger(props) {
  return new DialogTriggerState(props, DialogRootContext.get());
}
function useDialogTitle(props) {
  return new DialogTitleState(props, DialogRootContext.get());
}
function useDialogContent(props) {
  return new DialogContentState(props, DialogRootContext.get());
}
function useDialogOverlay(props) {
  return new DialogOverlayState(props, DialogRootContext.get());
}
function useDialogDescription(props) {
  return new DialogDescriptionState(props, DialogRootContext.get());
}
function useAlertDialogCancel(props) {
  return new AlertDialogCancelState(props, DialogRootContext.get());
}
function useAlertDialogAction(props) {
  return new DialogActionState(props, DialogRootContext.get());
}
function Alert_dialog($$payload, $$props) {
  push();
  let { open = false, onOpenChange = noop, children } = $$props;
  useDialogRoot({
    variant: box.with(() => "alert-dialog"),
    open: box.with(() => open, (v) => {
      open = v;
      onOpenChange(v);
    })
  });
  children?.($$payload);
  $$payload.out += `<!---->`;
  bind_props($$props, { open });
  pop();
}
function Dialog_title($$payload, $$props) {
  push();
  let {
    id = useId(),
    ref = null,
    child,
    children,
    level = 2,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const titleState = useDialogTitle({
    id: box.with(() => id),
    level: box.with(() => level),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, titleState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Alert_dialog_action$1($$payload, $$props) {
  push();
  let {
    children,
    child,
    id = useId(),
    ref = null,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const actionState = useAlertDialogAction({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, actionState.props);
  const paraglide_sveltekit_translate_attribute_pass_translationFunctions = getTranslationFunctions();
  const [
    paraglide_sveltekit_translate_attribute_pass_translateAttribute,
    paraglide_sveltekit_translate_attribute_pass_handle_attributes
  ] = paraglide_sveltekit_translate_attribute_pass_translationFunctions;
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<button${spread_attributes(
      {
        ...paraglide_sveltekit_translate_attribute_pass_handle_attributes({ ...mergedProps }, [{ attribute_name: "formaction" }])
      },
      null
    )}>`;
    children?.($$payload);
    $$payload.out += `<!----></button>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Alert_dialog_cancel$1($$payload, $$props) {
  push();
  let {
    id = useId(),
    ref = null,
    children,
    child,
    disabled = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const cancelState = useAlertDialogCancel({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    disabled: box.with(() => Boolean(disabled))
  });
  const mergedProps = mergeProps(restProps, cancelState.props);
  const paraglide_sveltekit_translate_attribute_pass_translationFunctions = getTranslationFunctions();
  const [
    paraglide_sveltekit_translate_attribute_pass_translateAttribute,
    paraglide_sveltekit_translate_attribute_pass_handle_attributes
  ] = paraglide_sveltekit_translate_attribute_pass_translationFunctions;
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<button${spread_attributes(
      {
        ...paraglide_sveltekit_translate_attribute_pass_handle_attributes({ ...mergedProps }, [{ attribute_name: "formaction" }])
      },
      null
    )}>`;
    children?.($$payload);
    $$payload.out += `<!----></button>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Portal($$payload, $$props) {
  push();
  let { to = "body", children, disabled } = $$props;
  getAllContexts();
  let target = getTarget();
  function getTarget() {
    if (!isBrowser || disabled) return null;
    let localTarget = null;
    if (typeof to === "string") {
      localTarget = document.querySelector(to);
    } else if (to instanceof HTMLElement || to instanceof DocumentFragment) {
      localTarget = to;
    } else ;
    return localTarget;
  }
  let instance;
  function unmountInstance() {
    if (instance) {
      unmount();
      instance = null;
    }
  }
  watch([() => target, () => disabled], ([target2, disabled2]) => {
    if (!target2 || disabled2) {
      unmountInstance();
      return;
    }
    instance = mount();
    return () => {
      unmountInstance();
    };
  });
  if (disabled) {
    $$payload.out += "<!--[-->";
    children?.($$payload);
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  pop();
}
function debounce(fn, wait = 500) {
  let timeout = null;
  const debounced = (...args) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      fn(...args);
    }, wait);
  };
  debounced.destroy = () => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  return debounced;
}
function isOrContainsTarget(node, target) {
  return node === target || node.contains(target);
}
function getOwnerDocument(el) {
  return el?.ownerDocument ?? document;
}
function isClickTrulyOutside(event, contentNode) {
  const { clientX, clientY } = event;
  const rect = contentNode.getBoundingClientRect();
  return clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom;
}
globalThis.bitsDismissableLayers ??= /* @__PURE__ */ new Map();
class DismissibleLayerState {
  opts;
  #interactOutsideProp;
  #behaviorType;
  #interceptedEvents = { pointerdown: false };
  #isResponsibleLayer = false;
  #isFocusInsideDOMTree = false;
  node = box(null);
  #documentObj = void 0;
  #onFocusOutside;
  currNode = null;
  #unsubClickListener = noop;
  constructor(opts) {
    this.opts = opts;
    useRefById({
      id: opts.id,
      ref: this.node,
      deps: () => opts.enabled.current,
      onRefChange: (node) => {
        this.currNode = node;
      }
    });
    this.#behaviorType = opts.interactOutsideBehavior;
    this.#interactOutsideProp = opts.onInteractOutside;
    this.#onFocusOutside = opts.onFocusOutside;
    let unsubEvents = noop;
    const cleanup = () => {
      this.#resetState();
      globalThis.bitsDismissableLayers.delete(this);
      this.#handleInteractOutside.destroy();
      unsubEvents();
    };
    watch(
      [
        () => this.opts.enabled.current,
        () => this.currNode
      ],
      ([enabled, currNode]) => {
        if (!enabled || !currNode) return;
        afterSleep(1, () => {
          if (!this.currNode) return;
          globalThis.bitsDismissableLayers.set(this, this.#behaviorType);
          unsubEvents();
          unsubEvents = this.#addEventListeners();
        });
        return cleanup;
      }
    );
  }
  #handleFocus = (event) => {
    if (event.defaultPrevented) return;
    if (!this.currNode) return;
    afterTick(() => {
      if (!this.currNode || this.#isTargetWithinLayer(event.target)) return;
      if (event.target && !this.#isFocusInsideDOMTree) {
        this.#onFocusOutside.current?.(event);
      }
    });
  };
  #addEventListeners() {
    return executeCallbacks(
      /**
      * CAPTURE INTERACTION START
      * mark interaction-start event as intercepted.
      * mark responsible layer during interaction start
      * to avoid checking if is responsible layer during interaction end
      * when a new floating element may have been opened.
      */
      on(this.#documentObj, "pointerdown", executeCallbacks(this.#markInterceptedEvent, this.#markResponsibleLayer), { capture: true }),
      /**
      * BUBBLE INTERACTION START
      * Mark interaction-start event as non-intercepted. Debounce `onInteractOutsideStart`
      * to avoid prematurely checking if other events were intercepted.
      */
      on(this.#documentObj, "pointerdown", executeCallbacks(this.#markNonInterceptedEvent, this.#handleInteractOutside)),
      /**
      * HANDLE FOCUS OUTSIDE
      */
      on(this.#documentObj, "focusin", this.#handleFocus)
    );
  }
  #handleDismiss = (e) => {
    let event = e;
    if (event.defaultPrevented) {
      event = createWrappedEvent(e);
    }
    this.#interactOutsideProp.current(e);
  };
  #handleInteractOutside = debounce(
    (e) => {
      if (!this.currNode) {
        this.#unsubClickListener();
        return;
      }
      const isEventValid = this.opts.isValidEvent.current(e, this.currNode) || isValidEvent(e, this.currNode);
      if (!this.#isResponsibleLayer || this.#isAnyEventIntercepted() || !isEventValid) {
        this.#unsubClickListener();
        return;
      }
      let event = e;
      if (event.defaultPrevented) {
        event = createWrappedEvent(event);
      }
      if (this.#behaviorType.current !== "close" && this.#behaviorType.current !== "defer-otherwise-close") {
        this.#unsubClickListener();
        return;
      }
      if (e.pointerType === "touch") {
        this.#unsubClickListener();
        this.#unsubClickListener = addEventListener(this.#documentObj, "click", this.#handleDismiss, { once: true });
      } else {
        this.#interactOutsideProp.current(event);
      }
    },
    10
  );
  #markInterceptedEvent = (e) => {
    this.#interceptedEvents[e.type] = true;
  };
  #markNonInterceptedEvent = (e) => {
    this.#interceptedEvents[e.type] = false;
  };
  #markResponsibleLayer = () => {
    if (!this.node.current) return;
    this.#isResponsibleLayer = isResponsibleLayer(this.node.current);
  };
  #isTargetWithinLayer = (target) => {
    if (!this.node.current) return false;
    return isOrContainsTarget(this.node.current, target);
  };
  #resetState = debounce(
    () => {
      for (const eventType in this.#interceptedEvents) {
        this.#interceptedEvents[eventType] = false;
      }
      this.#isResponsibleLayer = false;
    },
    20
  );
  #isAnyEventIntercepted() {
    const i = Object.values(this.#interceptedEvents).some(Boolean);
    return i;
  }
  #onfocuscapture = () => {
    this.#isFocusInsideDOMTree = true;
  };
  #onblurcapture = () => {
    this.#isFocusInsideDOMTree = false;
  };
  props = {
    onfocuscapture: this.#onfocuscapture,
    onblurcapture: this.#onblurcapture
  };
}
function useDismissibleLayer(props) {
  return new DismissibleLayerState(props);
}
function getTopMostLayer(layersArr) {
  return layersArr.findLast(([_2, { current: behaviorType }]) => behaviorType === "close" || behaviorType === "ignore");
}
function isResponsibleLayer(node) {
  const layersArr = [...globalThis.bitsDismissableLayers];
  const topMostLayer = getTopMostLayer(layersArr);
  if (topMostLayer) return topMostLayer[0].node.current === node;
  const [firstLayerNode] = layersArr[0];
  return firstLayerNode.node.current === node;
}
function isValidEvent(e, node) {
  if ("button" in e && e.button > 0) return false;
  const target = e.target;
  if (!isElement(target)) return false;
  const ownerDocument = getOwnerDocument(target);
  const isValid = ownerDocument.documentElement.contains(target) && !isOrContainsTarget(node, target) && isClickTrulyOutside(e, node);
  return isValid;
}
function createWrappedEvent(e) {
  const capturedCurrentTarget = e.currentTarget;
  const capturedTarget = e.target;
  let newEvent;
  if (e instanceof PointerEvent) {
    newEvent = new PointerEvent(e.type, e);
  } else {
    newEvent = new PointerEvent("pointerdown", e);
  }
  let isPrevented = false;
  const wrappedEvent = new Proxy(newEvent, {
    get: (target, prop) => {
      if (prop === "currentTarget") {
        return capturedCurrentTarget;
      }
      if (prop === "target") {
        return capturedTarget;
      }
      if (prop === "preventDefault") {
        return () => {
          isPrevented = true;
          if (typeof target.preventDefault === "function") {
            target.preventDefault();
          }
        };
      }
      if (prop === "defaultPrevented") {
        return isPrevented;
      }
      if (prop in target) {
        return target[prop];
      }
      return e[prop];
    }
  });
  return wrappedEvent;
}
function Dismissible_layer($$payload, $$props) {
  push();
  let {
    interactOutsideBehavior = "close",
    onInteractOutside = noop,
    onFocusOutside = noop,
    id,
    children,
    enabled,
    isValidEvent: isValidEvent2 = () => false
  } = $$props;
  const dismissibleLayerState = useDismissibleLayer({
    id: box.with(() => id),
    interactOutsideBehavior: box.with(() => interactOutsideBehavior),
    onInteractOutside: box.with(() => onInteractOutside),
    enabled: box.with(() => enabled),
    onFocusOutside: box.with(() => onFocusOutside),
    isValidEvent: box.with(() => isValidEvent2)
  });
  children?.($$payload, { props: dismissibleLayerState.props });
  $$payload.out += `<!---->`;
  pop();
}
globalThis.bitsEscapeLayers ??= /* @__PURE__ */ new Map();
class EscapeLayerState {
  opts;
  constructor(opts) {
    this.opts = opts;
    let unsubEvents = noop;
    watch(() => opts.enabled.current, (enabled) => {
      if (enabled) {
        globalThis.bitsEscapeLayers.set(this, opts.escapeKeydownBehavior);
        unsubEvents = this.#addEventListener();
      }
      return () => {
        unsubEvents();
        globalThis.bitsEscapeLayers.delete(this);
      };
    });
  }
  #addEventListener = () => {
    return on(document, "keydown", this.#onkeydown, { passive: false });
  };
  #onkeydown = (e) => {
    if (e.key !== ESCAPE || !isResponsibleEscapeLayer(this)) return;
    const clonedEvent = new KeyboardEvent(e.type, e);
    e.preventDefault();
    const behaviorType = this.opts.escapeKeydownBehavior.current;
    if (behaviorType !== "close" && behaviorType !== "defer-otherwise-close") return;
    this.opts.onEscapeKeydown.current(clonedEvent);
  };
}
function useEscapeLayer(props) {
  return new EscapeLayerState(props);
}
function isResponsibleEscapeLayer(instance) {
  const layersArr = [...globalThis.bitsEscapeLayers];
  const topMostLayer = layersArr.findLast(([_2, { current: behaviorType }]) => behaviorType === "close" || behaviorType === "ignore");
  if (topMostLayer) return topMostLayer[0] === instance;
  const [firstLayerNode] = layersArr[0];
  return firstLayerNode === instance;
}
function Escape_layer($$payload, $$props) {
  push();
  let {
    escapeKeydownBehavior = "close",
    onEscapeKeydown = noop,
    children,
    enabled
  } = $$props;
  useEscapeLayer({
    escapeKeydownBehavior: box.with(() => escapeKeydownBehavior),
    onEscapeKeydown: box.with(() => onEscapeKeydown),
    enabled: box.with(() => enabled)
  });
  children?.($$payload);
  $$payload.out += `<!---->`;
  pop();
}
const focusStack = box([]);
function createFocusScopeStack() {
  return {
    add(focusScope) {
      const activeFocusScope = focusStack.current[0];
      if (activeFocusScope && focusScope.id !== activeFocusScope.id) {
        activeFocusScope.pause();
      }
      focusStack.current = removeFromFocusScopeArray(focusStack.current, focusScope);
      focusStack.current.unshift(focusScope);
    },
    remove(focusScope) {
      focusStack.current = removeFromFocusScopeArray(focusStack.current, focusScope);
      focusStack.current[0]?.resume();
    },
    get current() {
      return focusStack.current;
    }
  };
}
function createFocusScopeAPI() {
  let paused = false;
  let isHandlingFocus = false;
  return {
    id: useId(),
    get paused() {
      return paused;
    },
    get isHandlingFocus() {
      return isHandlingFocus;
    },
    set isHandlingFocus(value) {
      isHandlingFocus = value;
    },
    pause() {
      paused = true;
    },
    resume() {
      paused = false;
    }
  };
}
function removeFromFocusScopeArray(arr, item) {
  return [...arr].filter((i) => i.id !== item.id);
}
function removeLinks(items) {
  return items.filter((item) => item.tagName !== "A");
}
function focus(element2, { select = false } = {}) {
  if (!(element2 && element2.focus))
    return;
  if (document.activeElement === element2)
    return;
  const previouslyFocusedElement = document.activeElement;
  element2.focus({ preventScroll: true });
  if (element2 !== previouslyFocusedElement && isSelectableInput(element2) && select) {
    element2.select();
  }
}
function focusFirst(candidates, { select = false } = {}) {
  const previouslyFocusedElement = document.activeElement;
  for (const candidate of candidates) {
    focus(candidate, { select });
    if (document.activeElement !== previouslyFocusedElement) {
      return true;
    }
  }
}
function findVisible(elements, container) {
  for (const element2 of elements) {
    if (!isElementHidden(element2, container))
      return element2;
  }
}
function getTabbableCandidates(container) {
  const nodes = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    acceptNode: (node) => {
      const isHiddenInput = node.tagName === "INPUT" && node.type === "hidden";
      if (node.disabled || node.hidden || isHiddenInput)
        return NodeFilter.FILTER_SKIP;
      return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  while (walker.nextNode())
    nodes.push(walker.currentNode);
  return nodes;
}
function getTabbableEdges(container) {
  const candidates = getTabbableCandidates(container);
  const first = findVisible(candidates, container);
  const last = findVisible(candidates.reverse(), container);
  return [first, last];
}
const AutoFocusOnMountEvent = new CustomEventDispatcher("focusScope.autoFocusOnMount", { bubbles: false, cancelable: true });
const AutoFocusOnDestroyEvent = new CustomEventDispatcher("focusScope.autoFocusOnDestroy", { bubbles: false, cancelable: true });
const FocusScopeContext = new Context("FocusScope");
function useFocusScope({
  id,
  loop,
  enabled,
  onOpenAutoFocus,
  onCloseAutoFocus,
  forceMount
}) {
  const focusScopeStack = createFocusScopeStack();
  const focusScope = createFocusScopeAPI();
  const ref = box(null);
  const ctx = FocusScopeContext.getOr({ ignoreCloseAutoFocus: false });
  let lastFocusedElement = null;
  useRefById({ id, ref, deps: () => enabled.current });
  function manageFocus(event) {
    if (focusScope.paused || !ref.current || focusScope.isHandlingFocus) return;
    focusScope.isHandlingFocus = true;
    try {
      const target = event.target;
      if (!isHTMLElement(target)) return;
      const isWithinActiveScope = ref.current.contains(target);
      if (event.type === "focusin") {
        if (isWithinActiveScope) {
          lastFocusedElement = target;
        } else {
          if (ctx.ignoreCloseAutoFocus) return;
          focus(lastFocusedElement, { select: true });
        }
      } else if (event.type === "focusout") {
        if (!isWithinActiveScope && !ctx.ignoreCloseAutoFocus) {
          focus(lastFocusedElement, { select: true });
        }
      }
    } finally {
      focusScope.isHandlingFocus = false;
    }
  }
  function handleMutations(_2) {
    const lastFocusedElementExists = ref.current?.contains(lastFocusedElement);
    if (!lastFocusedElementExists && ref.current) {
      focus(ref.current);
    }
  }
  watch([() => ref.current, () => enabled.current], ([container, enabled2]) => {
    if (!container || !enabled2) return;
    const removeEvents = executeCallbacks(on(document, "focusin", manageFocus), on(document, "focusout", manageFocus));
    const mutationObserver = new MutationObserver(handleMutations);
    mutationObserver.observe(container, { childList: true, subtree: true });
    return () => {
      removeEvents();
      mutationObserver.disconnect();
    };
  });
  watch([() => forceMount.current, () => ref.current], ([forceMount2, container]) => {
    if (forceMount2) return;
    const prevFocusedElement = document.activeElement;
    handleOpen(container, prevFocusedElement);
    return () => {
      if (!container) return;
      handleClose(prevFocusedElement);
    };
  });
  watch(
    [
      () => forceMount.current,
      () => ref.current,
      () => enabled.current
    ],
    ([forceMount2, container]) => {
      if (!forceMount2) return;
      const prevFocusedElement = document.activeElement;
      handleOpen(container, prevFocusedElement);
      return () => {
        if (!container) return;
        handleClose(prevFocusedElement);
      };
    }
  );
  function handleOpen(container, prevFocusedElement) {
    if (!container) container = document.getElementById(id.current);
    if (!container || !enabled.current) return;
    focusScopeStack.add(focusScope);
    const hasFocusedCandidate = container.contains(prevFocusedElement);
    if (!hasFocusedCandidate) {
      const mountEvent = AutoFocusOnMountEvent.createEvent();
      onOpenAutoFocus.current(mountEvent);
      if (!mountEvent.defaultPrevented) {
        afterTick(() => {
          if (!container) return;
          focusFirst(removeLinks(getTabbableCandidates(container)), { select: true });
          if (document.activeElement === prevFocusedElement) {
            focus(container);
          }
        });
      }
    }
  }
  function handleClose(prevFocusedElement) {
    const destroyEvent = AutoFocusOnDestroyEvent.createEvent();
    onCloseAutoFocus.current(destroyEvent);
    const shouldIgnore = ctx.ignoreCloseAutoFocus;
    afterSleep(0, () => {
      if (!destroyEvent.defaultPrevented && prevFocusedElement && !shouldIgnore) {
        focus(isTabbable(prevFocusedElement) ? prevFocusedElement : document.body, { select: true });
      }
      focusScopeStack.remove(focusScope);
    });
  }
  function handleKeydown(e) {
    if (!enabled.current) return;
    if (!loop.current && !enabled.current) return;
    if (focusScope.paused) return;
    const isTabKey = e.key === TAB && !e.ctrlKey && !e.altKey && !e.metaKey;
    const focusedElement = document.activeElement;
    if (!(isTabKey && focusedElement)) return;
    const container = ref.current;
    if (!container) return;
    const [first, last] = getTabbableEdges(container);
    const hasTabbableElementsInside = first && last;
    if (!hasTabbableElementsInside) {
      if (focusedElement === container) {
        e.preventDefault();
      }
    } else {
      if (!e.shiftKey && focusedElement === last) {
        e.preventDefault();
        if (loop.current) focus(first, { select: true });
      } else if (e.shiftKey && focusedElement === first) {
        e.preventDefault();
        if (loop.current) focus(last, { select: true });
      }
    }
  }
  const props = (() => ({
    id: id.current,
    tabindex: -1,
    onkeydown: handleKeydown
  }))();
  return {
    get props() {
      return props;
    }
  };
}
function Focus_scope($$payload, $$props) {
  push();
  let {
    id,
    trapFocus = false,
    loop = false,
    onCloseAutoFocus = noop,
    onOpenAutoFocus = noop,
    focusScope,
    forceMount = false
  } = $$props;
  const focusScopeState = useFocusScope({
    enabled: box.with(() => trapFocus),
    loop: box.with(() => loop),
    onCloseAutoFocus: box.with(() => onCloseAutoFocus),
    onOpenAutoFocus: box.with(() => onOpenAutoFocus),
    id: box.with(() => id),
    forceMount: box.with(() => forceMount)
  });
  focusScope?.($$payload, { props: focusScopeState.props });
  $$payload.out += `<!---->`;
  pop();
}
globalThis.bitsTextSelectionLayers ??= /* @__PURE__ */ new Map();
class TextSelectionLayerState {
  opts;
  #unsubSelectionLock = noop;
  #ref = box(null);
  constructor(opts) {
    this.opts = opts;
    useRefById({
      id: opts.id,
      ref: this.#ref,
      deps: () => this.opts.enabled.current
    });
    let unsubEvents = noop;
    watch(() => this.opts.enabled.current, (isEnabled) => {
      if (isEnabled) {
        globalThis.bitsTextSelectionLayers.set(this, this.opts.enabled);
        unsubEvents();
        unsubEvents = this.#addEventListeners();
      }
      return () => {
        unsubEvents();
        this.#resetSelectionLock();
        globalThis.bitsTextSelectionLayers.delete(this);
      };
    });
  }
  #addEventListeners() {
    return executeCallbacks(on(document, "pointerdown", this.#pointerdown), on(document, "pointerup", composeHandlers(this.#resetSelectionLock, this.opts.onPointerUp.current)));
  }
  #pointerdown = (e) => {
    const node = this.#ref.current;
    const target = e.target;
    if (!isHTMLElement(node) || !isHTMLElement(target) || !this.opts.enabled.current) return;
    if (!isHighestLayer(this) || !isOrContainsTarget(node, target)) return;
    this.opts.onPointerDown.current(e);
    if (e.defaultPrevented) return;
    this.#unsubSelectionLock = preventTextSelectionOverflow(node);
  };
  #resetSelectionLock = () => {
    this.#unsubSelectionLock();
    this.#unsubSelectionLock = noop;
  };
}
function useTextSelectionLayer(props) {
  return new TextSelectionLayerState(props);
}
const getUserSelect = (node) => node.style.userSelect || node.style.webkitUserSelect;
function preventTextSelectionOverflow(node) {
  const body = document.body;
  const originalBodyUserSelect = getUserSelect(body);
  const originalNodeUserSelect = getUserSelect(node);
  setUserSelect(body, "none");
  setUserSelect(node, "text");
  return () => {
    setUserSelect(body, originalBodyUserSelect);
    setUserSelect(node, originalNodeUserSelect);
  };
}
function setUserSelect(node, value) {
  node.style.userSelect = value;
  node.style.webkitUserSelect = value;
}
function isHighestLayer(instance) {
  const layersArr = [...globalThis.bitsTextSelectionLayers];
  if (!layersArr.length) return false;
  const highestLayer = layersArr.at(-1);
  if (!highestLayer) return false;
  return highestLayer[0] === instance;
}
function Text_selection_layer($$payload, $$props) {
  push();
  let {
    preventOverflowTextSelection = true,
    onPointerDown = noop,
    onPointerUp = noop,
    id,
    children,
    enabled
  } = $$props;
  useTextSelectionLayer({
    id: box.with(() => id),
    preventOverflowTextSelection: box.with(() => preventOverflowTextSelection),
    onPointerDown: box.with(() => onPointerDown),
    onPointerUp: box.with(() => onPointerUp),
    enabled: box.with(() => enabled)
  });
  children?.($$payload);
  $$payload.out += `<!---->`;
  pop();
}
function createSharedHook(factory) {
  let state = void 0;
  return (...args) => {
    return state;
  };
}
const useBodyLockStackCount = createSharedHook();
function useBodyScrollLock(initialState, restoreScrollDelay = () => null) {
  useId();
  useBodyLockStackCount();
  return;
}
function Scroll_lock($$payload, $$props) {
  push();
  let {
    preventScroll = true,
    restoreScrollDelay = null
  } = $$props;
  useBodyScrollLock(preventScroll, () => restoreScrollDelay);
  pop();
}
function shouldTrapFocus({ forceMount, present, trapFocus, open }) {
  if (forceMount) {
    return open && trapFocus;
  }
  return present && trapFocus && open;
}
function Alert_dialog_content$1($$payload, $$props) {
  push();
  let {
    id = useId(),
    children,
    child,
    ref = null,
    forceMount = false,
    interactOutsideBehavior = "ignore",
    onCloseAutoFocus = noop,
    onEscapeKeydown = noop,
    onOpenAutoFocus = noop,
    onInteractOutside = noop,
    preventScroll = true,
    trapFocus = true,
    restoreScrollDelay = null,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const contentState = useDialogContent({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, contentState.props);
  {
    let presence = function($$payload2) {
      {
        let focusScope = function($$payload3, { props: focusScopeProps }) {
          Escape_layer($$payload3, spread_props([
            mergedProps,
            {
              enabled: contentState.root.opts.open.current,
              onEscapeKeydown: (e) => {
                onEscapeKeydown(e);
                if (e.defaultPrevented) return;
                contentState.root.handleClose();
              },
              children: ($$payload4) => {
                Dismissible_layer($$payload4, spread_props([
                  mergedProps,
                  {
                    enabled: contentState.root.opts.open.current,
                    interactOutsideBehavior,
                    onInteractOutside: (e) => {
                      onInteractOutside(e);
                      if (e.defaultPrevented) return;
                      contentState.root.handleClose();
                    },
                    children: ($$payload5) => {
                      Text_selection_layer($$payload5, spread_props([
                        mergedProps,
                        {
                          enabled: contentState.root.opts.open.current,
                          children: ($$payload6) => {
                            if (child) {
                              $$payload6.out += "<!--[-->";
                              if (contentState.root.opts.open.current) {
                                $$payload6.out += "<!--[-->";
                                Scroll_lock($$payload6, { preventScroll, restoreScrollDelay });
                              } else {
                                $$payload6.out += "<!--[!-->";
                              }
                              $$payload6.out += `<!--]--> `;
                              child($$payload6, {
                                props: mergeProps(mergedProps, focusScopeProps),
                                ...contentState.snippetProps
                              });
                              $$payload6.out += `<!---->`;
                            } else {
                              $$payload6.out += "<!--[!-->";
                              Scroll_lock($$payload6, { preventScroll });
                              $$payload6.out += `<!----> <div${spread_attributes(
                                {
                                  ...mergeProps(mergedProps, focusScopeProps)
                                },
                                null
                              )}>`;
                              children?.($$payload6);
                              $$payload6.out += `<!----></div>`;
                            }
                            $$payload6.out += `<!--]-->`;
                          },
                          $$slots: { default: true }
                        }
                      ]));
                    },
                    $$slots: { default: true }
                  }
                ]));
              },
              $$slots: { default: true }
            }
          ]));
        };
        Focus_scope($$payload2, spread_props([
          {
            loop: true,
            trapFocus: shouldTrapFocus({
              forceMount,
              present: contentState.root.opts.open.current,
              trapFocus,
              open: contentState.root.opts.open.current
            })
          },
          mergedProps,
          {
            onCloseAutoFocus: (e) => {
              onCloseAutoFocus(e);
              if (e.defaultPrevented) return;
              contentState.root.triggerNode?.focus();
            },
            onOpenAutoFocus: (e) => {
              onOpenAutoFocus(e);
              if (e.defaultPrevented) return;
              e.preventDefault();
              afterTick(() => {
                contentState.opts.ref.current?.focus();
              });
            },
            focusScope,
            $$slots: { focusScope: true }
          }
        ]));
      }
    };
    Presence_layer($$payload, spread_props([
      mergedProps,
      {
        forceMount,
        present: contentState.root.opts.open.current || forceMount,
        presence,
        $$slots: { presence: true }
      }
    ]));
  }
  bind_props($$props, { ref });
  pop();
}
function Dialog_overlay($$payload, $$props) {
  push();
  let {
    id = useId(),
    forceMount = false,
    child,
    children,
    ref = null,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const overlayState = useDialogOverlay({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, overlayState.props);
  {
    let presence = function($$payload2) {
      if (child) {
        $$payload2.out += "<!--[-->";
        child($$payload2, {
          props: mergeProps(mergedProps),
          ...overlayState.snippetProps
        });
        $$payload2.out += `<!---->`;
      } else {
        $$payload2.out += "<!--[!-->";
        $$payload2.out += `<div${spread_attributes({ ...mergeProps(mergedProps) }, null)}>`;
        children?.($$payload2, overlayState.snippetProps);
        $$payload2.out += `<!----></div>`;
      }
      $$payload2.out += `<!--]-->`;
    };
    Presence_layer($$payload, {
      id,
      present: overlayState.root.opts.open.current || forceMount,
      presence
    });
  }
  bind_props($$props, { ref });
  pop();
}
function Dialog_trigger($$payload, $$props) {
  push();
  let {
    id = useId(),
    ref = null,
    children,
    child,
    disabled = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const triggerState = useDialogTrigger({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    disabled: box.with(() => Boolean(disabled))
  });
  const mergedProps = mergeProps(restProps, triggerState.props);
  const paraglide_sveltekit_translate_attribute_pass_translationFunctions = getTranslationFunctions();
  const [
    paraglide_sveltekit_translate_attribute_pass_translateAttribute,
    paraglide_sveltekit_translate_attribute_pass_handle_attributes
  ] = paraglide_sveltekit_translate_attribute_pass_translationFunctions;
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<button${spread_attributes(
      {
        ...paraglide_sveltekit_translate_attribute_pass_handle_attributes({ ...mergedProps }, [{ attribute_name: "formaction" }])
      },
      null
    )}>`;
    children?.($$payload);
    $$payload.out += `<!----></button>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Dialog_description($$payload, $$props) {
  push();
  let {
    id = useId(),
    children,
    child,
    ref = null,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const descriptionState = useDialogDescription({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, descriptionState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function initAnnouncer() {
  if (!isBrowser)
    return null;
  let el = document.querySelector("[data-bits-announcer]");
  if (!isHTMLElement(el)) {
    const div = document.createElement("div");
    div.style.cssText = srOnlyStylesString;
    div.setAttribute("data-bits-announcer", "");
    div.appendChild(createLog("assertive"));
    div.appendChild(createLog("polite"));
    el = div;
    document.body.insertBefore(el, document.body.firstChild);
  }
  function createLog(kind) {
    const log = document.createElement("div");
    log.role = "log";
    log.ariaLive = kind;
    log.setAttribute("aria-relevant", "additions");
    return log;
  }
  function getLog(kind) {
    if (!isHTMLElement(el))
      return null;
    const log = el.querySelector(`[aria-live="${kind}"]`);
    if (!isHTMLElement(log))
      return null;
    return log;
  }
  return {
    getLog
  };
}
function getAnnouncer() {
  const announcer = initAnnouncer();
  function announce(value, kind = "assertive", timeout = 7500) {
    if (!announcer || !isBrowser)
      return;
    const log = announcer.getLog(kind);
    const content = document.createElement("div");
    if (typeof value === "number") {
      value = value.toString();
    } else if (value === null) {
      value = "Empty";
    } else {
      value = value.trim();
    }
    content.innerText = value;
    if (kind === "assertive") {
      log?.replaceChildren(content);
    } else {
      log?.appendChild(content);
    }
    return setTimeout(() => {
      content.remove();
    }, timeout);
  }
  return {
    announce
  };
}
const defaultDateDefaults = {
  defaultValue: void 0,
  granularity: "day"
};
function getDefaultDate(opts) {
  const withDefaults = { ...defaultDateDefaults, ...opts };
  const { defaultValue, granularity } = withDefaults;
  if (Array.isArray(defaultValue) && defaultValue.length) {
    return defaultValue[defaultValue.length - 1];
  }
  if (defaultValue && !Array.isArray(defaultValue)) {
    return defaultValue;
  } else {
    const date2 = /* @__PURE__ */ new Date();
    const year = date2.getFullYear();
    const month = date2.getMonth() + 1;
    const day = date2.getDate();
    const calendarDateTimeGranularities = ["hour", "minute", "second"];
    if (calendarDateTimeGranularities.includes(granularity ?? "day")) {
      return new CalendarDateTime(year, month, day, 0, 0, 0);
    }
    return new CalendarDate(year, month, day);
  }
}
function parseStringToDateValue(dateStr, referenceVal) {
  let dateValue;
  if (referenceVal instanceof ZonedDateTime) {
    dateValue = parseZonedDateTime(dateStr);
  } else if (referenceVal instanceof CalendarDateTime) {
    dateValue = parseDateTime(dateStr);
  } else {
    dateValue = parseDate(dateStr);
  }
  return dateValue.calendar !== referenceVal.calendar ? toCalendar(dateValue, referenceVal.calendar) : dateValue;
}
function toDate(dateValue, tz = getLocalTimeZone()) {
  if (dateValue instanceof ZonedDateTime) {
    return dateValue.toDate();
  } else {
    return dateValue.toDate(tz);
  }
}
function isCalendarDateTime(dateValue) {
  return dateValue instanceof CalendarDateTime;
}
function isZonedDateTime(dateValue) {
  return dateValue instanceof ZonedDateTime;
}
function hasTime(dateValue) {
  return isCalendarDateTime(dateValue) || isZonedDateTime(dateValue);
}
function getDaysInMonth(date2) {
  if (date2 instanceof Date) {
    const year = date2.getFullYear();
    const month = date2.getMonth() + 1;
    return new Date(year, month, 0).getDate();
  } else {
    return date2.set({ day: 100 }).day;
  }
}
function isBefore(dateToCompare, referenceDate) {
  return dateToCompare.compare(referenceDate) < 0;
}
function isAfter(dateToCompare, referenceDate) {
  return dateToCompare.compare(referenceDate) > 0;
}
function getLastFirstDayOfWeek(date2, firstDayOfWeek, locale) {
  const day = getDayOfWeek(date2, locale);
  if (firstDayOfWeek > day) {
    return date2.subtract({ days: day + 7 - firstDayOfWeek });
  }
  if (firstDayOfWeek === day) {
    return date2;
  }
  return date2.subtract({ days: day - firstDayOfWeek });
}
function getNextLastDayOfWeek(date2, firstDayOfWeek, locale) {
  const day = getDayOfWeek(date2, locale);
  const lastDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  if (day === lastDayOfWeek) {
    return date2;
  }
  if (day > lastDayOfWeek) {
    return date2.add({ days: 7 - day + lastDayOfWeek });
  }
  return date2.add({ days: lastDayOfWeek - day });
}
const defaultPartOptions = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric"
};
function createFormatter(initialLocale) {
  let locale = initialLocale;
  function setLocale(newLocale) {
    locale = newLocale;
  }
  function getLocale() {
    return locale;
  }
  function custom(date2, options) {
    return new DateFormatter(locale, options).format(date2);
  }
  function selectedDate(date2, includeTime = true) {
    if (hasTime(date2) && includeTime) {
      return custom(toDate(date2), {
        dateStyle: "long",
        timeStyle: "long"
      });
    } else {
      return custom(toDate(date2), {
        dateStyle: "long"
      });
    }
  }
  function fullMonthAndYear(date2) {
    return new DateFormatter(locale, { month: "long", year: "numeric" }).format(date2);
  }
  function fullMonth(date2) {
    return new DateFormatter(locale, { month: "long" }).format(date2);
  }
  function fullYear(date2) {
    return new DateFormatter(locale, { year: "numeric" }).format(date2);
  }
  function toParts(date2, options) {
    if (isZonedDateTime(date2)) {
      return new DateFormatter(locale, {
        ...options,
        timeZone: date2.timeZone
      }).formatToParts(toDate(date2));
    } else {
      return new DateFormatter(locale, options).formatToParts(toDate(date2));
    }
  }
  function dayOfWeek(date2, length = "narrow") {
    return new DateFormatter(locale, { weekday: length }).format(date2);
  }
  function dayPeriod(date2, hourCycle = void 0) {
    const parts = new DateFormatter(locale, {
      hour: "numeric",
      minute: "numeric",
      hourCycle: hourCycle === 24 ? "h23" : void 0
    }).formatToParts(date2);
    const value = parts.find((p) => p.type === "dayPeriod")?.value;
    if (value === "PM") {
      return "PM";
    }
    return "AM";
  }
  function part(dateObj, type, options = {}) {
    const opts = { ...defaultPartOptions, ...options };
    const parts = toParts(dateObj, opts);
    const part2 = parts.find((p) => p.type === type);
    return part2 ? part2.value : "";
  }
  return {
    setLocale,
    getLocale,
    fullMonth,
    fullYear,
    fullMonthAndYear,
    toParts,
    custom,
    part,
    dayPeriod,
    selectedDate,
    dayOfWeek
  };
}
function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}
function isValidIndex(index, arr) {
  return index >= 0 && index < arr.length;
}
function next(array, index, loop = true) {
  if (array.length === 0 || index < 0 || index >= array.length) {
    return void 0;
  }
  if (array.length === 1 && index === 0) {
    return array[0];
  }
  if (index === array.length - 1) {
    return loop ? array[0] : void 0;
  }
  return array[index + 1];
}
function prev(array, index, loop = true) {
  if (array.length === 0 || index < 0 || index >= array.length) {
    return void 0;
  }
  if (array.length === 1 && index === 0) {
    return array[0];
  }
  if (index === 0) {
    return loop ? array[array.length - 1] : void 0;
  }
  return array[index - 1];
}
function forward(array, index, increment, loop = true) {
  if (array.length === 0 || index < 0 || index >= array.length) {
    return void 0;
  }
  let targetIndex = index + increment;
  if (loop) {
    targetIndex = (targetIndex % array.length + array.length) % array.length;
  } else {
    targetIndex = Math.max(0, Math.min(targetIndex, array.length - 1));
  }
  return array[targetIndex];
}
function backward(array, index, decrement, loop = true) {
  if (array.length === 0 || index < 0 || index >= array.length) {
    return void 0;
  }
  let targetIndex = index - decrement;
  if (loop) {
    targetIndex = (targetIndex % array.length + array.length) % array.length;
  } else {
    targetIndex = Math.max(0, Math.min(targetIndex, array.length - 1));
  }
  return array[targetIndex];
}
function getNextMatch(values, search, currentMatch) {
  const isRepeated = search.length > 1 && Array.from(search).every((char) => char === search[0]);
  const normalizedSearch = isRepeated ? search[0] : search;
  const currentMatchIndex = currentMatch ? values.indexOf(currentMatch) : -1;
  let wrappedValues = wrapArray(values, Math.max(currentMatchIndex, 0));
  const excludeCurrentMatch = normalizedSearch.length === 1;
  if (excludeCurrentMatch)
    wrappedValues = wrappedValues.filter((v) => v !== currentMatch);
  const nextMatch = wrappedValues.find((value) => value?.toLowerCase().startsWith(normalizedSearch.toLowerCase()));
  return nextMatch !== currentMatch ? nextMatch : void 0;
}
function wrapArray(array, startIndex) {
  return array.map((_2, index) => array[(startIndex + index) % array.length]);
}
function isCalendarDayNode(node) {
  if (!isHTMLElement(node)) return false;
  if (!node.hasAttribute("data-bits-day")) return false;
  return true;
}
function getDaysBetween(start, end) {
  const days = [];
  let dCurrent = start.add({ days: 1 });
  const dEnd = end;
  while (dCurrent.compare(dEnd) < 0) {
    days.push(dCurrent);
    dCurrent = dCurrent.add({ days: 1 });
  }
  return days;
}
function createMonth(props) {
  const { dateObj, weekStartsOn, fixedWeeks, locale } = props;
  const daysInMonth = getDaysInMonth(dateObj);
  const datesArray = Array.from({ length: daysInMonth }, (_2, i) => dateObj.set({ day: i + 1 }));
  const firstDayOfMonth = startOfMonth(dateObj);
  const lastDayOfMonth = endOfMonth(dateObj);
  const lastSunday = getLastFirstDayOfWeek(firstDayOfMonth, weekStartsOn, locale);
  const nextSaturday = getNextLastDayOfWeek(lastDayOfMonth, weekStartsOn, locale);
  const lastMonthDays = getDaysBetween(lastSunday.subtract({ days: 1 }), firstDayOfMonth);
  const nextMonthDays = getDaysBetween(lastDayOfMonth, nextSaturday.add({ days: 1 }));
  const totalDays = lastMonthDays.length + datesArray.length + nextMonthDays.length;
  if (fixedWeeks && totalDays < 42) {
    const extraDays = 42 - totalDays;
    let startFrom = nextMonthDays[nextMonthDays.length - 1];
    if (!startFrom) {
      startFrom = dateObj.add({ months: 1 }).set({ day: 1 });
    }
    let length = extraDays;
    if (nextMonthDays.length === 0) {
      length = extraDays - 1;
      nextMonthDays.push(startFrom);
    }
    const extraDaysArray = Array.from({ length }, (_2, i) => {
      const incr = i + 1;
      return startFrom.add({ days: incr });
    });
    nextMonthDays.push(...extraDaysArray);
  }
  const allDays = lastMonthDays.concat(datesArray, nextMonthDays);
  const weeks = chunk(allDays, 7);
  return { value: dateObj, dates: allDays, weeks };
}
function createMonths(props) {
  const { numberOfMonths, dateObj, ...monthProps } = props;
  const months = [];
  if (!numberOfMonths || numberOfMonths === 1) {
    months.push(createMonth({ ...monthProps, dateObj }));
    return months;
  }
  months.push(createMonth({ ...monthProps, dateObj }));
  for (let i = 1; i < numberOfMonths; i++) {
    const nextMonth = dateObj.add({ months: i });
    months.push(createMonth({ ...monthProps, dateObj: nextMonth }));
  }
  return months;
}
function getSelectableCells(calendarNode) {
  if (!calendarNode) return [];
  const selectableSelector = `[data-bits-day]:not([data-disabled]):not([data-outside-visible-months])`;
  return Array.from(calendarNode.querySelectorAll(selectableSelector)).filter((el) => isHTMLElement(el));
}
function setPlaceholderToNodeValue(node, placeholder) {
  const cellValue = node.getAttribute("data-value");
  if (!cellValue) return;
  placeholder.current = parseStringToDateValue(cellValue, placeholder.current);
}
function shiftCalendarFocus({
  node,
  add,
  placeholder,
  calendarNode,
  isPrevButtonDisabled,
  isNextButtonDisabled,
  months,
  numberOfMonths
}) {
  const candidateCells = getSelectableCells(calendarNode);
  if (!candidateCells.length) return;
  const index = candidateCells.indexOf(node);
  const nextIndex = index + add;
  if (isValidIndex(nextIndex, candidateCells)) {
    const nextCell = candidateCells[nextIndex];
    setPlaceholderToNodeValue(nextCell, placeholder);
    return nextCell.focus();
  }
  if (nextIndex < 0) {
    if (isPrevButtonDisabled) return;
    const firstMonth = months[0]?.value;
    if (!firstMonth) return;
    placeholder.current = firstMonth.subtract({ months: numberOfMonths });
    afterTick(() => {
      const newCandidateCells = getSelectableCells(calendarNode);
      if (!newCandidateCells.length) return;
      const newIndex = newCandidateCells.length - Math.abs(nextIndex);
      if (isValidIndex(newIndex, newCandidateCells)) {
        const newCell = newCandidateCells[newIndex];
        setPlaceholderToNodeValue(newCell, placeholder);
        return newCell.focus();
      }
    });
  }
  if (nextIndex >= candidateCells.length) {
    if (isNextButtonDisabled) return;
    const firstMonth = months[0]?.value;
    if (!firstMonth) return;
    placeholder.current = firstMonth.add({ months: numberOfMonths });
    afterTick(() => {
      const newCandidateCells = getSelectableCells(calendarNode);
      if (!newCandidateCells.length) return;
      const newIndex = nextIndex - candidateCells.length;
      if (isValidIndex(newIndex, newCandidateCells)) {
        const nextCell = newCandidateCells[newIndex];
        return nextCell.focus();
      }
    });
  }
}
const ARROW_KEYS = [
  ARROW_DOWN,
  ARROW_UP,
  ARROW_LEFT,
  ARROW_RIGHT
];
const SELECT_KEYS = [ENTER, SPACE];
function handleCalendarKeydown({
  event,
  handleCellClick,
  shiftFocus,
  placeholderValue
}) {
  const currentCell = event.target;
  if (!isCalendarDayNode(currentCell)) return;
  if (!ARROW_KEYS.includes(event.key) && !SELECT_KEYS.includes(event.key)) return;
  event.preventDefault();
  const kbdFocusMap = {
    [ARROW_DOWN]: 7,
    [ARROW_UP]: -7,
    [ARROW_LEFT]: -1,
    [ARROW_RIGHT]: 1
  };
  if (ARROW_KEYS.includes(event.key)) {
    const add = kbdFocusMap[event.key];
    if (add !== void 0) {
      shiftFocus(currentCell, add);
    }
  }
  if (SELECT_KEYS.includes(event.key)) {
    const cellValue = currentCell.getAttribute("data-value");
    if (!cellValue) return;
    handleCellClick(event, parseStringToDateValue(cellValue, placeholderValue));
  }
}
function handleCalendarNextPage({
  months,
  setMonths,
  numberOfMonths,
  pagedNavigation,
  weekStartsOn,
  locale,
  fixedWeeks,
  setPlaceholder
}) {
  const firstMonth = months[0]?.value;
  if (!firstMonth) return;
  if (pagedNavigation) {
    setPlaceholder(firstMonth.add({ months: numberOfMonths }));
  } else {
    const newMonths = createMonths({
      dateObj: firstMonth.add({ months: 1 }),
      weekStartsOn,
      locale,
      fixedWeeks,
      numberOfMonths
    });
    setMonths(newMonths);
    const firstNewMonth = newMonths[0];
    if (!firstNewMonth) return;
    setPlaceholder(firstNewMonth.value.set({ day: 1 }));
  }
}
function handleCalendarPrevPage({
  months,
  setMonths,
  numberOfMonths,
  pagedNavigation,
  weekStartsOn,
  locale,
  fixedWeeks,
  setPlaceholder
}) {
  const firstMonth = months[0]?.value;
  if (!firstMonth) return;
  if (pagedNavigation) {
    setPlaceholder(firstMonth.subtract({ months: numberOfMonths }));
  } else {
    const newMonths = createMonths({
      dateObj: firstMonth.subtract({ months: 1 }),
      weekStartsOn,
      locale,
      fixedWeeks,
      numberOfMonths
    });
    setMonths(newMonths);
    const firstNewMonth = newMonths[0];
    if (!firstNewMonth) return;
    setPlaceholder(firstNewMonth.value.set({ day: 1 }));
  }
}
function getWeekdays({ months, formatter: formatter2, weekdayFormat }) {
  if (!months.length) return [];
  const firstMonth = months[0];
  const firstWeek = firstMonth.weeks[0];
  if (!firstWeek) return [];
  return firstWeek.map((date2) => formatter2.dayOfWeek(toDate(date2), weekdayFormat));
}
function useMonthViewOptionsSync(props) {
  const weekStartsOn = props.weekStartsOn.current;
  const locale = props.locale.current;
  const fixedWeeks = props.fixedWeeks.current;
  const numberOfMonths = props.numberOfMonths.current;
  run(() => {
    const placeholder = props.placeholder.current;
    if (!placeholder) return;
    const defaultMonthProps = {
      weekStartsOn,
      locale,
      fixedWeeks,
      numberOfMonths
    };
    props.setMonths(createMonths({ ...defaultMonthProps, dateObj: placeholder }));
  });
}
function useMonthViewPlaceholderSync({
  placeholder,
  getVisibleMonths,
  weekStartsOn,
  locale,
  fixedWeeks,
  numberOfMonths,
  setMonths
}) {
}
function getIsNextButtonDisabled({ maxValue, months, disabled }) {
  if (!maxValue || !months.length) return false;
  if (disabled) return true;
  const lastMonthInView = months[months.length - 1]?.value;
  if (!lastMonthInView) return false;
  const firstMonthOfNextPage = lastMonthInView.add({ months: 1 }).set({ day: 1 });
  return isAfter(firstMonthOfNextPage, maxValue);
}
function getIsPrevButtonDisabled({ minValue, months, disabled }) {
  if (!minValue || !months.length) return false;
  if (disabled) return true;
  const firstMonthInView = months[0]?.value;
  if (!firstMonthInView) return false;
  const lastMonthOfPrevPage = firstMonthInView.subtract({ months: 1 }).set({ day: 35 });
  return isBefore(lastMonthOfPrevPage, minValue);
}
function getCalendarHeadingValue({ months, locale, formatter: formatter2 }) {
  if (!months.length) return "";
  if (locale !== formatter2.getLocale()) {
    formatter2.setLocale(locale);
  }
  if (months.length === 1) {
    const month = toDate(months[0].value);
    return `${formatter2.fullMonthAndYear(month)}`;
  }
  const startMonth = toDate(months[0].value);
  const endMonth = toDate(months[months.length - 1].value);
  const startMonthName = formatter2.fullMonth(startMonth);
  const endMonthName = formatter2.fullMonth(endMonth);
  const startMonthYear = formatter2.fullYear(startMonth);
  const endMonthYear = formatter2.fullYear(endMonth);
  const content = startMonthYear === endMonthYear ? `${startMonthName} - ${endMonthName} ${endMonthYear}` : `${startMonthName} ${startMonthYear} - ${endMonthName} ${endMonthYear}`;
  return content;
}
function getCalendarElementProps({
  fullCalendarLabel,
  id,
  isInvalid,
  disabled,
  readonly
}) {
  return {
    id,
    role: "application",
    "aria-label": fullCalendarLabel,
    "data-invalid": getDataInvalid(isInvalid),
    "data-disabled": getDataDisabled(disabled),
    "data-readonly": getDataReadonly(readonly)
  };
}
function getFirstNonDisabledDateInView(calendarRef) {
  if (!isBrowser) return;
  const daysInView = Array.from(calendarRef.querySelectorAll("[data-bits-day]:not([aria-disabled=true])"));
  if (daysInView.length === 0) return;
  const value = daysInView[0]?.getAttribute("data-value");
  if (!value) return;
  return parseDate(value);
}
function useEnsureNonDisabledPlaceholder({
  ref,
  placeholder,
  defaultPlaceholder,
  minValue,
  maxValue,
  isDateDisabled
}) {
  function isDisabled(date2) {
    if (isDateDisabled.current(date2)) return true;
    if (minValue.current && isBefore(date2, minValue.current)) return true;
    if (maxValue.current && isBefore(maxValue.current, date2)) return true;
    return false;
  }
  watch(() => ref.current, () => {
    if (!ref.current) return;
    if (placeholder.current && isSameDay(placeholder.current, defaultPlaceholder) && isDisabled(defaultPlaceholder)) {
      placeholder.current = getFirstNonDisabledDateInView(ref.current) ?? defaultPlaceholder;
    }
  });
}
class CalendarRootState {
  opts;
  months = [];
  #visibleMonths = once(() => this.months.map((month) => month.value));
  get visibleMonths() {
    return this.#visibleMonths();
  }
  announcer;
  formatter;
  accessibleHeadingId = useId();
  constructor(opts) {
    this.opts = opts;
    this.announcer = getAnnouncer();
    this.formatter = createFormatter(this.opts.locale.current);
    this.setMonths = this.setMonths.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.prevPage = this.prevPage.bind(this);
    this.prevYear = this.prevYear.bind(this);
    this.nextYear = this.nextYear.bind(this);
    this.setYear = this.setYear.bind(this);
    this.setMonth = this.setMonth.bind(this);
    this.isOutsideVisibleMonths = this.isOutsideVisibleMonths.bind(this);
    this.isDateDisabled = this.isDateDisabled.bind(this);
    this.isDateSelected = this.isDateSelected.bind(this);
    this.shiftFocus = this.shiftFocus.bind(this);
    this.handleCellClick = this.handleCellClick.bind(this);
    this.handleMultipleUpdate = this.handleMultipleUpdate.bind(this);
    this.handleSingleUpdate = this.handleSingleUpdate.bind(this);
    this.onkeydown = this.onkeydown.bind(this);
    this.getBitsAttr = this.getBitsAttr.bind(this);
    useRefById(opts);
    this.months = createMonths({
      dateObj: this.opts.placeholder.current,
      weekStartsOn: this.opts.weekStartsOn.current,
      locale: this.opts.locale.current,
      fixedWeeks: this.opts.fixedWeeks.current,
      numberOfMonths: this.opts.numberOfMonths.current
    });
    useMonthViewPlaceholderSync({
      placeholder: this.opts.placeholder,
      getVisibleMonths: () => this.visibleMonths,
      weekStartsOn: this.opts.weekStartsOn,
      locale: this.opts.locale,
      fixedWeeks: this.opts.fixedWeeks,
      numberOfMonths: this.opts.numberOfMonths,
      setMonths: (months) => this.months = months
    });
    useMonthViewOptionsSync({
      fixedWeeks: this.opts.fixedWeeks,
      locale: this.opts.locale,
      numberOfMonths: this.opts.numberOfMonths,
      placeholder: this.opts.placeholder,
      setMonths: this.setMonths,
      weekStartsOn: this.opts.weekStartsOn
    });
    watch(() => this.opts.value.current, () => {
      const value = this.opts.value.current;
      if (Array.isArray(value) && value.length) {
        const lastValue = value[value.length - 1];
        if (lastValue && this.opts.placeholder.current !== lastValue) {
          this.opts.placeholder.current = lastValue;
        }
      } else if (!Array.isArray(value) && value && this.opts.placeholder.current !== value) {
        this.opts.placeholder.current = value;
      }
    });
    useEnsureNonDisabledPlaceholder({
      placeholder: opts.placeholder,
      defaultPlaceholder: opts.defaultPlaceholder,
      isDateDisabled: opts.isDateDisabled,
      maxValue: opts.maxValue,
      minValue: opts.minValue,
      ref: opts.ref
    });
  }
  setMonths(months) {
    this.months = months;
  }
  #weekdays = once(() => {
    return getWeekdays({
      months: this.months,
      formatter: this.formatter,
      weekdayFormat: this.opts.weekdayFormat.current
    });
  });
  get weekdays() {
    return this.#weekdays();
  }
  /**
   * Navigates to the next page of the calendar.
   */
  nextPage() {
    handleCalendarNextPage({
      fixedWeeks: this.opts.fixedWeeks.current,
      locale: this.opts.locale.current,
      numberOfMonths: this.opts.numberOfMonths.current,
      pagedNavigation: this.opts.pagedNavigation.current,
      setMonths: this.setMonths,
      setPlaceholder: (date2) => this.opts.placeholder.current = date2,
      weekStartsOn: this.opts.weekStartsOn.current,
      months: this.months
    });
  }
  /**
   * Navigates to the previous page of the calendar.
   */
  prevPage() {
    handleCalendarPrevPage({
      fixedWeeks: this.opts.fixedWeeks.current,
      locale: this.opts.locale.current,
      numberOfMonths: this.opts.numberOfMonths.current,
      pagedNavigation: this.opts.pagedNavigation.current,
      setMonths: this.setMonths,
      setPlaceholder: (date2) => this.opts.placeholder.current = date2,
      weekStartsOn: this.opts.weekStartsOn.current,
      months: this.months
    });
  }
  nextYear() {
    this.opts.placeholder.current = this.opts.placeholder.current.add({ years: 1 });
  }
  prevYear() {
    this.opts.placeholder.current = this.opts.placeholder.current.subtract({ years: 1 });
  }
  setYear(year) {
    this.opts.placeholder.current = this.opts.placeholder.current.set({ year });
  }
  setMonth(month) {
    this.opts.placeholder.current = this.opts.placeholder.current.set({ month });
  }
  #isNextButtonDisabled = once(() => {
    return getIsNextButtonDisabled({
      maxValue: this.opts.maxValue.current,
      months: this.months,
      disabled: this.opts.disabled.current
    });
  });
  get isNextButtonDisabled() {
    return this.#isNextButtonDisabled();
  }
  #isPrevButtonDisabled = once(() => {
    return getIsPrevButtonDisabled({
      minValue: this.opts.minValue.current,
      months: this.months,
      disabled: this.opts.disabled.current
    });
  });
  get isPrevButtonDisabled() {
    return this.#isPrevButtonDisabled();
  }
  #isInvalid = once(() => {
    const value = this.opts.value.current;
    const isDateDisabled = this.opts.isDateDisabled.current;
    const isDateUnavailable = this.opts.isDateUnavailable.current;
    if (Array.isArray(value)) {
      if (!value.length) return false;
      for (const date2 of value) {
        if (isDateDisabled(date2)) return true;
        if (isDateUnavailable(date2)) return true;
      }
    } else {
      if (!value) return false;
      if (isDateDisabled(value)) return true;
      if (isDateUnavailable(value)) return true;
    }
    return false;
  });
  get isInvalid() {
    return this.#isInvalid();
  }
  #headingValue = once(() => {
    return getCalendarHeadingValue({
      months: this.months,
      formatter: this.formatter,
      locale: this.opts.locale.current
    });
  });
  get headingValue() {
    return this.#headingValue();
  }
  #fullCalendarLabel = once(() => {
    return `${this.opts.calendarLabel.current} ${this.headingValue}`;
  });
  get fullCalendarLabel() {
    return this.#fullCalendarLabel();
  }
  isOutsideVisibleMonths(date2) {
    return !this.visibleMonths.some((month) => isSameMonth(date2, month));
  }
  isDateDisabled(date2) {
    if (this.opts.isDateDisabled.current(date2) || this.opts.disabled.current) return true;
    const minValue = this.opts.minValue.current;
    const maxValue = this.opts.maxValue.current;
    if (minValue && isBefore(date2, minValue)) return true;
    if (maxValue && isBefore(maxValue, date2)) return true;
    return false;
  }
  isDateSelected(date2) {
    const value = this.opts.value.current;
    if (Array.isArray(value)) {
      return value.some((d) => isSameDay(d, date2));
    } else if (!value) {
      return false;
    } else {
      return isSameDay(value, date2);
    }
  }
  shiftFocus(node, add) {
    return shiftCalendarFocus({
      node,
      add,
      placeholder: this.opts.placeholder,
      calendarNode: this.opts.ref.current,
      isPrevButtonDisabled: this.isPrevButtonDisabled,
      isNextButtonDisabled: this.isNextButtonDisabled,
      months: this.months,
      numberOfMonths: this.opts.numberOfMonths.current
    });
  }
  handleCellClick(_2, date2) {
    const readonly = this.opts.readonly.current;
    if (readonly) return;
    const isDateDisabled = this.opts.isDateDisabled.current;
    const isDateUnavailable = this.opts.isDateUnavailable.current;
    if (isDateDisabled?.(date2) || isDateUnavailable?.(date2)) return;
    const prev2 = this.opts.value.current;
    const multiple = this.opts.type.current === "multiple";
    if (multiple) {
      if (Array.isArray(prev2) || prev2 === void 0) {
        this.opts.value.current = this.handleMultipleUpdate(prev2, date2);
      }
    } else {
      if (!Array.isArray(prev2)) {
        const next2 = this.handleSingleUpdate(prev2, date2);
        if (!next2) {
          this.announcer.announce("Selected date is now empty.", "polite", 5e3);
        } else {
          this.announcer.announce(`Selected Date: ${this.formatter.selectedDate(next2, false)}`, "polite");
        }
        this.opts.value.current = next2;
        if (next2 !== void 0) {
          this.opts.onDateSelect?.current?.();
        }
      }
    }
  }
  handleMultipleUpdate(prev2, date2) {
    if (!prev2) return [date2];
    if (!Array.isArray(prev2)) {
      return;
    }
    const index = prev2.findIndex((d) => isSameDay(d, date2));
    const preventDeselect = this.opts.preventDeselect.current;
    if (index === -1) {
      return [...prev2, date2];
    } else if (preventDeselect) {
      return prev2;
    } else {
      const next2 = prev2.filter((d) => !isSameDay(d, date2));
      if (!next2.length) {
        this.opts.placeholder.current = date2;
        return void 0;
      }
      return next2;
    }
  }
  handleSingleUpdate(prev2, date2) {
    if (!prev2) return date2;
    const preventDeselect = this.opts.preventDeselect.current;
    if (!preventDeselect && isSameDay(prev2, date2)) {
      this.opts.placeholder.current = date2;
      return void 0;
    }
    return date2;
  }
  onkeydown(event) {
    handleCalendarKeydown({
      event,
      handleCellClick: this.handleCellClick,
      shiftFocus: this.shiftFocus,
      placeholderValue: this.opts.placeholder.current
    });
  }
  #snippetProps = once(() => ({ months: this.months, weekdays: this.weekdays }));
  get snippetProps() {
    return this.#snippetProps();
  }
  getBitsAttr(part) {
    return `data-bits-calendar-${part}`;
  }
  #props = once(() => ({
    ...getCalendarElementProps({
      fullCalendarLabel: this.fullCalendarLabel,
      id: this.opts.id.current,
      isInvalid: this.isInvalid,
      disabled: this.opts.disabled.current,
      readonly: this.opts.readonly.current
    }),
    [this.getBitsAttr("root")]: "",
    //
    onkeydown: this.onkeydown
  }));
  get props() {
    return this.#props();
  }
}
class CalendarHeadingState {
  opts;
  root;
  #headingValue = once(() => this.root.headingValue);
  get headingValue() {
    return this.#headingValue();
  }
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    useRefById(opts);
  }
  #props = once(() => ({
    id: this.opts.id.current,
    "aria-hidden": getAriaHidden(true),
    "data-disabled": getDataDisabled(this.root.opts.disabled.current),
    "data-readonly": getDataReadonly(this.root.opts.readonly.current),
    [this.root.getBitsAttr("heading")]: ""
  }));
  get props() {
    return this.#props();
  }
}
class CalendarCellState {
  opts;
  root;
  #cellDate = once(() => toDate(this.opts.date.current));
  get cellDate() {
    return this.#cellDate();
  }
  #isDisabled = once(() => this.root.isDateDisabled(this.opts.date.current));
  get isDisabled() {
    return this.#isDisabled();
  }
  #isUnavailable = once(() => this.root.opts.isDateUnavailable.current(this.opts.date.current));
  get isUnavailable() {
    return this.#isUnavailable();
  }
  #isDateToday = once(() => isToday(this.opts.date.current, getLocalTimeZone()));
  get isDateToday() {
    return this.#isDateToday();
  }
  #isOutsideMonth = once(() => !isSameMonth(this.opts.date.current, this.opts.month.current));
  get isOutsideMonth() {
    return this.#isOutsideMonth();
  }
  #isOutsideVisibleMonths = once(() => this.root.isOutsideVisibleMonths(this.opts.date.current));
  get isOutsideVisibleMonths() {
    return this.#isOutsideVisibleMonths();
  }
  #isFocusedDate = once(() => isSameDay(this.opts.date.current, this.root.opts.placeholder.current));
  get isFocusedDate() {
    return this.#isFocusedDate();
  }
  #isSelectedDate = once(() => this.root.isDateSelected(this.opts.date.current));
  get isSelectedDate() {
    return this.#isSelectedDate();
  }
  #labelText = once(() => this.root.formatter.custom(this.cellDate, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }));
  get labelText() {
    return this.#labelText();
  }
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    useRefById(opts);
  }
  #snippetProps = once(() => ({
    disabled: this.isDisabled,
    unavailable: this.isUnavailable,
    selected: this.isSelectedDate
  }));
  get snippetProps() {
    return this.#snippetProps();
  }
  #ariaDisabled = once(() => {
    return this.isDisabled || this.isOutsideMonth && this.root.opts.disableDaysOutsideMonth.current || this.isUnavailable;
  });
  get ariaDisabled() {
    return this.#ariaDisabled();
  }
  #sharedDataAttrs = once(() => ({
    "data-unavailable": getDataUnavailable(this.isUnavailable),
    "data-today": this.isDateToday ? "" : void 0,
    "data-outside-month": this.isOutsideMonth ? "" : void 0,
    "data-outside-visible-months": this.isOutsideVisibleMonths ? "" : void 0,
    "data-focused": this.isFocusedDate ? "" : void 0,
    "data-selected": getDataSelected(this.isSelectedDate),
    "data-value": this.opts.date.current.toString(),
    "data-disabled": getDataDisabled(this.isDisabled || this.isOutsideMonth && this.root.opts.disableDaysOutsideMonth.current)
  }));
  get sharedDataAttrs() {
    return this.#sharedDataAttrs();
  }
  #props = once(() => ({
    id: this.opts.id.current,
    role: "gridcell",
    "aria-selected": getAriaSelected(this.isSelectedDate),
    "aria-disabled": getAriaDisabled(this.ariaDisabled),
    ...this.sharedDataAttrs,
    [this.root.getBitsAttr("cell")]: ""
  }));
  get props() {
    return this.#props();
  }
}
class CalendarDayState {
  opts;
  cell;
  constructor(opts, cell) {
    this.opts = opts;
    this.cell = cell;
    this.onclick = this.onclick.bind(this);
    useRefById(opts);
  }
  #tabindex = once(() => this.cell.isOutsideMonth && this.cell.root.opts.disableDaysOutsideMonth.current || this.cell.isDisabled ? void 0 : this.cell.isFocusedDate ? 0 : -1);
  onclick(e) {
    if (this.cell.isDisabled) return;
    this.cell.root.handleCellClick(e, this.cell.opts.date.current);
  }
  #snippetProps = once(() => ({
    disabled: this.cell.isDisabled,
    unavailable: this.cell.isUnavailable,
    selected: this.cell.isSelectedDate,
    day: `${this.cell.opts.date.current.day}`
  }));
  get snippetProps() {
    return this.#snippetProps();
  }
  #props = once(() => ({
    id: this.opts.id.current,
    role: "button",
    "aria-label": this.cell.labelText,
    "aria-disabled": getAriaDisabled(this.cell.ariaDisabled),
    ...this.cell.sharedDataAttrs,
    tabindex: this.#tabindex(),
    [this.cell.root.getBitsAttr("day")]: "",
    // Shared logic for range calendar and calendar
    "data-bits-day": "",
    //
    onclick: this.onclick
  }));
  get props() {
    return this.#props();
  }
}
class CalendarNextButtonState {
  opts;
  root;
  #isDisabled = once(() => this.root.isNextButtonDisabled);
  get isDisabled() {
    return this.#isDisabled();
  }
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.onclick = this.onclick.bind(this);
    useRefById(opts);
  }
  onclick(_2) {
    if (this.isDisabled) return;
    this.root.nextPage();
  }
  #props = once(() => ({
    id: this.opts.id.current,
    role: "button",
    type: "button",
    "aria-label": "Next",
    "aria-disabled": getAriaDisabled(this.isDisabled),
    "data-disabled": getDataDisabled(this.isDisabled),
    disabled: this.isDisabled,
    [this.root.getBitsAttr("next-button")]: "",
    //
    onclick: this.onclick
  }));
  get props() {
    return this.#props();
  }
}
class CalendarPrevButtonState {
  opts;
  root;
  #isDisabled = once(() => this.root.isPrevButtonDisabled);
  get isDisabled() {
    return this.#isDisabled();
  }
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.onclick = this.onclick.bind(this);
    useRefById(opts);
  }
  onclick(_2) {
    if (this.isDisabled) return;
    this.root.prevPage();
  }
  #props = once(() => ({
    id: this.opts.id.current,
    role: "button",
    type: "button",
    "aria-label": "Previous",
    "aria-disabled": getAriaDisabled(this.isDisabled),
    "data-disabled": getDataDisabled(this.isDisabled),
    disabled: this.isDisabled,
    [this.root.getBitsAttr("prev-button")]: "",
    //
    onclick: this.onclick
  }));
  get props() {
    return this.#props();
  }
}
class CalendarGridState {
  opts;
  root;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    useRefById(opts);
  }
  #props = once(() => ({
    id: this.opts.id.current,
    tabindex: -1,
    role: "grid",
    "aria-readonly": getAriaReadonly(this.root.opts.readonly.current),
    "aria-disabled": getAriaDisabled(this.root.opts.disabled.current),
    "data-readonly": getDataReadonly(this.root.opts.readonly.current),
    "data-disabled": getDataDisabled(this.root.opts.disabled.current),
    [this.root.getBitsAttr("grid")]: ""
  }));
  get props() {
    return this.#props();
  }
}
class CalendarGridBodyState {
  opts;
  root;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    useRefById(opts);
  }
  #props = once(() => ({
    id: this.opts.id.current,
    "data-disabled": getDataDisabled(this.root.opts.disabled.current),
    "data-readonly": getDataReadonly(this.root.opts.readonly.current),
    [this.root.getBitsAttr("grid-body")]: ""
  }));
  get props() {
    return this.#props();
  }
}
class CalendarGridHeadState {
  opts;
  root;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    useRefById(opts);
  }
  #props = once(() => ({
    id: this.opts.id.current,
    "data-disabled": getDataDisabled(this.root.opts.disabled.current),
    "data-readonly": getDataReadonly(this.root.opts.readonly.current),
    [this.root.getBitsAttr("grid-head")]: ""
  }));
  get props() {
    return this.#props();
  }
}
class CalendarGridRowState {
  opts;
  root;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    useRefById(opts);
  }
  #props = once(() => ({
    id: this.opts.id.current,
    "data-disabled": getDataDisabled(this.root.opts.disabled.current),
    "data-readonly": getDataReadonly(this.root.opts.readonly.current),
    [this.root.getBitsAttr("grid-row")]: ""
  }));
  get props() {
    return this.#props();
  }
}
class CalendarHeadCellState {
  opts;
  root;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    useRefById(opts);
  }
  #props = once(() => ({
    id: this.opts.id.current,
    "data-disabled": getDataDisabled(this.root.opts.disabled.current),
    "data-readonly": getDataReadonly(this.root.opts.readonly.current),
    [this.root.getBitsAttr("head-cell")]: ""
  }));
  get props() {
    return this.#props();
  }
}
class CalendarHeaderState {
  opts;
  root;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    useRefById(opts);
  }
  #props = once(() => ({
    id: this.opts.id.current,
    "data-disabled": getDataDisabled(this.root.opts.disabled.current),
    "data-readonly": getDataReadonly(this.root.opts.readonly.current),
    [this.root.getBitsAttr("header")]: ""
  }));
  get props() {
    return this.#props();
  }
}
const CalendarRootContext = new Context("Calendar.Root | RangeCalender.Root");
const CalendarCellContext = new Context("Calendar.Cell | RangeCalendar.Cell");
function useCalendarRoot(props) {
  return CalendarRootContext.set(new CalendarRootState(props));
}
function useCalendarGrid(props) {
  return new CalendarGridState(props, CalendarRootContext.get());
}
function useCalendarCell(props) {
  return CalendarCellContext.set(new CalendarCellState(props, CalendarRootContext.get()));
}
function useCalendarNextButton(props) {
  return new CalendarNextButtonState(props, CalendarRootContext.get());
}
function useCalendarPrevButton(props) {
  return new CalendarPrevButtonState(props, CalendarRootContext.get());
}
function useCalendarDay(props) {
  return new CalendarDayState(props, CalendarCellContext.get());
}
function useCalendarGridBody(props) {
  return new CalendarGridBodyState(props, CalendarRootContext.get());
}
function useCalendarGridHead(props) {
  return new CalendarGridHeadState(props, CalendarRootContext.get());
}
function useCalendarGridRow(props) {
  return new CalendarGridRowState(props, CalendarRootContext.get());
}
function useCalendarHeadCell(props) {
  return new CalendarHeadCellState(props, CalendarRootContext.get());
}
function useCalendarHeader(props) {
  return new CalendarHeaderState(props, CalendarRootContext.get());
}
function useCalendarHeading(props) {
  return new CalendarHeadingState(props, CalendarRootContext.get());
}
function Calendar($$payload, $$props) {
  push();
  let {
    child,
    children,
    id = useId(),
    ref = null,
    value = void 0,
    onValueChange = noop,
    placeholder = void 0,
    onPlaceholderChange = noop,
    weekdayFormat = "narrow",
    weekStartsOn = 0,
    pagedNavigation = false,
    isDateDisabled = () => false,
    isDateUnavailable = () => false,
    fixedWeeks = false,
    numberOfMonths = 1,
    locale = "en",
    calendarLabel = "Event",
    disabled = false,
    readonly = false,
    minValue = void 0,
    maxValue = void 0,
    preventDeselect = false,
    type,
    disableDaysOutsideMonth = true,
    initialFocus = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const defaultPlaceholder = getDefaultDate({ defaultValue: value });
  if (placeholder === void 0) {
    placeholder = defaultPlaceholder;
  }
  if (value === void 0) {
    const defaultValue = type === "single" ? "" : [];
    value = defaultValue;
  }
  const rootState = useCalendarRoot({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    weekdayFormat: box.with(() => weekdayFormat),
    weekStartsOn: box.with(() => weekStartsOn),
    pagedNavigation: box.with(() => pagedNavigation),
    isDateDisabled: box.with(() => isDateDisabled),
    isDateUnavailable: box.with(() => isDateUnavailable),
    fixedWeeks: box.with(() => fixedWeeks),
    numberOfMonths: box.with(() => numberOfMonths),
    locale: box.with(() => locale),
    calendarLabel: box.with(() => calendarLabel),
    readonly: box.with(() => readonly),
    disabled: box.with(() => disabled),
    minValue: box.with(() => minValue),
    maxValue: box.with(() => maxValue),
    disableDaysOutsideMonth: box.with(() => disableDaysOutsideMonth),
    initialFocus: box.with(() => initialFocus),
    placeholder: box.with(() => placeholder, (v) => {
      placeholder = v;
      onPlaceholderChange(v);
    }),
    preventDeselect: box.with(() => preventDeselect),
    value: box.with(() => value, (v) => {
      value = v;
      onValueChange(v);
    }),
    type: box.with(() => type),
    defaultPlaceholder
  });
  const mergedProps = mergeProps(restProps, rootState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps, ...rootState.snippetProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload, rootState.snippetProps);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref, value, placeholder });
  pop();
}
function Calendar_day$1($$payload, $$props) {
  push();
  let {
    children,
    child,
    ref = null,
    id = useId(),
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const dayState = useCalendarDay({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, dayState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps, ...dayState.snippetProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
    if (children) {
      $$payload.out += "<!--[-->";
      children?.($$payload, dayState.snippetProps);
      $$payload.out += `<!---->`;
    } else {
      $$payload.out += "<!--[!-->";
      $$payload.out += `${escape_html(dayState.cell.opts.date.current.day)}`;
    }
    $$payload.out += `<!--]--></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Calendar_grid$1($$payload, $$props) {
  push();
  let {
    children,
    child,
    ref = null,
    id = useId(),
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const gridState = useCalendarGrid({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, gridState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<table${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></table>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Calendar_grid_body$1($$payload, $$props) {
  push();
  let {
    children,
    child,
    ref = null,
    id = useId(),
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const gridBodyState = useCalendarGridBody({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, gridBodyState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<tbody${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></tbody>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Calendar_cell$1($$payload, $$props) {
  push();
  let {
    children,
    child,
    ref = null,
    id = useId(),
    date: date2,
    month,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const cellState = useCalendarCell({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    date: box.with(() => date2),
    month: box.with(() => month)
  });
  const mergedProps = mergeProps(restProps, cellState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps, ...cellState.snippetProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<td${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload, cellState.snippetProps);
    $$payload.out += `<!----></td>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Calendar_grid_head$1($$payload, $$props) {
  push();
  let {
    children,
    child,
    ref = null,
    id = useId(),
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const gridHeadState = useCalendarGridHead({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, gridHeadState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<thead${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></thead>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Calendar_head_cell$1($$payload, $$props) {
  push();
  let {
    children,
    child,
    ref = null,
    id = useId(),
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const headCellState = useCalendarHeadCell({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, headCellState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<th${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></th>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Calendar_grid_row$1($$payload, $$props) {
  push();
  let {
    children,
    child,
    ref = null,
    id = useId(),
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const gridRowState = useCalendarGridRow({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, gridRowState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<tr${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></tr>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Calendar_header$1($$payload, $$props) {
  push();
  let {
    children,
    child,
    ref = null,
    id = useId(),
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const headerState = useCalendarHeader({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, headerState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<header${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></header>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Calendar_heading$1($$payload, $$props) {
  push();
  let {
    children,
    child,
    ref = null,
    id = useId(),
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const headingState = useCalendarHeading({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, headingState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, {
      props: mergedProps,
      headingValue: headingState.headingValue
    });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
    if (children) {
      $$payload.out += "<!--[-->";
      children?.($$payload, { headingValue: headingState.headingValue });
      $$payload.out += `<!---->`;
    } else {
      $$payload.out += "<!--[!-->";
      $$payload.out += `${escape_html(headingState.headingValue)}`;
    }
    $$payload.out += `<!--]--></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Calendar_next_button$1($$payload, $$props) {
  push();
  let {
    children,
    child,
    id = useId(),
    ref = null,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const nextButtonState = useCalendarNextButton({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, nextButtonState.props);
  const paraglide_sveltekit_translate_attribute_pass_translationFunctions = getTranslationFunctions();
  const [
    paraglide_sveltekit_translate_attribute_pass_translateAttribute,
    paraglide_sveltekit_translate_attribute_pass_handle_attributes
  ] = paraglide_sveltekit_translate_attribute_pass_translationFunctions;
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<button${spread_attributes(
      {
        ...paraglide_sveltekit_translate_attribute_pass_handle_attributes({ ...mergedProps }, [{ attribute_name: "formaction" }])
      },
      null
    )}>`;
    children?.($$payload);
    $$payload.out += `<!----></button>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Calendar_prev_button$1($$payload, $$props) {
  push();
  let {
    children,
    child,
    id = useId(),
    ref = null,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const prevButtonState = useCalendarPrevButton({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, prevButtonState.props);
  const paraglide_sveltekit_translate_attribute_pass_translationFunctions = getTranslationFunctions();
  const [
    paraglide_sveltekit_translate_attribute_pass_translateAttribute,
    paraglide_sveltekit_translate_attribute_pass_handle_attributes
  ] = paraglide_sveltekit_translate_attribute_pass_translationFunctions;
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<button${spread_attributes(
      {
        ...paraglide_sveltekit_translate_attribute_pass_handle_attributes({ ...mergedProps }, [{ attribute_name: "formaction" }])
      },
      null
    )}>`;
    children?.($$payload);
    $$payload.out += `<!----></button>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Hidden_input($$payload, $$props) {
  push();
  let {
    value = void 0,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const mergedProps = mergeProps(restProps, {
    "aria-hidden": "true",
    tabindex: -1,
    style: srOnlyStylesString
  });
  if (mergedProps.type === "checkbox") {
    $$payload.out += "<!--[-->";
    $$payload.out += `<input${spread_attributes({ ...mergedProps, value }, null)}>`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<input${spread_attributes({ value, ...mergedProps }, null)}>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { value });
  pop();
}
function useDOMTypeahead(opts) {
  const search = boxAutoReset("", 1e3);
  const onMatch = opts?.onMatch ?? ((node) => node.focus());
  const getCurrentItem = opts?.getCurrentItem ?? (() => document.activeElement);
  function handleTypeaheadSearch(key, candidates) {
    if (!candidates.length) return;
    search.current = search.current + key;
    const currentItem = getCurrentItem();
    const currentMatch = candidates.find((item) => item === currentItem)?.textContent?.trim() ?? "";
    const values = candidates.map((item) => item.textContent?.trim() ?? "");
    const nextMatch = getNextMatch(values, search.current, currentMatch);
    const newItem = candidates.find((item) => item.textContent?.trim() === nextMatch);
    if (newItem) {
      onMatch(newItem);
    }
    return newItem;
  }
  function resetTypeahead() {
    search.current = "";
  }
  return {
    search,
    handleTypeaheadSearch,
    resetTypeahead
  };
}
function useDataTypeahead(opts) {
  const search = boxAutoReset("", 1e3);
  function handleTypeaheadSearch(key, candidateValues) {
    if (!opts.enabled) return;
    if (!candidateValues.length) return;
    search.current = search.current + key;
    const currentItem = opts.getCurrentItem();
    const currentMatch = candidateValues.find((item) => item === currentItem) ?? "";
    const values = candidateValues.map((item) => item ?? "");
    const nextMatch = getNextMatch(values, search.current, currentMatch);
    const newItem = candidateValues.find((item) => item === nextMatch);
    if (newItem) {
      opts.onMatch(newItem);
    }
    return newItem;
  }
  function resetTypeahead() {
    search.current = "";
  }
  return {
    search,
    handleTypeaheadSearch,
    resetTypeahead
  };
}
const FIRST_KEYS = [ARROW_DOWN, PAGE_UP, HOME];
const LAST_KEYS = [ARROW_UP, PAGE_DOWN, END];
const FIRST_LAST_KEYS = [...FIRST_KEYS, ...LAST_KEYS];
class SelectBaseRootState {
  opts;
  touchedInput = false;
  inputValue = "";
  inputNode = null;
  contentNode = null;
  triggerNode = null;
  valueId = "";
  highlightedNode = null;
  #highlightedValue = once(() => {
    if (!this.highlightedNode) return null;
    return this.highlightedNode.getAttribute("data-value");
  });
  get highlightedValue() {
    return this.#highlightedValue();
  }
  #highlightedId = once(() => {
    if (!this.highlightedNode) return void 0;
    return this.highlightedNode.id;
  });
  get highlightedId() {
    return this.#highlightedId();
  }
  #highlightedLabel = once(() => {
    if (!this.highlightedNode) return null;
    return this.highlightedNode.getAttribute("data-label");
  });
  get highlightedLabel() {
    return this.#highlightedLabel();
  }
  isUsingKeyboard = false;
  isCombobox = false;
  bitsAttrs;
  constructor(opts) {
    this.opts = opts;
    this.isCombobox = opts.isCombobox;
    this.bitsAttrs = getSelectBitsAttrs(this);
  }
  setHighlightedNode(node, initial = false) {
    this.highlightedNode = node;
    if (node && (this.isUsingKeyboard || initial)) {
      node.scrollIntoView({ block: "nearest" });
    }
  }
  getCandidateNodes() {
    const node = this.contentNode;
    if (!node) return [];
    const nodes = Array.from(node.querySelectorAll(`[${this.bitsAttrs.item}]:not([data-disabled])`));
    return nodes;
  }
  setHighlightedToFirstCandidate() {
    this.setHighlightedNode(null);
    const candidateNodes = this.getCandidateNodes();
    if (!candidateNodes.length) return;
    this.setHighlightedNode(candidateNodes[0]);
  }
  getNodeByValue(value) {
    const candidateNodes = this.getCandidateNodes();
    return candidateNodes.find((node) => node.dataset.value === value) ?? null;
  }
  setOpen(open) {
    this.opts.open.current = open;
  }
  toggleOpen() {
    this.opts.open.current = !this.opts.open.current;
  }
  handleOpen() {
    this.setOpen(true);
  }
  handleClose() {
    this.setHighlightedNode(null);
    this.setOpen(false);
  }
  toggleMenu() {
    this.toggleOpen();
  }
}
class SelectSingleRootState extends SelectBaseRootState {
  opts;
  isMulti = false;
  #hasValue = once(() => this.opts.value.current !== "");
  get hasValue() {
    return this.#hasValue();
  }
  #currentLabel = once(() => {
    if (!this.opts.items.current.length) return "";
    const match = this.opts.items.current.find((item) => item.value === this.opts.value.current)?.label;
    return match ?? "";
  });
  get currentLabel() {
    return this.#currentLabel();
  }
  #candidateLabels = once(() => {
    if (!this.opts.items.current.length) return [];
    const filteredItems = this.opts.items.current.filter((item) => !item.disabled);
    return filteredItems.map((item) => item.label);
  });
  get candidateLabels() {
    return this.#candidateLabels();
  }
  #dataTypeaheadEnabled = once(() => {
    if (this.isMulti) return false;
    if (this.opts.items.current.length === 0) return false;
    return true;
  });
  get dataTypeaheadEnabled() {
    return this.#dataTypeaheadEnabled();
  }
  constructor(opts) {
    super(opts);
    this.opts = opts;
    watch(() => this.opts.open.current, () => {
      if (!this.opts.open.current) return;
      this.setInitialHighlightedNode();
    });
  }
  includesItem(itemValue) {
    return this.opts.value.current === itemValue;
  }
  toggleItem(itemValue, itemLabel = itemValue) {
    this.opts.value.current = this.includesItem(itemValue) ? "" : itemValue;
    this.inputValue = itemLabel;
  }
  setInitialHighlightedNode() {
    afterTick(() => {
      if (this.highlightedNode && document.contains(this.highlightedNode)) return;
      if (this.opts.value.current !== "") {
        const node = this.getNodeByValue(this.opts.value.current);
        if (node) {
          this.setHighlightedNode(node, true);
          return;
        }
      }
      const firstCandidate = this.getCandidateNodes()[0];
      if (!firstCandidate) return;
      this.setHighlightedNode(firstCandidate, true);
    });
  }
}
class SelectMultipleRootState extends SelectBaseRootState {
  opts;
  isMulti = true;
  #hasValue = once(() => this.opts.value.current.length > 0);
  get hasValue() {
    return this.#hasValue();
  }
  constructor(opts) {
    super(opts);
    this.opts = opts;
    watch(() => this.opts.open.current, () => {
      if (!this.opts.open.current) return;
      this.setInitialHighlightedNode();
    });
  }
  includesItem(itemValue) {
    return this.opts.value.current.includes(itemValue);
  }
  toggleItem(itemValue, itemLabel = itemValue) {
    if (this.includesItem(itemValue)) {
      this.opts.value.current = this.opts.value.current.filter((v) => v !== itemValue);
    } else {
      this.opts.value.current = [...this.opts.value.current, itemValue];
    }
    this.inputValue = itemLabel;
  }
  setInitialHighlightedNode() {
    afterTick(() => {
      if (this.highlightedNode && document.contains(this.highlightedNode)) return;
      if (this.opts.value.current.length && this.opts.value.current[0] !== "") {
        const node = this.getNodeByValue(this.opts.value.current[0]);
        if (node) {
          this.setHighlightedNode(node, true);
          return;
        }
      }
      const firstCandidate = this.getCandidateNodes()[0];
      if (!firstCandidate) return;
      this.setHighlightedNode(firstCandidate, true);
    });
  }
}
class SelectTriggerState {
  opts;
  root;
  #domTypeahead;
  #dataTypeahead;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    useRefById({
      ...opts,
      onRefChange: (node) => {
        this.root.triggerNode = node;
      }
    });
    this.#domTypeahead = useDOMTypeahead({
      getCurrentItem: () => this.root.highlightedNode,
      onMatch: (node) => {
        this.root.setHighlightedNode(node);
      }
    });
    this.#dataTypeahead = useDataTypeahead({
      getCurrentItem: () => {
        if (this.root.isMulti) return "";
        return this.root.currentLabel;
      },
      onMatch: (label) => {
        if (this.root.isMulti) return;
        if (!this.root.opts.items.current) return;
        const matchedItem = this.root.opts.items.current.find((item) => item.label === label);
        if (!matchedItem) return;
        this.root.opts.value.current = matchedItem.value;
      },
      enabled: !this.root.isMulti && this.root.dataTypeaheadEnabled
    });
    this.onkeydown = this.onkeydown.bind(this);
    this.onpointerdown = this.onpointerdown.bind(this);
    this.onpointerup = this.onpointerup.bind(this);
    this.onclick = this.onclick.bind(this);
  }
  #handleOpen() {
    this.root.opts.open.current = true;
    this.#dataTypeahead.resetTypeahead();
    this.#domTypeahead.resetTypeahead();
  }
  #handlePointerOpen(_2) {
    this.#handleOpen();
  }
  onkeydown(e) {
    this.root.isUsingKeyboard = true;
    if (e.key === ARROW_UP || e.key === ARROW_DOWN) e.preventDefault();
    if (!this.root.opts.open.current) {
      if (e.key === ENTER || e.key === SPACE || e.key === ARROW_DOWN || e.key === ARROW_UP) {
        e.preventDefault();
        this.root.handleOpen();
      } else if (!this.root.isMulti && this.root.dataTypeaheadEnabled) {
        this.#dataTypeahead.handleTypeaheadSearch(e.key, this.root.candidateLabels);
        return;
      }
      if (this.root.hasValue) return;
      const candidateNodes2 = this.root.getCandidateNodes();
      if (!candidateNodes2.length) return;
      if (e.key === ARROW_DOWN) {
        const firstCandidate = candidateNodes2[0];
        this.root.setHighlightedNode(firstCandidate);
      } else if (e.key === ARROW_UP) {
        const lastCandidate = candidateNodes2[candidateNodes2.length - 1];
        this.root.setHighlightedNode(lastCandidate);
      }
      return;
    }
    if (e.key === TAB) {
      this.root.handleClose();
      return;
    }
    if ((e.key === ENTER || e.key === SPACE) && !e.isComposing) {
      e.preventDefault();
      const isCurrentSelectedValue = this.root.highlightedValue === this.root.opts.value.current;
      if (!this.root.opts.allowDeselect.current && isCurrentSelectedValue && !this.root.isMulti) {
        this.root.handleClose();
        return;
      }
      if (this.root.highlightedValue !== null) {
        this.root.toggleItem(this.root.highlightedValue, this.root.highlightedLabel ?? void 0);
      }
      if (!this.root.isMulti && !isCurrentSelectedValue) {
        this.root.handleClose();
        return;
      }
    }
    if (e.key === ARROW_UP && e.altKey) {
      this.root.handleClose();
    }
    if (FIRST_LAST_KEYS.includes(e.key)) {
      e.preventDefault();
      const candidateNodes2 = this.root.getCandidateNodes();
      const currHighlightedNode = this.root.highlightedNode;
      const currIndex = currHighlightedNode ? candidateNodes2.indexOf(currHighlightedNode) : -1;
      const loop = this.root.opts.loop.current;
      let nextItem;
      if (e.key === ARROW_DOWN) {
        nextItem = next(candidateNodes2, currIndex, loop);
      } else if (e.key === ARROW_UP) {
        nextItem = prev(candidateNodes2, currIndex, loop);
      } else if (e.key === PAGE_DOWN) {
        nextItem = forward(candidateNodes2, currIndex, 10, loop);
      } else if (e.key === PAGE_UP) {
        nextItem = backward(candidateNodes2, currIndex, 10, loop);
      } else if (e.key === HOME) {
        nextItem = candidateNodes2[0];
      } else if (e.key === END) {
        nextItem = candidateNodes2[candidateNodes2.length - 1];
      }
      if (!nextItem) return;
      this.root.setHighlightedNode(nextItem);
      return;
    }
    const isModifierKey = e.ctrlKey || e.altKey || e.metaKey;
    const isCharacterKey = e.key.length === 1;
    if (e.code === "Space") return;
    const candidateNodes = this.root.getCandidateNodes();
    if (e.key === TAB) return;
    if (!isModifierKey && isCharacterKey) {
      this.#domTypeahead.handleTypeaheadSearch(e.key, candidateNodes);
      return;
    }
    if (!this.root.highlightedNode) {
      this.root.setHighlightedToFirstCandidate();
    }
  }
  onclick(e) {
    const currTarget = e.currentTarget;
    currTarget.focus();
  }
  onpointerdown(e) {
    if (this.root.opts.disabled.current) return;
    if (e.pointerType === "touch") return e.preventDefault();
    const target = e.target;
    if (target?.hasPointerCapture(e.pointerId)) {
      target?.releasePointerCapture(e.pointerId);
    }
    if (e.button === 0 && e.ctrlKey === false) {
      if (this.root.opts.open.current === false) {
        this.#handlePointerOpen(e);
      } else {
        this.root.handleClose();
      }
    }
  }
  onpointerup(e) {
    e.preventDefault();
    if (e.pointerType === "touch") {
      if (this.root.opts.open.current === false) {
        this.#handlePointerOpen(e);
      } else {
        this.root.handleClose();
      }
    }
  }
  #props = once(() => ({
    id: this.opts.id.current,
    disabled: this.root.opts.disabled.current ? true : void 0,
    "aria-haspopup": "listbox",
    "aria-expanded": getAriaExpanded(this.root.opts.open.current),
    "aria-activedescendant": this.root.highlightedId,
    "data-state": getDataOpenClosed(this.root.opts.open.current),
    "data-disabled": getDataDisabled(this.root.opts.disabled.current),
    "data-placeholder": this.root.hasValue ? void 0 : "",
    [this.root.bitsAttrs.trigger]: "",
    onpointerdown: this.onpointerdown,
    onkeydown: this.onkeydown,
    onclick: this.onclick,
    onpointerup: this.onpointerup
  }));
  get props() {
    return this.#props();
  }
}
class SelectContentState {
  opts;
  root;
  viewportNode = null;
  isPositioned = false;
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
    watch(() => this.root.opts.open.current, () => {
      if (this.root.opts.open.current) return;
      this.isPositioned = false;
    });
    this.onpointermove = this.onpointermove.bind(this);
  }
  onpointermove(_2) {
    this.root.isUsingKeyboard = false;
  }
  #styles = once(() => {
    const prefix = this.root.isCombobox ? "--bits-combobox" : "--bits-select";
    return {
      [`${prefix}-content-transform-origin`]: "var(--bits-floating-transform-origin)",
      [`${prefix}-content-available-width`]: "var(--bits-floating-available-width)",
      [`${prefix}-content-available-height`]: "var(--bits-floating-available-height)",
      [`${prefix}-anchor-width`]: " var(--bits-floating-anchor-width)",
      [`${prefix}-anchor-height`]: "var(--bits-floating-anchor-height)"
    };
  });
  onInteractOutside = (e) => {
    if (e.target === this.root.triggerNode || e.target === this.root.inputNode) {
      e.preventDefault();
      return;
    }
    this.opts.onInteractOutside.current(e);
    if (e.defaultPrevented) return;
    this.root.handleClose();
  };
  onEscapeKeydown = (e) => {
    this.opts.onEscapeKeydown.current(e);
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
    role: "listbox",
    "aria-multiselectable": this.root.isMulti ? "true" : void 0,
    "data-state": getDataOpenClosed(this.root.opts.open.current),
    [this.root.bitsAttrs.content]: "",
    style: {
      display: "flex",
      flexDirection: "column",
      outline: "none",
      boxSizing: "border-box",
      pointerEvents: "auto",
      ...this.#styles()
    },
    onpointermove: this.onpointermove
  }));
  get props() {
    return this.#props();
  }
  popperProps = {
    onInteractOutside: this.onInteractOutside,
    onEscapeKeydown: this.onEscapeKeydown,
    onOpenAutoFocus: this.onOpenAutoFocus,
    onCloseAutoFocus: this.onCloseAutoFocus,
    trapFocus: false,
    loop: false,
    onPlaced: () => {
      this.isPositioned = true;
    }
  };
}
class SelectItemState {
  opts;
  root;
  #isSelected = once(() => this.root.includesItem(this.opts.value.current));
  get isSelected() {
    return this.#isSelected();
  }
  #isHighlighted = once(() => this.root.highlightedValue === this.opts.value.current);
  get isHighlighted() {
    return this.#isHighlighted();
  }
  prevHighlighted = new Previous(() => this.isHighlighted);
  mounted = false;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    useRefById({ ...opts, deps: () => this.mounted });
    watch(
      [
        () => this.isHighlighted,
        () => this.prevHighlighted.current
      ],
      () => {
        if (this.isHighlighted) {
          this.opts.onHighlight.current();
        } else if (this.prevHighlighted.current) {
          this.opts.onUnhighlight.current();
        }
      }
    );
    watch(() => this.mounted, () => {
      if (!this.mounted) return;
      this.root.setInitialHighlightedNode();
    });
    this.onpointerdown = this.onpointerdown.bind(this);
    this.onpointerup = this.onpointerup.bind(this);
    this.onpointermove = this.onpointermove.bind(this);
  }
  handleSelect() {
    if (this.opts.disabled.current) return;
    const isCurrentSelectedValue = this.opts.value.current === this.root.opts.value.current;
    if (!this.root.opts.allowDeselect.current && isCurrentSelectedValue && !this.root.isMulti) {
      this.root.handleClose();
      return;
    }
    this.root.toggleItem(this.opts.value.current, this.opts.label.current);
    if (!this.root.isMulti && !isCurrentSelectedValue) {
      this.root.handleClose();
    }
  }
  #snippetProps = once(() => ({
    selected: this.isSelected,
    highlighted: this.isHighlighted
  }));
  get snippetProps() {
    return this.#snippetProps();
  }
  onpointerdown(e) {
    e.preventDefault();
  }
  /**
   * Using `pointerup` instead of `click` allows power users to pointerdown
   * the trigger, then release pointerup on an item to select it vs having to do
   * multiple clicks.
   */
  onpointerup(e) {
    if (e.defaultPrevented || !this.opts.ref.current) return;
    if (e.pointerType === "touch" && !isIOS) {
      on(
        this.opts.ref.current,
        "click",
        () => {
          this.handleSelect();
          this.root.setHighlightedNode(this.opts.ref.current);
        },
        { once: true }
      );
      return;
    }
    e.preventDefault();
    this.handleSelect();
    if (e.pointerType === "touch") {
      this.root.setHighlightedNode(this.opts.ref.current);
    }
  }
  onpointermove(e) {
    if (e.pointerType === "touch") return;
    if (this.root.highlightedNode !== this.opts.ref.current) {
      this.root.setHighlightedNode(this.opts.ref.current);
    }
  }
  #props = once(() => ({
    id: this.opts.id.current,
    role: "option",
    "aria-selected": this.root.includesItem(this.opts.value.current) ? "true" : void 0,
    "data-value": this.opts.value.current,
    "data-disabled": getDataDisabled(this.opts.disabled.current),
    "data-highlighted": this.root.highlightedValue === this.opts.value.current ? "" : void 0,
    "data-selected": this.root.includesItem(this.opts.value.current) ? "" : void 0,
    "data-label": this.opts.label.current,
    [this.root.bitsAttrs.item]: "",
    onpointermove: this.onpointermove,
    onpointerdown: this.onpointerdown,
    onpointerup: this.onpointerup
  }));
  get props() {
    return this.#props();
  }
}
class SelectHiddenInputState {
  opts;
  root;
  #shouldRender = once(() => this.root.opts.name.current !== "");
  get shouldRender() {
    return this.#shouldRender();
  }
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.onfocus = this.onfocus.bind(this);
  }
  onfocus(e) {
    e.preventDefault();
    if (!this.root.isCombobox) {
      this.root.triggerNode?.focus();
    } else {
      this.root.inputNode?.focus();
    }
  }
  #props = once(() => ({
    disabled: getDisabled(this.root.opts.disabled.current),
    required: getRequired(this.root.opts.required.current),
    name: this.root.opts.name.current,
    value: this.opts.value.current,
    onfocus: this.onfocus
  }));
  get props() {
    return this.#props();
  }
}
class SelectViewportState {
  opts;
  content;
  root;
  prevScrollTop = 0;
  constructor(opts, content) {
    this.opts = opts;
    this.content = content;
    this.root = content.root;
    useRefById({
      ...opts,
      onRefChange: (node) => {
        this.content.viewportNode = node;
      },
      deps: () => this.root.opts.open.current
    });
  }
  #props = once(() => ({
    id: this.opts.id.current,
    role: "presentation",
    [this.root.bitsAttrs.viewport]: "",
    style: {
      // we use position: 'relative' here on the `viewport` so that when we call
      // `selectedItem.offsetTop` in calculations, the offset is relative to the viewport
      // (independent of the scrollUpButton).
      position: "relative",
      flex: 1,
      overflow: "auto"
    }
  }));
  get props() {
    return this.#props();
  }
}
class SelectScrollButtonImplState {
  opts;
  content;
  root;
  autoScrollInterval = null;
  userScrollTimer = -1;
  isUserScrolling = false;
  onAutoScroll = noop;
  mounted = false;
  constructor(opts, content) {
    this.opts = opts;
    this.content = content;
    this.root = content.root;
    useRefById({ ...opts, deps: () => this.mounted });
    watch([() => this.mounted], () => {
      if (!this.mounted) {
        this.isUserScrolling = false;
        return;
      }
      if (this.isUserScrolling) return;
    });
    this.onpointerdown = this.onpointerdown.bind(this);
    this.onpointermove = this.onpointermove.bind(this);
    this.onpointerleave = this.onpointerleave.bind(this);
  }
  handleUserScroll() {
    window.clearTimeout(this.userScrollTimer);
    this.isUserScrolling = true;
    this.userScrollTimer = window.setTimeout(
      () => {
        this.isUserScrolling = false;
      },
      200
    );
  }
  clearAutoScrollInterval() {
    if (this.autoScrollInterval === null) return;
    window.clearInterval(this.autoScrollInterval);
    this.autoScrollInterval = null;
  }
  onpointerdown(_2) {
    if (this.autoScrollInterval !== null) return;
    this.autoScrollInterval = window.setInterval(
      () => {
        this.onAutoScroll();
      },
      50
    );
  }
  onpointermove(_2) {
    if (this.autoScrollInterval !== null) return;
    this.autoScrollInterval = window.setInterval(
      () => {
        this.onAutoScroll();
      },
      50
    );
  }
  onpointerleave(_2) {
    this.clearAutoScrollInterval();
  }
  #props = once(() => ({
    id: this.opts.id.current,
    "aria-hidden": getAriaHidden(true),
    style: { flexShrink: 0 },
    onpointerdown: this.onpointerdown,
    onpointermove: this.onpointermove,
    onpointerleave: this.onpointerleave
  }));
  get props() {
    return this.#props();
  }
}
class SelectScrollDownButtonState {
  state;
  content;
  root;
  canScrollDown = false;
  scrollIntoViewTimer = null;
  constructor(state) {
    this.state = state;
    this.content = state.content;
    this.root = state.root;
    this.state.onAutoScroll = this.handleAutoScroll;
    watch(
      [
        () => this.content.viewportNode,
        () => this.content.isPositioned
      ],
      () => {
        if (!this.content.viewportNode || !this.content.isPositioned) {
          return;
        }
        this.handleScroll(true);
        return on(this.content.viewportNode, "scroll", () => this.handleScroll());
      }
    );
    watch(() => this.state.mounted, () => {
      if (!this.state.mounted) return;
      if (this.scrollIntoViewTimer) {
        clearTimeout(this.scrollIntoViewTimer);
      }
      this.scrollIntoViewTimer = afterSleep(5, () => {
        const activeItem = this.root.highlightedNode;
        activeItem?.scrollIntoView({ block: "nearest" });
      });
    });
  }
  /**
   * @param manual - if true, it means the function was invoked manually outside of an event
   * listener, so we don't call `handleUserScroll` to prevent the auto scroll from kicking in.
   */
  handleScroll = (manual = false) => {
    if (!manual) {
      this.state.handleUserScroll();
    }
    if (!this.content.viewportNode) return;
    const maxScroll = this.content.viewportNode.scrollHeight - this.content.viewportNode.clientHeight;
    const paddingTop = Number.parseInt(getComputedStyle(this.content.viewportNode).paddingTop, 10);
    this.canScrollDown = Math.ceil(this.content.viewportNode.scrollTop) < maxScroll - paddingTop;
  };
  handleAutoScroll = () => {
    const viewport = this.content.viewportNode;
    const selectedItem = this.root.highlightedNode;
    if (!viewport || !selectedItem) return;
    viewport.scrollTop = viewport.scrollTop + selectedItem.offsetHeight;
  };
  #props = once(() => ({
    ...this.state.props,
    [this.root.bitsAttrs["scroll-down-button"]]: ""
  }));
  get props() {
    return this.#props();
  }
}
class SelectScrollUpButtonState {
  state;
  content;
  root;
  canScrollUp = false;
  constructor(state) {
    this.state = state;
    this.content = state.content;
    this.root = state.root;
    this.state.onAutoScroll = this.handleAutoScroll;
    watch(
      [
        () => this.content.viewportNode,
        () => this.content.isPositioned
      ],
      () => {
        if (!this.content.viewportNode || !this.content.isPositioned) return;
        this.handleScroll(true);
        return on(this.content.viewportNode, "scroll", () => this.handleScroll());
      }
    );
  }
  /**
   * @param manual - if true, it means the function was invoked manually outside of an event
   * listener, so we don't call `handleUserScroll` to prevent the auto scroll from kicking in.
   */
  handleScroll = (manual = false) => {
    if (!manual) {
      this.state.handleUserScroll();
    }
    if (!this.content.viewportNode) return;
    const paddingTop = Number.parseInt(getComputedStyle(this.content.viewportNode).paddingTop, 10);
    this.canScrollUp = this.content.viewportNode.scrollTop - paddingTop > 0.1;
  };
  handleAutoScroll = () => {
    if (!this.content.viewportNode || !this.root.highlightedNode) return;
    this.content.viewportNode.scrollTop = this.content.viewportNode.scrollTop - this.root.highlightedNode.offsetHeight;
  };
  #props = once(() => ({
    ...this.state.props,
    [this.root.bitsAttrs["scroll-up-button"]]: ""
  }));
  get props() {
    return this.#props();
  }
}
const SelectRootContext = new Context("Select.Root | Combobox.Root");
const SelectContentContext = new Context("Select.Content | Combobox.Content");
function useSelectRoot(props) {
  const { type, ...rest } = props;
  const rootState = type === "single" ? new SelectSingleRootState(rest) : new SelectMultipleRootState(rest);
  return SelectRootContext.set(rootState);
}
function useSelectContent(props) {
  return SelectContentContext.set(new SelectContentState(props, SelectRootContext.get()));
}
function useSelectTrigger(props) {
  return new SelectTriggerState(props, SelectRootContext.get());
}
function useSelectItem(props) {
  return new SelectItemState(props, SelectRootContext.get());
}
function useSelectViewport(props) {
  return new SelectViewportState(props, SelectContentContext.get());
}
function useSelectScrollUpButton(props) {
  return new SelectScrollUpButtonState(new SelectScrollButtonImplState(props, SelectContentContext.get()));
}
function useSelectScrollDownButton(props) {
  return new SelectScrollDownButtonState(new SelectScrollButtonImplState(props, SelectContentContext.get()));
}
function useSelectHiddenInput(props) {
  return new SelectHiddenInputState(props, SelectRootContext.get());
}
const selectParts = [
  "trigger",
  "content",
  "item",
  "viewport",
  "scroll-up-button",
  "scroll-down-button",
  "group",
  "group-label",
  "separator",
  "arrow",
  "input",
  "content-wrapper",
  "item-text",
  "value"
];
function getSelectBitsAttrs(root) {
  const isCombobox = root.isCombobox;
  const attrObj = {};
  for (const part of selectParts) {
    attrObj[part] = isCombobox ? `data-combobox-${part}` : `data-select-${part}`;
  }
  return attrObj;
}
function Select_hidden_input($$payload, $$props) {
  push();
  let { value = "" } = $$props;
  const hiddenInputState = useSelectHiddenInput({ value: box.with(() => value) });
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    if (hiddenInputState.shouldRender) {
      $$payload2.out += "<!--[-->";
      Hidden_input($$payload2, spread_props([
        hiddenInputState.props,
        {
          get value() {
            return value;
          },
          set value($$value) {
            value = $$value;
            $$settled = false;
          }
        }
      ]));
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]-->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { value });
  pop();
}
function Floating_layer_content($$payload, $$props) {
  push();
  let {
    content,
    side = "bottom",
    sideOffset = 0,
    align = "center",
    alignOffset = 0,
    id,
    arrowPadding = 0,
    avoidCollisions = true,
    collisionBoundary = [],
    collisionPadding = 0,
    hideWhenDetached = false,
    onPlaced = () => {
    },
    sticky = "partial",
    updatePositionStrategy = "optimized",
    strategy = "fixed",
    dir = "ltr",
    style = {},
    wrapperId = useId(),
    customAnchor = null,
    enabled
  } = $$props;
  const contentState = useFloatingContentState({
    side: box.with(() => side),
    sideOffset: box.with(() => sideOffset),
    align: box.with(() => align),
    alignOffset: box.with(() => alignOffset),
    id: box.with(() => id),
    arrowPadding: box.with(() => arrowPadding),
    avoidCollisions: box.with(() => avoidCollisions),
    collisionBoundary: box.with(() => collisionBoundary),
    collisionPadding: box.with(() => collisionPadding),
    hideWhenDetached: box.with(() => hideWhenDetached),
    onPlaced: box.with(() => onPlaced),
    sticky: box.with(() => sticky),
    updatePositionStrategy: box.with(() => updatePositionStrategy),
    strategy: box.with(() => strategy),
    dir: box.with(() => dir),
    style: box.with(() => style),
    enabled: box.with(() => enabled),
    wrapperId: box.with(() => wrapperId),
    customAnchor: box.with(() => customAnchor)
  });
  const mergedProps = mergeProps(contentState.wrapperProps, { style: { pointerEvents: "auto" } });
  content?.($$payload, {
    props: contentState.props,
    wrapperProps: mergedProps
  });
  $$payload.out += `<!---->`;
  pop();
}
function Floating_layer_content_static($$payload, $$props) {
  push();
  let { content } = $$props;
  content?.($$payload, { props: {}, wrapperProps: {} });
  $$payload.out += `<!---->`;
  pop();
}
function Popper_content($$payload, $$props) {
  let {
    content,
    isStatic = false,
    onPlaced,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  if (isStatic) {
    $$payload.out += "<!--[-->";
    Floating_layer_content_static($$payload, { content });
  } else {
    $$payload.out += "<!--[!-->";
    Floating_layer_content($$payload, spread_props([{ content, onPlaced }, restProps]));
  }
  $$payload.out += `<!--]-->`;
}
function Popper_layer_inner($$payload, $$props) {
  push();
  let {
    popper,
    onEscapeKeydown,
    escapeKeydownBehavior,
    preventOverflowTextSelection,
    id,
    onPointerDown,
    onPointerUp,
    side,
    sideOffset,
    align,
    alignOffset,
    arrowPadding,
    avoidCollisions,
    collisionBoundary,
    collisionPadding,
    sticky,
    hideWhenDetached,
    updatePositionStrategy,
    strategy,
    dir,
    preventScroll,
    wrapperId,
    style,
    onPlaced,
    onInteractOutside,
    onCloseAutoFocus,
    onOpenAutoFocus,
    onFocusOutside,
    interactOutsideBehavior = "close",
    loop,
    trapFocus = true,
    isValidEvent: isValidEvent2 = () => false,
    customAnchor = null,
    isStatic = false,
    enabled,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  {
    let content = function($$payload2, { props: floatingProps, wrapperProps }) {
      if (restProps.forceMount && enabled) {
        $$payload2.out += "<!--[-->";
        Scroll_lock($$payload2, { preventScroll });
      } else if (!restProps.forceMount) {
        $$payload2.out += "<!--[1-->";
        Scroll_lock($$payload2, { preventScroll });
      } else {
        $$payload2.out += "<!--[!-->";
      }
      $$payload2.out += `<!--]--> `;
      {
        let focusScope = function($$payload3, { props: focusScopeProps }) {
          Escape_layer($$payload3, {
            onEscapeKeydown,
            escapeKeydownBehavior,
            enabled,
            children: ($$payload4) => {
              {
                let children = function($$payload5, { props: dismissibleProps }) {
                  Text_selection_layer($$payload5, {
                    id,
                    preventOverflowTextSelection,
                    onPointerDown,
                    onPointerUp,
                    enabled,
                    children: ($$payload6) => {
                      popper?.($$payload6, {
                        props: mergeProps(restProps, floatingProps, dismissibleProps, focusScopeProps, { style: { pointerEvents: "auto" } }),
                        wrapperProps
                      });
                      $$payload6.out += `<!---->`;
                    }
                  });
                };
                Dismissible_layer($$payload4, {
                  id,
                  onInteractOutside,
                  onFocusOutside,
                  interactOutsideBehavior,
                  isValidEvent: isValidEvent2,
                  enabled,
                  children
                });
              }
            }
          });
        };
        Focus_scope($$payload2, {
          id,
          onOpenAutoFocus,
          onCloseAutoFocus,
          loop,
          trapFocus: enabled && trapFocus,
          forceMount: restProps.forceMount,
          focusScope
        });
      }
      $$payload2.out += `<!---->`;
    };
    Popper_content($$payload, {
      isStatic,
      id,
      side,
      sideOffset,
      align,
      alignOffset,
      arrowPadding,
      avoidCollisions,
      collisionBoundary,
      collisionPadding,
      sticky,
      hideWhenDetached,
      updatePositionStrategy,
      strategy,
      dir,
      wrapperId,
      style,
      onPlaced,
      customAnchor,
      enabled,
      content,
      $$slots: { content: true }
    });
  }
  pop();
}
function Popper_layer($$payload, $$props) {
  let {
    popper,
    present,
    onEscapeKeydown,
    escapeKeydownBehavior,
    preventOverflowTextSelection,
    id,
    onPointerDown,
    onPointerUp,
    side,
    sideOffset,
    align,
    alignOffset,
    arrowPadding,
    avoidCollisions,
    collisionBoundary,
    collisionPadding,
    sticky,
    hideWhenDetached,
    updatePositionStrategy,
    strategy,
    dir,
    preventScroll,
    wrapperId,
    style,
    onPlaced,
    onInteractOutside,
    onCloseAutoFocus,
    onOpenAutoFocus,
    onFocusOutside,
    interactOutsideBehavior = "close",
    loop,
    trapFocus = true,
    isValidEvent: isValidEvent2 = () => false,
    customAnchor = null,
    isStatic = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  {
    let presence = function($$payload2) {
      Popper_layer_inner($$payload2, spread_props([
        {
          popper,
          onEscapeKeydown,
          escapeKeydownBehavior,
          preventOverflowTextSelection,
          id,
          onPointerDown,
          onPointerUp,
          side,
          sideOffset,
          align,
          alignOffset,
          arrowPadding,
          avoidCollisions,
          collisionBoundary,
          collisionPadding,
          sticky,
          hideWhenDetached,
          updatePositionStrategy,
          strategy,
          dir,
          preventScroll,
          wrapperId,
          style,
          onPlaced,
          customAnchor,
          isStatic,
          enabled: present,
          onInteractOutside,
          onCloseAutoFocus,
          onOpenAutoFocus,
          interactOutsideBehavior,
          loop,
          trapFocus,
          isValidEvent: isValidEvent2,
          onFocusOutside,
          forceMount: false
        },
        restProps
      ]));
    };
    Presence_layer($$payload, spread_props([
      { id, present },
      restProps,
      { presence, $$slots: { presence: true } }
    ]));
  }
}
function Popper_layer_force_mount($$payload, $$props) {
  let {
    popper,
    onEscapeKeydown,
    escapeKeydownBehavior,
    preventOverflowTextSelection,
    id,
    onPointerDown,
    onPointerUp,
    side,
    sideOffset,
    align,
    alignOffset,
    arrowPadding,
    avoidCollisions,
    collisionBoundary,
    collisionPadding,
    sticky,
    hideWhenDetached,
    updatePositionStrategy,
    strategy,
    dir,
    preventScroll,
    wrapperId,
    style,
    onPlaced,
    onInteractOutside,
    onCloseAutoFocus,
    onOpenAutoFocus,
    onFocusOutside,
    interactOutsideBehavior = "close",
    loop,
    trapFocus = true,
    isValidEvent: isValidEvent2 = () => false,
    customAnchor = null,
    isStatic = false,
    enabled,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  Popper_layer_inner($$payload, spread_props([
    {
      popper,
      onEscapeKeydown,
      escapeKeydownBehavior,
      preventOverflowTextSelection,
      id,
      onPointerDown,
      onPointerUp,
      side,
      sideOffset,
      align,
      alignOffset,
      arrowPadding,
      avoidCollisions,
      collisionBoundary,
      collisionPadding,
      sticky,
      hideWhenDetached,
      updatePositionStrategy,
      strategy,
      dir,
      preventScroll,
      wrapperId,
      style,
      onPlaced,
      customAnchor,
      isStatic,
      enabled,
      onInteractOutside,
      onCloseAutoFocus,
      onOpenAutoFocus,
      interactOutsideBehavior,
      loop,
      trapFocus,
      isValidEvent: isValidEvent2,
      onFocusOutside
    },
    restProps,
    { forceMount: true }
  ]));
}
function Select_content$1($$payload, $$props) {
  push();
  let {
    id = useId(),
    ref = null,
    forceMount = false,
    side = "bottom",
    onInteractOutside = noop,
    onEscapeKeydown = noop,
    children,
    child,
    preventScroll = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const contentState = useSelectContent({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    onInteractOutside: box.with(() => onInteractOutside),
    onEscapeKeydown: box.with(() => onEscapeKeydown)
  });
  const mergedProps = mergeProps(restProps, contentState.props);
  if (forceMount) {
    $$payload.out += "<!--[-->";
    {
      let popper = function($$payload2, { props, wrapperProps }) {
        const finalProps = mergeProps(props, { style: contentState.props.style });
        if (child) {
          $$payload2.out += "<!--[-->";
          child($$payload2, {
            props: finalProps,
            wrapperProps,
            ...contentState.snippetProps
          });
          $$payload2.out += `<!---->`;
        } else {
          $$payload2.out += "<!--[!-->";
          $$payload2.out += `<div${spread_attributes({ ...wrapperProps }, null)}><div${spread_attributes({ ...finalProps }, null)}>`;
          children?.($$payload2);
          $$payload2.out += `<!----></div></div>`;
        }
        $$payload2.out += `<!--]-->`;
      };
      Popper_layer_force_mount($$payload, spread_props([
        mergedProps,
        contentState.popperProps,
        {
          side,
          enabled: contentState.root.opts.open.current,
          id,
          preventScroll,
          forceMount: true,
          popper,
          $$slots: { popper: true }
        }
      ]));
    }
  } else if (!forceMount) {
    $$payload.out += "<!--[1-->";
    {
      let popper = function($$payload2, { props, wrapperProps }) {
        const finalProps = mergeProps(props, { style: contentState.props.style });
        if (child) {
          $$payload2.out += "<!--[-->";
          child($$payload2, {
            props: finalProps,
            wrapperProps,
            ...contentState.snippetProps
          });
          $$payload2.out += `<!---->`;
        } else {
          $$payload2.out += "<!--[!-->";
          $$payload2.out += `<div${spread_attributes({ ...wrapperProps }, null)}><div${spread_attributes({ ...finalProps }, null)}>`;
          children?.($$payload2);
          $$payload2.out += `<!----></div></div>`;
        }
        $$payload2.out += `<!--]-->`;
      };
      Popper_layer($$payload, spread_props([
        mergedProps,
        contentState.popperProps,
        {
          side,
          present: contentState.root.opts.open.current,
          id,
          preventScroll,
          forceMount: false,
          popper,
          $$slots: { popper: true }
        }
      ]));
    }
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Mounted($$payload, $$props) {
  push();
  let { mounted = false, onMountedChange = noop } = $$props;
  bind_props($$props, { mounted });
  pop();
}
function Select_item$1($$payload, $$props) {
  push();
  let {
    id = useId(),
    ref = null,
    value,
    label = value,
    disabled = false,
    children,
    child,
    onHighlight = noop,
    onUnhighlight = noop,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const itemState = useSelectItem({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    value: box.with(() => value),
    disabled: box.with(() => disabled),
    label: box.with(() => label),
    onHighlight: box.with(() => onHighlight),
    onUnhighlight: box.with(() => onUnhighlight)
  });
  const mergedProps = mergeProps(restProps, itemState.props);
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    if (child) {
      $$payload2.out += "<!--[-->";
      child($$payload2, { props: mergedProps, ...itemState.snippetProps });
      $$payload2.out += `<!---->`;
    } else {
      $$payload2.out += "<!--[!-->";
      $$payload2.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
      children?.($$payload2, itemState.snippetProps);
      $$payload2.out += `<!----></div>`;
    }
    $$payload2.out += `<!--]--> `;
    Mounted($$payload2, {
      get mounted() {
        return itemState.mounted;
      },
      set mounted($$value) {
        itemState.mounted = $$value;
        $$settled = false;
      }
    });
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Select_viewport($$payload, $$props) {
  push();
  let {
    id = useId(),
    ref = null,
    children,
    child,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const viewportState = useSelectViewport({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, viewportState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Select_scroll_down_button$1($$payload, $$props) {
  push();
  let {
    id = useId(),
    ref = null,
    child,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const scrollButtonState = useSelectScrollDownButton({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, scrollButtonState.props);
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    if (scrollButtonState.canScrollDown) {
      $$payload2.out += "<!--[-->";
      Mounted($$payload2, {
        get mounted() {
          return scrollButtonState.state.mounted;
        },
        set mounted($$value) {
          scrollButtonState.state.mounted = $$value;
          $$settled = false;
        }
      });
      $$payload2.out += `<!----> `;
      if (child) {
        $$payload2.out += "<!--[-->";
        child($$payload2, { props: restProps });
        $$payload2.out += `<!---->`;
      } else {
        $$payload2.out += "<!--[!-->";
        $$payload2.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
        children?.($$payload2);
        $$payload2.out += `<!----></div>`;
      }
      $$payload2.out += `<!--]-->`;
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]-->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Select_scroll_up_button$1($$payload, $$props) {
  push();
  let {
    id = useId(),
    ref = null,
    child,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const scrollButtonState = useSelectScrollUpButton({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, scrollButtonState.props);
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    if (scrollButtonState.canScrollUp) {
      $$payload2.out += "<!--[-->";
      Mounted($$payload2, {
        get mounted() {
          return scrollButtonState.state.mounted;
        },
        set mounted($$value) {
          scrollButtonState.state.mounted = $$value;
          $$settled = false;
        }
      });
      $$payload2.out += `<!----> `;
      if (child) {
        $$payload2.out += "<!--[-->";
        child($$payload2, { props: restProps });
        $$payload2.out += `<!---->`;
      } else {
        $$payload2.out += "<!--[!-->";
        $$payload2.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
        children?.($$payload2);
        $$payload2.out += `<!----></div>`;
      }
      $$payload2.out += `<!--]-->`;
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]-->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
const ROOT_ATTR = "data-label-root";
class LabelRootState {
  opts;
  constructor(opts) {
    this.opts = opts;
    this.onmousedown = this.onmousedown.bind(this);
    useRefById(opts);
  }
  onmousedown(e) {
    if (e.detail > 1) e.preventDefault();
  }
  #props = once(() => ({
    id: this.opts.id.current,
    [ROOT_ATTR]: "",
    onmousedown: this.onmousedown
  }));
  get props() {
    return this.#props();
  }
}
function setLabelRootState(props) {
  return new LabelRootState(props);
}
function Label$1($$payload, $$props) {
  push();
  let {
    children,
    child,
    id = useId(),
    ref = null,
    for: forProp,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const rootState = setLabelRootState({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, rootState.props, { for: forProp });
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<label${spread_attributes({ ...mergedProps, for: forProp }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></label>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function useResizeObserver(node, onResize) {
}
const RADIO_GROUP_ROOT_ATTR = "data-radio-group-root";
const RADIO_GROUP_ITEM_ATTR = "data-radio-group-item";
class RadioGroupRootState {
  opts;
  rovingFocusGroup;
  #hasValue = once(() => this.opts.value.current !== "");
  get hasValue() {
    return this.#hasValue();
  }
  constructor(opts) {
    this.opts = opts;
    this.rovingFocusGroup = useRovingFocus({
      rootNodeId: this.opts.id,
      candidateAttr: RADIO_GROUP_ITEM_ATTR,
      loop: this.opts.loop,
      orientation: this.opts.orientation
    });
    useRefById({ id: this.opts.id, ref: this.opts.ref });
  }
  isChecked(value) {
    return this.opts.value.current === value;
  }
  setValue(value) {
    this.opts.value.current = value;
  }
  #props = once(() => ({
    id: this.opts.id.current,
    role: "radiogroup",
    "aria-required": getAriaRequired(this.opts.required.current),
    "data-disabled": getDataDisabled(this.opts.disabled.current),
    "data-orientation": this.opts.orientation.current,
    [RADIO_GROUP_ROOT_ATTR]: ""
  }));
  get props() {
    return this.#props();
  }
}
class RadioGroupItemState {
  opts;
  root;
  #checked = once(() => this.root.opts.value.current === this.opts.value.current);
  get checked() {
    return this.#checked();
  }
  #isDisabled = once(() => this.opts.disabled.current || this.root.opts.disabled.current);
  #isChecked = once(() => this.root.isChecked(this.opts.value.current));
  #tabIndex = -1;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    useRefById(opts);
    if (this.opts.value.current === this.root.opts.value.current) {
      this.root.rovingFocusGroup.setCurrentTabStopId(this.opts.id.current);
      this.#tabIndex = 0;
    } else if (!this.root.opts.value.current) {
      this.#tabIndex = 0;
    }
    watch(
      [
        () => this.opts.value.current,
        () => this.root.opts.value.current
      ],
      () => {
        if (this.opts.value.current === this.root.opts.value.current) {
          this.root.rovingFocusGroup.setCurrentTabStopId(this.opts.id.current);
          this.#tabIndex = 0;
        }
      }
    );
    this.onclick = this.onclick.bind(this);
    this.onkeydown = this.onkeydown.bind(this);
    this.onfocus = this.onfocus.bind(this);
  }
  onclick(_2) {
    if (this.opts.disabled.current) return;
    this.root.setValue(this.opts.value.current);
  }
  onfocus(_2) {
    if (!this.root.hasValue) return;
    this.root.setValue(this.opts.value.current);
  }
  onkeydown(e) {
    if (this.#isDisabled()) return;
    if (e.key === SPACE) {
      e.preventDefault();
      this.root.setValue(this.opts.value.current);
      return;
    }
    this.root.rovingFocusGroup.handleKeydown(this.opts.ref.current, e, true);
  }
  #snippetProps = once(() => ({ checked: this.#isChecked() }));
  get snippetProps() {
    return this.#snippetProps();
  }
  #props = once(() => ({
    id: this.opts.id.current,
    disabled: this.#isDisabled() ? true : void 0,
    "data-value": this.opts.value.current,
    "data-orientation": this.root.opts.orientation.current,
    "data-disabled": getDataDisabled(this.#isDisabled()),
    "data-state": this.#isChecked() ? "checked" : "unchecked",
    "aria-checked": getAriaChecked(this.#isChecked()),
    [RADIO_GROUP_ITEM_ATTR]: "",
    type: "button",
    role: "radio",
    tabindex: this.#tabIndex,
    //
    onkeydown: this.onkeydown,
    onfocus: this.onfocus,
    onclick: this.onclick
  }));
  get props() {
    return this.#props();
  }
}
class RadioGroupInputState {
  root;
  #shouldRender = once(() => this.root.opts.name.current !== void 0);
  get shouldRender() {
    return this.#shouldRender();
  }
  #props = once(() => ({
    name: this.root.opts.name.current,
    value: this.root.opts.value.current,
    required: this.root.opts.required.current,
    disabled: this.root.opts.disabled.current
  }));
  get props() {
    return this.#props();
  }
  constructor(root) {
    this.root = root;
  }
}
const RadioGroupRootContext = new Context("RadioGroup.Root");
function useRadioGroupRoot(props) {
  return RadioGroupRootContext.set(new RadioGroupRootState(props));
}
function useRadioGroupItem(props) {
  return new RadioGroupItemState(props, RadioGroupRootContext.get());
}
function useRadioGroupInput() {
  return new RadioGroupInputState(RadioGroupRootContext.get());
}
function Radio_group_input($$payload, $$props) {
  push();
  const inputState = useRadioGroupInput();
  if (inputState.shouldRender) {
    $$payload.out += "<!--[-->";
    Hidden_input($$payload, spread_props([inputState.props]));
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  pop();
}
function Radio_group$1($$payload, $$props) {
  push();
  let {
    disabled = false,
    children,
    child,
    value = "",
    ref = null,
    orientation = "vertical",
    loop = true,
    name = void 0,
    required = false,
    id = useId(),
    onValueChange = noop,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const rootState = useRadioGroupRoot({
    orientation: box.with(() => orientation),
    disabled: box.with(() => disabled),
    loop: box.with(() => loop),
    name: box.with(() => name),
    required: box.with(() => required),
    id: box.with(() => id),
    value: box.with(() => value, (v) => {
      if (v === value) return;
      value = v;
      onValueChange?.(v);
    }),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, rootState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]--> `;
  Radio_group_input($$payload);
  $$payload.out += `<!---->`;
  bind_props($$props, { value, ref });
  pop();
}
function Radio_group_item$1($$payload, $$props) {
  push();
  let {
    id = useId(),
    children,
    child,
    value,
    disabled = false,
    ref = null,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const itemState = useRadioGroupItem({
    value: box.with(() => value),
    disabled: box.with(() => disabled ?? false),
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, itemState.props);
  const paraglide_sveltekit_translate_attribute_pass_translationFunctions = getTranslationFunctions();
  const [
    paraglide_sveltekit_translate_attribute_pass_translateAttribute,
    paraglide_sveltekit_translate_attribute_pass_handle_attributes
  ] = paraglide_sveltekit_translate_attribute_pass_translationFunctions;
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps, ...itemState.snippetProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<button${spread_attributes(
      {
        ...paraglide_sveltekit_translate_attribute_pass_handle_attributes({ ...mergedProps }, [{ attribute_name: "formaction" }])
      },
      null
    )}>`;
    children?.($$payload, itemState.snippetProps);
    $$payload.out += `<!----></button>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}
const SCROLL_AREA_ROOT_ATTR = "data-scroll-area-root";
const SCROLL_AREA_VIEWPORT_ATTR = "data-scroll-area-viewport";
const SCROLL_AREA_CORNER_ATTR = "data-scroll-area-corner";
const SCROLL_AREA_THUMB_ATTR = "data-scroll-area-thumb";
const SCROLL_AREA_SCROLLBAR_ATTR = "data-scroll-area-scrollbar";
class ScrollAreaRootState {
  opts;
  scrollAreaNode = null;
  viewportNode = null;
  contentNode = null;
  scrollbarXNode = null;
  scrollbarYNode = null;
  cornerWidth = 0;
  cornerHeight = 0;
  scrollbarXEnabled = false;
  scrollbarYEnabled = false;
  constructor(opts) {
    this.opts = opts;
    useRefById({
      ...opts,
      onRefChange: (node) => {
        this.scrollAreaNode = node;
      }
    });
  }
  #props = once(() => ({
    id: this.opts.id.current,
    dir: this.opts.dir.current,
    style: {
      position: "relative",
      "--bits-scroll-area-corner-height": `${this.cornerHeight}px`,
      "--bits-scroll-area-corner-width": `${this.cornerWidth}px`
    },
    [SCROLL_AREA_ROOT_ATTR]: ""
  }));
  get props() {
    return this.#props();
  }
}
class ScrollAreaViewportState {
  opts;
  root;
  #contentId = box(useId());
  #contentRef = box(null);
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    useRefById({
      ...opts,
      onRefChange: (node) => {
        this.root.viewportNode = node;
      }
    });
    useRefById({
      id: this.#contentId,
      ref: this.#contentRef,
      onRefChange: (node) => {
        this.root.contentNode = node;
      }
    });
  }
  #props = once(() => ({
    id: this.opts.id.current,
    style: {
      overflowX: this.root.scrollbarXEnabled ? "scroll" : "hidden",
      overflowY: this.root.scrollbarYEnabled ? "scroll" : "hidden"
    },
    [SCROLL_AREA_VIEWPORT_ATTR]: ""
  }));
  get props() {
    return this.#props();
  }
  #contentProps = once(() => ({
    id: this.#contentId.current,
    "data-scroll-area-content": "",
    /**
     * When horizontal scrollbar is visible: this element should be at least
     * as wide as its children for size calculations to work correctly.
     *
     * When horizontal scrollbar is NOT visible: this element's width should
     * be constrained by the parent container to enable `text-overflow: ellipsis`
     */
    style: {
      minWidth: this.root.scrollbarXEnabled ? "fit-content" : void 0
    }
  }));
  get contentProps() {
    return this.#contentProps();
  }
}
class ScrollAreaScrollbarState {
  opts;
  root;
  #isHorizontal = once(() => this.opts.orientation.current === "horizontal");
  get isHorizontal() {
    return this.#isHorizontal();
  }
  hasThumb = false;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
  }
}
class ScrollAreaScrollbarHoverState {
  scrollbar;
  root;
  isVisible = false;
  constructor(scrollbar) {
    this.scrollbar = scrollbar;
    this.root = scrollbar.root;
  }
  #props = once(() => ({
    "data-state": this.isVisible ? "visible" : "hidden"
  }));
  get props() {
    return this.#props();
  }
}
class ScrollAreaScrollbarScrollState {
  scrollbar;
  root;
  machine = useStateMachine("hidden", {
    hidden: { SCROLL: "scrolling" },
    scrolling: {
      SCROLL_END: "idle",
      POINTER_ENTER: "interacting"
    },
    interacting: { SCROLL: "interacting", POINTER_LEAVE: "idle" },
    idle: {
      HIDE: "hidden",
      SCROLL: "scrolling",
      POINTER_ENTER: "interacting"
    }
  });
  #isHidden = once(() => this.machine.state.current === "hidden");
  get isHidden() {
    return this.#isHidden();
  }
  constructor(scrollbar) {
    this.scrollbar = scrollbar;
    this.root = scrollbar.root;
    useDebounce(() => this.machine.dispatch("SCROLL_END"), 100);
    this.onpointerenter = this.onpointerenter.bind(this);
    this.onpointerleave = this.onpointerleave.bind(this);
  }
  onpointerenter(_2) {
    this.machine.dispatch("POINTER_ENTER");
  }
  onpointerleave(_2) {
    this.machine.dispatch("POINTER_LEAVE");
  }
  #props = once(() => ({
    "data-state": this.machine.state.current === "hidden" ? "hidden" : "visible",
    onpointerenter: this.onpointerenter,
    onpointerleave: this.onpointerleave
  }));
  get props() {
    return this.#props();
  }
}
class ScrollAreaScrollbarAutoState {
  scrollbar;
  root;
  isVisible = false;
  constructor(scrollbar) {
    this.scrollbar = scrollbar;
    this.root = scrollbar.root;
    useDebounce(
      () => {
        const viewportNode = this.root.viewportNode;
        if (!viewportNode) return;
        const isOverflowX = viewportNode.offsetWidth < viewportNode.scrollWidth;
        const isOverflowY = viewportNode.offsetHeight < viewportNode.scrollHeight;
        this.isVisible = this.scrollbar.isHorizontal ? isOverflowX : isOverflowY;
      },
      10
    );
  }
  #props = once(() => ({
    "data-state": this.isVisible ? "visible" : "hidden"
  }));
  get props() {
    return this.#props();
  }
}
class ScrollAreaScrollbarVisibleState {
  scrollbar;
  root;
  thumbNode = null;
  pointerOffset = 0;
  sizes = {
    content: 0,
    viewport: 0,
    scrollbar: { size: 0, paddingStart: 0, paddingEnd: 0 }
  };
  #thumbRatio = once(() => getThumbRatio(this.sizes.viewport, this.sizes.content));
  get thumbRatio() {
    return this.#thumbRatio();
  }
  #hasThumb = once(() => Boolean(this.thumbRatio > 0 && this.thumbRatio < 1));
  get hasThumb() {
    return this.#hasThumb();
  }
  prevTransformStyle = "";
  constructor(scrollbar) {
    this.scrollbar = scrollbar;
    this.root = scrollbar.root;
  }
  setSizes(sizes) {
    this.sizes = sizes;
  }
  getScrollPosition(pointerPos, dir) {
    return getScrollPositionFromPointer({
      pointerPos,
      pointerOffset: this.pointerOffset,
      sizes: this.sizes,
      dir
    });
  }
  onThumbPointerUp() {
    this.pointerOffset = 0;
  }
  onThumbPointerDown(pointerPos) {
    this.pointerOffset = pointerPos;
  }
  xOnThumbPositionChange() {
    if (!(this.root.viewportNode && this.thumbNode)) return;
    const scrollPos = this.root.viewportNode.scrollLeft;
    const offset = getThumbOffsetFromScroll({
      scrollPos,
      sizes: this.sizes,
      dir: this.root.opts.dir.current
    });
    const transformStyle = `translate3d(${offset}px, 0, 0)`;
    this.thumbNode.style.transform = transformStyle;
  }
  xOnWheelScroll(scrollPos) {
    if (!this.root.viewportNode) return;
    this.root.viewportNode.scrollLeft = scrollPos;
  }
  xOnDragScroll(pointerPos) {
    if (!this.root.viewportNode) return;
    this.root.viewportNode.scrollLeft = this.getScrollPosition(pointerPos, this.root.opts.dir.current);
  }
  yOnThumbPositionChange() {
    if (!(this.root.viewportNode && this.thumbNode)) return;
    const scrollPos = this.root.viewportNode.scrollTop;
    const offset = getThumbOffsetFromScroll({ scrollPos, sizes: this.sizes });
    const transformStyle = `translate3d(0, ${offset}px, 0)`;
    this.thumbNode.style.transform = transformStyle;
  }
  yOnWheelScroll(scrollPos) {
    if (!this.root.viewportNode) return;
    this.root.viewportNode.scrollTop = scrollPos;
  }
  yOnDragScroll(pointerPos) {
    if (!this.root.viewportNode) return;
    this.root.viewportNode.scrollTop = this.getScrollPosition(pointerPos, this.root.opts.dir.current);
  }
}
class ScrollAreaScrollbarXState {
  opts;
  scrollbarVis;
  root;
  computedStyle;
  scrollbar;
  constructor(opts, scrollbarVis) {
    this.opts = opts;
    this.scrollbarVis = scrollbarVis;
    this.scrollbarVis = scrollbarVis;
    this.root = scrollbarVis.root;
    this.scrollbar = scrollbarVis.scrollbar;
    useRefById({
      ...this.scrollbar.opts,
      onRefChange: (node) => {
        this.root.scrollbarXNode = node;
      },
      deps: () => this.opts.mounted.current
    });
  }
  onThumbPointerDown = (pointerPos) => {
    this.scrollbarVis.onThumbPointerDown(pointerPos.x);
  };
  onDragScroll = (pointerPos) => {
    this.scrollbarVis.xOnDragScroll(pointerPos.x);
  };
  onThumbPointerUp = () => {
    this.scrollbarVis.onThumbPointerUp();
  };
  onThumbPositionChange = () => {
    this.scrollbarVis.xOnThumbPositionChange();
  };
  onWheelScroll = (e, maxScrollPos) => {
    if (!this.root.viewportNode) return;
    const scrollPos = this.root.viewportNode.scrollLeft + e.deltaX;
    this.scrollbarVis.xOnWheelScroll(scrollPos);
    if (isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos)) {
      e.preventDefault();
    }
  };
  onResize = () => {
    if (!(this.scrollbar.opts.ref.current && this.root.viewportNode && this.computedStyle)) return;
    this.scrollbarVis.setSizes({
      content: this.root.viewportNode.scrollWidth,
      viewport: this.root.viewportNode.offsetWidth,
      scrollbar: {
        size: this.scrollbar.opts.ref.current.clientWidth,
        paddingStart: toInt(this.computedStyle.paddingLeft),
        paddingEnd: toInt(this.computedStyle.paddingRight)
      }
    });
  };
  #thumbSize = once(() => {
    return getThumbSize(this.scrollbarVis.sizes);
  });
  get thumbSize() {
    return this.#thumbSize();
  }
  #props = once(() => ({
    id: this.scrollbar.opts.id.current,
    "data-orientation": "horizontal",
    style: {
      bottom: 0,
      left: this.root.opts.dir.current === "rtl" ? "var(--bits-scroll-area-corner-width)" : 0,
      right: this.root.opts.dir.current === "ltr" ? "var(--bits-scroll-area-corner-width)" : 0,
      "--bits-scroll-area-thumb-width": `${this.thumbSize}px`
    }
  }));
  get props() {
    return this.#props();
  }
}
class ScrollAreaScrollbarYState {
  opts;
  scrollbarVis;
  root;
  scrollbar;
  computedStyle;
  constructor(opts, scrollbarVis) {
    this.opts = opts;
    this.scrollbarVis = scrollbarVis;
    this.root = scrollbarVis.root;
    this.scrollbar = scrollbarVis.scrollbar;
    useRefById({
      ...this.scrollbar.opts,
      onRefChange: (node) => {
        this.root.scrollbarYNode = node;
      },
      deps: () => this.opts.mounted.current
    });
    this.onThumbPointerDown = this.onThumbPointerDown.bind(this);
    this.onDragScroll = this.onDragScroll.bind(this);
    this.onThumbPointerUp = this.onThumbPointerUp.bind(this);
    this.onThumbPositionChange = this.onThumbPositionChange.bind(this);
    this.onWheelScroll = this.onWheelScroll.bind(this);
    this.onResize = this.onResize.bind(this);
  }
  onThumbPointerDown(pointerPos) {
    this.scrollbarVis.onThumbPointerDown(pointerPos.y);
  }
  onDragScroll(pointerPos) {
    this.scrollbarVis.yOnDragScroll(pointerPos.y);
  }
  onThumbPointerUp() {
    this.scrollbarVis.onThumbPointerUp();
  }
  onThumbPositionChange() {
    this.scrollbarVis.yOnThumbPositionChange();
  }
  onWheelScroll(e, maxScrollPos) {
    if (!this.root.viewportNode) return;
    const scrollPos = this.root.viewportNode.scrollTop + e.deltaY;
    this.scrollbarVis.yOnWheelScroll(scrollPos);
    if (isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos)) {
      e.preventDefault();
    }
  }
  onResize() {
    if (!(this.scrollbar.opts.ref.current && this.root.viewportNode && this.computedStyle)) return;
    this.scrollbarVis.setSizes({
      content: this.root.viewportNode.scrollHeight,
      viewport: this.root.viewportNode.offsetHeight,
      scrollbar: {
        size: this.scrollbar.opts.ref.current.clientHeight,
        paddingStart: toInt(this.computedStyle.paddingTop),
        paddingEnd: toInt(this.computedStyle.paddingBottom)
      }
    });
  }
  #thumbSize = once(() => {
    return getThumbSize(this.scrollbarVis.sizes);
  });
  get thumbSize() {
    return this.#thumbSize();
  }
  #props = once(() => ({
    id: this.scrollbar.opts.id.current,
    "data-orientation": "vertical",
    style: {
      top: 0,
      right: this.root.opts.dir.current === "ltr" ? 0 : void 0,
      left: this.root.opts.dir.current === "rtl" ? 0 : void 0,
      bottom: "var(--bits-scroll-area-corner-height)",
      "--bits-scroll-area-thumb-height": `${this.thumbSize}px`
    }
  }));
  get props() {
    return this.#props();
  }
}
class ScrollAreaScrollbarSharedState {
  scrollbarState;
  root;
  scrollbarVis;
  scrollbar;
  rect = null;
  prevWebkitUserSelect = "";
  handleResize;
  handleThumbPositionChange;
  handleWheelScroll;
  handleThumbPointerDown;
  handleThumbPointerUp;
  #maxScrollPos = once(() => this.scrollbarVis.sizes.content - this.scrollbarVis.sizes.viewport);
  get maxScrollPos() {
    return this.#maxScrollPos();
  }
  constructor(scrollbarState) {
    this.scrollbarState = scrollbarState;
    this.root = scrollbarState.root;
    this.scrollbarVis = scrollbarState.scrollbarVis;
    this.scrollbar = scrollbarState.scrollbarVis.scrollbar;
    this.handleResize = useDebounce(() => this.scrollbarState.onResize(), 10);
    this.handleThumbPositionChange = this.scrollbarState.onThumbPositionChange;
    this.handleWheelScroll = this.scrollbarState.onWheelScroll;
    this.handleThumbPointerDown = this.scrollbarState.onThumbPointerDown;
    this.handleThumbPointerUp = this.scrollbarState.onThumbPointerUp;
    useResizeObserver(() => this.scrollbar.opts.ref.current, this.handleResize);
    useResizeObserver(() => this.root.contentNode, this.handleResize);
    this.onpointerdown = this.onpointerdown.bind(this);
    this.onpointermove = this.onpointermove.bind(this);
    this.onpointerup = this.onpointerup.bind(this);
  }
  handleDragScroll(e) {
    if (!this.rect) return;
    const x = e.clientX - this.rect.left;
    const y = e.clientY - this.rect.top;
    this.scrollbarState.onDragScroll({ x, y });
  }
  onpointerdown(e) {
    if (e.button !== 0) return;
    const target = e.target;
    target.setPointerCapture(e.pointerId);
    this.rect = this.scrollbar.opts.ref.current?.getBoundingClientRect() ?? null;
    this.prevWebkitUserSelect = document.body.style.webkitUserSelect;
    document.body.style.webkitUserSelect = "none";
    if (this.root.viewportNode) this.root.viewportNode.style.scrollBehavior = "auto";
    this.handleDragScroll(e);
  }
  onpointermove(e) {
    this.handleDragScroll(e);
  }
  onpointerup(e) {
    const target = e.target;
    if (target.hasPointerCapture(e.pointerId)) {
      target.releasePointerCapture(e.pointerId);
    }
    document.body.style.webkitUserSelect = this.prevWebkitUserSelect;
    if (this.root.viewportNode) this.root.viewportNode.style.scrollBehavior = "";
    this.rect = null;
  }
  #props = once(() => mergeProps({
    ...this.scrollbarState.props,
    style: {
      position: "absolute",
      ...this.scrollbarState.props.style
    },
    [SCROLL_AREA_SCROLLBAR_ATTR]: "",
    onpointerdown: this.onpointerdown,
    onpointermove: this.onpointermove,
    onpointerup: this.onpointerup
  }));
  get props() {
    return this.#props();
  }
}
class ScrollAreaThumbImplState {
  opts;
  scrollbarState;
  #root;
  #removeUnlinkedScrollListener;
  #debounceScrollEnd = useDebounce(
    () => {
      if (this.#removeUnlinkedScrollListener) {
        this.#removeUnlinkedScrollListener();
        this.#removeUnlinkedScrollListener = void 0;
      }
    },
    100
  );
  constructor(opts, scrollbarState) {
    this.opts = opts;
    this.scrollbarState = scrollbarState;
    this.#root = scrollbarState.root;
    useRefById({
      ...opts,
      onRefChange: (node) => {
        this.scrollbarState.scrollbarVis.thumbNode = node;
      },
      deps: () => this.opts.mounted.current
    });
    this.onpointerdowncapture = this.onpointerdowncapture.bind(this);
    this.onpointerup = this.onpointerup.bind(this);
  }
  onpointerdowncapture(e) {
    const thumb = e.target;
    if (!thumb) return;
    const thumbRect = thumb.getBoundingClientRect();
    const x = e.clientX - thumbRect.left;
    const y = e.clientY - thumbRect.top;
    this.scrollbarState.handleThumbPointerDown({ x, y });
  }
  onpointerup(_2) {
    this.scrollbarState.handleThumbPointerUp();
  }
  #props = once(() => ({
    id: this.opts.id.current,
    "data-state": this.scrollbarState.scrollbarVis.hasThumb ? "visible" : "hidden",
    style: {
      width: "var(--bits-scroll-area-thumb-width)",
      height: "var(--bits-scroll-area-thumb-height)",
      transform: this.scrollbarState.scrollbarVis.prevTransformStyle
    },
    onpointerdowncapture: this.onpointerdowncapture,
    onpointerup: this.onpointerup,
    [SCROLL_AREA_THUMB_ATTR]: ""
  }));
  get props() {
    return this.#props();
  }
}
class ScrollAreaCornerImplState {
  opts;
  root;
  #width = 0;
  #height = 0;
  #hasSize = once(() => Boolean(this.#width && this.#height));
  get hasSize() {
    return this.#hasSize();
  }
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    useRefById(opts);
  }
  #props = once(() => ({
    id: this.opts.id.current,
    style: {
      width: this.#width,
      height: this.#height,
      position: "absolute",
      right: this.root.opts.dir.current === "ltr" ? 0 : void 0,
      left: this.root.opts.dir.current === "rtl" ? 0 : void 0,
      bottom: 0
    },
    [SCROLL_AREA_CORNER_ATTR]: ""
  }));
  get props() {
    return this.#props();
  }
}
const ScrollAreaRootContext = new Context("ScrollArea.Root");
const ScrollAreaScrollbarContext = new Context("ScrollArea.Scrollbar");
const ScrollAreaScrollbarVisibleContext = new Context("ScrollArea.ScrollbarVisible");
const ScrollAreaScrollbarAxisContext = new Context("ScrollArea.ScrollbarAxis");
const ScrollAreaScrollbarSharedContext = new Context("ScrollArea.ScrollbarShared");
function useScrollAreaRoot(props) {
  return ScrollAreaRootContext.set(new ScrollAreaRootState(props));
}
function useScrollAreaViewport(props) {
  return new ScrollAreaViewportState(props, ScrollAreaRootContext.get());
}
function useScrollAreaScrollbar(props) {
  return ScrollAreaScrollbarContext.set(new ScrollAreaScrollbarState(props, ScrollAreaRootContext.get()));
}
function useScrollAreaScrollbarVisible() {
  return ScrollAreaScrollbarVisibleContext.set(new ScrollAreaScrollbarVisibleState(ScrollAreaScrollbarContext.get()));
}
function useScrollAreaScrollbarAuto() {
  return new ScrollAreaScrollbarAutoState(ScrollAreaScrollbarContext.get());
}
function useScrollAreaScrollbarScroll() {
  return new ScrollAreaScrollbarScrollState(ScrollAreaScrollbarContext.get());
}
function useScrollAreaScrollbarHover() {
  return new ScrollAreaScrollbarHoverState(ScrollAreaScrollbarContext.get());
}
function useScrollAreaScrollbarX(props) {
  return ScrollAreaScrollbarAxisContext.set(new ScrollAreaScrollbarXState(props, ScrollAreaScrollbarVisibleContext.get()));
}
function useScrollAreaScrollbarY(props) {
  return ScrollAreaScrollbarAxisContext.set(new ScrollAreaScrollbarYState(props, ScrollAreaScrollbarVisibleContext.get()));
}
function useScrollAreaScrollbarShared() {
  return ScrollAreaScrollbarSharedContext.set(new ScrollAreaScrollbarSharedState(ScrollAreaScrollbarAxisContext.get()));
}
function useScrollAreaThumb(props) {
  return new ScrollAreaThumbImplState(props, ScrollAreaScrollbarSharedContext.get());
}
function useScrollAreaCorner(props) {
  return new ScrollAreaCornerImplState(props, ScrollAreaRootContext.get());
}
function toInt(value) {
  return value ? Number.parseInt(value, 10) : 0;
}
function getThumbRatio(viewportSize, contentSize) {
  const ratio = viewportSize / contentSize;
  return Number.isNaN(ratio) ? 0 : ratio;
}
function getThumbSize(sizes) {
  const ratio = getThumbRatio(sizes.viewport, sizes.content);
  const scrollbarPadding = sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd;
  const thumbSize = (sizes.scrollbar.size - scrollbarPadding) * ratio;
  return Math.max(thumbSize, 18);
}
function getScrollPositionFromPointer({
  pointerPos,
  pointerOffset,
  sizes,
  dir = "ltr"
}) {
  const thumbSizePx = getThumbSize(sizes);
  const thumbCenter = thumbSizePx / 2;
  const offset = pointerOffset || thumbCenter;
  const thumbOffsetFromEnd = thumbSizePx - offset;
  const minPointerPos = sizes.scrollbar.paddingStart + offset;
  const maxPointerPos = sizes.scrollbar.size - sizes.scrollbar.paddingEnd - thumbOffsetFromEnd;
  const maxScrollPos = sizes.content - sizes.viewport;
  const scrollRange = dir === "ltr" ? [0, maxScrollPos] : [maxScrollPos * -1, 0];
  const interpolate = linearScale([minPointerPos, maxPointerPos], scrollRange);
  return interpolate(pointerPos);
}
function getThumbOffsetFromScroll({ scrollPos, sizes, dir = "ltr" }) {
  const thumbSizePx = getThumbSize(sizes);
  const scrollbarPadding = sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd;
  const scrollbar = sizes.scrollbar.size - scrollbarPadding;
  const maxScrollPos = sizes.content - sizes.viewport;
  const maxThumbPos = scrollbar - thumbSizePx;
  const scrollClampRange = dir === "ltr" ? [0, maxScrollPos] : [maxScrollPos * -1, 0];
  const scrollWithoutMomentum = clamp(scrollPos, scrollClampRange[0], scrollClampRange[1]);
  const interpolate = linearScale([0, maxScrollPos], [0, maxThumbPos]);
  return interpolate(scrollWithoutMomentum);
}
function linearScale(input, output) {
  return (value) => {
    if (input[0] === input[1] || output[0] === output[1]) return output[0];
    const ratio = (output[1] - output[0]) / (input[1] - input[0]);
    return output[0] + ratio * (value - input[0]);
  };
}
function isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos) {
  return scrollPos > 0 && scrollPos < maxScrollPos;
}
function Scroll_area$1($$payload, $$props) {
  push();
  let {
    ref = null,
    id = useId(),
    type = "hover",
    dir = "ltr",
    scrollHideDelay = 600,
    children,
    child,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const rootState = useScrollAreaRoot({
    type: box.with(() => type),
    dir: box.with(() => dir),
    scrollHideDelay: box.with(() => scrollHideDelay),
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, rootState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Scroll_area_viewport($$payload, $$props) {
  push();
  let {
    ref = null,
    id = useId(),
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const viewportState = useScrollAreaViewport({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, viewportState.props);
  const mergedContentProps = mergeProps({}, viewportState.contentProps);
  $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}><div${spread_attributes({ ...mergedContentProps }, null)}>`;
  children?.($$payload);
  $$payload.out += `<!----></div></div>`;
  bind_props($$props, { ref });
  pop();
}
function Scroll_area_scrollbar_shared($$payload, $$props) {
  push();
  let {
    child,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const scrollbarSharedState = useScrollAreaScrollbarShared();
  const mergedProps = mergeProps(restProps, scrollbarSharedState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  pop();
}
function Scroll_area_scrollbar_x($$payload, $$props) {
  push();
  let { $$slots, $$events, ...restProps } = $$props;
  const isMounted = new IsMounted();
  const scrollbarXState = useScrollAreaScrollbarX({ mounted: box.with(() => isMounted.current) });
  const mergedProps = mergeProps(restProps, scrollbarXState.props);
  Scroll_area_scrollbar_shared($$payload, spread_props([mergedProps]));
  pop();
}
function Scroll_area_scrollbar_y($$payload, $$props) {
  push();
  let { $$slots, $$events, ...restProps } = $$props;
  const isMounted = new IsMounted();
  const scrollbarYState = useScrollAreaScrollbarY({ mounted: box.with(() => isMounted.current) });
  const mergedProps = mergeProps(restProps, scrollbarYState.props);
  Scroll_area_scrollbar_shared($$payload, spread_props([mergedProps]));
  pop();
}
function Scroll_area_scrollbar_visible($$payload, $$props) {
  push();
  let { $$slots, $$events, ...restProps } = $$props;
  const scrollbarVisibleState = useScrollAreaScrollbarVisible();
  if (scrollbarVisibleState.scrollbar.opts.orientation.current === "horizontal") {
    $$payload.out += "<!--[-->";
    Scroll_area_scrollbar_x($$payload, spread_props([restProps]));
  } else {
    $$payload.out += "<!--[!-->";
    Scroll_area_scrollbar_y($$payload, spread_props([restProps]));
  }
  $$payload.out += `<!--]-->`;
  pop();
}
function Scroll_area_scrollbar_auto($$payload, $$props) {
  push();
  let {
    forceMount = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const scrollbarAutoState = useScrollAreaScrollbarAuto();
  const mergedProps = mergeProps(restProps, scrollbarAutoState.props);
  {
    let presence = function($$payload2) {
      Scroll_area_scrollbar_visible($$payload2, spread_props([mergedProps]));
    };
    Presence_layer($$payload, spread_props([
      {
        present: forceMount || scrollbarAutoState.isVisible
      },
      mergedProps,
      { presence, $$slots: { presence: true } }
    ]));
  }
  pop();
}
function Scroll_area_scrollbar_scroll($$payload, $$props) {
  push();
  let {
    forceMount = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const scrollbarScrollState = useScrollAreaScrollbarScroll();
  const mergedProps = mergeProps(restProps, scrollbarScrollState.props);
  {
    let presence = function($$payload2) {
      Scroll_area_scrollbar_visible($$payload2, spread_props([mergedProps]));
    };
    Presence_layer($$payload, spread_props([
      mergedProps,
      {
        present: forceMount || !scrollbarScrollState.isHidden,
        presence,
        $$slots: { presence: true }
      }
    ]));
  }
  pop();
}
function Scroll_area_scrollbar_hover($$payload, $$props) {
  push();
  let {
    forceMount = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const scrollbarHoverState = useScrollAreaScrollbarHover();
  const scrollbarAutoState = useScrollAreaScrollbarAuto();
  const mergedProps = mergeProps(restProps, scrollbarHoverState.props, scrollbarAutoState.props, {
    "data-state": scrollbarHoverState.isVisible ? "visible" : "hidden"
  });
  const present = forceMount || scrollbarHoverState.isVisible && scrollbarAutoState.isVisible;
  {
    let presence = function($$payload2) {
      Scroll_area_scrollbar_visible($$payload2, spread_props([mergedProps]));
    };
    Presence_layer($$payload, spread_props([
      mergedProps,
      {
        present,
        presence,
        $$slots: { presence: true }
      }
    ]));
  }
  pop();
}
function Scroll_area_scrollbar$1($$payload, $$props) {
  push();
  let {
    ref = null,
    id = useId(),
    orientation,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const scrollbarState = useScrollAreaScrollbar({
    orientation: box.with(() => orientation),
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const type = scrollbarState.root.opts.type.current;
  if (type === "hover") {
    $$payload.out += "<!--[-->";
    Scroll_area_scrollbar_hover($$payload, spread_props([restProps, { id }]));
  } else if (type === "scroll") {
    $$payload.out += "<!--[1-->";
    Scroll_area_scrollbar_scroll($$payload, spread_props([restProps, { id }]));
  } else if (type === "auto") {
    $$payload.out += "<!--[2-->";
    Scroll_area_scrollbar_auto($$payload, spread_props([restProps, { id }]));
  } else if (type === "always") {
    $$payload.out += "<!--[3-->";
    Scroll_area_scrollbar_visible($$payload, spread_props([restProps, { id }]));
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Scroll_area_thumb_impl($$payload, $$props) {
  push();
  let {
    ref = null,
    id,
    child,
    children,
    present,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const isMounted = new IsMounted();
  const thumbState = useScrollAreaThumb({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    mounted: box.with(() => isMounted.current)
  });
  const mergedProps = mergeProps(restProps, thumbState.props, { style: { hidden: !present } });
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Scroll_area_thumb($$payload, $$props) {
  push();
  let {
    id = useId(),
    ref = null,
    forceMount = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const scrollbarState = ScrollAreaScrollbarVisibleContext.get();
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    {
      let presence = function($$payload3, { present }) {
        Scroll_area_thumb_impl($$payload3, spread_props([
          restProps,
          {
            id,
            present: present.current,
            get ref() {
              return ref;
            },
            set ref($$value) {
              ref = $$value;
              $$settled = false;
            }
          }
        ]));
      };
      Presence_layer($$payload2, spread_props([
        { present: forceMount || scrollbarState.hasThumb },
        restProps,
        { id, presence, $$slots: { presence: true } }
      ]));
    }
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Scroll_area_corner_impl($$payload, $$props) {
  push();
  let {
    ref = null,
    id,
    children,
    child,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const cornerState = useScrollAreaCorner({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, cornerState.props);
  if (child) {
    $$payload.out += "<!--[-->";
    child($$payload, { props: mergedProps });
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${spread_attributes({ ...mergedProps }, null)}>`;
    children?.($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Scroll_area_corner($$payload, $$props) {
  push();
  let {
    ref = null,
    id = useId(),
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const scrollAreaState = ScrollAreaRootContext.get();
  const hasBothScrollbarsVisible = Boolean(scrollAreaState.scrollbarXNode && scrollAreaState.scrollbarYNode);
  const hasCorner = scrollAreaState.opts.type.current !== "scroll" && hasBothScrollbarsVisible;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    if (hasCorner) {
      $$payload2.out += "<!--[-->";
      Scroll_area_corner_impl($$payload2, spread_props([
        restProps,
        {
          id,
          get ref() {
            return ref;
          },
          set ref($$value) {
            ref = $$value;
            $$settled = false;
          }
        }
      ]));
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]-->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Select($$payload, $$props) {
  push();
  let {
    value = void 0,
    onValueChange = noop,
    name = "",
    disabled = false,
    type,
    open = false,
    onOpenChange = noop,
    loop = false,
    scrollAlignment = "nearest",
    required = false,
    items = [],
    allowDeselect = false,
    children
  } = $$props;
  if (value === void 0) {
    const defaultValue = type === "single" ? "" : [];
    value = defaultValue;
  }
  const rootState = useSelectRoot({
    type,
    value: box.with(() => value, (v) => {
      value = v;
      onValueChange(v);
    }),
    disabled: box.with(() => disabled),
    required: box.with(() => required),
    open: box.with(() => open, (v) => {
      open = v;
      onOpenChange(v);
    }),
    loop: box.with(() => loop),
    scrollAlignment: box.with(() => scrollAlignment),
    name: box.with(() => name),
    isCombobox: false,
    items: box.with(() => items),
    allowDeselect: box.with(() => allowDeselect)
  });
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    Floating_layer($$payload2, {
      children: ($$payload3) => {
        children?.($$payload3);
        $$payload3.out += `<!---->`;
      }
    });
    $$payload2.out += `<!----> `;
    if (Array.isArray(rootState.opts.value.current)) {
      $$payload2.out += "<!--[-->";
      if (rootState.opts.value.current.length) {
        $$payload2.out += "<!--[-->";
        const each_array = ensure_array_like(rootState.opts.value.current);
        $$payload2.out += `<!--[-->`;
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let item = each_array[$$index];
          Select_hidden_input($$payload2, { value: item });
        }
        $$payload2.out += `<!--]-->`;
      } else {
        $$payload2.out += "<!--[!-->";
      }
      $$payload2.out += `<!--]-->`;
    } else {
      $$payload2.out += "<!--[!-->";
      Select_hidden_input($$payload2, {
        get value() {
          return rootState.opts.value.current;
        },
        set value($$value) {
          rootState.opts.value.current = $$value;
          $$settled = false;
        }
      });
    }
    $$payload2.out += `<!--]-->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { value, open });
  pop();
}
function Select_trigger$1($$payload, $$props) {
  push();
  let {
    id = useId(),
    ref = null,
    child,
    children,
    type = "button",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const triggerState = useSelectTrigger({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, triggerState.props, { type });
  const paraglide_sveltekit_translate_attribute_pass_translationFunctions = getTranslationFunctions();
  const [
    paraglide_sveltekit_translate_attribute_pass_translateAttribute,
    paraglide_sveltekit_translate_attribute_pass_handle_attributes
  ] = paraglide_sveltekit_translate_attribute_pass_translationFunctions;
  $$payload.out += `<!---->`;
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
  $$payload.out += `<!---->`;
  bind_props($$props, { ref });
  pop();
}
function Tooltip_content$1($$payload, $$props) {
  push();
  let {
    children,
    child,
    id = useId(),
    ref = null,
    side = "top",
    sideOffset = 0,
    align = "center",
    avoidCollisions = true,
    arrowPadding = 0,
    sticky = "partial",
    hideWhenDetached = false,
    collisionPadding = 0,
    onInteractOutside = noop,
    onEscapeKeydown = noop,
    forceMount = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const contentState = useTooltipContent({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    onInteractOutside: box.with(() => onInteractOutside),
    onEscapeKeydown: box.with(() => onEscapeKeydown)
  });
  const floatingProps = {
    side,
    sideOffset,
    align,
    avoidCollisions,
    arrowPadding,
    sticky,
    hideWhenDetached,
    collisionPadding
  };
  const mergedProps = mergeProps(restProps, floatingProps, contentState.props);
  if (forceMount) {
    $$payload.out += "<!--[-->";
    {
      let popper = function($$payload2, { props, wrapperProps }) {
        const mergedProps2 = mergeProps(props, {
          style: getFloatingContentCSSVars("tooltip")
        });
        if (child) {
          $$payload2.out += "<!--[-->";
          child($$payload2, {
            props: mergedProps2,
            wrapperProps,
            ...contentState.snippetProps
          });
          $$payload2.out += `<!---->`;
        } else {
          $$payload2.out += "<!--[!-->";
          $$payload2.out += `<div${spread_attributes({ ...wrapperProps }, null)}><div${spread_attributes({ ...mergedProps2 }, null)}>`;
          children?.($$payload2);
          $$payload2.out += `<!----></div></div>`;
        }
        $$payload2.out += `<!--]-->`;
      };
      Popper_layer_force_mount($$payload, spread_props([
        mergedProps,
        contentState.popperProps,
        {
          enabled: contentState.root.opts.open.current,
          id,
          trapFocus: false,
          loop: false,
          preventScroll: false,
          forceMount: true,
          popper,
          $$slots: { popper: true }
        }
      ]));
    }
  } else if (!forceMount) {
    $$payload.out += "<!--[1-->";
    {
      let popper = function($$payload2, { props, wrapperProps }) {
        const mergedProps2 = mergeProps(props, {
          style: getFloatingContentCSSVars("tooltip")
        });
        if (child) {
          $$payload2.out += "<!--[-->";
          child($$payload2, {
            props: mergedProps2,
            wrapperProps,
            ...contentState.snippetProps
          });
          $$payload2.out += `<!---->`;
        } else {
          $$payload2.out += "<!--[!-->";
          $$payload2.out += `<div${spread_attributes({ ...wrapperProps }, null)}><div${spread_attributes({ ...mergedProps2 }, null)}>`;
          children?.($$payload2);
          $$payload2.out += `<!----></div></div>`;
        }
        $$payload2.out += `<!--]-->`;
      };
      Popper_layer($$payload, spread_props([
        mergedProps,
        contentState.popperProps,
        {
          present: contentState.root.opts.open.current,
          id,
          trapFocus: false,
          loop: false,
          preventScroll: false,
          forceMount: false,
          popper,
          $$slots: { popper: true }
        }
      ]));
    }
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function Tooltip_content($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    sideOffset = 4,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Portal($$payload2, {
      children: ($$payload3) => {
        $$payload3.out += `<!---->`;
        Tooltip_content$1($$payload3, spread_props([
          {
            sideOffset,
            class: cn("z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)
          },
          restProps,
          {
            get ref() {
              return ref;
            },
            set ref($$value) {
              ref = $$value;
              $$settled = false;
            }
          }
        ]));
        $$payload3.out += `<!---->`;
      }
    });
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
/**
 * @license @lucide/svelte v0.482.0 - ISC
 *
 * ISC License
 * 
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
 * 
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 * 
 */
const defaultAttributes$1 = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 2,
  "stroke-linecap": "round",
  "stroke-linejoin": "round"
};
function Icon$1($$payload, $$props) {
  push();
  const {
    name,
    color = "currentColor",
    size = 24,
    strokeWidth = 2,
    absoluteStrokeWidth = false,
    iconNode = [],
    children,
    $$slots,
    $$events,
    ...props
  } = $$props;
  const paraglide_sveltekit_translate_attribute_pass_translationFunctions = getTranslationFunctions();
  const [
    paraglide_sveltekit_translate_attribute_pass_translateAttribute,
    paraglide_sveltekit_translate_attribute_pass_handle_attributes
  ] = paraglide_sveltekit_translate_attribute_pass_translationFunctions;
  const each_array = ensure_array_like(iconNode);
  $$payload.out += `<svg${spread_attributes(
    {
      ...defaultAttributes$1,
      ...props,
      width: size,
      height: size,
      stroke: color,
      "stroke-width": absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
      class: clsx$1([
        "lucide-icon lucide",
        name && `lucide-${name}`,
        props.class
      ])
    },
    null,
    void 0,
    void 0,
    3
  )}><!--[-->`;
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let [tag, attrs] = each_array[$$index];
    element($$payload, tag, () => {
      $$payload.out += `${spread_attributes(
        {
          ...`${tag}` === "button" ? paraglide_sveltekit_translate_attribute_pass_handle_attributes({ ...attrs }, [{ attribute_name: "formaction" }]) : `${tag}` === "form" ? paraglide_sveltekit_translate_attribute_pass_handle_attributes({ ...attrs }, [{ attribute_name: "action" }]) : `${tag}` === "a" ? paraglide_sveltekit_translate_attribute_pass_handle_attributes({ ...attrs }, [
            {
              attribute_name: "href",
              lang_attribute_name: "hreflang"
            }
          ]) : { ...attrs }
        },
        null,
        void 0,
        void 0,
        3
      )}`;
    });
  }
  $$payload.out += `<!--]-->`;
  children?.($$payload);
  $$payload.out += `<!----></svg>`;
  pop();
}
function Arrow_down($$payload, $$props) {
  push();
  let { $$slots, $$events, ...props } = $$props;
  const iconNode = [
    ["path", { "d": "M12 5v14" }],
    ["path", { "d": "m19 12-7 7-7-7" }]
  ];
  Icon$1($$payload, spread_props([
    { name: "arrow-down" },
    props,
    {
      iconNode,
      children: ($$payload2) => {
        props.children?.($$payload2);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
function Arrow_up($$payload, $$props) {
  push();
  let { $$slots, $$events, ...props } = $$props;
  const iconNode = [
    ["path", { "d": "m5 12 7-7 7 7" }],
    ["path", { "d": "M12 19V5" }]
  ];
  Icon$1($$payload, spread_props([
    { name: "arrow-up" },
    props,
    {
      iconNode,
      children: ($$payload2) => {
        props.children?.($$payload2);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
function Banknote($$payload, $$props) {
  push();
  let { $$slots, $$events, ...props } = $$props;
  const iconNode = [
    [
      "rect",
      {
        "width": "20",
        "height": "12",
        "x": "2",
        "y": "6",
        "rx": "2"
      }
    ],
    [
      "circle",
      { "cx": "12", "cy": "12", "r": "2" }
    ],
    ["path", { "d": "M6 12h.01M18 12h.01" }]
  ];
  Icon$1($$payload, spread_props([
    { name: "banknote" },
    props,
    {
      iconNode,
      children: ($$payload2) => {
        props.children?.($$payload2);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
function Check$1($$payload, $$props) {
  push();
  let { $$slots, $$events, ...props } = $$props;
  const iconNode = [["path", { "d": "M20 6 9 17l-5-5" }]];
  Icon$1($$payload, spread_props([
    { name: "check" },
    props,
    {
      iconNode,
      children: ($$payload2) => {
        props.children?.($$payload2);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
function Info($$payload, $$props) {
  push();
  let { $$slots, $$events, ...props } = $$props;
  const iconNode = [
    [
      "circle",
      { "cx": "12", "cy": "12", "r": "10" }
    ],
    ["path", { "d": "M12 16v-4" }],
    ["path", { "d": "M12 8h.01" }]
  ];
  Icon$1($$payload, spread_props([
    { name: "info" },
    props,
    {
      iconNode,
      children: ($$payload2) => {
        props.children?.($$payload2);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
function Landmark($$payload, $$props) {
  push();
  let { $$slots, $$events, ...props } = $$props;
  const iconNode = [
    [
      "line",
      {
        "x1": "3",
        "x2": "21",
        "y1": "22",
        "y2": "22"
      }
    ],
    [
      "line",
      {
        "x1": "6",
        "x2": "6",
        "y1": "18",
        "y2": "11"
      }
    ],
    [
      "line",
      {
        "x1": "10",
        "x2": "10",
        "y1": "18",
        "y2": "11"
      }
    ],
    [
      "line",
      {
        "x1": "14",
        "x2": "14",
        "y1": "18",
        "y2": "11"
      }
    ],
    [
      "line",
      {
        "x1": "18",
        "x2": "18",
        "y1": "18",
        "y2": "11"
      }
    ],
    ["polygon", { "points": "12 2 20 7 4 7" }]
  ];
  Icon$1($$payload, spread_props([
    { name: "landmark" },
    props,
    {
      iconNode,
      children: ($$payload2) => {
        props.children?.($$payload2);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
function Log_out($$payload, $$props) {
  push();
  let { $$slots, $$events, ...props } = $$props;
  const iconNode = [
    [
      "path",
      { "d": "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }
    ],
    ["polyline", { "points": "16 17 21 12 16 7" }],
    [
      "line",
      {
        "x1": "21",
        "x2": "9",
        "y1": "12",
        "y2": "12"
      }
    ]
  ];
  Icon$1($$payload, spread_props([
    { name: "log-out" },
    props,
    {
      iconNode,
      children: ($$payload2) => {
        props.children?.($$payload2);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
function Redo($$payload, $$props) {
  push();
  let { $$slots, $$events, ...props } = $$props;
  const iconNode = [
    ["path", { "d": "M21 7v6h-6" }],
    [
      "path",
      {
        "d": "M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"
      }
    ]
  ];
  Icon$1($$payload, spread_props([
    { name: "redo" },
    props,
    {
      iconNode,
      children: ($$payload2) => {
        props.children?.($$payload2);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
function Square_pen($$payload, $$props) {
  push();
  let { $$slots, $$events, ...props } = $$props;
  const iconNode = [
    [
      "path",
      {
        "d": "M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
      }
    ],
    [
      "path",
      {
        "d": "M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"
      }
    ]
  ];
  Icon$1($$payload, spread_props([
    { name: "square-pen" },
    props,
    {
      iconNode,
      children: ($$payload2) => {
        props.children?.($$payload2);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
function User_plus($$payload, $$props) {
  push();
  let { $$slots, $$events, ...props } = $$props;
  const iconNode = [
    [
      "path",
      {
        "d": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
      }
    ],
    ["circle", { "cx": "9", "cy": "7", "r": "4" }],
    [
      "line",
      {
        "x1": "19",
        "x2": "19",
        "y1": "8",
        "y2": "14"
      }
    ],
    [
      "line",
      {
        "x1": "22",
        "x2": "16",
        "y1": "11",
        "y2": "11"
      }
    ]
  ];
  Icon$1($$payload, spread_props([
    { name: "user-plus" },
    props,
    {
      iconNode,
      children: ($$payload2) => {
        props.children?.($$payload2);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
function X($$payload, $$props) {
  push();
  let { $$slots, $$events, ...props } = $$props;
  const iconNode = [
    ["path", { "d": "M18 6 6 18" }],
    ["path", { "d": "m6 6 12 12" }]
  ];
  Icon$1($$payload, spread_props([
    { name: "x" },
    props,
    {
      iconNode,
      children: ($$payload2) => {
        props.children?.($$payload2);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
function Card($$payload, $$props) {
  let { class: clazz, children } = $$props;
  $$payload.out += `<div${attr_class(`rounded-lg border border-white/[0.3] bg-emerald-400/[0.05] p-4 shadow-lg backdrop-blur ${stringify(clazz)}`)}>`;
  children($$payload);
  $$payload.out += `<!----></div>`;
}
/**
 * @license lucide-svelte v0.482.0 - ISC
 *
 * ISC License
 * 
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
 * 
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 * 
 */
const defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 2,
  "stroke-linecap": "round",
  "stroke-linejoin": "round"
};
function Icon($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "name",
    "color",
    "size",
    "strokeWidth",
    "absoluteStrokeWidth",
    "iconNode"
  ]);
  push();
  let name = fallback($$props["name"], void 0);
  let color = fallback($$props["color"], "currentColor");
  let size = fallback($$props["size"], 24);
  let strokeWidth = fallback($$props["strokeWidth"], 2);
  let absoluteStrokeWidth = fallback($$props["absoluteStrokeWidth"], false);
  let iconNode = fallback($$props["iconNode"], () => [], true);
  const mergeClasses = (...classes) => classes.filter((className, index, array) => {
    return Boolean(className) && array.indexOf(className) === index;
  }).join(" ");
  const paraglide_sveltekit_translate_attribute_pass_translationFunctions = getTranslationFunctions();
  const [
    paraglide_sveltekit_translate_attribute_pass_translateAttribute,
    paraglide_sveltekit_translate_attribute_pass_handle_attributes
  ] = paraglide_sveltekit_translate_attribute_pass_translationFunctions;
  const each_array = ensure_array_like(iconNode);
  $$payload.out += `<svg${spread_attributes(
    {
      ...defaultAttributes,
      ...$$restProps,
      width: size,
      height: size,
      stroke: color,
      "stroke-width": absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
      class: clsx$1(mergeClasses("lucide-icon", "lucide", name ? `lucide-${name}` : "", $$sanitized_props.class))
    },
    null,
    void 0,
    void 0,
    3
  )}><!--[-->`;
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let [tag, attrs] = each_array[$$index];
    element($$payload, tag, () => {
      $$payload.out += `${spread_attributes(
        {
          ...`${tag}` === "button" ? paraglide_sveltekit_translate_attribute_pass_handle_attributes({ ...attrs }, [{ attribute_name: "formaction" }]) : `${tag}` === "form" ? paraglide_sveltekit_translate_attribute_pass_handle_attributes({ ...attrs }, [{ attribute_name: "action" }]) : `${tag}` === "a" ? paraglide_sveltekit_translate_attribute_pass_handle_attributes({ ...attrs }, [
            {
              attribute_name: "href",
              lang_attribute_name: "hreflang"
            }
          ]) : { ...attrs }
        },
        null,
        void 0,
        void 0,
        3
      )}`;
    });
  }
  $$payload.out += `<!--]--><!---->`;
  slot($$payload, $$props, "default", {}, null);
  $$payload.out += `<!----></svg>`;
  bind_props($$props, {
    name,
    color,
    size,
    strokeWidth,
    absoluteStrokeWidth,
    iconNode
  });
  pop();
}
function Check($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [["path", { "d": "M20 6 9 17l-5-5" }]];
  Icon($$payload, spread_props([
    { name: "check" },
    $$sanitized_props,
    {
      iconNode,
      children: ($$payload2) => {
        $$payload2.out += `<!---->`;
        slot($$payload2, $$props, "default", {}, null);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
}
function Select_item($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    value,
    label,
    children: childrenProp,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    {
      let children = function($$payload3, { selected, highlighted }) {
        $$payload3.out += `<span class="absolute left-2 flex size-3.5 items-center justify-center">`;
        if (selected) {
          $$payload3.out += "<!--[-->";
          Check($$payload3, { class: "size-4" });
        } else {
          $$payload3.out += "<!--[!-->";
        }
        $$payload3.out += `<!--]--></span> `;
        if (childrenProp) {
          $$payload3.out += "<!--[-->";
          childrenProp($$payload3, { selected, highlighted });
          $$payload3.out += `<!---->`;
        } else {
          $$payload3.out += "<!--[!-->";
          $$payload3.out += `${escape_html(label || value)}`;
        }
        $$payload3.out += `<!--]-->`;
      };
      Select_item$1($$payload2, spread_props([
        {
          value,
          class: cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50", className)
        },
        restProps,
        {
          get ref() {
            return ref;
          },
          set ref($$value) {
            ref = $$value;
            $$settled = false;
          },
          children,
          $$slots: { default: true }
        }
      ]));
    }
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Chevron_up($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [["path", { "d": "m18 15-6-6-6 6" }]];
  Icon($$payload, spread_props([
    { name: "chevron-up" },
    $$sanitized_props,
    {
      iconNode,
      children: ($$payload2) => {
        $$payload2.out += `<!---->`;
        slot($$payload2, $$props, "default", {}, null);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
}
function Select_scroll_up_button($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Select_scroll_up_button$1($$payload2, spread_props([
      {
        class: cn("flex cursor-default items-center justify-center py-1", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        },
        children: ($$payload3) => {
          Chevron_up($$payload3, { class: "size-4" });
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Chevron_down($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [["path", { "d": "m6 9 6 6 6-6" }]];
  Icon($$payload, spread_props([
    { name: "chevron-down" },
    $$sanitized_props,
    {
      iconNode,
      children: ($$payload2) => {
        $$payload2.out += `<!---->`;
        slot($$payload2, $$props, "default", {}, null);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
}
function Select_scroll_down_button($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Select_scroll_down_button$1($$payload2, spread_props([
      {
        class: cn("flex cursor-default items-center justify-center py-1", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        },
        children: ($$payload3) => {
          Chevron_down($$payload3, { class: "size-4" });
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Select_content($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    sideOffset = 4,
    portalProps,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Portal($$payload2, spread_props([
      portalProps,
      {
        children: ($$payload3) => {
          $$payload3.out += `<!---->`;
          Select_content$1($$payload3, spread_props([
            {
              sideOffset,
              class: cn("relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)
            },
            restProps,
            {
              get ref() {
                return ref;
              },
              set ref($$value) {
                ref = $$value;
                $$settled = false;
              },
              children: ($$payload4) => {
                Select_scroll_up_button($$payload4, {});
                $$payload4.out += `<!----> <!---->`;
                Select_viewport($$payload4, {
                  class: cn("h-[var(--bits-select-anchor-height)] w-full min-w-[var(--bits-select-anchor-width)] p-1"),
                  children: ($$payload5) => {
                    children?.($$payload5);
                    $$payload5.out += `<!---->`;
                  },
                  $$slots: { default: true }
                });
                $$payload4.out += `<!----> `;
                Select_scroll_down_button($$payload4, {});
                $$payload4.out += `<!---->`;
              },
              $$slots: { default: true }
            }
          ]));
          $$payload3.out += `<!---->`;
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Select_trigger($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Select_trigger$1($$payload2, spread_props([
      {
        class: cn("flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground [&>span]:line-clamp-1", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        },
        children: ($$payload3) => {
          children?.($$payload3);
          $$payload3.out += `<!----> `;
          Chevron_down($$payload3, { class: "size-4 opacity-50" });
          $$payload3.out += `<!---->`;
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
const Root$1 = Select;
function Currency_selector($$payload, $$props) {
  push();
  let { currency = void 0 } = $$props;
  function getCurrencies() {
    return Object.entries(page.data.currencies).toSorted((a, b) => a[0].localeCompare(b[0]));
  }
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Root$1($$payload2, {
      type: "single",
      get value() {
        return currency;
      },
      set value($$value) {
        currency = $$value;
        $$settled = false;
      },
      children: ($$payload3) => {
        $$payload3.out += `<!---->`;
        Select_trigger($$payload3, {
          children: ($$payload4) => {
            $$payload4.out += `<!---->${escape_html(currency)}`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!----> <!---->`;
        Select_content($$payload3, {
          children: ($$payload4) => {
            const each_array = ensure_array_like(getCurrencies());
            $$payload4.out += `<!--[-->`;
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let [code, info] = each_array[$$index];
              $$payload4.out += `<!---->`;
              Select_item($$payload4, {
                value: code,
                children: ($$payload5) => {
                  $$payload5.out += `<!---->${escape_html(info.symbol)}
				${escape_html(code)}`;
                },
                $$slots: { default: true }
              });
              $$payload4.out += `<!---->`;
            }
            $$payload4.out += `<!--]-->`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!---->`;
      },
      $$slots: { default: true }
    });
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { currency });
  pop();
}
function date(d, format) {
  const day = dayjs(d);
  if (!format) {
    if (day.isSame(dayjs(), "day")) {
      format = "h:mm a";
    } else {
      format = "ddd MMM D";
    }
  }
  return day.format(format);
}
function money(amount) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currencyDisplay: "narrowSymbol",
    currency: local.currency
  }).format(amount * page.data.currencies[local.currency].value);
}
const formatter = {
  date,
  money
};
function Totals($$payload, $$props) {
  push();
  let { totals: totals2 } = $$props;
  let total = totals2.income - totals2.expense;
  let bank = totals2.bankIncome - totals2.withdrawal - totals2.bankExpense;
  let cash = totals2.cashIncome + totals2.withdrawal - totals2.cashExpense;
  $$payload.out += `<div class="mb-4 text-center text-3xl tracking-wider">${escape_html(formatter.money(total))}</div> <div class="flex justify-center gap-4"><div class="flex items-center gap-2">`;
  Landmark($$payload, {});
  $$payload.out += `<!----> <div>${escape_html(formatter.money(bank))}</div></div> <div>/</div> <div class="flex items-center gap-2">`;
  Banknote($$payload, {});
  $$payload.out += `<!----> <div>${escape_html(formatter.money(cash))}</div></div></div>`;
  pop();
}
const client = createTRPCClient({
  links: [httpBatchLink({ url: new URL("/api", PUBLIC_APP_URL).toString() })]
});
function Alert_dialog_title($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    level = 3,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Dialog_title($$payload2, spread_props([
      {
        class: cn("text-lg font-semibold", className),
        level
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
const buttonVariants = tv({
  base: "ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border-input bg-background hover:bg-accent hover:text-accent-foreground border",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline"
    },
    size: {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10"
    }
  },
  defaultVariants: { variant: "default", size: "default" }
});
function Button($$payload, $$props) {
  push();
  let {
    class: className,
    variant = "default",
    size = "default",
    ref = null,
    href = void 0,
    type = "button",
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const paraglide_sveltekit_translate_attribute_pass_translationFunctions = getTranslationFunctions();
  const [
    paraglide_sveltekit_translate_attribute_pass_translateAttribute,
    paraglide_sveltekit_translate_attribute_pass_handle_attributes
  ] = paraglide_sveltekit_translate_attribute_pass_translationFunctions;
  if (href) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<a${spread_attributes(
      {
        ...paraglide_sveltekit_translate_attribute_pass_handle_attributes(
          {
            "class": cn(buttonVariants({ variant, size }), className),
            "href": href,
            ...restProps
          },
          [
            {
              attribute_name: "href",
              lang_attribute_name: "hreflang"
            }
          ]
        )
      },
      null
    )}>`;
    children?.($$payload);
    $$payload.out += `<!----></a>`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<button${spread_attributes(
      {
        ...paraglide_sveltekit_translate_attribute_pass_handle_attributes(
          {
            "class": cn(buttonVariants({ variant, size }), className),
            "type": type,
            ...restProps
          },
          [{ attribute_name: "formaction" }]
        )
      },
      null
    )}>`;
    children?.($$payload);
    $$payload.out += `<!----></button>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { ref });
  pop();
}
function Alert_dialog_action($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Alert_dialog_action$1($$payload2, spread_props([
      { class: cn(buttonVariants(), className) },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Alert_dialog_cancel($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Alert_dialog_cancel$1($$payload2, spread_props([
      {
        class: cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Alert_dialog_footer($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out += `<div${spread_attributes(
    {
      class: clsx$1(cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)),
      ...restProps
    },
    null
  )}>`;
  children?.($$payload);
  $$payload.out += `<!----></div>`;
  bind_props($$props, { ref });
  pop();
}
function Alert_dialog_header($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out += `<div${spread_attributes(
    {
      class: clsx$1(cn("flex flex-col space-y-2 text-center sm:text-left", className)),
      ...restProps
    },
    null
  )}>`;
  children?.($$payload);
  $$payload.out += `<!----></div>`;
  bind_props($$props, { ref });
  pop();
}
function Alert_dialog_overlay($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Dialog_overlay($$payload2, spread_props([
      {
        class: cn("fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Alert_dialog_content($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    portalProps,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Portal($$payload2, spread_props([
      portalProps,
      {
        children: ($$payload3) => {
          Alert_dialog_overlay($$payload3, {});
          $$payload3.out += `<!----> <!---->`;
          Alert_dialog_content$1($$payload3, spread_props([
            {
              class: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg", className)
            },
            restProps,
            {
              get ref() {
                return ref;
              },
              set ref($$value) {
                ref = $$value;
                $$settled = false;
              }
            }
          ]));
          $$payload3.out += `<!---->`;
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Alert_dialog_description($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Dialog_description($$payload2, spread_props([
      {
        class: cn("text-sm text-muted-foreground", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
const Root = Alert_dialog;
const Trigger = Dialog_trigger;
function Input($$payload, $$props) {
  push();
  let {
    ref = null,
    value = void 0,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out += `<input${spread_attributes(
    {
      class: clsx$1(cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className)),
      value,
      ...restProps
    },
    null
  )}>`;
  bind_props($$props, { ref, value });
  pop();
}
function Label($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Label$1($$payload2, spread_props([
      {
        class: cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Radio_group($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    value = "",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Radio_group$1($$payload2, spread_props([
      { class: cn("grid gap-2", className) },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        },
        get value() {
          return value;
        },
        set value($$value) {
          value = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref, value });
  pop();
}
function Circle($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "circle",
      { "cx": "12", "cy": "12", "r": "10" }
    ]
  ];
  Icon($$payload, spread_props([
    { name: "circle" },
    $$sanitized_props,
    {
      iconNode,
      children: ($$payload2) => {
        $$payload2.out += `<!---->`;
        slot($$payload2, $$props, "default", {}, null);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
}
function Radio_group_item($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    {
      let children = function($$payload3, { checked }) {
        $$payload3.out += `<div class="flex items-center justify-center">`;
        if (checked) {
          $$payload3.out += "<!--[-->";
          Circle($$payload3, { class: "size-2.5 fill-current text-current" });
        } else {
          $$payload3.out += "<!--[!-->";
        }
        $$payload3.out += `<!--]--></div>`;
      };
      Radio_group_item$1($$payload2, spread_props([
        {
          class: cn("aspect-square size-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)
        },
        restProps,
        {
          get ref() {
            return ref;
          },
          set ref($$value) {
            ref = $$value;
            $$settled = false;
          },
          children,
          $$slots: { default: true }
        }
      ]));
    }
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Amount_input($$payload, $$props) {
  push();
  let {
    amount = void 0,
    enteredAmount = void 0,
    enteredCurrency = "CAD"
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<div class="flex gap-1"><div class="flex-auto">`;
    Input($$payload2, {
      type: "number",
      min: 0,
      placeholder: "Amount",
      get value() {
        return enteredAmount;
      },
      set value($$value) {
        enteredAmount = $$value;
        $$settled = false;
      }
    });
    $$payload2.out += `<!----></div> <div>`;
    Currency_selector($$payload2, {
      get currency() {
        return enteredCurrency;
      },
      set currency($$value) {
        enteredCurrency = $$value;
        $$settled = false;
      }
    });
    $$payload2.out += `<!----></div></div>`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { amount, enteredAmount, enteredCurrency });
  pop();
}
function Calendar_1($$payload, $$props) {
  push();
  let {
    ref = null,
    value = void 0,
    placeholder = void 0,
    class: className,
    weekdayFormat = "short",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    {
      let children = function($$payload3, { months, weekdays }) {
        $$payload3.out += `<!---->`;
        Calendar_header($$payload3, {
          children: ($$payload4) => {
            $$payload4.out += `<!---->`;
            Calendar_prev_button($$payload4, {});
            $$payload4.out += `<!----> <!---->`;
            Calendar_heading($$payload4, {});
            $$payload4.out += `<!----> <!---->`;
            Calendar_next_button($$payload4, {});
            $$payload4.out += `<!---->`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!----> <!---->`;
        Calendar_months($$payload3, {
          children: ($$payload4) => {
            const each_array = ensure_array_like(months);
            $$payload4.out += `<!--[-->`;
            for (let $$index_3 = 0, $$length = each_array.length; $$index_3 < $$length; $$index_3++) {
              let month = each_array[$$index_3];
              $$payload4.out += `<!---->`;
              Calendar_grid($$payload4, {
                children: ($$payload5) => {
                  $$payload5.out += `<!---->`;
                  Calendar_grid_head($$payload5, {
                    children: ($$payload6) => {
                      $$payload6.out += `<!---->`;
                      Calendar_grid_row($$payload6, {
                        class: "flex",
                        children: ($$payload7) => {
                          const each_array_1 = ensure_array_like(weekdays);
                          $$payload7.out += `<!--[-->`;
                          for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
                            let weekday = each_array_1[$$index];
                            $$payload7.out += `<!---->`;
                            Calendar_head_cell($$payload7, {
                              children: ($$payload8) => {
                                $$payload8.out += `<!---->${escape_html(weekday.slice(0, 2))}`;
                              },
                              $$slots: { default: true }
                            });
                            $$payload7.out += `<!---->`;
                          }
                          $$payload7.out += `<!--]-->`;
                        },
                        $$slots: { default: true }
                      });
                      $$payload6.out += `<!---->`;
                    },
                    $$slots: { default: true }
                  });
                  $$payload5.out += `<!----> <!---->`;
                  Calendar_grid_body($$payload5, {
                    children: ($$payload6) => {
                      const each_array_2 = ensure_array_like(month.weeks);
                      $$payload6.out += `<!--[-->`;
                      for (let $$index_2 = 0, $$length2 = each_array_2.length; $$index_2 < $$length2; $$index_2++) {
                        let weekDates = each_array_2[$$index_2];
                        $$payload6.out += `<!---->`;
                        Calendar_grid_row($$payload6, {
                          class: "mt-2 w-full",
                          children: ($$payload7) => {
                            const each_array_3 = ensure_array_like(weekDates);
                            $$payload7.out += `<!--[-->`;
                            for (let $$index_1 = 0, $$length3 = each_array_3.length; $$index_1 < $$length3; $$index_1++) {
                              let date2 = each_array_3[$$index_1];
                              $$payload7.out += `<!---->`;
                              Calendar_cell($$payload7, {
                                date: date2,
                                month: month.value,
                                children: ($$payload8) => {
                                  $$payload8.out += `<!---->`;
                                  Calendar_day($$payload8, {});
                                  $$payload8.out += `<!---->`;
                                },
                                $$slots: { default: true }
                              });
                              $$payload7.out += `<!---->`;
                            }
                            $$payload7.out += `<!--]-->`;
                          },
                          $$slots: { default: true }
                        });
                        $$payload6.out += `<!---->`;
                      }
                      $$payload6.out += `<!--]-->`;
                    },
                    $$slots: { default: true }
                  });
                  $$payload5.out += `<!---->`;
                },
                $$slots: { default: true }
              });
              $$payload4.out += `<!---->`;
            }
            $$payload4.out += `<!--]-->`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!---->`;
      };
      Calendar($$payload2, spread_props([
        {
          weekdayFormat,
          class: cn("p-3", className)
        },
        restProps,
        {
          get value() {
            return value;
          },
          set value($$value) {
            value = $$value;
            $$settled = false;
          },
          get ref() {
            return ref;
          },
          set ref($$value) {
            ref = $$value;
            $$settled = false;
          },
          get placeholder() {
            return placeholder;
          },
          set placeholder($$value) {
            placeholder = $$value;
            $$settled = false;
          },
          children,
          $$slots: { default: true }
        }
      ]));
    }
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref, value, placeholder });
  pop();
}
function Calendar_cell($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Calendar_cell$1($$payload2, spread_props([
      {
        class: cn("relative size-9 p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([data-selected])]:rounded-md [&:has([data-selected])]:bg-accent [&:has([data-selected][data-outside-month])]:bg-accent/50", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Calendar_day($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Calendar_day$1($$payload2, spread_props([
      {
        class: cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 p-0 font-normal",
          "[&[data-today]:not([data-selected])]:bg-accent [&[data-today]:not([data-selected])]:text-accent-foreground",
          // Selected
          "data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:opacity-100 data-[selected]:hover:bg-primary data-[selected]:hover:text-primary-foreground data-[selected]:focus:bg-primary data-[selected]:focus:text-primary-foreground",
          // Disabled
          "data-[disabled]:text-muted-foreground data-[disabled]:opacity-50",
          // Unavailable
          "data-[unavailable]:text-destructive-foreground data-[unavailable]:line-through",
          // Outside months
          "data-[outside-month]:pointer-events-none data-[outside-month]:text-muted-foreground data-[outside-month]:opacity-50 [&[data-outside-month][data-selected]]:bg-accent/50 [&[data-outside-month][data-selected]]:text-muted-foreground [&[data-outside-month][data-selected]]:opacity-30",
          className
        )
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Calendar_grid($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Calendar_grid$1($$payload2, spread_props([
      {
        class: cn("w-full border-collapse space-y-1", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Calendar_header($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Calendar_header$1($$payload2, spread_props([
      {
        class: cn("relative flex w-full items-center justify-between pt-1", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Calendar_months($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out += `<div${spread_attributes(
    {
      class: clsx$1(cn("mt-4 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0", className)),
      ...restProps
    },
    null
  )}>`;
  children?.($$payload);
  $$payload.out += `<!----></div>`;
  bind_props($$props, { ref });
  pop();
}
function Calendar_grid_row($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Calendar_grid_row$1($$payload2, spread_props([
      { class: cn("flex", className) },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Calendar_heading($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Calendar_heading$1($$payload2, spread_props([
      {
        class: cn("text-sm font-medium", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Calendar_grid_body($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Calendar_grid_body$1($$payload2, spread_props([
      { class: cn(className) },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Calendar_grid_head($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Calendar_grid_head$1($$payload2, spread_props([
      { class: cn(className) },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Calendar_head_cell($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Calendar_head_cell$1($$payload2, spread_props([
      {
        class: cn("w-9 rounded-md text-[0.8rem] font-normal text-muted-foreground", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Chevron_right($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [["path", { "d": "m9 18 6-6-6-6" }]];
  Icon($$payload, spread_props([
    { name: "chevron-right" },
    $$sanitized_props,
    {
      iconNode,
      children: ($$payload2) => {
        $$payload2.out += `<!---->`;
        slot($$payload2, $$props, "default", {}, null);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
}
function Fallback$1($$payload) {
  Chevron_right($$payload, { class: "size-4" });
}
function Calendar_next_button($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Calendar_next_button$1($$payload2, spread_props([
      {
        class: cn(buttonVariants({ variant: "outline" }), "size-7 bg-transparent p-0 opacity-50 hover:opacity-100", className),
        children: children || Fallback$1
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Chevron_left($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [["path", { "d": "m15 18-6-6 6-6" }]];
  Icon($$payload, spread_props([
    { name: "chevron-left" },
    $$sanitized_props,
    {
      iconNode,
      children: ($$payload2) => {
        $$payload2.out += `<!---->`;
        slot($$payload2, $$props, "default", {}, null);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
}
function Fallback($$payload) {
  Chevron_left($$payload, { class: "size-4" });
}
function Calendar_prev_button($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Calendar_prev_button$1($$payload2, spread_props([
      {
        class: cn(buttonVariants({ variant: "outline" }), "size-7 bg-transparent p-0 opacity-50 hover:opacity-100", className),
        children: children || Fallback
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Datetime_input($$payload, $$props) {
  push();
  let { onselect } = $$props;
  const today = now(getLocalTimeZone());
  let open = false;
  let date2 = today;
  let hour = today.hour % 12 || 12;
  let minute = today.minute;
  let afternoon = today.hour >= 12;
  function setTime() {
    let h = hour;
    if (afternoon) {
      h += 12;
    }
    h %= 24;
    const newDate = date2.set({ hour: h, minute, second: 0, millisecond: 0 });
    onselect(newDate.toDate());
    open = false;
  }
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Root($$payload2, {
      get open() {
        return open;
      },
      set open($$value) {
        open = $$value;
        $$settled = false;
      },
      children: ($$payload3) => {
        $$payload3.out += `<!---->`;
        Trigger($$payload3, {
          children: ($$payload4) => {
            Square_pen($$payload4, {});
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!----> <!---->`;
        Alert_dialog_content($$payload3, {
          class: "w-auto",
          children: ($$payload4) => {
            $$payload4.out += `<div class="mx-auto flex items-center gap-1"><input class="max-w-[4rem] rounded border border-gray-300" type="number"${attr("min", 1)}${attr("max", 12)}${attr("value", hour)}> <div class="text-lg">:</div> <input class="max-w-[4rem] rounded border border-gray-300" type="number"${attr("min", 0)}${attr("max", 59)}${attr("value", minute)}> <div class="flex flex-col"><button${attr_class(clsx$1([
              "rounded px-3 py-1 transition",
              !afternoon && "bg-indigo-100"
            ]))}>am</button> <button${attr_class(clsx$1([
              "rounded px-3 py-1 transition",
              afternoon && "bg-indigo-100"
            ]))}>pm</button></div></div> `;
            Calendar_1($$payload4, {
              class: "rounded border border-gray-300",
              type: "single",
              maxValue: today,
              get value() {
                return date2;
              },
              set value($$value) {
                date2 = $$value;
                $$settled = false;
              }
            });
            $$payload4.out += `<!----> <!---->`;
            Alert_dialog_footer($$payload4, {
              children: ($$payload5) => {
                $$payload5.out += `<!---->`;
                Alert_dialog_cancel($$payload5, {
                  children: ($$payload6) => {
                    $$payload6.out += `<!---->Cancel`;
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!----> <!---->`;
                Alert_dialog_action($$payload5, {
                  onclick: setTime,
                  children: ($$payload6) => {
                    $$payload6.out += `<!---->Set`;
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!---->`;
              },
              $$slots: { default: true }
            });
            $$payload4.out += `<!---->`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!---->`;
      },
      $$slots: { default: true }
    });
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  pop();
}
function Description_input($$payload, $$props) {
  push();
  let { options, value = void 0 } = $$props;
  let open = false;
  let highlighted = 0;
  let filtered = filterOptions();
  function filterOptions() {
    if (!value) {
      return options;
    }
    return options.filter((o) => o.toLocaleLowerCase().includes(value.toLocaleLowerCase()));
  }
  function close() {
    setTimeout(
      () => {
        open = false;
      },
      50
    );
  }
  function handleKeydown(evt) {
    if (!open) {
      return;
    }
    const actions = {
      ArrowUp: changeHighlighted.bind(null, -1),
      ArrowDown: changeHighlighted.bind(null, 1),
      Enter: select
    };
    if (actions[evt.key]) {
      stopEvent(evt);
      actions[evt.key]();
    }
  }
  function changeHighlighted(dir) {
    highlighted = wrap(highlighted + dir, 0, filtered.length - 1);
  }
  function select(idx) {
    if (idx != null) {
      value = filtered[idx];
    } else {
      value = filtered[highlighted];
    }
    close();
  }
  function wrap(num, min, max) {
    if (num > max) {
      return min;
    }
    if (num < min) {
      return max;
    }
    return num;
  }
  function stopEvent(evt) {
    evt.stopPropagation();
    evt.preventDefault();
  }
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<div class="relative">`;
    Input($$payload2, {
      id: "description",
      placeholder: "Description",
      autocomplete: "off",
      onfocus: () => open = filtered.length !== 0,
      onblur: close,
      onkeydown: handleKeydown,
      get value() {
        return value;
      },
      set value($$value) {
        value = $$value;
        $$settled = false;
      }
    });
    $$payload2.out += `<!----> `;
    if (open) {
      $$payload2.out += "<!--[-->";
      const each_array = ensure_array_like(filtered);
      $$payload2.out += `<div class="absolute top-full z-10 flex w-full translate-y-2 flex-col gap-1 rounded-md border border-gray-200 bg-white p-2 text-left shadow-md"><!--[-->`;
      for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
        let opt = each_array[idx];
        const hl = idx === highlighted;
        $$payload2.out += `<button${attr_class(clsx$1([
          "rounded px-2 py-1 text-left capitalize hover:bg-gray-100",
          hl && "bg-gray-100"
        ]))} tabindex="-1">${escape_html(opt)}</button>`;
      }
      $$payload2.out += `<!--]--></div>`;
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]--></div>`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { value });
  pop();
}
function Add_entry($$payload, $$props) {
  push();
  let { defaultCategories, entryType, title } = $$props;
  let open = false;
  let amount = void 0;
  let enteredAmount = void 0;
  let enteredCurrency = "CAD";
  let account = "bank";
  let created = void 0;
  let category = void 0;
  let addingCategory = false;
  let description = "";
  let entries2 = page.data.entries.filter((e) => e.type === entryType);
  let categories = _.unique(defaultCategories.concat(entries2.map((e) => e.category)));
  let descriptions = _.unique(_.sift(entries2.filter((e) => e.category === category).map((e) => e.description)));
  let disabled = amount == null || !account || !category;
  function reset() {
    amount = void 0;
    enteredAmount = void 0;
    enteredCurrency = "CAD";
    account = "bank";
    created = void 0;
    category = void 0;
    addingCategory = false;
    description = "";
  }
  async function save() {
    if (amount == null || enteredAmount == null || !account || category == null) {
      return;
    }
    await client.entry.create.mutate({
      type: entryType,
      account,
      created,
      amount,
      enteredAmount,
      enteredCurrency,
      category,
      description
    });
    await invalidateAll();
    open = false;
  }
  getTranslationFunctions();
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Root($$payload2, {
      onOpenChange: reset,
      get open() {
        return open;
      },
      set open($$value) {
        open = $$value;
        $$settled = false;
      },
      children: ($$payload3) => {
        $$payload3.out += `<!---->`;
        {
          let child = function($$payload4, { props }) {
            Button($$payload4, spread_props([
              { class: "capitalize" },
              props,
              {
                children: ($$payload5) => {
                  $$payload5.out += `<!---->${escape_html(entryType)}`;
                },
                $$slots: { default: true }
              }
            ]));
          };
          Trigger($$payload3, { child, $$slots: { child: true } });
        }
        $$payload3.out += `<!----> <!---->`;
        Alert_dialog_content($$payload3, {
          class: "border border-white/[0.8] bg-white/[0.3] backdrop-blur",
          children: ($$payload4) => {
            const each_array = ensure_array_like(categories);
            $$payload4.out += `<!---->`;
            Alert_dialog_title($$payload4, {
              children: ($$payload5) => {
                $$payload5.out += `<!---->${escape_html(title)}`;
              },
              $$slots: { default: true }
            });
            $$payload4.out += `<!----> `;
            Amount_input($$payload4, {
              get amount() {
                return amount;
              },
              set amount($$value) {
                amount = $$value;
                $$settled = false;
              },
              get enteredAmount() {
                return enteredAmount;
              },
              set enteredAmount($$value) {
                enteredAmount = $$value;
                $$settled = false;
              },
              get enteredCurrency() {
                return enteredCurrency;
              },
              set enteredCurrency($$value) {
                enteredCurrency = $$value;
                $$settled = false;
              }
            });
            $$payload4.out += `<!----> <div class="flex flex-wrap items-center gap-4"><!---->`;
            Radio_group($$payload4, {
              class: "flex flex-auto flex-wrap items-center gap-4",
              get value() {
                return account;
              },
              set value($$value) {
                account = $$value;
                $$settled = false;
              },
              children: ($$payload5) => {
                $$payload5.out += `<div class="flex items-center gap-2"><!---->`;
                Radio_group_item($$payload5, { value: "bank", id: "bank" });
                $$payload5.out += `<!----> `;
                Label($$payload5, {
                  for: "bank",
                  children: ($$payload6) => {
                    $$payload6.out += `<!---->Bank`;
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!----></div> <div class="flex items-center gap-2"><!---->`;
                Radio_group_item($$payload5, { value: "cash", id: "cash" });
                $$payload5.out += `<!----> `;
                Label($$payload5, {
                  for: "cash",
                  children: ($$payload6) => {
                    $$payload6.out += `<!---->Cash`;
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!----></div>`;
              },
              $$slots: { default: true }
            });
            $$payload4.out += `<!----> <div class="flex items-center gap-2"><div>${escape_html(formatter.date(created, "ddd MMM D, h:mm a"))}</div> `;
            Datetime_input($$payload4, { onselect: (d) => created = d });
            $$payload4.out += `<!----></div></div> <div class="flex flex-wrap gap-2"><!--[-->`;
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let cat = each_array[$$index];
              const isSelected = cat === category;
              $$payload4.out += `<button${attr_class(clsx$1([
                "rounded border border-gray-200 px-4 py-1 capitalize",
                isSelected && "bg-black text-white",
                !isSelected && "bg-white hover:bg-gray-100"
              ]))}>${escape_html(cat)}</button>`;
            }
            $$payload4.out += `<!--]--> <button${attr_class(clsx$1([
              "rounded border border-gray-200 px-4 py-1",
              !addingCategory && "bg-white hover:bg-gray-100",
              addingCategory && "bg-black text-white"
            ]))}>+</button></div> `;
            if (addingCategory) {
              $$payload4.out += "<!--[-->";
              Input($$payload4, {
                type: "text",
                placeholder: "New category",
                get value() {
                  return category;
                },
                set value($$value) {
                  category = $$value;
                  $$settled = false;
                }
              });
            } else {
              $$payload4.out += "<!--[!-->";
            }
            $$payload4.out += `<!--]--> `;
            if (category || addingCategory) {
              $$payload4.out += "<!--[-->";
              Description_input($$payload4, {
                options: descriptions,
                get value() {
                  return description;
                },
                set value($$value) {
                  description = $$value;
                  $$settled = false;
                }
              });
            } else {
              $$payload4.out += "<!--[!-->";
            }
            $$payload4.out += `<!--]--> <!---->`;
            Alert_dialog_footer($$payload4, {
              children: ($$payload5) => {
                $$payload5.out += `<!---->`;
                Alert_dialog_cancel($$payload5, {
                  children: ($$payload6) => {
                    $$payload6.out += `<!---->Cancel`;
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!----> <!---->`;
                Alert_dialog_action($$payload5, {
                  disabled,
                  onclick: save,
                  children: ($$payload6) => {
                    $$payload6.out += `<!---->Save`;
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!---->`;
              },
              $$slots: { default: true }
            });
            $$payload4.out += `<!---->`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!---->`;
      },
      $$slots: { default: true }
    });
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  pop();
}
function Income($$payload) {
  const defaultCategories = ["paycheck", "misc"];
  Add_entry($$payload, {
    defaultCategories,
    entryType: "income",
    title: "Add income to your account"
  });
}
function Expense($$payload) {
  const defaultCategories = [
    "rent",
    "groceries",
    "food",
    "transportation",
    "entertainment",
    "home",
    "pets",
    "clothes"
  ];
  Add_entry($$payload, {
    defaultCategories,
    entryType: "expense",
    title: "Register an expense"
  });
}
function Withdrawal($$payload, $$props) {
  push();
  let open = false;
  let amount = void 0;
  let enteredAmount = void 0;
  let enteredCurrency = "CAD";
  let description = void 0;
  let disabled = amount == null;
  function reset() {
    amount = void 0;
    enteredAmount = void 0;
    enteredCurrency = "CAD";
    description = void 0;
  }
  async function save() {
    if (amount == null || enteredAmount == null) {
      return;
    }
    await client.entry.create.mutate({
      type: "withdrawal",
      account: "bank",
      amount,
      enteredAmount,
      enteredCurrency,
      category: "withdrawal",
      description
    });
    await invalidateAll();
    open = false;
  }
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Root($$payload2, {
      onOpenChange: reset,
      get open() {
        return open;
      },
      set open($$value) {
        open = $$value;
        $$settled = false;
      },
      children: ($$payload3) => {
        $$payload3.out += `<!---->`;
        {
          let child = function($$payload4, { props }) {
            Button($$payload4, spread_props([
              props,
              {
                children: ($$payload5) => {
                  $$payload5.out += `<!---->Withdrawal`;
                },
                $$slots: { default: true }
              }
            ]));
          };
          Trigger($$payload3, { child, $$slots: { child: true } });
        }
        $$payload3.out += `<!----> <!---->`;
        Alert_dialog_content($$payload3, {
          class: "border border-white/[0.8] bg-white/[0.3] backdrop-blur",
          children: ($$payload4) => {
            $$payload4.out += `<!---->`;
            Alert_dialog_title($$payload4, {
              children: ($$payload5) => {
                $$payload5.out += `<!---->Withdraw cash`;
              },
              $$slots: { default: true }
            });
            $$payload4.out += `<!----> `;
            Amount_input($$payload4, {
              get amount() {
                return amount;
              },
              set amount($$value) {
                amount = $$value;
                $$settled = false;
              },
              get enteredAmount() {
                return enteredAmount;
              },
              set enteredAmount($$value) {
                enteredAmount = $$value;
                $$settled = false;
              },
              get enteredCurrency() {
                return enteredCurrency;
              },
              set enteredCurrency($$value) {
                enteredCurrency = $$value;
                $$settled = false;
              }
            });
            $$payload4.out += `<!----> `;
            Input($$payload4, {
              type: "text",
              placeholder: "Description",
              get value() {
                return description;
              },
              set value($$value) {
                description = $$value;
                $$settled = false;
              }
            });
            $$payload4.out += `<!----> <!---->`;
            Alert_dialog_footer($$payload4, {
              children: ($$payload5) => {
                $$payload5.out += `<!---->`;
                Alert_dialog_cancel($$payload5, {
                  children: ($$payload6) => {
                    $$payload6.out += `<!---->Cancel`;
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!----> <!---->`;
                Alert_dialog_action($$payload5, {
                  disabled,
                  onclick: save,
                  children: ($$payload6) => {
                    $$payload6.out += `<!---->Save`;
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!---->`;
              },
              $$slots: { default: true }
            });
            $$payload4.out += `<!---->`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!---->`;
      },
      $$slots: { default: true }
    });
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  pop();
}
function Scroll_area_scrollbar($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    orientation = "vertical",
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Scroll_area_scrollbar$1($$payload2, spread_props([
      {
        orientation,
        class: cn("flex touch-none select-none transition-colors", orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-px", orientation === "horizontal" && "h-2.5 w-full border-t border-t-transparent p-px", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        },
        children: ($$payload3) => {
          children?.($$payload3);
          $$payload3.out += `<!----> <!---->`;
          Scroll_area_thumb($$payload3, {
            class: cn("relative rounded-full bg-border", orientation === "vertical" && "flex-1")
          });
          $$payload3.out += `<!---->`;
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Scroll_area($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    orientation = "vertical",
    scrollbarXClasses = "",
    scrollbarYClasses = "",
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<!---->`;
    Scroll_area$1($$payload2, spread_props([
      restProps,
      {
        class: cn("relative overflow-hidden", className),
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        },
        children: ($$payload3) => {
          $$payload3.out += `<!---->`;
          Scroll_area_viewport($$payload3, {
            class: "h-full w-full rounded-[inherit]",
            children: ($$payload4) => {
              children?.($$payload4);
              $$payload4.out += `<!---->`;
            },
            $$slots: { default: true }
          });
          $$payload3.out += `<!----> `;
          if (orientation === "vertical" || orientation === "both") {
            $$payload3.out += "<!--[-->";
            Scroll_area_scrollbar($$payload3, {
              orientation: "vertical",
              class: scrollbarYClasses
            });
          } else {
            $$payload3.out += "<!--[!-->";
          }
          $$payload3.out += `<!--]--> `;
          if (orientation === "horizontal" || orientation === "both") {
            $$payload3.out += "<!--[-->";
            Scroll_area_scrollbar($$payload3, {
              orientation: "horizontal",
              class: scrollbarXClasses
            });
          } else {
            $$payload3.out += "<!--[!-->";
          }
          $$payload3.out += `<!--]--> <!---->`;
          Scroll_area_corner($$payload3, {});
          $$payload3.out += `<!---->`;
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function badge($$payload, entry) {
  if (entry.type === "income") {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="badge from-green-300 to-green-400 svelte-1hw0umf">`;
    Arrow_up($$payload, { size: 20 });
    $$payload.out += `<!----></div>`;
  } else if (entry.type === "expense") {
    $$payload.out += "<!--[1-->";
    $$payload.out += `<div class="badge from-red-300 to-red-400 svelte-1hw0umf">`;
    Arrow_down($$payload, { size: 20 });
    $$payload.out += `<!----></div>`;
  } else if (entry.type === "withdrawal") {
    $$payload.out += "<!--[2-->";
    $$payload.out += `<div class="badge from-blue-300 to-blue-400 svelte-1hw0umf">`;
    Redo($$payload, { size: 20 });
    $$payload.out += `<!----></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
}
function Entries($$payload, $$props) {
  push();
  let { entries: entries2, canDelete = true } = $$props;
  Scroll_area($$payload, {
    class: "flex max-h-[300px] flex-col lg:max-h-[400px]",
    children: ($$payload2) => {
      const each_array = ensure_array_like(entries2);
      if (each_array.length !== 0) {
        $$payload2.out += "<!--[-->";
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let entry = each_array[$$index];
          $$payload2.out += `<div class="entry mb-2 flex items-center gap-4 rounded bg-white/[0.7] px-4 py-1 shadow svelte-1hw0umf">`;
          badge($$payload2, entry);
          $$payload2.out += `<!----> <div>${escape_html(formatter.money(entry.amount))}</div> <div class="text-gray-500">${escape_html(formatter.date(entry.created))}</div> <div class="capitalize">${escape_html(entry.category)}</div> <div class="actions flex flex-auto items-center justify-end gap-1 transition svelte-1hw0umf"><!---->`;
          Root$2($$payload2, {
            children: ($$payload3) => {
              $$payload3.out += `<!---->`;
              Trigger$1($$payload3, {
                class: "text-blue-500",
                children: ($$payload4) => {
                  Info($$payload4, {});
                },
                $$slots: { default: true }
              });
              $$payload3.out += `<!----> <!---->`;
              Tooltip_content($$payload3, {
                class: "flex flex-col gap-2 py-2 text-base",
                children: ($$payload4) => {
                  $$payload4.out += `<div class="flex items-center gap-2">`;
                  badge($$payload4, entry);
                  $$payload4.out += `<!----> <div>${escape_html(formatter.money(entry.amount))}</div> <div>(${escape_html(entry.enteredAmount)} ${escape_html(entry.enteredCurrency)})</div> `;
                  if (entry.account === "bank") {
                    $$payload4.out += "<!--[-->";
                    Landmark($$payload4, {});
                  } else if (entry.account === "cash") {
                    $$payload4.out += "<!--[1-->";
                    Banknote($$payload4, {});
                  } else {
                    $$payload4.out += "<!--[!-->";
                  }
                  $$payload4.out += `<!--]--></div> <div>${escape_html(formatter.date(entry.created, "h:mm a ddd MMM D, YYYY"))}</div> <div class="flex gap-1"><div class="capitalize">${escape_html(entry.category)}</div> <div>-</div> <div class="text-gray-500">${escape_html(entry.description ?? "No description")}</div></div> <div>${escape_html(entry.user.email)}</div>`;
                },
                $$slots: { default: true }
              });
              $$payload3.out += `<!---->`;
            },
            $$slots: { default: true }
          });
          $$payload2.out += `<!----> <button class="text-red-500">`;
          X($$payload2, {});
          $$payload2.out += `<!----></button></div></div>`;
        }
      } else {
        $$payload2.out += "<!--[!-->";
        $$payload2.out += `<div class="rounded bg-white/[0.7] px-4 py-1 shadow text-gray-500 text-center text-lg py-2">No entries added yet</div>`;
      }
      $$payload2.out += `<!--]-->`;
    },
    $$slots: { default: true }
  });
  pop();
}
function Breakdown($$payload, $$props) {
  push();
  let { entries: entries2, detailed = true } = $$props;
  let expenses = entries2.filter((e) => {
    const isExpense = e.type === "expense";
    const isInRange = true;
    return isExpense && isInRange;
  });
  let amounts = expenses.reduce(
    (a, v) => {
      const description = (v.description ?? "no description").toLocaleLowerCase();
      a[v.category] = a[v.category] ?? {};
      a[v.category].total = a[v.category].total ?? 0;
      a[v.category][description] = a[v.category][description] ?? 0;
      a[v.category].total += v.amount;
      a[v.category][description] += v.amount;
      return a;
    },
    {}
  );
  _.listify(amounts, (name, values) => ({ name, value: values.total })).toSorted((a, b) => b.value - a.value);
  let details = _.listify(amounts, (name, values) => {
    const breakdown = _.listify(_.omit(values, ["total"]), (name2, value) => ({ name: name2, value })).toSorted((a, b) => {
      return b.value - a.value;
    });
    return { name, total: values.total, breakdown };
  }).toSorted((a, b) => b.total - a.total);
  $$payload.out += `<div class="flex items-center gap-2 text-lg"><button${attr_class(clsx$1([
    "rounded px-4 py-2",
    "bg-white/[0.7] shadow"
  ]))}>All time</button> <button${attr_class(clsx$1([
    "rounded px-4 py-2",
    false
  ]))}>This month</button></div> <div class="grid grid-rows-[auto_auto] @3xl:grid-cols-2 @3xl:grid-rows-1"><div id="chart" class="h-[300px] w-[400px] justify-self-center @3xl:justify-self-start"></div> `;
  if (detailed) {
    $$payload.out += "<!--[-->";
    Scroll_area($$payload, {
      class: "flex max-h-[300px] flex-col",
      children: ($$payload2) => {
        const each_array = ensure_array_like(details);
        $$payload2.out += `<!--[-->`;
        for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
          let cat = each_array[$$index_1];
          const each_array_1 = ensure_array_like(cat.breakdown);
          $$payload2.out += `<div class="mb-3 rounded bg-white/[0.7] px-4 py-2 shadow"><div class="flex items-center gap-2 text-lg"><div class="capitalize">${escape_html(cat.name)}</div> <div>-</div> <div>${escape_html(formatter.money(cat.total))}</div></div> <div class="ml-4"><!--[-->`;
          for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
            let sub = each_array_1[$$index];
            $$payload2.out += `<div class="flex items-center gap-2"><span class="capitalize text-gray-500">${escape_html(sub.name)}</span> <span>-</span> <span>${escape_html(formatter.money(sub.value))}</span></div>`;
          }
          $$payload2.out += `<!--]--></div></div>`;
        }
        $$payload2.out += `<!--]-->`;
      },
      $$slots: { default: true }
    });
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></div>`;
  pop();
}
function Partners($$payload, $$props) {
  push();
  let open = false;
  let email = "";
  function reset() {
    email = "";
  }
  async function invite() {
    if (email === "") {
      return;
    }
    try {
      await client.invitation.send.mutate({ to: email });
      toast.success("Invitation sent!");
      open = false;
    } catch (_err) {
      const msg = "We couldn't send your invitation. Make sure your partner has an account and that you spelled their email correctly.";
      toast.error(msg);
    }
  }
  getTranslationFunctions();
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    const each_array = ensure_array_like(page.data.user.partners);
    $$payload2.out += `<div class="flex flex-wrap items-center gap-3"><!---->`;
    Root($$payload2, {
      onOpenChange: reset,
      get open() {
        return open;
      },
      set open($$value) {
        open = $$value;
        $$settled = false;
      },
      children: ($$payload3) => {
        $$payload3.out += `<!---->`;
        {
          let child = function($$payload4, { props }) {
            Button($$payload4, spread_props([
              props,
              {
                children: ($$payload5) => {
                  User_plus($$payload5, {});
                  $$payload5.out += `<!----> Add a partner`;
                },
                $$slots: { default: true }
              }
            ]));
          };
          Trigger($$payload3, { child, $$slots: { child: true } });
        }
        $$payload3.out += `<!----> <!---->`;
        Alert_dialog_content($$payload3, {
          class: "border border-white/[0.8] bg-white/[0.3] backdrop-blur",
          children: ($$payload4) => {
            $$payload4.out += `<!---->`;
            Alert_dialog_header($$payload4, {
              children: ($$payload5) => {
                $$payload5.out += `<!---->`;
                Alert_dialog_title($$payload5, {
                  children: ($$payload6) => {
                    $$payload6.out += `<!---->Add a partner to your account`;
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!----> <!---->`;
                Alert_dialog_description($$payload5, {
                  children: ($$payload6) => {
                    $$payload6.out += `<!---->Partners will be able to see and edit all information you've added up to this point.
					Likewise, you'll be able to see and edit any information they have added.`;
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!---->`;
              },
              $$slots: { default: true }
            });
            $$payload4.out += `<!----> `;
            Input($$payload4, {
              type: "email",
              placeholder: "Email",
              get value() {
                return email;
              },
              set value($$value) {
                email = $$value;
                $$settled = false;
              }
            });
            $$payload4.out += `<!----> <!---->`;
            Alert_dialog_footer($$payload4, {
              children: ($$payload5) => {
                $$payload5.out += `<!---->`;
                Alert_dialog_cancel($$payload5, {
                  children: ($$payload6) => {
                    $$payload6.out += `<!---->Cancel`;
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!----> <!---->`;
                Alert_dialog_action($$payload5, {
                  onclick: invite,
                  children: ($$payload6) => {
                    $$payload6.out += `<!---->Invite`;
                  },
                  $$slots: { default: true }
                });
                $$payload5.out += `<!---->`;
              },
              $$slots: { default: true }
            });
            $$payload4.out += `<!---->`;
          },
          $$slots: { default: true }
        });
        $$payload3.out += `<!---->`;
      },
      $$slots: { default: true }
    });
    $$payload2.out += `<!----> <!--[-->`;
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let partner = each_array[$$index];
      $$payload2.out += `<div class="inline-block rounded bg-white/[0.7] px-4 py-1 shadow">${escape_html(partner.email)}</div>`;
    }
    $$payload2.out += `<!--]--></div> `;
    if (page.data.invitations.length) {
      $$payload2.out += "<!--[-->";
      const each_array_1 = ensure_array_like(page.data.invitations);
      $$payload2.out += `<div class="mt-3 flex flex-wrap items-center gap-3"><!--[-->`;
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let invitation = each_array_1[$$index_1];
        $$payload2.out += `<div class="inline-block rounded bg-white/[0.7] px-4 py-1 shadow"><div class="underline">Invitation</div> <div>From ${escape_html(invitation.from.email)}</div> <div class="flex items-center gap-2"><div class="mr-4 flex-auto text-gray-500">Sent ${escape_html(formatter.date(invitation.sent))}</div> <button class="text-green-500">`;
        Check$1($$payload2, {});
        $$payload2.out += `<!----></button> <button class="text-red-500">`;
        X($$payload2, {});
        $$payload2.out += `<!----></button></div></div>`;
      }
      $$payload2.out += `<!--]--></div>`;
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]-->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  pop();
}
function Dashboard($$payload, $$props) {
  push();
  const paraglide_sveltekit_translate_attribute_pass_translationFunctions = getTranslationFunctions();
  const [
    paraglide_sveltekit_translate_attribute_pass_translateAttribute,
    paraglide_sveltekit_translate_attribute_pass_handle_attributes
  ] = paraglide_sveltekit_translate_attribute_pass_translationFunctions;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<div class="px-8 pb-10 pt-4"><div class="mb-4 flex items-center"><div class="flex-auto"><img src="/squid.png" alt="Cartoon squid with money" class="w-[70px]"></div> <div class="flex items-center gap-4">`;
    Currency_selector($$payload2, {
      get currency() {
        return local.currency;
      },
      set currency($$value) {
        local.currency = $$value;
        $$settled = false;
      }
    });
    $$payload2.out += `<!----> <a${attr("href", paraglide_sveltekit_translate_attribute_pass_translateAttribute(auth.getSignoutUrl(), void 0))}>`;
    Log_out($$payload2, { size: 30 });
    $$payload2.out += `<!----></a></div></div> <div class="grid grid-rows-[auto_auto] place-items-start justify-items-stretch gap-4 lg:grid-cols-[1fr_2fr] lg:grid-rows-1"><div class="grid grid-rows-[auto_auto] gap-2 md:grid-cols-2 md:grid-rows-1 lg:grid-cols-1 lg:grid-rows-[auto_auto]"><div>`;
    Card($$payload2, {
      children: ($$payload3) => {
        Totals($$payload3, { totals: page.data.totals });
      }
    });
    $$payload2.out += `<!----> <div class="my-4 flex justify-around">`;
    Income($$payload2);
    $$payload2.out += `<!----> `;
    Expense($$payload2);
    $$payload2.out += `<!----> `;
    Withdrawal($$payload2);
    $$payload2.out += `<!----></div></div> `;
    Card($$payload2, {
      children: ($$payload3) => {
        Entries($$payload3, { entries: page.data.entries });
      }
    });
    $$payload2.out += `<!----></div> <div>`;
    Card($$payload2, {
      class: "mb-6 @container",
      children: ($$payload3) => {
        Breakdown($$payload3, { entries: page.data.entries });
      }
    });
    $$payload2.out += `<!----> `;
    Card($$payload2, {
      children: ($$payload3) => {
        Partners($$payload3);
      }
    });
    $$payload2.out += `<!----></div></div></div>`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  pop();
}
const totals = {
  bankExpense: 25,
  bankIncome: 2600,
  cashExpense: 19,
  cashIncome: 0,
  expense: 44,
  income: 2600,
  withdrawal: 100
};
const entries = [
  {
    id: _.uid(8),
    created: dayjs().subtract(1, "hours").toDate(),
    type: "expense",
    account: "bank",
    amount: 12,
    enteredAmount: 12,
    enteredCurrency: "CAD",
    category: "transportation",
    description: "uber",
    user: {
      email: "example@email.com"
    }
  },
  {
    id: _.uid(8),
    created: dayjs().subtract(3, "hours").toDate(),
    type: "expense",
    account: "cash",
    amount: 19,
    enteredAmount: 270,
    enteredCurrency: "MXN",
    category: "groceries",
    description: null,
    user: {
      email: "partner@email.com"
    }
  },
  {
    id: _.uid(8),
    created: dayjs().subtract(12, "hours").toDate(),
    type: "withdrawal",
    account: "bank",
    amount: 100,
    enteredAmount: 100,
    enteredCurrency: "CAD",
    category: "withdrawal",
    description: null,
    user: {
      email: "example@email.com"
    }
  },
  {
    id: _.uid(8),
    created: dayjs().subtract(3.2, "days").toDate(),
    type: "expense",
    account: "bank",
    amount: 25,
    enteredAmount: 25,
    enteredCurrency: "CAD",
    category: "food",
    description: "uber eats",
    user: {
      email: "example@email.com"
    }
  },
  {
    id: _.uid(8),
    created: dayjs().subtract(15.1, "days").toDate(),
    type: "income",
    account: "bank",
    amount: 2600,
    enteredAmount: 2600,
    enteredCurrency: "CAD",
    category: "paycheck",
    description: dayjs().subtract(15.1, "days").format("MMMM"),
    user: {
      email: "example@email.com"
    }
  }
];
const landingData = {
  totals,
  entries
};
function Landing($$payload, $$props) {
  push();
  $$payload.out += `<div class="mx-auto w-[80%]"><div class="grid grid-rows-[repeat(3,auto)] items-center justify-items-center gap-10 p-4 lg:grid-cols-[repeat(3,auto)] lg:grid-rows-1"><img src="/squid.png" alt="Cartoon squid with money" class="w-[200px]"> <div><div class="mb-2 text-[50px] leading-none">Save quid with squid!</div> <div class="text-2xl"><div class="ml-2">Easily keep track of your income and expenses</div> <div class="ml-4">and collaborate with others to do shared budgeting</div></div></div> <div class="self-center">`;
  Button($$payload, {
    href: auth.getBuiltinUIUrl(),
    children: ($$payload2) => {
      $$payload2.out += `<!---->Get started`;
    },
    $$slots: { default: true }
  });
  $$payload.out += `<!----></div></div></div> <div class="mx-auto mt-10 flex w-[95%] flex-wrap justify-evenly gap-4">`;
  Card($$payload, {
    class: "grid w-[430px] grid-rows-[auto_1fr]",
    children: ($$payload2) => {
      $$payload2.out += `<div class="mb-4 text-center text-lg">See your total balance at a glance</div> <div class="place-self-center lg:mb-10">`;
      Totals($$payload2, { totals: landingData.totals });
      $$payload2.out += `<!----></div>`;
    }
  });
  $$payload.out += `<!----> `;
  Card($$payload, {
    class: "grid w-[430px] grid-rows-[auto_1fr]",
    children: ($$payload2) => {
      $$payload2.out += `<div class="mb-6 text-center text-lg">All your income, expenses, and withdrawals</div> <div class="place-self-center">`;
      Entries($$payload2, {
        canDelete: false,
        entries: landingData.entries
      });
      $$payload2.out += `<!----></div>`;
    }
  });
  $$payload.out += `<!----> `;
  Card($$payload, {
    class: "grid w-[430px] grid-rows-[auto_1fr]",
    children: ($$payload2) => {
      $$payload2.out += `<div class="mb-4 text-center text-lg">Breakdown of all time and monthly expenses</div> <div class="place-self-center">`;
      Breakdown($$payload2, { entries: landingData.entries, detailed: false });
      $$payload2.out += `<!----></div>`;
    }
  });
  $$payload.out += `<!----></div>`;
  pop();
}
function _page($$payload, $$props) {
  push();
  let { data } = $$props;
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Squid</title>`;
  });
  if (data.authenticated) {
    $$payload.out += "<!--[-->";
    Dashboard($$payload);
  } else {
    $$payload.out += "<!--[!-->";
    Landing($$payload);
  }
  $$payload.out += `<!--]-->`;
  pop();
}
export {
  _page as default
};
