# petal-elements

[English](README.md) | 简体中文

社区维护的 Material 3 Expressive Web Components。

> **petal-elements 不是 Google 官方项目，与 Google 没有关联。** 它是
> [material-components/material-web](https://github.com/material-components/material-web)
> 的一个独立的、由社区维护的修改版本。

## 状态

0.2.0 版本把所有组件改为 Jetpack Compose 的数值，并新增了许多组件，见 [roadmap](docs/roadmap.md)（英文）和 [CHANGELOG](CHANGELOG.md)。1.0 之前 API 可能变动。

官网：[petal.anontokyo.vip](https://petal.anontokyo.vip/)。文档和在线示例：[catalog](https://petal.anontokyo.vip/catalog/) 和 [docs/](docs/intro.md)（英文）。

## 快速上手

```sh
npm install petal-elements
```

```html
<link rel="stylesheet" href="node_modules/petal-elements/tokens/css/sys.css">
<script type="module">
  import 'petal-elements/button/filled-button.js';
  import 'petal-elements/buttongroup/button-group.js';
</script>

<petal-filled-button>保存</petal-filled-button>

<!-- Material 3 Expressive，按需开启 -->
<petal-button-group connected single-select size="medium">
  <petal-filled-tonal-button toggle selected>日</petal-filled-tonal-button>
  <petal-filled-tonal-button toggle>周</petal-filled-tonal-button>
</petal-button-group>
```

打包和主题设置见 [Quick start](docs/quick-start.md)。

## 0.1 包含的内容

- Material Web 的全部组件，改名为 `petal-*`。
- 核心组件（按钮、图标按钮、FAB、复选框、单选框、开关、文本框、chip、进度条、标签页）改用 Material Design Web 令牌 v34 的数值，见 [Token update v0.192 → v34](docs/token-update-v34.md)。
- `tokens/css/` 下生成的令牌样式表：含浅色和深色配色的系统令牌、对比度变体、expressive 动效方案。
- Material 3 Expressive（按需开启）：按钮尺寸 `xsmall`–`xlarge`、圆形和方形、切换按钮、带弹簧动效的形状变形、按钮组、实心 FAB。见 [Material 3 Expressive features](docs/expressive.md)。

## 背景

Google 的 Material Web 项目
[已进入维护模式](https://github.com/material-components/material-web/discussions/5642)。
其维护者在该讨论中
[表示](https://github.com/material-components/material-web/discussions/5642#discussioncomment-13724284)：
"Forks and different directions are always welcome in open source!"

petal-elements 在 Material Web 代码库（保留完整 git 历史）的基础上继续开发，目标是 Material 3 Expressive：

- 组件沿用 Material Web 的基础设施：ripple、焦点环、状态层、通过 `ElementInternals` 的表单关联和无障碍支持。
- 尺寸、颜色、形状和动效取自固定提交的 Jetpack Compose Material 3 源码，Material Design Web 令牌（v34）作为后备。数值一律以源码为准，不凭目测估计。详见 [docs/tokens.md](docs/tokens.md)。
- 逐步补上缺失的 Expressive 规格和组件（形状变形、弹簧动效、按钮组等），并用视觉回归测试验证。
- 持续跟进上游并合并其修复。上游实验性的 `labs/gb` 和 `labs/aria` 组件不包含在内，petal 自己的组件已经覆盖。

## 与 Material Web 的区别

| | Material Web | petal-elements |
|---|---|---|
| 包名 | `@material/web` | `petal-elements` |
| 标签 | `<md-filled-button>` | `<petal-filled-button>` |
| 类名 | `MdFilledButton` | `PetalFilledButton` |
| CSS 自定义属性 | `--md-sys-*`、`--md-filled-button-*` | 不变，方便迁移 |

## 开发

需要 Node.js 22 或更高版本，支持 Linux、macOS 和 Windows。

```sh
npm ci
npm run build
npx playwright install chromium
npm test
npm run check:licenses   # 检查所有依赖的许可证
npm run check:rebrand    # 合并上游后检查是否还有 md-* 标签
npm run check:tokens     # 检查生成的令牌是否最新
npm run test:visual      # 逐像素截图对比（Playwright）
npm run docs:images      # 渲染 docs/components 里的图片
npm run build:catalog    # 构建文档站点，输出到 catalog/_prod
```

令牌流水线和截图测试见 [Design tokens](docs/tokens.md) 与 [Visual testing](docs/visual-testing.md)。

### 合并上游

```sh
git fetch upstream
git merge upstream/main
node scripts/rebrand.js   # 把新出现的 md-* 标签改名，可重复执行
```

## 许可证

Apache License 2.0。署名和修改清单见 [LICENSE](LICENSE) 与 [NOTICE](NOTICE)；文件头规则、第三方素材和依赖检查见 [docs/licensing.md](docs/licensing.md)。
