import { on, hookFragments, IsolatedFragment } from "../dist/index.js";
import { createVNode, hydrateChildren, hydrate, Fragment } from "@opennetwork/vnode";

const context = {
  hydrate: (node, tree) => {
    return hydrateChildren(context, node, tree)
  }
};

function createInstance() {
  return createVNode(
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
    on(3, node => console.log("We have a reference to 3", node)),
    {},
    createInstance()
  );

  await hydrate(context, await hookFragments()(simpleReferenceFragment));

  const isReferenceFragment = createVNode(
    on(node => node.source === "button", node => console.log("We have a reference to a button", node)),
    {},
    createInstance()
  );

  await hydrate(context, await hookFragments()(isReferenceFragment));

  const anyReferenceFragment = createVNode(
    on(node => console.log("We have a reference", node)),
    {},
    createInstance()
  );

  await hydrate(context, await hookFragments()(anyReferenceFragment));
}

run()
  .then(() => console.log("Complete"))
  .catch(error => console.error(error));


