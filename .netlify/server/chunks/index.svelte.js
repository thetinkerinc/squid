import "clsx";
import { p as page } from "./index5.js";
import "js-cookie";
import * as devalue from "devalue";
class Local {
  cookies = void 0;
  cookieName = "_tti_isolocal";
  defaults;
  constructor(cookieJar, defaults) {
    this.defaults = defaults ?? {};
    if (cookieJar) {
      cookieJar.rm = cookieJar.delete;
      this.cookies = cookieJar;
    }
  }
  getAll() {
    if (this.cookies) {
      return { ...this.defaults, ...this.parseCookie() };
    } else {
      return {
        ...this.defaults,
        ...page.data.localStorage ?? {}
      };
    }
  }
  clear() {
    if (!this.cookies) {
      throw new Error("Local storage can only be cleared in load functions and in the browser");
    }
    this.cookies.rm(this.cookieName, { path: "/", secure: true, sameSite: "strict" });
  }
  save(vals) {
    if (!this.cookies) {
      throw new Error("Local storage can only be set in load functions and in the browser");
    }
    this.cookies.set(this.cookieName, devalue.stringify(vals), {
      expires: nextYear(),
      path: "/",
      secure: true,
      sameSite: "strict"
    });
  }
  parseCookie() {
    if (!this.cookies) {
      throw new Error("Cookies can only be parsed in load functions and in the browser");
    }
    return devalue.parse(this.cookies.get(this.cookieName) ?? "[{}]");
  }
}
function makeLocalStorage(cookieJar, defaults) {
  return new Proxy(new Local(cookieJar, defaults), {
    get(target, prop, receiver) {
      const key = prop.toString();
      const internal = [
        "cookies",
        "cookieName",
        "parseCookie",
        "defaults",
        "getAll",
        "clear",
        "save"
      ];
      if (internal.includes(key)) {
        return Reflect.get(target, prop, receiver);
      }
      {
        const vals = target.getAll();
        return vals[key] ?? target.defaults[key];
      }
    },
    set(target, prop, value) {
      const key = prop.toString();
      const internal = ["defaults"];
      if (internal.includes(key)) {
        return Reflect.set(target, prop, value);
      }
      {
        const vals = target.getAll();
        vals[key] = value;
        target.save(vals);
      }
      return true;
    },
    deleteProperty(target, prop) {
      const key = prop.toString();
      {
        const vals = target.getAll();
        delete vals[key];
        target.save(vals);
      }
      return true;
    }
  });
}
function nextYear() {
  return new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3);
}
const local = makeLocalStorage(void 0, void 0);
function addLocalStorage(defaults) {
  return ({ event, resolve }) => {
    event.locals.localStorage = makeLocalStorage(event.cookies, defaults);
    return resolve(event);
  };
}
function getPageData(event) {
  const { localStorage } = event.locals;
  return {
    localStorage: localStorage.getAll(),
    localStorageDefaults: localStorage.defaults
  };
}
export {
  addLocalStorage as a,
  getPageData as g,
  local as l
};
