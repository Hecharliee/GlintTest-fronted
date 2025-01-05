

<!--</style>-->
<template>
  <div class="app-container">
    <!-- 顶部文字区域 -->
    <header class="header">
      <h1 class="logo">GlintTest</h1>
      <p class="subtext">GlintTest · Make your test easier</p>
      <hr class="divider" />
    </header>

    <!-- 功能模块网格布局 -->
    <div class="features-grid">



      <!-- 测试配置 -->
      <div class="feature-card">
        <h3>测试配置</h3>
        <p>请输入测试场景的描述，并点击“上传场景”按钮进行提交。</p>
        <form class="form-container" @submit.prevent="uploadScenario">
          <textarea
              v-model="scenarioDescription"
              placeholder="请输入测试场景描述..."
              class="form-textarea"

          ></textarea>
          <button type="submit" class="submit-button"style="margin-left:180px;margin-right:30px;">上传场景</button>
          <button @click="startTest" class="submit-button" :disabled="!scenarioDescription" style="margin-right:30px;">
            启动测试
          </button>
          <button @click="endTest" class="submit-button" :disabled="!scenarioDescription">
            终止测试
          </button>
        </form>

      </div>

      <!-- 测试进度 -->
      <div class="feature-card">
        <h3>测试进度</h3>
        <p>实时监控测试进展，随时掌握当前状态。</p>
        <div>
          <h4>当前状态: <span :class="statusClass">{{ status }}</span></h4>
          <div class="progress-bar">
            <div v-if="status === 'running'" class="progress-dot" :class="{ 'running': status === 'running' }"></div>
            <div
                class="progress-bar-inner"
                :style="{ width: progress + '%' }"
            ></div>
          </div>

        </div>
      </div>


    </div>
  </div>
</template>


<script>
import axios from "axios";

