import "clsx";
import { w as push, z as store_get, A as ensure_array_like, B as attr, C as unsubscribe_stores, y as pop, E as head, F as fallback, G as bind_props, I as sanitize_props, J as attr_class, K as attr_style, M as clsx, N as spread_props, O as slot, P as escape_html, Q as rest_props, R as spread_attributes } from "../../chunks/index.js";
import { n as normaliseBase, p as page, a as parseRoute, s as serializeRoute, g as getHrefBetween, i as i18n } from "../../chunks/i18n.js";
import { b as base } from "../../chunks/paths.js";
import { i as get, w as writable, j as derived } from "../../chunks/exports.js";
import "../../chunks/client.js";
import { s as setParaglideContext, g as getTranslationFunctions, c as cn, t as toastState, u as useEffect, o as onDestroy, P as Provider } from "../../chunks/index4.js";
import "@inlang/paraglide-js/internal/adapter-utils";
function isExternal(url, currentUrl, base2) {
  const absoluteBase = new URL(base2, currentUrl).pathname;
  return url.origin !== currentUrl.origin || !url.pathname.startsWith(absoluteBase);
}
function AlternateLinks($$payload, $$props) {
  push();
  var $$store_subs;
  const absoluteBase = normaliseBase(base, new URL(store_get($$store_subs ??= {}, "$page", page).url)) || "/";
  const { availableLanguageTags, strategy, currentLang } = $$props;
  const getAlternateLinks = (canonicalPath2, strategy2) => {
    const links = [];
    for (const lang of availableLanguageTags) {
      const localisedPath2 = strategy2.getLocalisedPath(canonicalPath2, lang);
      const fullPath = serializeRoute(localisedPath2, absoluteBase, void 0);
      const link = new URL(fullPath, new URL(store_get($$store_subs ??= {}, "$page", page).url)).href;
      links.push(link);
    }
    return links;
  };
  const localisedPath = parseRoute(store_get($$store_subs ??= {}, "$page", page).url.pathname, absoluteBase)[0];
  const canonicalPath = strategy.getCanonicalPath(localisedPath, currentLang);
  const alternateLinks = getAlternateLinks(canonicalPath, strategy);
  if (availableLanguageTags.length >= 1) {
    $$payload.out += "<!--[-->";
    const each_array = ensure_array_like(alternateLinks);
    $$payload.out += `<!--[-->`;
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let href = each_array[i];
      $$payload.out += `<link rel="alternate"${attr("hreflang", availableLanguageTags[i])}${attr("href", href)}>`;
    }
    $$payload.out += `<!--]-->`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function ParaglideJS($$payload, $$props) {
  push();
  var $$store_subs;
  const { languageTag, i18n: i18n2, children } = $$props;
  const absoluteBase = normaliseBase(base, new URL(store_get($$store_subs ??= {}, "$page", page).url)) || "/";
  const lang = languageTag ?? i18n2.getLanguageFromUrl(store_get($$store_subs ??= {}, "$page", page).url);
  function translateHref(href, hreflang) {
    try {
      const localisedCurrentUrl = new URL(get(page).url);
      const [localisedCurrentPath, suffix] = parseRoute(localisedCurrentUrl.pathname, absoluteBase);
      const canonicalCurrentPath = i18n2.strategy.getCanonicalPath(localisedCurrentPath, lang);
      const canonicalCurrentUrl = new URL(localisedCurrentUrl);
      canonicalCurrentUrl.pathname = serializeRoute(canonicalCurrentPath, absoluteBase, suffix);
      const original_to = new URL(href, new URL(canonicalCurrentUrl));
      if (isExternal(original_to, localisedCurrentUrl, absoluteBase) || i18n2.config.exclude(original_to.pathname)) return href;
      const targetLanguage = hreflang ?? lang;
      const [canonicalPath, dataSuffix] = parseRoute(original_to.pathname, absoluteBase);
      const translatedPath = i18n2.strategy.getLocalisedPath(canonicalPath, targetLanguage);
      const to = new URL(original_to);
      to.pathname = serializeRoute(translatedPath, absoluteBase, dataSuffix);
      return getHrefBetween(localisedCurrentUrl, to);
    } catch (error) {
      return href;
    }
  }
  setParaglideContext({ translateHref });
  head($$payload, ($$payload2) => {
    if (i18n2.config.seo.noAlternateLinks !== true && !i18n2.config.exclude(store_get($$store_subs ??= {}, "$page", page).url.pathname)) {
      $$payload2.out += "<!--[-->";
      AlternateLinks($$payload2, {
        availableLanguageTags: i18n2.config.runtime.availableLanguageTags,
        strategy: i18n2.strategy,
        currentLang: lang
      });
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]-->`;
  });
  $$payload.out += `<!---->`;
  {
    children?.($$payload);
    $$payload.out += `<!---->`;
  }
  $$payload.out += `<!---->`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function Icon($$payload, $$props) {
  let type = fallback($$props["type"], "success");
  if (type === "success") {
    $$payload.out += "<!--[-->";
    $$payload.out += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" height="20" width="20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"></path></svg>`;
  } else if (type === "error") {
    $$payload.out += "<!--[1-->";
    $$payload.out += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" height="20" width="20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path></svg>`;
  } else if (type === "info") {
    $$payload.out += "<!--[2-->";
    $$payload.out += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" height="20" width="20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd"></path></svg>`;
  } else if (type === "warning") {
    $$payload.out += "<!--[3-->";
    $$payload.out += `<svg viewBox="0 0 64 64" fill="currentColor" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M32.427,7.987c2.183,0.124 4,1.165 5.096,3.281l17.936,36.208c1.739,3.66 -0.954,8.585 -5.373,8.656l-36.119,0c-4.022,-0.064 -7.322,-4.631 -5.352,-8.696l18.271,-36.207c0.342,-0.65 0.498,-0.838 0.793,-1.179c1.186,-1.375 2.483,-2.111 4.748,-2.063Zm-0.295,3.997c-0.687,0.034 -1.316,0.419 -1.659,1.017c-6.312,11.979 -12.397,24.081 -18.301,36.267c-0.546,1.225 0.391,2.797 1.762,2.863c12.06,0.195 24.125,0.195 36.185,0c1.325,-0.064 2.321,-1.584 1.769,-2.85c-5.793,-12.184 -11.765,-24.286 -17.966,-36.267c-0.366,-0.651 -0.903,-1.042 -1.79,-1.03Z"></path><path d="M33.631,40.581l-3.348,0l-0.368,-16.449l4.1,0l-0.384,16.449Zm-3.828,5.03c0,-0.609 0.197,-1.113 0.592,-1.514c0.396,-0.4 0.935,-0.601 1.618,-0.601c0.684,0 1.223,0.201 1.618,0.601c0.395,0.401 0.593,0.905 0.593,1.514c0,0.587 -0.193,1.078 -0.577,1.473c-0.385,0.395 -0.929,0.593 -1.634,0.593c-0.705,0 -1.249,-0.198 -1.634,-0.593c-0.384,-0.395 -0.576,-0.886 -0.576,-1.473Z"></path></svg>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { type });
}
function Loader($$payload, $$props) {
  push();
  let visible = $$props["visible"];
  const bars = Array(12).fill(0);
  const each_array = ensure_array_like(bars);
  $$payload.out += `<div class="sonner-loading-wrapper"${attr("data-visible", visible)}><div class="sonner-spinner"><!--[-->`;
  for (let i = 0, $$length = each_array.length; i < $$length; i++) {
    each_array[i];
    $$payload.out += `<div class="sonner-loading-bar"></div>`;
  }
  $$payload.out += `<!--]--></div></div>`;
  bind_props($$props, { visible });
  pop();
}
function Toast($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  push();
  var $$store_subs;
  let isFront, isVisible, toastType, toastClass, toastDescriptionClass, heightIndex, coords, toastsHeightBefore, disabled, isPromiseLoadingOrInfiniteDuration;
  const TOAST_LIFETIME = 4e3;
  const GAP = 14;
  const TIME_BEFORE_UNMOUNT = 200;
  const defaultClasses = {
    toast: "",
    title: "",
    description: "",
    loader: "",
    closeButton: "",
    cancelButton: "",
    actionButton: "",
    action: "",
    warning: "",
    error: "",
    success: "",
    default: "",
    info: "",
    loading: ""
  };
  const {
    toasts,
    heights,
    removeHeight,
    remove
  } = toastState;
  let toast = $$props["toast"];
  let index = $$props["index"];
  let expanded = $$props["expanded"];
  let invert = $$props["invert"];
  let position = $$props["position"];
  let visibleToasts = $$props["visibleToasts"];
  let expandByDefault = $$props["expandByDefault"];
  let closeButton = $$props["closeButton"];
  let interacting = $$props["interacting"];
  let cancelButtonStyle = fallback($$props["cancelButtonStyle"], "");
  let actionButtonStyle = fallback($$props["actionButtonStyle"], "");
  let duration = fallback($$props["duration"], 4e3);
  let descriptionClass = fallback($$props["descriptionClass"], "");
  let classes = fallback($$props["classes"], () => ({}), true);
  let unstyled = fallback($$props["unstyled"], false);
  let mounted = false;
  let removed = false;
  let swiping = false;
  let swipeOut = false;
  let offsetBeforeRemove = 0;
  let initialHeight = 0;
  let offset = 0;
  let closeTimerStartTimeRef = 0;
  let lastCloseTimerStartTimeRef = 0;
  async function updateHeights() {
    {
      return;
    }
  }
  function deleteToast() {
    removed = true;
    offsetBeforeRemove = offset;
    removeHeight(toast.id);
    setTimeout(
      () => {
        remove(toast.id);
      },
      TIME_BEFORE_UNMOUNT
    );
  }
  let timeoutId;
  let remainingTime = toast.duration || duration || TOAST_LIFETIME;
  function pauseTimer() {
    if (lastCloseTimerStartTimeRef < closeTimerStartTimeRef) {
      const elapsedTime = (/* @__PURE__ */ new Date()).getTime() - closeTimerStartTimeRef;
      remainingTime = remainingTime - elapsedTime;
    }
    lastCloseTimerStartTimeRef = (/* @__PURE__ */ new Date()).getTime();
  }
  function startTimer() {
    closeTimerStartTimeRef = (/* @__PURE__ */ new Date()).getTime();
    timeoutId = setTimeout(
      () => {
        toast.onAutoClose?.(toast);
        deleteToast();
      },
      remainingTime
    );
  }
  let effect;
  getTranslationFunctions();
  classes = { ...defaultClasses, ...classes };
  isFront = index === 0;
  isVisible = index + 1 <= visibleToasts;
  toast.title;
  toast.description;
  toastType = toast.type;
  toastClass = toast.class || "";
  toastDescriptionClass = toast.descriptionClass || "";
  heightIndex = store_get($$store_subs ??= {}, "$heights", heights).findIndex((height) => height.toastId === toast.id) || 0;
  coords = position.split("-");
  toastsHeightBefore = store_get($$store_subs ??= {}, "$heights", heights).reduce(
    (prev, curr, reducerIndex) => {
      if (reducerIndex >= heightIndex) return prev;
      return prev + curr.height;
    },
    0
  );
  invert = toast.invert || invert;
  disabled = toastType === "loading";
  offset = Math.round(heightIndex * GAP + toastsHeightBefore);
  updateHeights();
  if (toast.updated) {
    clearTimeout(timeoutId);
    remainingTime = toast.duration || duration || TOAST_LIFETIME;
    startTimer();
  }
  isPromiseLoadingOrInfiniteDuration = toast.promise && toastType === "loading" || toast.duration === Number.POSITIVE_INFINITY;
  effect = useEffect(() => {
    if (!isPromiseLoadingOrInfiniteDuration) {
      if (expanded || interacting) {
        pauseTimer();
      } else {
        startTimer();
      }
    }
    return () => clearTimeout(timeoutId);
  });
  store_get($$store_subs ??= {}, "$effect", effect);
  if (toast.delete) {
    deleteToast();
  }
  $$payload.out += `<li${attr("aria-live", toast.important ? "assertive" : "polite")} aria-atomic="true" role="status"${attr("tabindex", 0)}${attr_class(clsx(cn($$sanitized_props.class, toastClass, classes?.toast, toast?.classes?.toast, classes?.[toastType], toast?.classes?.[toastType])))} data-sonner-toast=""${attr("data-styled", !(toast.component || toast?.unstyled || unstyled))}${attr("data-mounted", mounted)}${attr("data-promise", Boolean(toast.promise))}${attr("data-removed", removed)}${attr("data-visible", isVisible)}${attr("data-y-position", coords[0])}${attr("data-x-position", coords[1])}${attr("data-index", index)}${attr("data-front", isFront)}${attr("data-swiping", swiping)}${attr("data-type", toastType)}${attr("data-invert", invert)}${attr("data-swipe-out", swipeOut)}${attr("data-expanded", Boolean(expanded || expandByDefault && mounted))}${attr_style(`${$$sanitized_props.style} ${toast.style}`, {
    "--index": index,
    "--toasts-before": index,
    "--z-index": store_get($$store_subs ??= {}, "$toasts", toasts).length - index,
    "--offset": `${removed ? offsetBeforeRemove : offset}px`,
    "--initial-height": `${initialHeight}px`
  })}>`;
  if (closeButton && !toast.component) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<button aria-label="Close toast"${attr("data-disabled", disabled)} data-close-button=""${attr_class(clsx(cn(classes?.closeButton, toast?.classes?.closeButton)))}><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> `;
  if (toast.component) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<!---->`;
    toast.component?.($$payload, spread_props([toast.componentProps]));
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
    if (toastType !== "default" || toast.icon || toast.promise) {
      $$payload.out += "<!--[-->";
      $$payload.out += `<div data-icon="">`;
      if ((toast.promise || toastType === "loading") && !toast.icon) {
        $$payload.out += "<!--[-->";
        $$payload.out += `<!---->`;
        slot($$payload, $$props, "loading-icon", {}, null);
        $$payload.out += `<!---->`;
      } else {
        $$payload.out += "<!--[!-->";
      }
      $$payload.out += `<!--]--> `;
      if (toast.icon) {
        $$payload.out += "<!--[-->";
        $$payload.out += `<!---->`;
        toast.icon?.($$payload, {});
        $$payload.out += `<!---->`;
      } else if (toastType === "success") {
        $$payload.out += "<!--[1-->";
        $$payload.out += `<!---->`;
        slot($$payload, $$props, "success-icon", {}, null);
        $$payload.out += `<!---->`;
      } else if (toastType === "error") {
        $$payload.out += "<!--[2-->";
        $$payload.out += `<!---->`;
        slot($$payload, $$props, "error-icon", {}, null);
        $$payload.out += `<!---->`;
      } else if (toastType === "warning") {
        $$payload.out += "<!--[3-->";
        $$payload.out += `<!---->`;
        slot($$payload, $$props, "warning-icon", {}, null);
        $$payload.out += `<!---->`;
      } else if (toastType === "info") {
        $$payload.out += "<!--[4-->";
        $$payload.out += `<!---->`;
        slot($$payload, $$props, "info-icon", {}, null);
        $$payload.out += `<!---->`;
      } else {
        $$payload.out += "<!--[!-->";
      }
      $$payload.out += `<!--]--></div>`;
    } else {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]--> <div data-content="">`;
    if (toast.title) {
      $$payload.out += "<!--[-->";
      $$payload.out += `<div data-title=""${attr_class(clsx(cn(classes?.title, toast?.classes?.title)))}>`;
      if (typeof toast.title !== "string") {
        $$payload.out += "<!--[-->";
        $$payload.out += `<!---->`;
        toast.title?.($$payload, spread_props([toast.componentProps]));
        $$payload.out += `<!---->`;
      } else {
        $$payload.out += "<!--[!-->";
        $$payload.out += `${escape_html(toast.title)}`;
      }
      $$payload.out += `<!--]--></div>`;
    } else {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]--> `;
    if (toast.description) {
      $$payload.out += "<!--[-->";
      $$payload.out += `<div data-description=""${attr_class(clsx(cn(descriptionClass, toastDescriptionClass, classes?.description, toast.classes?.description)))}>`;
      if (typeof toast.description !== "string") {
        $$payload.out += "<!--[-->";
        $$payload.out += `<!---->`;
        toast.description?.($$payload, spread_props([toast.componentProps]));
        $$payload.out += `<!---->`;
      } else {
        $$payload.out += "<!--[!-->";
        $$payload.out += `${escape_html(toast.description)}`;
      }
      $$payload.out += `<!--]--></div>`;
    } else {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]--></div> `;
    if (toast.cancel) {
      $$payload.out += "<!--[-->";
      $$payload.out += `<button data-button="" data-cancel=""${attr_style(cancelButtonStyle)}${attr_class(clsx(cn(classes?.cancelButton, toast?.classes?.cancelButton)))}>${escape_html(toast.cancel.label)}</button>`;
    } else {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]--> `;
    if (toast.action) {
      $$payload.out += "<!--[-->";
      $$payload.out += `<button data-button=""${attr_style(actionButtonStyle)}${attr_class(clsx(cn(classes?.actionButton, toast?.classes?.actionButton)))}>${escape_html(toast.action.label)}</button>`;
    } else {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]-->`;
  }
  $$payload.out += `<!--]--></li>`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  bind_props($$props, {
    toast,
    index,
    expanded,
    invert,
    position,
    visibleToasts,
    expandByDefault,
    closeButton,
    interacting,
    cancelButtonStyle,
    actionButtonStyle,
    duration,
    descriptionClass,
    classes,
    unstyled
  });
  pop();
}
function Toaster($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "invert",
    "theme",
    "position",
    "hotkey",
    "containerAriaLabel",
    "richColors",
    "expand",
    "duration",
    "visibleToasts",
    "closeButton",
    "toastOptions",
    "offset",
    "dir"
  ]);
  push();
  var $$store_subs;
  let possiblePositions, hotkeyLabel;
  const VISIBLE_TOASTS_AMOUNT = 3;
  const VIEWPORT_OFFSET = "32px";
  const TOAST_WIDTH = 356;
  const GAP = 14;
  const DARK = "dark";
  const LIGHT = "light";
  function getInitialTheme(t) {
    if (t !== "system") {
      return t;
    }
    if (typeof window !== "undefined") {
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return DARK;
      }
      return LIGHT;
    }
    return LIGHT;
  }
  function getDocumentDirection() {
    if (typeof window === "undefined") return "ltr";
    if (typeof document === "undefined") return "ltr";
    const dirAttribute = document.documentElement.getAttribute("dir");
    if (dirAttribute === "auto" || !dirAttribute) {
      return window.getComputedStyle(document.documentElement).direction;
    }
    return dirAttribute;
  }
  let invert = fallback($$props["invert"], false);
  let theme2 = fallback($$props["theme"], "light");
  let position = fallback($$props["position"], "bottom-right");
  let hotkey = fallback($$props["hotkey"], () => ["altKey", "KeyT"], true);
  let containerAriaLabel = fallback($$props["containerAriaLabel"], "Notifications");
  let richColors = fallback($$props["richColors"], false);
  let expand = fallback($$props["expand"], false);
  let duration = fallback($$props["duration"], 4e3);
  let visibleToasts = fallback($$props["visibleToasts"], VISIBLE_TOASTS_AMOUNT);
  let closeButton = fallback($$props["closeButton"], false);
  let toastOptions = fallback($$props["toastOptions"], () => ({}), true);
  let offset = fallback($$props["offset"], null);
  let dir = fallback($$props["dir"], getDocumentDirection, true);
  const { toasts, heights } = toastState;
  let expanded = false;
  let interacting = false;
  let actualTheme = getInitialTheme(theme2);
  onDestroy(() => {
  });
  possiblePositions = Array.from(new Set([
    position,
    ...store_get($$store_subs ??= {}, "$toasts", toasts).filter((toast) => toast.position).map((toast) => toast.position)
  ].filter(Boolean)));
  hotkeyLabel = hotkey.join("+").replace(/Key/g, "").replace(/Digit/g, "");
  if (store_get($$store_subs ??= {}, "$toasts", toasts).length <= 1) {
    expanded = false;
  }
  {
    const toastsToDismiss = store_get($$store_subs ??= {}, "$toasts", toasts).filter((toast) => toast.dismiss && !toast.delete);
    if (toastsToDismiss.length > 0) {
      const updatedToasts = store_get($$store_subs ??= {}, "$toasts", toasts).map((toast) => {
        const matchingToast = toastsToDismiss.find((dismissToast) => dismissToast.id === toast.id);
        if (matchingToast) {
          return { ...toast, delete: true };
        }
        return toast;
      });
      toasts.set(updatedToasts);
    }
  }
  {
    if (theme2 !== "system") {
      actualTheme = theme2;
    }
    if (typeof window !== "undefined") {
      if (theme2 === "system") {
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
          actualTheme = DARK;
        } else {
          actualTheme = LIGHT;
        }
      }
      const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
      const changeHandler = ({ matches }) => {
        actualTheme = matches ? DARK : LIGHT;
      };
      if ("addEventListener" in mediaQueryList) {
        mediaQueryList.addEventListener("change", changeHandler);
      } else {
        mediaQueryList.addListener(changeHandler);
      }
    }
  }
  if (store_get($$store_subs ??= {}, "$toasts", toasts).length > 0) {
    $$payload.out += "<!--[-->";
    const each_array = ensure_array_like(possiblePositions);
    $$payload.out += `<section${attr("aria-label", `${containerAriaLabel} ${hotkeyLabel}`)}${attr("tabindex", -1)} class="svelte-1fo5d1m"><!--[-->`;
    for (let index = 0, $$length = each_array.length; index < $$length; index++) {
      let position2 = each_array[index];
      const each_array_1 = ensure_array_like(store_get($$store_subs ??= {}, "$toasts", toasts).filter((toast) => !toast.position && index === 0 || toast.position === position2));
      $$payload.out += `<ol${spread_attributes(
        {
          tabindex: -1,
          class: clsx($$sanitized_props.class),
          "data-sonner-toaster": true,
          "data-theme": actualTheme,
          "data-rich-colors": richColors,
          dir: dir === "auto" ? getDocumentDirection() : dir,
          "data-y-position": position2.split("-")[0],
          "data-x-position": position2.split("-")[1],
          style: $$sanitized_props.style,
          ...$$restProps
        },
        "svelte-1fo5d1m",
        void 0,
        {
          "--front-toast-height": `${store_get($$store_subs ??= {}, "$heights", heights)[0]?.height}px`,
          "--offset": typeof offset === "number" ? `${offset}px` : offset || VIEWPORT_OFFSET,
          "--width": `${TOAST_WIDTH}px`,
          "--gap": `${GAP}px`
        }
      )}><!--[-->`;
      for (let index2 = 0, $$length2 = each_array_1.length; index2 < $$length2; index2++) {
        let toast = each_array_1[index2];
        Toast($$payload, {
          index: index2,
          toast,
          invert,
          visibleToasts,
          closeButton,
          interacting,
          position: position2,
          expandByDefault: expand,
          expanded,
          actionButtonStyle: toastOptions?.actionButtonStyle || "",
          cancelButtonStyle: toastOptions?.cancelButtonStyle || "",
          class: toastOptions?.class || "",
          descriptionClass: toastOptions?.descriptionClass || "",
          classes: toastOptions.classes || {},
          duration: toastOptions?.duration ?? duration,
          unstyled: toastOptions.unstyled || false,
          $$slots: {
            "loading-icon": ($$payload2) => {
              $$payload2.out += `<!---->`;
              slot($$payload2, $$props, "loading-icon", {}, () => {
                Loader($$payload2, { visible: toast.type === "loading" });
              });
              $$payload2.out += `<!---->`;
            },
            "success-icon": ($$payload2) => {
              $$payload2.out += `<!---->`;
              slot($$payload2, $$props, "success-icon", {}, () => {
                Icon($$payload2, { type: "success" });
              });
              $$payload2.out += `<!---->`;
            },
            "error-icon": ($$payload2) => {
              $$payload2.out += `<!---->`;
              slot($$payload2, $$props, "error-icon", {}, () => {
                Icon($$payload2, { type: "error" });
              });
              $$payload2.out += `<!---->`;
            },
            "warning-icon": ($$payload2) => {
              $$payload2.out += `<!---->`;
              slot($$payload2, $$props, "warning-icon", {}, () => {
                Icon($$payload2, { type: "warning" });
              });
              $$payload2.out += `<!---->`;
            },
            "info-icon": ($$payload2) => {
              $$payload2.out += `<!---->`;
              slot($$payload2, $$props, "info-icon", {}, () => {
                Icon($$payload2, { type: "info" });
              });
              $$payload2.out += `<!---->`;
            }
          }
        });
      }
      $$payload.out += `<!--]--></ol>`;
    }
    $$payload.out += `<!--]--></section>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  bind_props($$props, {
    invert,
    theme: theme2,
    position,
    hotkey,
    containerAriaLabel,
    richColors,
    expand,
    duration,
    visibleToasts,
    closeButton,
    toastOptions,
    offset,
    dir
  });
  pop();
}
let timeoutAction;
let timeoutEnable;
function withoutTransition(action) {
  if (typeof document === "undefined")
    return;
  clearTimeout(timeoutAction);
  clearTimeout(timeoutEnable);
  const style = document.createElement("style");
  const css = document.createTextNode(`* {
     -webkit-transition: none !important;
     -moz-transition: none !important;
     -o-transition: none !important;
     -ms-transition: none !important;
     transition: none !important;
  }`);
  style.appendChild(css);
  const disable = () => document.head.appendChild(style);
  const enable = () => document.head.removeChild(style);
  if (typeof window.getComputedStyle !== "undefined") {
    disable();
    action();
    window.getComputedStyle(style).opacity;
    enable();
    return;
  }
  if (typeof window.requestAnimationFrame !== "undefined") {
    disable();
    action();
    window.requestAnimationFrame(enable);
    return;
  }
  disable();
  timeoutAction = window.setTimeout(() => {
    action();
    timeoutEnable = window.setTimeout(enable, 120);
  }, 120);
}
function sanitizeClassNames(classNames) {
  return classNames.filter((className) => className.length > 0);
}
const noopStorage = {
  getItem: (_key) => null,
  setItem: (_key, _value) => {
  }
};
const isBrowser = typeof document !== "undefined";
const modes = ["dark", "light", "system"];
const modeStorageKey = writable("mode-watcher-mode");
const themeStorageKey = writable("mode-watcher-theme");
const userPrefersMode = createUserPrefersMode();
const systemPrefersMode = createSystemMode();
const themeColors = writable(void 0);
const theme = createCustomTheme();
const disableTransitions = writable(true);
const darkClassNames = writable([]);
const lightClassNames = writable([]);
const derivedMode = createDerivedMode();
createDerivedTheme();
function createUserPrefersMode() {
  const defaultValue = "system";
  const storage = isBrowser ? localStorage : noopStorage;
  const initialValue = storage.getItem(getModeStorageKey());
  let value = isValidMode(initialValue) ? initialValue : defaultValue;
  function getModeStorageKey() {
    return get(modeStorageKey);
  }
  const { subscribe, set: _set } = writable(value, () => {
    if (!isBrowser)
      return;
    const handler = (e) => {
      if (e.key !== getModeStorageKey())
        return;
      const newValue = e.newValue;
      if (isValidMode(newValue)) {
        _set(value = newValue);
      } else {
        _set(value = defaultValue);
      }
    };
    addEventListener("storage", handler);
    return () => removeEventListener("storage", handler);
  });
  function set(v) {
    _set(value = v);
    storage.setItem(getModeStorageKey(), value);
  }
  return {
    subscribe,
    set
  };
}
function createCustomTheme() {
  const storage = isBrowser ? localStorage : noopStorage;
  const initialValue = storage.getItem(getThemeStorageKey());
  let value = initialValue === null || initialValue === void 0 ? "" : initialValue;
  function getThemeStorageKey() {
    return get(themeStorageKey);
  }
  const { subscribe, set: _set } = writable(value, () => {
    if (!isBrowser)
      return;
    const handler = (e) => {
      if (e.key !== getThemeStorageKey())
        return;
      const newValue = e.newValue;
      if (newValue === null) {
        _set(value = "");
      } else {
        _set(value = newValue);
      }
    };
    addEventListener("storage", handler);
    return () => removeEventListener("storage", handler);
  });
  function set(v) {
    _set(value = v);
    storage.setItem(getThemeStorageKey(), value);
  }
  return {
    subscribe,
    set
  };
}
function createSystemMode() {
  const defaultValue = void 0;
  let track = true;
  const { subscribe, set } = writable(defaultValue, () => {
    if (!isBrowser)
      return;
    const handler = (e) => {
      if (!track)
        return;
      set(e.matches ? "light" : "dark");
    };
    const mediaQueryState = window.matchMedia("(prefers-color-scheme: light)");
    mediaQueryState.addEventListener("change", handler);
    return () => mediaQueryState.removeEventListener("change", handler);
  });
  function query() {
    if (!isBrowser)
      return;
    const mediaQueryState = window.matchMedia("(prefers-color-scheme: light)");
    set(mediaQueryState.matches ? "light" : "dark");
  }
  function tracking(active) {
    track = active;
  }
  return {
    subscribe,
    query,
    tracking
  };
}
function createDerivedMode() {
  const { subscribe } = derived([
    userPrefersMode,
    systemPrefersMode,
    themeColors,
    disableTransitions,
    darkClassNames,
    lightClassNames
  ], ([$userPrefersMode, $systemPrefersMode, $themeColors, $disableTransitions, $darkClassNames, $lightClassNames]) => {
    if (!isBrowser)
      return void 0;
    const derivedMode2 = $userPrefersMode === "system" ? $systemPrefersMode : $userPrefersMode;
    const sanitizedDarkClassNames = sanitizeClassNames($darkClassNames);
    const sanitizedLightClassNames = sanitizeClassNames($lightClassNames);
    function update() {
      const htmlEl = document.documentElement;
      const themeColorEl = document.querySelector('meta[name="theme-color"]');
      if (derivedMode2 === "light") {
        if (sanitizedDarkClassNames.length)
          htmlEl.classList.remove(...sanitizedDarkClassNames);
        if (sanitizedLightClassNames.length)
          htmlEl.classList.add(...sanitizedLightClassNames);
        htmlEl.style.colorScheme = "light";
        if (themeColorEl && $themeColors) {
          themeColorEl.setAttribute("content", $themeColors.light);
        }
      } else {
        if (sanitizedLightClassNames.length)
          htmlEl.classList.remove(...sanitizedLightClassNames);
        if (sanitizedDarkClassNames.length)
          htmlEl.classList.add(...sanitizedDarkClassNames);
        htmlEl.style.colorScheme = "dark";
        if (themeColorEl && $themeColors) {
          themeColorEl.setAttribute("content", $themeColors.dark);
        }
      }
    }
    if ($disableTransitions) {
      withoutTransition(update);
    } else {
      update();
    }
    return derivedMode2;
  });
  return {
    subscribe
  };
}
function createDerivedTheme() {
  const { subscribe } = derived([theme, disableTransitions], ([$theme, $disableTransitions]) => {
    if (!isBrowser)
      return void 0;
    function update() {
      const htmlEl = document.documentElement;
      htmlEl.setAttribute("data-theme", $theme);
    }
    if ($disableTransitions) {
      withoutTransition(update);
    } else {
      update();
    }
    return $theme;
  });
  return {
    subscribe
  };
}
function isValidMode(value) {
  if (typeof value !== "string")
    return false;
  return modes.includes(value);
}
function Sonner_1($$payload, $$props) {
  var $$store_subs;
  let { $$slots, $$events, ...restProps } = $$props;
  Toaster($$payload, spread_props([
    {
      theme: store_get($$store_subs ??= {}, "$mode", derivedMode),
      class: "toaster group"
    },
    restProps
  ]));
  if ($$store_subs) unsubscribe_stores($$store_subs);
}
function bg($$payload) {
  $$payload.out += `<div class="relative h-full w-full"><div class="absolute bottom-0 w-full overflow-x-clip"><div class="grid origin-bottom scale-x-[1.8] scale-y-[4] md:scale-[1.5]"><svg class="cell-1 waves origin-bottom translate-x-[200px] scale-x-[1.5] scale-y-[1.4] lg:translate-x-[100px] lg:scale-x-[1] lg:scale-y-[1.8] svelte-s1857a" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#e4d5b7" fill-opacity="1" d="M0,224L30,186.7C60,149,120,75,180,69.3C240,64,300,128,360,160C420,192,480,192,540,202.7C600,213,660,235,720,218.7C780,203,840,149,900,149.3C960,149,1020,203,1080,229.3C1140,256,1200,256,1260,234.7C1320,213,1380,171,1410,149.3L1440,128L1440,320L1410,320C1380,320,1320,320,1260,320C1200,320,1140,320,1080,320C1020,320,960,320,900,320C840,320,780,320,720,320C660,320,600,320,540,320C480,320,420,320,360,320C300,320,240,320,180,320C120,320,60,320,30,320L0,320Z"></path></svg> <svg class="cell-1 waves svelte-s1857a" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#fff0db" fill-opacity="1" d="M0,288L34.3,256C68.6,224,137,160,206,144C274.3,128,343,160,411,192C480,224,549,256,617,234.7C685.7,213,754,139,823,117.3C891.4,96,960,128,1029,128C1097.1,128,1166,96,1234,74.7C1302.9,53,1371,43,1406,37.3L1440,32L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"></path></svg> <svg class="cell-1 waves svelte-s1857a" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#faf0e6" fill-opacity="1" d="M0,128L34.3,128C68.6,128,137,128,206,154.7C274.3,181,343,235,411,245.3C480,256,549,224,617,224C685.7,224,754,256,823,272C891.4,288,960,288,1029,261.3C1097.1,235,1166,181,1234,181.3C1302.9,181,1371,235,1406,261.3L1440,288L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"></path></svg></div></div></div>`;
}
function _layout($$payload, $$props) {
  let { children } = $$props;
  ParaglideJS($$payload, {
    i18n,
    children: ($$payload2) => {
      Sonner_1($$payload2, {
        theme: "light",
        position: "top-right",
        closeButton: true,
        richColors: true
      });
      $$payload2.out += `<!----> <!---->`;
      Provider($$payload2, {
        children: ($$payload3) => {
          $$payload3.out += `<div class="grid"><div class="cell-1 z-10">`;
          children($$payload3);
          $$payload3.out += `<!----></div> <div class="cell-1 fixed h-[100vh] w-full bg-[#fffde8]">`;
          bg($$payload3);
          $$payload3.out += `<!----></div></div>`;
        }
      });
      $$payload2.out += `<!---->`;
    }
  });
}
export {
  _layout as default
};
