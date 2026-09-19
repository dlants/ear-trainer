import { ActivityCatalogView } from "../views/activity-catalog.ts";

document.addEventListener("click", (event) => event.preventDefault());

new ActivityCatalogView(
  document.body,
  (message) => {
    if (message.type !== "ACTIVATE_ACTIVITY") return;
    const context = new AudioContext();
    void context.resume().then(() => console.log(`unlock:${context.state}`));
  },
  {},
);
