import { HelloView, type Msg, type State, update } from "./views/hello.ts";

const container = document.getElementById("app");
if (!container) throw new Error("missing #app");

const state: State = { taps: 0 };
let dispatching = false;

function dispatch(msg: Msg): void {
  if (dispatching) throw new Error("dispatch-in-dispatch");
  dispatching = true;
  update(state, msg);
  view.sync(state);
  dispatching = false;
}

const view = new HelloView(container, dispatch, state);
