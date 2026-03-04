import { IInventoryDisplay } from "@/interface/Inventory";
import axiosInstance from "@/lib/axiosInstance";

export default {
  getInventory: async (
    showAvailableItems: boolean,
    location?: string,
  ): Promise<IInventoryDisplay[]> => {
    return (
      await axiosInstance.get("/item/list", {
        params: {
          showAvailableItems,
          location,
        },
      })
    ).data;
  },
};
