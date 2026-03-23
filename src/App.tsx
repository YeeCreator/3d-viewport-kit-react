import { useMemo, useState } from 'react';
import { Viewport3D } from './lib/react';
import type { EntityTransformMap } from './lib/react';
import { createDemoEntities } from './lib/core/scene/scene-state';
import type { SelectedEntityId } from './lib/core/selection/selection-state';
import type { TransformMode } from './lib/core/gizmo/transform-mode';

/**
 * 示例应用根组件。
 *
 * @returns 示例页面。
 */
export function App() {
  const entities = useMemo(() => createDemoEntities(), []);
  const [miniMapEnabled, setMiniMapEnabled] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<SelectedEntityId>(null);
  const [transformMode, setTransformMode] = useState<TransformMode>('translate');
  const [entityTransforms, setEntityTransforms] = useState<EntityTransformMap>({});

  return (
    <main className="app-root">
      <h1 className="app-title">viewport-3d-kit-react</h1>
      <p className="app-description">当前示例展示通用 3D 视口与可选小地图能力。</p>

      <label className="app-checkbox app-row">
        <input
          type="checkbox"
          checked={miniMapEnabled}
          onChange={(event) => setMiniMapEnabled(event.currentTarget.checked)}
        />
        显示小地图
      </label>

      <div className="app-row">
        <span>宿主工具模式：</span>
        <button
          type="button"
          onClick={() => setTransformMode('translate')}
          className={`app-mode-button ${transformMode === 'translate' ? 'is-active' : ''}`}
        >
          平移
        </button>
        <button
          type="button"
          onClick={() => setTransformMode('rotate')}
          className={`app-mode-button ${transformMode === 'rotate' ? 'is-active' : ''}`}
        >
          旋转
        </button>
        <button
          type="button"
          onClick={() => setTransformMode('scale')}
          className={`app-mode-button ${transformMode === 'scale' ? 'is-active' : ''}`}
        >
          缩放
        </button>
        <span>宿主选中对象：{selectedEntityId ?? '无'}</span>
      </div>

      <Viewport3D
        entities={entities}
        miniMapEnabled={miniMapEnabled}
        selectedEntityId={selectedEntityId}
        onSelectedEntityIdChange={setSelectedEntityId}
        transformMode={transformMode}
        onTransformModeChange={setTransformMode}
        entityTransforms={entityTransforms}
        onEntityTransformsChange={setEntityTransforms}
        miniMapMode="top-down"
        className="app-viewport"
      />
    </main>
  );
}
