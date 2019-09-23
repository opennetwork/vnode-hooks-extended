import { on, hookFragments, IsolatedFragment } from "../dist/index.js";
import { createVNode, hydrateChildren, hydrate, Fragment } from "@opennetwork/vnode";
import { asyncExtendedIterable } from "iterable";

const context = {
  hydrate: (node, tree) => {
    return hydrateChildren(context, node, tree)
  }
};

function createInstance() {
  return createVNode(
    context,
    {
      reference: 1,
      source: "main",
      options: {
        class: "main-content"
      },
      children: [
        [
          {
            reference: 2,
            source: "button",
            options: {
              class: "primary"
            },
            children: [
              ["I am a primary button"]
            ]
          },
          {
            reference: 3,
            source: "button",
            options: {
              class: "secondary"
            },
            children: [
              ["I am a secondary button"]
            ]
          }
        ],
        [
          {
            // Warning, this works in JavaScript, but the MarshalledVNode type doesn't allow it
            //
            // The way createVNode works, it "just works"
            reference: Fragment,
            source: IsolatedFragment,
            children: [
              [
                {
                  reference: 2,
                  source: "button",
                  options: {
                    class: "primary"
                  },
                  children: [
                    ["I am a primary button"]
                  ]
                },
                {
                  reference: 3,
                  source: "button",
                  options: {
                    class: "primary"
                  },
                  children: [
                    ["I am now a primary button"]
                  ]
                }
              ]
            ]
          }
        ]
      ]
    },
    {}
  )
}

async function run() {
  const simpleReferenceFragment = createVNode(
    context,
    on(3, node => console.log("We have a reference to 3", node)),
    {},
    createInstance()
  );

  await asyncExtendedIterable(hookFragments()(simpleReferenceFragment)).forEach(node => hydrate(context, node));

  const isReferenceFragment = createVNode(
    context,
    on(node => node.source === "button", node => console.log("We have a reference to a button", node)),
    {},
    createInstance()
  );

  await asyncExtendedIterable(hookFragments()(isReferenceFragment)).forEach(node => hydrate(context, node));

  const anyReferenceFragment = createVNode(
    context,
    on(node => console.log("We have a reference", node)),
    {},
    createInstance()
  );

  await asyncExtendedIterable(hookFragments()(anyReferenceFragment)).forEach(node => hydrate(context, node));
}

run()
  .then(() => console.log("Complete"))
  .catch(error => console.error(error));


