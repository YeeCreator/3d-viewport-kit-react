import * as Toolbar from '@radix-ui/react-toolbar';
import type { SelectedEntityId } from '../core/selection/selection-state';
import type { TransformMode } from '../core/gizmo/transform-mode';

/**
 * 视口工具栏属性。
 */
export interface Viewport3DToolbarProps {
  /** 当前变换模式。 */
  transformMode: TransformMode;
  /** 变换模式变化回调。 */
  onTransformModeChange: (mode: TransformMode) => void;
  /** 小地图开关状态。 */
  miniMapEnabled: boolean;
  /** 小地图开关回调。 */
  onMiniMapEnabledChange: (enabled: boolean) => void;
  /** 当前选中对象标识。 */
  selectedEntityId: SelectedEntityId;
}

/**
 * 视口工具栏。
 *
 * @param props 组件属性。
 * @returns 工具栏组件。
 */
export function Viewport3DToolbar(props: Viewport3DToolbarProps) {
  const { transformMode, onTransformModeChange, miniMapEnabled, onMiniMapEnabledChange, selectedEntityId } = props;

  return (
    <Toolbar.Root className="vk-toolbar" aria-label="Viewport 工具栏">
      <span className="vk-toolbar__label">工具</span>

      <Toolbar.Button
        type="button"
        className={`vk-toolbar__button ${transformMode === 'translate' ? 'is-active' : ''}`}
        onClick={() => onTransformModeChange('translate')}
      >
        平移
      </Toolbar.Button>
      <Toolbar.Button
        type="button"
        className={`vk-toolbar__button ${transformMode === 'rotate' ? 'is-active' : ''}`}
        onClick={() => onTransformModeChange('rotate')}
      >
        旋转
      </Toolbar.Button>
      <Toolbar.Button
        type="button"
        className={`vk-toolbar__button ${transformMode === 'scale' ? 'is-active' : ''}`}
        onClick={() => onTransformModeChange('scale')}
      >
        缩放
      </Toolbar.Button>

      <Toolbar.Separator className="vk-toolbar__separator" />

      <label className="vk-toolbar__checkbox">
        <input
          type="checkbox"
          checked={miniMapEnabled}
          onChange={(event) => onMiniMapEnabledChange(event.currentTarget.checked)}
        />
        小地图
      </label>

      <span className="vk-toolbar__selected">选中：{selectedEntityId ?? '无'}</span>
    </Toolbar.Root>
  );
}
