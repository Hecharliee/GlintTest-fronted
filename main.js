import { createApp } from "vue";
import App from "./App.vue";


const app = createApp(App);

// Vue 3 中不再支持 `Vue.config.productionTip = false`
// 你可以将全局配置放在 `app.config.globalProperties` 中
app.config.globalProperties.productionTip = false;

app.use(router).mount("#app");
