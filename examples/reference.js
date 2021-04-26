import {Hook, Isolated, Reference} from "../dist/index.js";
import {hydrateChildren, hydrate, Fragment, createNode} from "@opennetwork/vnode";

const context = {
  hydrate: (node, tree) => {
    return hydrateChildren(context, node, tree)
  }
};

function createInstance() {
  return createNode(
    "main",
    {
      attributes: {
        class: "main-content"
      }
    },
    createNode(
      "button",
      {
        reference: 2,
        attributes: {
          class: "primary"
        }
      },
      "I am a primary button"
    ),
    createNode(
      "button",
      {
        reference: 3,
        attributes: {
          class: "secondary"
        }
      },
      "I am a secondary button"
    ),
    createNode(
      Isolated,
      {},
      createNode(
        "button",
        {
          reference: 2,
          attributes: {
            class: "primary different"
          }
        },
        "I am a primary button, but different"
      )
    )
  )
}

async function run() {

  const simpleReferenceFragment = createNode(
    Reference,
    {
      is: 3,
      on(node) {
        console.log("We have a reference to 3", node)
      }
    },
    createInstance()
  );

  await hydrate(context, createNode(Hook, {}, simpleReferenceFragment));

  const isReferenceFragment = createNode(
    Reference,
    {
      is(node) {
        return node.source === "button"
      },
      on(node) {
        console.log("We have a reference to a button", node)
      }
    },
    createInstance()
  );

  await hydrate(context, createNode(Hook, {}, isReferenceFragment));

  const anyReferenceFragment = createNode(
    Reference,
    {
      on(node) {
        console.log("We have a reference", node)
      }
    },
    createInstance()
  );

  await hydrate(context, createNode(Hook, {}, anyReferenceFragment));
}

run()
  .then(() => console.log("Complete"))
  .catch(error => console.error(error));


