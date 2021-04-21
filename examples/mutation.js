import dom from "./jsdom.js";
import { mutate, hookFragments, IsolatedFragment } from "../dist/index.js";
import { createVNode, Fragment } from "@opennetwork/vnode";
import {createTimeline, marshalTimeline} from "@opennetwork/vdom";
import { render, DOMVContext } from "@opennetwork/vdom";
import { v4 } from "uuid";

const context = new DOMVContext({
  root: dom.window.document.body
});

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

  const mutateFragment = createVNode(
    mutate(node => node.source === "button", node => ({
      ...node,
      source: "div",
      options: {
        ...node.options,
        "aria-role": "button",
        class: "button"
      }
    })),
    {},
    createInstance()
  );

  const timelinePromise = createTimeline(context);

  await render(await hookFragments()(mutateFragment), context);

  await context.close();

  console.log(JSON.stringify(await marshalTimeline(await timelinePromise, v4), undefined, "  "))
}

run()
  .catch(error => console.error(error));


