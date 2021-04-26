import dom from "./jsdom.js";
import { mutate, Hook, Isolated } from "../dist/index.js";
import { createNode, Fragment } from "@opennetwork/vnode";
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
        createNode(
          "button",
          {
            reference: 2,
            attributes: {
              class: "primary"
            }
          },
          "I am a primary button, but different"
        )
      )
    )
  )
}

async function run() {

  debugger;

  console.log("start");

  const mutateFragment = createNode(
    mutate(node => node.source === "button", node => ({
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
    })),
    {},
    createInstance()
  );

  const timelinePromise = createTimeline(context, logTimeline);

  await render(createNode(Hook, {}, mutateFragment), context);

  await context.close();

  console.log(JSON.stringify(logTimeline(await timelinePromise), undefined, "  "))
}

async function logTimeline(timeline) {
  return marshalTimeline(timeline, v4);
}

run()
  .catch(error => console.error(error));


