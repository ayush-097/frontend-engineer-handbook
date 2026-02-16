/**
 * Virtual DOM Implementation
 * 
 * A minimal vDOM system implementing:
 * - createElement: build virtual nodes
 * - render: vnode → real DOM
 * - diff: compute changes between two vnode trees  
 * - patch: apply patches to real DOM
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export const PatchType = {
  REPLACE:      'REPLACE',
  UPDATE_PROPS: 'UPDATE_PROPS',
  REMOVE:       'REMOVE',
  ADD:          'ADD',
  TEXT:         'TEXT',
  REORDER:      'REORDER',
};

// ─── createElement ────────────────────────────────────────────────────────────

/**
 * Create a virtual DOM node
 * @param {string|Function} tag - HTML tag name or component function
 * @param {Object|null} props - Element attributes and event listeners
 * @param  {...(VNode|string)} children - Child vnodes or text
 * @returns {VNode}
 */
export function createElement(tag, props, ...children) {
  // Handle functional components
  if (typeof tag === 'function') {
    return tag({ ...props, children });
  }

  const flatChildren = children.flat().map(child => {
    if (child === null || child === undefined || child === false) return null;
    if (typeof child === 'string' || typeof child === 'number') {
      return createTextNode(String(child));
    }
    return child;
  }).filter(Boolean);

  return {
    tag,
    props: props || {},
    children: flatChildren,
    key: props?.key ?? null,
  };
}

function createTextNode(value) {
  return { tag: '#text', props: {}, children: [], value };
}

// ─── render ───────────────────────────────────────────────────────────────────

/**
 * Convert a virtual node to a real DOM node
 * @param {VNode} vnode
 * @returns {Node} Real DOM node
 */
export function render(vnode) {
  if (!vnode) return document.createTextNode('');

  // Text node
  if (vnode.tag === '#text') {
    return document.createTextNode(vnode.value);
  }

  // Element node
  const el = document.createElement(vnode.tag);

  // Set properties
  setProps(el, vnode.props);

  // Render children
  vnode.children.forEach(child => {
    el.appendChild(render(child));
  });

  return el;
}

function setProps(el, props) {
  Object.entries(props).forEach(([key, value]) => {
    if (key === 'key') return; // Internal — don't set as attribute

    if (key.startsWith('on') && typeof value === 'function') {
      // Event listener: onClick → click
      const event = key.slice(2).toLowerCase();
      el.addEventListener(event, value);
    } else if (key === 'className') {
      el.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value);
    } else if (typeof value === 'boolean') {
      if (value) el.setAttribute(key, '');
      else el.removeAttribute(key);
    } else {
      el.setAttribute(key, value);
    }
  });
}

function removeProps(el, props) {
  Object.keys(props).forEach(key => {
    if (key.startsWith('on') && typeof props[key] === 'function') {
      el.removeEventListener(key.slice(2).toLowerCase(), props[key]);
    } else {
      el.removeAttribute(key);
    }
  });
}

// ─── diff ─────────────────────────────────────────────────────────────────────

/**
 * Compute the minimal set of changes between two vnodes
 * @param {VNode} oldVnode
 * @param {VNode} newVnode
 * @returns {Array<Patch>} List of patches
 */
export function diff(oldVnode, newVnode) {
  const patches = [];
  diffNode(oldVnode, newVnode, patches, []);
  return patches;
}

function diffNode(oldNode, newNode, patches, path) {
  // Both null
  if (!oldNode && !newNode) return;

  // Node removed
  if (oldNode && !newNode) {
    patches.push({ type: PatchType.REMOVE, path });
    return;
  }

  // Node added
  if (!oldNode && newNode) {
    patches.push({ type: PatchType.ADD, path, vnode: newNode });
    return;
  }

  // Different tag or text content changed → replace
  if (
    oldNode.tag !== newNode.tag ||
    (oldNode.tag === '#text' && oldNode.value !== newNode.value)
  ) {
    patches.push({ type: PatchType.REPLACE, path, vnode: newNode });
    return;
  }

  // Same tag — diff props
  const propPatches = diffProps(oldNode.props, newNode.props);
  if (Object.keys(propPatches).length > 0) {
    patches.push({ type: PatchType.UPDATE_PROPS, path, props: propPatches });
  }

  // Diff children
  diffChildren(oldNode.children, newNode.children, patches, path);
}

function diffProps(oldProps, newProps) {
  const patches = {};

  // Removed or changed props
  Object.keys(oldProps).forEach(key => {
    if (key === 'key') return;
    if (!(key in newProps)) {
      patches[key] = null; // null = remove
    } else if (oldProps[key] !== newProps[key]) {
      patches[key] = newProps[key];
    }
  });

  // Added props
  Object.keys(newProps).forEach(key => {
    if (key === 'key') return;
    if (!(key in oldProps)) {
      patches[key] = newProps[key];
    }
  });

  return patches;
}

function diffChildren(oldChildren, newChildren, patches, path) {
  const maxLen = Math.max(oldChildren.length, newChildren.length);

  for (let i = 0; i < maxLen; i++) {
    diffNode(
      oldChildren[i],
      newChildren[i],
      patches,
      [...path, i]
    );
  }
}

// ─── patch ────────────────────────────────────────────────────────────────────

/**
 * Apply patches to a real DOM node
 * @param {Node} root - Real DOM root node
 * @param {Array<Patch>} patches
 */
export function patch(root, patches) {
  patches.forEach(p => {
    const node = getNodeAtPath(root, p.path);

    switch (p.type) {
      case PatchType.REPLACE:
        const newEl = render(p.vnode);
        node.parentNode.replaceChild(newEl, node);
        break;

      case PatchType.UPDATE_PROPS:
        Object.entries(p.props).forEach(([key, value]) => {
          if (value === null) {
            node.removeAttribute(key);
          } else if (key.startsWith('on')) {
            // Re-bind event listener
            const event = key.slice(2).toLowerCase();
            node.addEventListener(event, value);
          } else {
            node.setAttribute(key, value);
          }
        });
        break;

      case PatchType.REMOVE:
        node.parentNode.removeChild(node);
        break;

      case PatchType.ADD:
        const addedEl = render(p.vnode);
        node.appendChild(addedEl);
        break;
    }
  });
}

function getNodeAtPath(root, path) {
  return path.reduce((node, index) => {
    return node.childNodes[index];
  }, root);
}
