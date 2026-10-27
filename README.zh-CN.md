# petal-elements

[English](README.md) | 简体中文

[![npm](https://img.shields.io/npm/v/petal-elements)](https://www.npmjs.com/package/petal-elements)
[![CI](https://github.com/Saki340/petal-elements/actions/workflows/ci.yml/badge.svg)](https://github.com/Saki340/petal-elements/actions/workflows/ci.yml)
[![License](https://img.shields.io/npm/l/petal-elements)](LICENSE)

Material 3 Expressive 风格的 Web Components，可以直接用在普通 HTML 里，也能配合任何框架。尺寸、颜色和弹簧动效都取自 Jetpack Compose，组件支持无障碍访问，并能直接参与原生表单。

![用 petal-elements 拼出的界面：带日期和时间字段的订座表单、通知开关、账户安全设置、储蓄目标、旅行地点轮播、聊天和收件箱](https://raw.githubusercontent.com/Saki340/petal-elements/main/docs/images/readme-examples.webp)

[官网](https://petal.anontokyo.vip/) ·
[组件](https://petal.anontokyo.vip/catalog/components/button/) ·
[文档](https://petal.anontokyo.vip/catalog/about/intro/)（英文）

- **Expressive，数值有出处。** 会变形的多尺寸按钮、按钮组、波浪进度条、轮播、日期和时间选择器、FAB 菜单……所有数值都读自 Jetpack Compose Material 3 源码，不凭目测估计。
- **弹簧动效。** 组件按 Compose 的弹簧曲线运动；用鼠标悬停时会预示按压效果；系统开启“减少动效”时保持静止。
- **标准自定义元素。** 适用于普通 HTML、React、Vue、Svelte、Angular 和静态站点；表单控件能直接参与 `<form>` 和 `FormData`。
- **为 AI 编程助手准备。** [`llms.txt`](llms.txt) 和 [`llms-full.txt`](llms-full.txt) 描述了每个组件，编程助手照着就能用真实的 API 搭页面。

## 示例

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/petal-elements/tokens/css/sys.css">
<script type="importmap">
  {"imports": {"petal-elements/": "https://esm.run/petal-elements/"}}
</script>
<script type="module">
  import 'petal-elements/buttongroup/button-group.js';
  import 'petal-elements/button/filled-tonal-button.js';
  import 'petal-elements/switch/switch.js';
</script>

<petal-button-group connected single-select size="medium" aria-label="视图">
  <petal-filled-tonal-button toggle selected>日</petal-filled-tonal-button>
  <petal-filled-tonal-button toggle>周</petal-filled-tonal-button>
  <petal-filled-tonal-button toggle>月</petal-filled-tonal-button>
</petal-button-group>

<label>通知 <petal-switch selected></petal-switch></label>
```

存成 HTML 文件直接打开：按下按钮时它会变宽，选中的按钮会改变形状，动效都是 Compose 的弹簧。

## 安装

```sh
npm install petal-elements
```

先加载一次令牌样式表，再导入要用的组件：

```html
<link rel="stylesheet" href="node_modules/petal-elements/tokens/css/sys.css">
<style>:root { color-scheme: light dark; }</style>
<script type="module">
  import 'petal-elements/button/filled-button.js';
</script>
```

任何打包工具（Vite、esbuild、webpack）都能直接处理这种导入写法。`petal-elements/all.js` 会导入全部组件。图标使用 [Material Symbols](https://fonts.google.com/icons) 字体。详见 [Quick start](docs/quick-start.md) 和 [Building pages](docs/building-pages.md)（英文）。

## 组件

| 类别 | 组件 |
| --- | --- |
| 操作 | [按钮](docs/components/button.md)、[图标按钮](docs/components/icon-button.md)、[按钮组](docs/components/button-group.md)、[分割按钮](docs/components/split-button.md)、[分段按钮](docs/components/segmented-button.md)、[FAB](docs/components/fab.md)、[FAB 菜单](docs/components/fab-menu.md)、[浮动工具栏](docs/components/floating-toolbar.md)、[chip](docs/components/chip.md) |
| 反馈 | [徽章](docs/components/badge.md)、[进度条](docs/components/progress.md)、[加载指示器](docs/components/loading-indicator.md)、[snackbar](docs/components/snackbar.md)、[提示](docs/components/tooltip.md)、[下拉刷新](docs/components/pull-to-refresh.md) |
| 容器 | [卡片](docs/components/card.md)、[轮播](docs/components/carousel.md)、[对话框](docs/components/dialog.md)、[底部面板](docs/components/bottom-sheet.md)、[列表](docs/components/list.md)、[分隔线](docs/components/divider.md)、[形状](docs/components/shape.md) |
| 导航 | [顶部应用栏](docs/components/top-app-bar.md)、[底部应用栏](docs/components/bottom-app-bar.md)、[导航栏](docs/components/navigation-bar.md)、[侧边导航栏](docs/components/navigation-rail.md)、[导航抽屉](docs/components/navigation-drawer.md)、[标签页](docs/components/tabs.md)、[搜索](docs/components/search.md)、[菜单](docs/components/menu.md) |
| 选择 | [复选框](docs/components/checkbox.md)、[单选框](docs/components/radio.md)、[开关](docs/components/switch.md)、[滑块](docs/components/slider.md)、[日期选择器](docs/components/date-picker.md)、[时间选择器](docs/components/time-picker.md) |
| 文本输入 | [文本框](docs/components/text-field.md)、[下拉选择](docs/components/select.md) |

每个组件在 [catalog](https://petal.anontokyo.vip/catalog/components/button/) 里都有可交互的演示页。

## 文档

文档目前只有英文。

- [Building pages](docs/building-pages.md)：页面初始设置、响应式导航、表单、对话框等常见页面
- [Motion](docs/motion.md)：弹簧曲线、每个组件的动画，以及在自己的 CSS 里使用它们
- [Theming](docs/theming/README.md)：颜色（包括从一个主色生成主题）、字体和形状
- [Material 3 Expressive features](docs/expressive.md)
- 给编程助手：[`llms.txt`](llms.txt)（索引）和 [`llms-full.txt`](llms-full.txt)（全部内容合成一个文件），网站上也有：[petal.anontokyo.vip/llms.txt](https://petal.anontokyo.vip/llms.txt)

## 从 Material Web 迁移

Google 的 [Material Web](https://github.com/material-components/material-web) 已[进入维护模式](https://github.com/material-components/material-web/discussions/5642)，petal-elements 在它的基础上继续开发，保留了完整的提交历史。

| | Material Web | petal-elements |
| --- | --- | --- |
| 包名 | `@material/web` | `petal-elements`（路径不变） |
| 标签 | `<md-filled-button>` | `<petal-filled-button>` |
| 类名 | `MdFilledButton` | `PetalFilledButton` |
| CSS 自定义属性 | `--md-*` | 不变 |

具体步骤和变化见 [Using in an existing site](docs/migrating.md)（英文）。

## 状态

当前版本 0.3。1.0 之前 API 可能变动；每次改动见 [CHANGELOG](CHANGELOG.md)，后续计划见 [roadmap](docs/roadmap.md)，支持的浏览器见 [Support](docs/support.md)（均为英文）。

petal-elements 不是 Google 官方项目，与 Google 没有关联。它是 Material Web 的一个独立的、由社区维护的修改版本。

## 参与贡献

欢迎提交 issue、发起讨论或提交 pull request。开发环境、测试和令牌数值的规则见 [CONTRIBUTING.md](CONTRIBUTING.md)（英文）。

## 许可证

[Apache License 2.0](LICENSE)。署名和修改清单见 [NOTICE](NOTICE)，文件头规则和第三方素材见 [docs/licensing.md](docs/licensing.md)。
