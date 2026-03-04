"use client";

import { Client } from "@/lib/reactQuery";
import { invalidateServerCache } from "../actions";

const Test = () => {
  const clearCacheClick = async () => {
    await invalidateServerCache("/inventory");
    Client.invalidateQueries({ queryKey: ["posts"] });
  };
  return (
    <button className="bg-primary" onClick={clearCacheClick}>
      Clear Cache
    </button>
  );
};

export default Test;