export default {
  name: "App",
  data() {
    return {
      // 截图分析
      file: null,
      analysisResult: null,

      // 测试配置
      scenarioDescription: "",

      // 测试进度
      status: "",
      progress: 0,
      currentStep: "",

      // 测试结果
      result: {
        status: "",
        result: "",
        logs: [],
        screenshots: [],
      },
    };
  },
  computed: {
    // 根据状态动态设置样式
    statusClass() {
      return {
        running: this.status === "running",
        completed: this.status === "completed",
        error: this.status === "error",
        success: this.result.status === "completed",
        failed: this.result.status === "failed",
      };
    },
    statusText() {
      return this.status === "Test in progress." ? "运行中" : "测试结束";
    },
  },
  methods: {
    // 启动测试
    startTest() {
      axios
          .post("http://127.0.0.1:8000/api/start_test/", {}, {
            headers: {
              'Content-Type': 'application/json',
            }
          })
          .then((response) => {
            alert("测试已启动：" + response.data.message);
            // 可以根据需求更新界面上的状态
            this.status = "running";  // 假设启动测试后状态更新为运行中
          })
          .catch((error) => {
            console.error(error);
            alert("启动测试失败，请重试！");
          });
    },
    endTest() {
      axios
          .post("http://127.0.0.1:8000/api/end_test/", {}, {
            headers: {
              'Content-Type': 'application/json',
            }
          })
          .then((response) => {
            alert("测试已终止：" + response.data.message);
            // 可以根据需求更新界面上的状态
            this.status = "running";  // 假设启动测试后状态更新为运行中
          })
          .catch((error) => {
            console.error(error);
            alert("终止测试失败，请重试！");
          });
    },
    // 截图上传与分析
    handleFileUpload(event) {
      this.file = event.target.files[0];
    },
    uploadScreenshot() {
      const formData = new FormData();
      formData.append("screenshot", this.file);

      axios
          .post("http://127.0.0.1:8000/api/upload_screenshot/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
          .then((response) => {
            const imagePath = response.data.image_path;
            return axios.get("http://127.0.0.1:8000/api/screenshot_analysis/", {
              params: { image_path: imagePath },
            });
          })
          .then((response) => {
            this.analysisResult = response.data.analysis_result;
          })
          .catch((error) => {
            console.error(error);
          });
    },

    // 测试配置
    uploadScenario() {
      axios
          .post("http://127.0.0.1:8000/api/upload_scenario/",
              {
                scene_description: this.scenarioDescription
              },
              {
                headers: {
                  'Content-Type': 'application/json'  // 显式设置 Content-Type
                }
              }
          )
          .then((response) => {
            alert("场景上传成功：" + response.data.message);
          })
          .catch((error) => {
            console.error(error);
            alert("上传失败，请重试！");
          });
    },

    // 测试进度
    fetchStatus() {
      axios
          .get("http://127.0.0.1:8000/api/test_status/", { params: { test_id: "1" } })
          .then((response) => {
            this.status = response.data.status;
            this.progress = response.data.progress;
            this.currentStep = response.data.current_step;
          })
          .catch((error) => {
            console.error(error);
          });
    },
    autoUpdateStatus() {
      setInterval(() => {
        this.fetchStatus();
      }, 5000);
    },

    // 测试结果
    fetchResult() {
      axios
          .get("http://127.0.0.1:8000/api/test_result/", { params: { test_id: "1" } })
          .then((response) => {
            this.result = response.data;
          })
          .catch((error) => {
            console.error(error);
          });
    },
  },
  mounted() {
    // 自动更新测试进度和加载测试结果
    this.fetchStatus();
    this.autoUpdateStatus();
    this.fetchResult();
  },
};
</script>

<style>
/* 全局样式 */
body {
  margin: 0;
  font-family: "Arial", sans-serif;
  background-color: #f7f9fc;
  color: #333;
}

.app-container {
  text-align: center;
  padding: 20px;
}

.header {
  margin-bottom: 30px;
}

.divider {
  width: 80vw;
  margin: 20px auto;
  border: none;
  border-top: 1px solid #ddd;
}

.logo {
  font-size: 80px;
  color: #212020;
  font-family: "Georgia", serif;
  margin: 0;
}

.subtext {
  font-size: 19px;
  font-family: "Georgia", serif;
  margin: 10px 0;
  color: #666;
}

/* 功能模块网格布局 */
.features-grid {
  font-family: 'Source Han Serif', 'Noto Serif CJK SC', serif;
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 两列布局 */
  gap: 20px; /* 卡片间距 */
  margin-top: 40px;
  width: 95%; /* 将容器宽度设为90%，适配屏幕 */
  max-width: 1200px; /* 最大宽度为1200px，防止过宽 */
  margin-left: auto;
  margin-right: auto; /* 居中对齐 */
}


/* 功能卡片样式 */
.feature-card {
  font-family: 'Source Han Serif', 'Noto Serif CJK SC', serif;

  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.feature-card h3 {
  font-family: 'Source Han Serif', 'Noto Serif CJK SC', serif;

  font-size: 20px;
  color: #343a40;
  margin-bottom: 10px;
}

.feature-card p {
  font-family: 'Source Han Serif', 'Noto Serif CJK SC', serif;

  font-size: 17px;
  color: #6c757d;
  margin-bottom: 20px;
}

/* 按钮和输入框样式 */
.file-input-label,
.upload-button,
.submit-button {
  font-family: 'Source Han Serif', 'Noto Serif CJK SC', serif;
  display: inline-block;
  padding: 10px 20px;

  font-size: 14px;
  color: #fff;
  background-color: #a19793;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-align: center;
}

.file-input-label:hover,
.upload-button:hover,
.submit-button:hover {
  font-family: 'Source Han Serif', 'Noto Serif CJK SC', serif;
  background-color: #a19793;
}

.file-input-label input[type="file"] {
  display: none;
}

.form-textarea {
  font-family: 'Source Han Serif', 'Noto Serif CJK SC', serif;
  width: 100%;
  height: 80px;
  margin-bottom: 15px;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

/* 动态进度条样式 */
.progress-bar {
  width: 100%;
  height: 10px;
  background-color: #e9ecef;
  border-radius: 5px;
  overflow: hidden;
  margin: 10px 0;
}

.progress-bar-inner {
  height: 100%;
  background-color: #007bff;
  transition: width 0.4s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr; /* 小屏幕下单列显示 */
  }
}

/* 动态进度条样式 */
.progress-bar {
  width: 100%;
  height: 10px;
  background-color: #e9ecef;
  border-radius: 5px;
  overflow: hidden;
  margin: 10px 0;
  position: relative; /* 相对定位，以便放置进度条内部的动态点 */
}

.progress-bar-inner {
  height: 100%;
  background-color: #007bff;
  transition: width 0.4s ease;
}

/* 动态进度条上的点 */
.progress-dot {
  position: absolute;
  top: 50%;
  left: 0;
  width: 10px;
  height: 10px;
  background-color: #a19793;
  border-radius: 50%;
  transform: translateY(-50%);
  animation: moveDot 2s linear infinite; /* 初始动画设置 */
}

/* 当状态为 running 时，点开始运动 */
.progress-dot.running {
  animation: moveDot 2s linear infinite; /* 定义点的来回动画 */
}

@keyframes moveDot {
  0% {
    left: 0;
  }
  50% {
    left: 90%; /* 点从左边移动到右边 */
  }
  100% {
    left: 0; /* 点从右边返回到左边 */
  }
}
</style>
