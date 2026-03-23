# viewport-3d-kit-react

通用 3D 视口工具包（React + TypeScript + Vite），提供：

- 主视口 `Viewport3D`
- 可选小地图 `MiniMap3D`
- 可选外围 UI（Radix Toolbar / ContextMenu）

当前版本已支持：

- 视口导航（旋转/平移/缩放）
- 对象选中与高亮
- 基础变换工具（平移/旋转/缩放）
- 小地图开关（受控/非受控）

## 安装

```bash
npm install viewport-3d-kit-react three @react-three/fiber @react-three/drei react react-dom
```

## 快速接入（最小示例）

```tsx
import { useMemo, useState } from 'react';
import { Viewport3D } from 'viewport-3d-kit-react/react';
import { createDemoEntities } from 'viewport-3d-kit-react/core';

export function Demo() {
	const entities = useMemo(() => createDemoEntities(), []);
	const [miniMapEnabled, setMiniMapEnabled] = useState(false);

	return (
		<div style={{ width: '100%', height: '70vh' }}>
			<label>
				<input
					type="checkbox"
					checked={miniMapEnabled}
					onChange={(event) => setMiniMapEnabled(event.currentTarget.checked)}
				/>
				显示小地图
			</label>

			<Viewport3D
				entities={entities}
				miniMapEnabled={miniMapEnabled}
				miniMapMode="top-down"
				className="app-viewport"
			/>
		</div>
	);
}
```

## 最小 API（`Viewport3D`）

```ts
interface Viewport3DProps {
	entities?: ViewportEntity[];

	miniMapEnabled?: boolean;
	defaultMiniMapEnabled?: boolean;
	miniMapMode?: 'top-down' | 'follow';
	onMiniMapEnabledChange?: (enabled: boolean) => void;

	selectedEntityId?: string | null;
	defaultSelectedEntityId?: string | null;
	onSelectedEntityIdChange?: (id: string | null) => void;

	transformMode?: 'translate' | 'rotate' | 'scale';
	defaultTransformMode?: 'translate' | 'rotate' | 'scale';
	onTransformModeChange?: (mode: 'translate' | 'rotate' | 'scale') => void;

	entityTransforms?: EntityTransformMap;
	defaultEntityTransforms?: EntityTransformMap;
	onEntityTransformsChange?: (transforms: EntityTransformMap) => void;

	className?: string;
}
```

## 子入口使用示例

### `react` 子入口

```ts
import { Viewport3D, MiniMap3D } from 'viewport-3d-kit-react/react';
import type { Viewport3DProps, MiniMapMode } from 'viewport-3d-kit-react/react';
```

### `core` 子入口

```ts
import {
	createDemoEntities,
	computeSceneBounds,
	normalizeSelectedEntityId,
	TRANSFORM_MODES,
} from 'viewport-3d-kit-react/core';
import type { ViewportEntity, SelectedEntityId, TransformMode } from 'viewport-3d-kit-react/core';
```

### `ui` 子入口

```ts
import { Viewport3DToolbar, Viewport3DContextMenu } from 'viewport-3d-kit-react/ui';
import type { Viewport3DToolbarProps, Viewport3DContextMenuProps } from 'viewport-3d-kit-react/ui';
```

## 导出结构

```txt
viewport-3d-kit-react
viewport-3d-kit-react/core
viewport-3d-kit-react/react
viewport-3d-kit-react/ui
```

## 说明

- 小地图默认建议关闭，按业务场景按需开启。
- `ui` 子入口是可选层，不影响核心视口能力。
