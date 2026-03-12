import { $t } from "@/plugins/i18n";
import { stock } from "@/router/enums";

export default {
  path: "/stock",
  redirect: "/stock/candlestick-brush",
  meta: {
    icon: "ri/stock-line",
    title: $t("menus.pureStock"),
    rank: stock
  },
  children: [
    {
      path: "/stock/candlestick-brush",
      name: "CandlestickBrush",
      component: () => import("@/views/stock/candlestick-brush/index.vue"),
      meta: {
        title: $t("menus.pureCandlestickBrush")
      }
    }
  ]
} satisfies RouteConfigsTable;
