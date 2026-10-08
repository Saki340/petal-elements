# petal-elements

[English](README.md) | 简体中文

社区维护的 Material 3 Expressive Web Components。

> **petal-elements 不是 Google 官方项目，与 Google 没有关联。** 它是
> [material-components/material-web](https://github.com/material-components/material-web)
> 的一个独立的、由社区维护的修改版本。

## 状态

早期开发中，尚未发布到 npm，API 可能变动。

## 背景

Google 的 Material Web 项目
[已进入维护模式](https://github.com/material-components/material-web/discussions/5642)。
其维护者在该讨论中
[表示](https://github.com/material-components/material-web/discussions/5642#discussioncomment-13724284)：
"Forks and different directions are always welcome in open source!"

petal-elements 在 Material Web 代码库（保留完整 git 历史）的基础上继续开发，目标是 Material 3 Expressive：

- 组件沿用 Material Web 的基础设施：ripple、焦点环、状态层、通过 `ElementInternals` 的表单关联和无障碍支持。
- 设计令牌的数值来自 Material Web 仓库自带的 Material Design Web 令牌（v34），并与 Jetpack Compose Material 3 源码交叉核对。数值一律以源码为准，不凭目测估计。详见 [docs/tokens.md](docs/tokens.md)。
- 逐步补上缺失的 Expressive 规格和组件（形状变形、弹簧动效、按钮组等），并用视觉回归测试验证。
- 持续跟进上游并合并其修复，包括上游 `labs/` 中的 Expressive 工作。

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
```

### 合并上游

```sh
git fetch upstream
git merge upstream/main
node scripts/rebrand.js   # 把新出现的 md-* 标签改名，可重复执行
```

## 许可证

Apache License 2.0。署名和修改清单见 [LICENSE](LICENSE) 与 [NOTICE](NOTICE)；文件头规则、第三方素材和依赖检查见 [docs/licensing.md](docs/licensing.md)。
