import { create } from "zustand";

export const useFeedStore = create((set) => ({
  shuffledFeed: [],
  setShuffledFeed: (feed) =>
    set({
      shuffledFeed: [...feed].sort(() => Math.random() - 0.5),
    }),
}));
