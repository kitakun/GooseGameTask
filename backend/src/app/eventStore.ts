/// <reference path="../shared/types/eventstore.d.ts" />
import eventstore from "eventstore";

// Для быстрого теста инмемори
export const eventStore = eventstore({
  type: "inmemory",
});

export default eventStore;
