/** Tiny DOM helpers -- no framework, this app is small enough not to need one. */

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  children: (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else node.setAttribute(k, v);
  }
  for (const c of children) node.append(c);
  return node;
}

export function mount(root: HTMLElement, node: Node): void {
  root.replaceChildren(node);
}

export function button(label: string, onClick: () => void, extraClass = ""): HTMLButtonElement {
  const b = el("button", { class: `btn ${extraClass}`.trim() }, [label]);
  b.addEventListener("click", onClick);
  return b;
}
