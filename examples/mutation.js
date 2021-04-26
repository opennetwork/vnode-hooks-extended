import dom from "./jsdom.js";
import {Hook, Isolated, Mutation, Reference} from "../dist/index.js";
import { createNode } from "@opennetwork/vnode";
import { createTimeline, marshalTimeline } from "@opennetwork/vdom";
import { render, DOMVContext } from "@opennetwork/vdom";
import { v4 } from "uuid";

const context = new DOMVContext({
  root: dom.window.document.body
});

function createInstance() {
  return createNode(
    "main",
    {
      type: "Element",
      attributes: {
        class: "main-content"
      }
    },
    createNode(
      "button",
      {
        type: "Element",
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
        type: "Element",
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
          type: "Element",
          reference: 2,
          attributes: {
            class: "primary"
          }
        },
        "I am a primary button, but different"
      )
    )
  )
}

async function run() {

  const mutateFragment = createNode(
    Reference,
    {
      on: console.log
    },
    createNode(
      Mutation,
      {
        is(node) {
          return node.source === "button"
        },
        mutate(node) {
          console.log({ node });
          return {
            ...node,
            source: "div",
            options: {
              ...node.options,
              attributes: {
                ...node.options.attributes,
                "aria-role": "button",
                class: "button"
              }
            }
          }
        }
      },
      createInstance()
    )
  );

  // const timelinePromise = createTimeline(context, logTimeline);

  await render(createNode(Hook, {}, mutateFragment), context);

  await context.close();

  console.log(dom.serialize());

  // console.log(JSON.stringify(logTimeline(await timelinePromise), undefined, "  "))
}

async function logTimeline(timeline) {
  return marshalTimeline(timeline, v4);
}

run()
  .catch(error => console.error(error.errors ?? error));


