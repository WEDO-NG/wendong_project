# business-core 的 `package.json` 入口与导出策略

本文以 `packages/business-core/package.json` 为例，解释各字段在当前“源码直引（workspace）”模式下的作用，并补充当你后续要产出 `dist/`（JS + d.ts）时，应该如何演进配置。

## 1. 当前模式：workspace 内直接引用 TS 源码

当前 `@wendong/business-core` 在 workspace 内被 `apps/web-react` 直接引用，入口指向 TS 源文件，例如：

- 运行时代码入口：`packages/business-core/src/index.ts`
- 类型入口（子路径）：`packages/business-core/types.ts`（纯类型入口，聚合导出）

这种模式的优点：

- 开发体验简单：不用先 build 包，就能直接被 app 引用。
- 迭代成本低：改完包里代码，app 重新编译即可生效。

这种模式的代价：

- “包”本质上并未产出可发布物：外部项目（非 workspace）通常无法直接消费 TS 源码入口。
- 对不同工具的解析策略更敏感：尤其是 TypeScript 的 `moduleResolution`、webpack/ts-loader 的解析行为等。

## 2. 你现在的 `package.json` 每个字段在做什么

以下解释对应 `packages/business-core/package.json` 的常见字段含义：

### 2.1 `name`

`"name": "@wendong/business-core"`

- workspace 内依赖的唯一标识。
- 其它包通过 `import { ... } from '@wendong/business-core'` 引用它。

### 2.2 `version`

`"version": "1.0.0"`

- 版本号元信息。
- 在 workspace 内主要用于信息展示；发布到 npm 时才有真正的语义化版本意义。

### 2.3 `main`

`"main": "./src/index.ts"`

- 传统 CommonJS 时代的“主入口”字段，历史原因保留。
- 当配置了 `exports` 后，很多现代工具会优先使用 `exports`，`main` 变成兼容字段（尤其在老工具/部分场景仍可能被读取）。

### 2.4 `types`

`"types": "./src/index.ts"`

- 传统 TypeScript 声明入口字段。
- 在“源码直引”模式下，写到 TS 入口文件是可以工作的（TS 能沿着入口分析出类型）。
- 有 `exports` 时，TS 也可能优先使用 `exports` 中的 `types` 条件，但建议保留这个字段作为兼容兜底。

### 2.5 `exports`

`exports` 是现代 Node/打包器/TS 推荐的“导出映射表”。它的核心价值是：

- 控制包的对外可见面（避免随意 deep import）。
- 支持“子路径导入”（例如 `@wendong/business-core/types`）。
- 支持条件导出（对不同环境提供不同入口，如 `types/import/require/default`）。

#### `exports["."]`

`"."` 代表包根路径导入：`@wendong/business-core`

- `"types": "./src/index.ts"`
  - TypeScript/类型系统解析此入口时优先采用的路径。
- `"default": "./src/index.ts"`
  - 运行时代码入口（在你当前“源码直引”下也是 TS 文件）。

#### `exports["./types"]`

`"./types"` 代表子路径导入：`@wendong/business-core/types`

你现在将其指向：

- `"types": "./types.ts"`
- `"default": "./types.ts"`

并且 `types.ts` 只做“纯类型转发”，例如：

```ts
export type * from './src/home/types';
```

这样做的目的：

- 使用者可以明确区分：
  - runtime：`import { HomeService } from '@wendong/business-core'`
  - types：`import type { BannerItem } from '@wendong/business-core/types'`
- 避免某些解析策略下“找不到 `@wendong/business-core/types`”：
  - 有些工具会倾向于寻找真实文件 `business-core/types.ts`，而不是只依赖 `exports` 路由。
  - 所以在包根放一份 `types.ts` 是更稳妥的做法。

## 3. 为什么要区分 `runtime` 和 `types` 子路径

对于使用者（例如 web-react）来说，区分入口有 3 个收益：

- **语义清晰**：一看 import 就知道是类型还是运行时代码。
- **避免误引运行时代码**：类型导入不会把运行时代码带入 bundle。
- **更利于演进**：未来你改成 `dist/` 发布时，`/types` 子路径依然成立，不影响使用者迁移成本。

## 4. 演进目标：产出 `dist/` 并可发布（推荐路线）

当你想让 `@wendong/business-core` 不只在 workspace 内使用，而是具备“可发布/可复用”的标准形态时，通常会演进到：

- `dist/index.js`（运行时代码）
- `dist/index.d.ts`（类型声明）
- `dist/types.d.ts`（纯类型子路径入口声明）
- 可选：同时提供 ESM/CJS 两套（看你未来运行环境）

### 4.1 最小演进：只产出一种 JS 形态（更简单）

如果你暂时只考虑 Web 端打包器消费（webpack/vite/rollup 都能处理 ESM），可以先只产出 ESM（或只产出 CJS），并把入口指向 `dist`：

示例（示意，不要求你现在立刻这么改）：

```json
{
  "name": "@wendong/business-core",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./types": {
      "types": "./dist/types.d.ts",
      "default": "./dist/types.js"
    }
  }
}
```

要点：

- `types` 指向 `*.d.ts`（声明文件）。
- runtime `default` 指向 `*.js`（运行时代码）。

> 注意：如果 `./types` 这个入口是“纯类型”，你也可以让它只存在 `d.ts`，不一定非要有 `types.js`；但某些工具对 `default` 条件仍会尝试解析，因此更稳妥的方式是提供一个不会产生副作用的 `types.js`（例如空导出）。

### 4.2 完整演进：同时提供 `import`（ESM）与 `require`（CJS）

当你要兼容更多生态（例如 Node.js 环境里既有人用 ESM import，也有人用 CJS require），可采用条件导出：

```json
{
  "name": "@wendong/business-core",
  "version": "1.0.0",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "default": "./dist/index.js"
    },
    "./types": {
      "types": "./dist/types.d.ts",
      "import": "./dist/types.js",
      "require": "./dist/types.cjs",
      "default": "./dist/types.js"
    }
  }
}
```

字段解释：

- `import`：提供给 ESM `import` 的入口
- `require`：提供给 CJS `require()` 的入口
- `default`：作为兜底（有些工具只读 default）

> 常见策略是：`default` 指向 `import` 版本（ESM），因为现代打包器大多偏好 ESM。

### 4.3 你现在项目里最关键的约束：Node 版本

你当前环境是 Node 16（之前 lint-staged / @typescript-eslint 的兼容问题也证明了这一点）。

当你产出 `dist` 时，务必考虑：

- 编译目标（target）不要使用 Node 18 才有的内置 API
- 如果要在 Node 侧直接运行（非打包器），要明确是否支持 ESM

## 5. 推荐的使用方式（对 app 侧）

保持 app 侧的导入不变，是你演进成功的标志：

```ts
import { HomeService } from '@wendong/business-core';
import type { BannerItem } from '@wendong/business-core/types';
```

只要你未来保证 `exports` 中这两个入口一直存在，app 侧基本无需改动。

## 6. 常见问题与排查

### 6.1 为什么有时会报 “Cannot find module '@wendong/business-core/types'”？

通常来自以下几类原因：

- 子路径 `exports` 没配或路径不对
- TS 的解析策略（`moduleResolution`）和实际文件结构不匹配
- 某些工具没有完全遵循 `exports`，更倾向找“真实文件”

因此我们在包根增加了 `types.ts` 并让 `exports["./types"]` 指向它，以提升稳定性。

### 6.2 `export type *` 会不会覆盖？

不会静默覆盖，但会在同名导出时产生冲突报错，逼你显式处理（例如改名或显式 export）。
