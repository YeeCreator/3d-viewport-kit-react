import * as ContextMenu from '@radix-ui/react-context-menu';
import type { ReactNode } from 'react';
import type { TransformMode } from '../core/gizmo/transform-mode';

/**
 * 视口右键菜单属性。
 */
export interface Viewport3DContextMenuProps {
  /** 子元素。 */
  children: ReactNode;
  /** 当前变换模式。 */
  transformMode: TransformMode;
  /** 变换模式变化回调。 */
  onTransformModeChange: (mode: TransformMode) => void;
  /** 小地图开关状态。 */
  miniMapEnabled: boolean;
  /** 小地图开关回调。 */
  onMiniMapEnabledChange: (enabled: boolean) => void;
  /** 清空选中回调。 */
  onClearSelection: () => void;
}

/**
 * 视口右键菜单容器。
 *
 * @param props 组件属性。
 * @returns 右键菜单组件。
 */
export function Viewport3DContextMenu(props: Viewport3DContextMenuProps) {
  const {
    children,
    transformMode,
    onTransformModeChange,
    miniMapEnabled,
    onMiniMapEnabledChange,
    onClearSelection,
  } = props;

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="vk-context-menu" alignOffset={4}>
          <ContextMenu.Label className="vk-context-menu__label">视口菜单</ContextMenu.Label>
          <ContextMenu.Separator className="vk-context-menu__separator" />

          <ContextMenu.RadioGroup value={transformMode} onValueChange={(value) => onTransformModeChange(value as TransformMode)}>
            <ContextMenu.RadioItem className="vk-context-menu__item" value="translate">
              平移模式
            </ContextMenu.RadioItem>
            <ContextMenu.RadioItem className="vk-context-menu__item" value="rotate">
              旋转模式
            </ContextMenu.RadioItem>
            <ContextMenu.RadioItem className="vk-context-menu__item" value="scale">
              缩放模式
            </ContextMenu.RadioItem>
          </ContextMenu.RadioGroup>

          <ContextMenu.Separator className="vk-context-menu__separator" />

          <ContextMenu.CheckboxItem
            className="vk-context-menu__item"
            checked={miniMapEnabled}
            onCheckedChange={(checked) => onMiniMapEnabledChange(checked === true)}
          >
            显示小地图
          </ContextMenu.CheckboxItem>

          <ContextMenu.Item className="vk-context-menu__item" onSelect={onClearSelection}>
            取消选中
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
