"use client";

import { Client } from "@/lib/reactQuery";

const Test = () => {
  const clearCacheClick = () => {
    Client.invalidateQueries({ queryKey: ["posts"] });
  };
  return (
    <button className="bg-primary" onClick={clearCacheClick}>
      Clear Cache
    </button>
  );
};

export default Test;
