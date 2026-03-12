<script setup lang="ts">
import type { ECharts } from "echarts/core";
import echarts from "@/plugins/echarts";
import { mockStockData, type StockPoint } from "./data";
import { useDark } from "@pureadmin/utils";
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch
} from "vue";

defineOptions({
  name: "CandlestickBrush"
});

type StockData = {
  categoryData: string[];
  values: number[][];
  volumes: Array<[number, number, 1 | -1]>;
};

const chartRef = ref<HTMLDivElement>();
const chartInstance = shallowRef<ECharts>();
const rawData = ref<StockPoint[]>(mockStockData);

const exampleUrl =
  "https://echarts.org.cn/examples/en/editor.html?c=candlestick-brush&lang=ts";

const { isDark } = useDark();
const chartTheme = computed(() => (isDark.value ? "dark" : "light"));

function splitData(source: StockPoint[]): StockData {
  const categoryData: string[] = [];
  const values: number[][] = [];
  const volumes: Array<[number, number, 1 | -1]> = [];

  source.forEach((item, index) => {
    const [date, open, close, low, high, volume] = item;
    categoryData.push(date);
    values.push([open, close, low, high, volume]);
    volumes.push([index, volume, open > close ? 1 : -1]);
  });

  return {
    categoryData,
    values,
    volumes
  };
}

function calculateMA(dayCount: number, data: StockData) {
  const result: Array<number | string> = [];

  for (let index = 0; index < data.values.length; index++) {
    if (index < dayCount) {
      result.push("-");
      continue;
    }

    let sum = 0;

    for (let offset = 0; offset < dayCount; offset++) {
      sum += data.values[index - offset][1];
    }

    result.push(+(sum / dayCount).toFixed(3));
  }

  return result;
}

function buildOption(data: StockData) {
  const upColor = "#00da3c";
  const downColor = "#ec0000";

  return {
    animation: false,
    legend: {
      bottom: 10,
      left: "center",
      data: ["Dow-Jones index", "MA5", "MA10", "MA20", "MA30"]
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross"
      },
      borderWidth: 1,
      borderColor: "#ccc",
      padding: 10,
      textStyle: {
        color: "#000"
      },
      position(pos, _params, _el, _rect, size) {
        const point = pos as number[];
        const currentSize = size as { viewSize: number[] };
        const position = {
          top: 10
        } as Record<string, number>;

        position[["left", "right"][+(point[0] < currentSize.viewSize[0] / 2)]] =
          30;
        return position;
      }
    },
    axisPointer: {
      link: [
        {
          xAxisIndex: "all"
        }
      ],
      label: {
        backgroundColor: "#777"
      }
    },
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: false
        },
        brush: {
          type: ["lineX", "clear"]
        }
      }
    },
    brush: {
      xAxisIndex: "all",
      brushLink: "all",
      outOfBrush: {
        colorAlpha: 0.1
      }
    },
    visualMap: {
      show: false,
      seriesIndex: 5,
      dimension: 2,
      pieces: [
        {
          value: 1,
          color: downColor
        },
        {
          value: -1,
          color: upColor
        }
      ]
    },
    grid: [
      {
        left: "10%",
        right: "8%",
        height: "50%"
      },
      {
        left: "10%",
        right: "8%",
        top: "63%",
        height: "16%"
      }
    ],
    xAxis: [
      {
        type: "category",
        data: data.categoryData,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        min: "dataMin",
        max: "dataMax",
        axisPointer: {
          z: 100
        }
      },
      {
        type: "category",
        gridIndex: 1,
        data: data.categoryData,
        boundaryGap: false,
        axisLine: { onZero: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        min: "dataMin",
        max: "dataMax"
      }
    ],
    yAxis: [
      {
        scale: true,
        splitArea: {
          show: true
        }
      },
      {
        scale: true,
        gridIndex: 1,
        splitNumber: 2,
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false }
      }
    ],
    dataZoom: [
      {
        type: "inside",
        xAxisIndex: [0, 1],
        start: 98,
        end: 100
      },
      {
        show: true,
        xAxisIndex: [0, 1],
        type: "slider",
        top: "85%",
        start: 98,
        end: 100
      }
    ],
    series: [
      {
        name: "Dow-Jones index",
        type: "candlestick",
        data: data.values,
        itemStyle: {
          color: upColor,
          color0: downColor,
          borderColor: undefined,
          borderColor0: undefined
        }
      },
      {
        name: "MA5",
        type: "line",
        data: calculateMA(5, data),
        smooth: true,
        lineStyle: {
          opacity: 0.5
        }
      },
      {
        name: "MA10",
        type: "line",
        data: calculateMA(10, data),
        smooth: true,
        lineStyle: {
          opacity: 0.5
        }
      },
      {
        name: "MA20",
        type: "line",
        data: calculateMA(20, data),
        smooth: true,
        lineStyle: {
          opacity: 0.5
        }
      },
      {
        name: "MA30",
        type: "line",
        data: calculateMA(30, data),
        smooth: true,
        lineStyle: {
          opacity: 0.5
        }
      },
      {
        name: "Volume",
        type: "bar",
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: data.volumes
      }
    ]
  } as any;
}

function disposeChart() {
  chartInstance.value?.dispose();
  chartInstance.value = undefined;
}

function resizeChart() {
  chartInstance.value?.resize();
}

function renderChart() {
  if (!chartRef.value || rawData.value.length === 0) return;

  disposeChart();

  const chartData = splitData(rawData.value);
  const instance = echarts.init(chartRef.value, chartTheme.value, {
    renderer: "svg"
  });

  instance.setOption(buildOption(chartData), true);
  instance.dispatchAction({
    type: "brush",
    areas: [
      {
        brushType: "lineX",
        coordRange: ["2016-06-02", "2016-06-20"],
        xAxisIndex: 0
      }
    ]
  });

  chartInstance.value = instance;
}

watch(chartTheme, () => {
  if (rawData.value.length > 0) {
    renderChart();
  }
});

onMounted(() => {
  renderChart();
  window.addEventListener("resize", resizeChart);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeChart);
  disposeChart();
});
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="stock-header">
        <div>
          <p class="stock-title">Candlestick Brush</p>
          <p class="stock-description">
            基于 ECharts 官方示例接入的 K 线刷选图，当前使用本地 mock
            数据，包含均线、成交量、缩放和线性刷选。
          </p>
        </div>
        <div class="stock-links">
          <el-link :href="exampleUrl" target="_blank">官方示例</el-link>
          <el-tag effect="plain" round>本地 Mock 数据</el-tag>
        </div>
      </div>
    </template>

    <div class="stock-chart-wrap">
      <div ref="chartRef" class="stock-chart" />
    </div>
  </el-card>
</template>

<style scoped>
.stock-header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
}

.stock-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
}

.stock-description {
  margin: 8px 0 0;
  color: var(--el-text-color-secondary);
}

.stock-links {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
  padding-top: 2px;
}

.stock-chart-wrap {
  min-height: 72vh;
}

.stock-chart {
  width: 100%;
  height: 72vh;
}

@media screen and (max-width: 768px) {
  .stock-header {
    flex-direction: column;
  }

  .stock-links {
    padding-top: 0;
  }

  .stock-chart-wrap,
  .stock-chart {
    min-height: 520px;
    height: 520px;
  }
}
</style>
