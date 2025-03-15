import { P as escape_html, y as pop, w as push } from "../../chunks/index.js";
import "clsx";
import { p as page } from "../../chunks/index5.js";
function Error($$payload, $$props) {
  push();
  $$payload.out += `<h1>${escape_html(page.status)}</h1> <p>${escape_html(page.error?.message)}</p>`;
  pop();
}
export {
  Error as default
};
