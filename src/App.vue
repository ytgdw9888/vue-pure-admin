<template>
  <!-- 为整个应用提供组件库语言环境，并挂载全局路由与弹层容器 -->
  <el-config-provider :locale="currentLocale">
    <router-view />
    <ReDialog />
    <ReDrawer />
  </el-config-provider>
</template>

<script lang="ts">
import { useRouter } from "vue-router";
import { useGlobal } from "@pureadmin/utils";
import { checkVersion } from "version-rocket";
import { defineComponent, computed } from "vue";
import { ElConfigProvider } from "element-plus";
import { ReDialog, closeAllDialog } from "@/components/ReDialog";
import { ReDrawer, closeAllDrawer } from "@/components/ReDrawer";
import en from "element-plus/es/locale/lang/en";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import plusEn from "plus-pro-components/es/locale/lang/en";
import plusZhCn from "plus-pro-components/es/locale/lang/zh-cn";

export default defineComponent({
  name: "app",
  components: {
    [ElConfigProvider.name]: ElConfigProvider,
    ReDialog,
    ReDrawer
  },
  setup() {
    const router = useRouter();
    const { $storage } = useGlobal<GlobalPropertiesApi>();

    // 根据本地缓存的语言设置，动态合并 Element Plus 与 Plus Pro 的语言包
    const currentLocale = computed(() => {
      return $storage.locale?.locale === "zh"
        ? { ...zhCn, ...plusZhCn }
        : { ...en, ...plusEn };
    });

    // 每次路由切换前关闭所有全局对话框和抽屉，避免跨页面残留
    router.beforeEach(() => {
      closeAllDialog();
      closeAllDrawer();
    });

    return {
      currentLocale
    };
  },
  beforeCreate() {
    const { version, name: title } = __APP_INFO__.pkg;
    const { VITE_PUBLIC_PATH, MODE } = import.meta.env;
    // https://github.com/guMcrey/version-rocket/blob/main/README.zh-CN.md#api
    if (MODE === "production") {
      // 版本实时更新检测，只作用于线上环境
      checkVersion(
        // config
        {
          // 5分钟检测一次版本
          pollingTime: 300000,
          localPackageVersion: version,
          originVersionFileUrl: `${location.origin}${VITE_PUBLIC_PATH}version.json`
        },
        // options
        {
          title,
          description: "检测到新版本",
          buttonText: "立即更新"
        }
      );
    }
  }
});
</script>
