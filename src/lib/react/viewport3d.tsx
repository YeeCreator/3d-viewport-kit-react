import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MutableRefObject } from 'react';
import { Canvas } from '@react-three/fiber';
import { Grid, OrbitControls, TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { ViewportEntity } from '../core/scene/scene-state';
import { createDemoEntities } from '../core/scene/scene-state';
import { MiniMap3D, type MiniMapMode } from './minimap3d';
import { normalizeSelectedEntityId, type SelectedEntityId } from '../core/selection/selection-state';
import type { TransformMode } from '../core/gizmo/transform-mode';
import { Viewport3DContextMenu, Viewport3DToolbar } from '../ui';

/**
 * 对象局部变换数据。
 */
export interface EntityTransformState {
  /** 对象位置。 */
  position: [number, number, number];
  /** 对象旋转。 */
  rotation: [number, number, number];
  /** 对象缩放。 */
  scale: [number, number, number];
}

/**
 * 对象变换字典。
 */
export type EntityTransformMap = Record<string, EntityTransformState>;

/**
 * 视口运行态对象。
 */
interface RuntimeEntity {
  /** 对象数据。 */
  entity: ViewportEntity;
  /** 位置。 */
  position: [number, number, number];
  /** 旋转。 */
  rotation: [number, number, number];
  /** 缩放。 */
  scale: [number, number, number];
}

/**
 * 主视口组件属性。
 */
export interface Viewport3DProps {
  /** 场景对象列表。 */
  entities?: ViewportEntity[];
  /** 受控：是否启用小地图。 */
  miniMapEnabled?: boolean;
  /** 非受控：小地图默认状态。 */
  defaultMiniMapEnabled?: boolean;
  /** 小地图模式。 */
  miniMapMode?: MiniMapMode;
  /** 小地图开关变化回调。 */
  onMiniMapEnabledChange?: (enabled: boolean) => void;
  /** 受控：选中对象。 */
  selectedEntityId?: SelectedEntityId;
  /** 非受控：默认选中对象。 */
  defaultSelectedEntityId?: SelectedEntityId;
  /** 选中对象变化回调。 */
  onSelectedEntityIdChange?: (id: SelectedEntityId) => void;
  /** 受控：变换模式。 */
  transformMode?: TransformMode;
  /** 非受控：默认变换模式。 */
  defaultTransformMode?: TransformMode;
  /** 变换模式变化回调。 */
  onTransformModeChange?: (mode: TransformMode) => void;
  /** 受控：对象变换状态。 */
  entityTransforms?: EntityTransformMap;
  /** 非受控：默认对象变换状态。 */
  defaultEntityTransforms?: EntityTransformMap;
  /** 对象变换变化回调。 */
  onEntityTransformsChange?: (transforms: EntityTransformMap) => void;
  /** 容器样式（已废弃，建议使用 className + CSS）。 */
  style?: CSSProperties;
  /** 容器类名。 */
  className?: string;
}

/**
 * 从实体数据创建初始变换字典。
 *
 * @param entities 场景对象。
 * @returns 变换字典。
 */
function createInitialTransforms(entities: ViewportEntity[]): EntityTransformMap {
  return entities.reduce<EntityTransformMap>((acc, entity) => {
    acc[entity.id] = {
      position: entity.position,
      rotation: entity.rotation ?? [0, 0, 0],
      scale: [1, 1, 1],
    };
    return acc;
  }, {});
}

/**
 * 构建运行态实体列表。
 *
 * @param entities 场景对象。
 * @param transforms 变换字典。
 * @returns 运行态实体列表。
 */
function buildRuntimeEntities(entities: ViewportEntity[], transforms: EntityTransformMap): RuntimeEntity[] {
  return entities.map((entity) => {
    const fallback: EntityTransformState = {
      position: entity.position,
      rotation: entity.rotation ?? [0, 0, 0],
      scale: [1, 1, 1],
    };
    const transform = transforms[entity.id] ?? fallback;

    return {
      entity,
      position: transform.position,
      rotation: transform.rotation,
      scale: transform.scale,
    };
  });
}

/**
 * 视口中的实体渲染。
 *
 * @param props 组件属性。
 * @returns 渲染节点。
 */
function ViewportEntities(props: {
  runtimeEntities: RuntimeEntity[];
  selectedEntityId: SelectedEntityId;
  onSelectEntity: (id: SelectedEntityId) => void;
  meshRefMap: MutableRefObject<Map<string, THREE.Mesh>>;
}) {
  const { runtimeEntities, selectedEntityId, onSelectEntity, meshRefMap } = props;

  return (
    <>
      <Grid args={[40, 40]} cellSize={1} cellThickness={0.5} sectionSize={5} sectionThickness={1} fadeDistance={80} />
      <axesHelper args={[5]} />

      {runtimeEntities.map((runtimeEntity) => {
        const { entity, position, rotation, scale } = runtimeEntity;
        const [px, py, pz] = position;
        const [rx, ry, rz] = rotation;
        const [sx, sy, sz] = entity.size;
        const isSelected = selectedEntityId === entity.id;

        return (
          <mesh
            key={entity.id}
            ref={(mesh) => {
              if (!mesh) {
                meshRefMap.current.delete(entity.id);
                return;
              }
              meshRefMap.current.set(entity.id, mesh);
            }}
            position={[px, py, pz]}
            rotation={[rx, ry, rz]}
            scale={scale}
            castShadow
            receiveShadow
            onClick={(event) => {
              event.stopPropagation();
              onSelectEntity(entity.id);
            }}
          >
            <boxGeometry args={[sx, sy, sz]} />
            <meshStandardMaterial
              color={entity.color}
              emissive={isSelected ? '#f59e0b' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
              wireframe={isSelected}
            />
          </mesh>
        );
      })}
    </>
  );
}

/**
 * 通用 3D 视口组件。
 *
 * @param props 组件属性。
 * @returns 3D 视口组件。
 */
export function Viewport3D(props: Viewport3DProps) {
  const {
    entities: inputEntities,
    miniMapEnabled,
    defaultMiniMapEnabled = false,
    miniMapMode = 'top-down',
    onMiniMapEnabledChange,
    selectedEntityId,
    defaultSelectedEntityId = null,
    onSelectedEntityIdChange,
    transformMode,
    defaultTransformMode = 'translate',
    onTransformModeChange,
    entityTransforms,
    defaultEntityTransforms,
    onEntityTransformsChange,
    className,
  } = props;

  const entities = useMemo(() => inputEntities ?? createDemoEntities(), [inputEntities]);

  const [localMiniMapEnabled, setLocalMiniMapEnabled] = useState(defaultMiniMapEnabled);
  const [localSelectedEntityId, setLocalSelectedEntityId] = useState<SelectedEntityId>(
    normalizeSelectedEntityId(defaultSelectedEntityId),
  );
  const [localTransformMode, setLocalTransformMode] = useState<TransformMode>(defaultTransformMode);
  const [localEntityTransforms, setLocalEntityTransforms] = useState<EntityTransformMap>(
    defaultEntityTransforms ?? createInitialTransforms(entities),
  );

  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const meshRefMap = useRef<Map<string, THREE.Mesh>>(new Map());

  const runtimeTransforms = entityTransforms ?? localEntityTransforms;
  const runtimeEntities = useMemo(
    () => buildRuntimeEntities(entities, runtimeTransforms),
    [entities, runtimeTransforms],
  );

  const isMiniMapEnabled = miniMapEnabled ?? localMiniMapEnabled;
  const activeSelectedEntityId = selectedEntityId ?? localSelectedEntityId;
  const activeTransformMode = transformMode ?? localTransformMode;
  const selectedMesh = activeSelectedEntityId ? meshRefMap.current.get(activeSelectedEntityId) ?? null : null;

  useEffect(() => {
    if (entityTransforms !== undefined) {
      return;
    }

    setLocalEntityTransforms((prev) => {
      const next = { ...createInitialTransforms(entities), ...prev };
      return next;
    });
  }, [entities, entityTransforms]);

  const setMiniMapEnabled = (enabled: boolean) => {
    if (miniMapEnabled === undefined) {
      setLocalMiniMapEnabled(enabled);
    }
    onMiniMapEnabledChange?.(enabled);
  };

  const setSelectedEntityId = (id: SelectedEntityId) => {
    if (selectedEntityId === undefined) {
      setLocalSelectedEntityId(id);
    }
    onSelectedEntityIdChange?.(id);
  };

  const setActiveTransformMode = (mode: TransformMode) => {
    if (transformMode === undefined) {
      setLocalTransformMode(mode);
    }
    onTransformModeChange?.(mode);
  };

  const setTransforms = (transforms: EntityTransformMap) => {
    if (entityTransforms === undefined) {
      setLocalEntityTransforms(transforms);
    }
    onEntityTransformsChange?.(transforms);
  };

  const updateSelectedTransformFromMesh = () => {
    if (!activeSelectedEntityId) {
      return;
    }

    const mesh = meshRefMap.current.get(activeSelectedEntityId);
    if (!mesh) {
      return;
    }

    const nextTransforms: EntityTransformMap = {
      ...runtimeTransforms,
      [activeSelectedEntityId]: {
        position: [mesh.position.x, mesh.position.y, mesh.position.z],
        rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z],
        scale: [mesh.scale.x, mesh.scale.y, mesh.scale.z],
      },
    };

    setTransforms(nextTransforms);
  };

  return (
    <Viewport3DContextMenu
      transformMode={activeTransformMode}
      onTransformModeChange={setActiveTransformMode}
      miniMapEnabled={isMiniMapEnabled}
      onMiniMapEnabledChange={setMiniMapEnabled}
      onClearSelection={() => setSelectedEntityId(null)}
    >
      <section className={`vk-viewport ${className ?? ''}`.trim()}>
      <Canvas
        shadows
        camera={{ position: [6, 6, 8], fov: 50, near: 0.1, far: 1000 }}
        onPointerMissed={() => {
          setSelectedEntityId(null);
        }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 14, 8]} intensity={1.1} castShadow />

        <ViewportEntities
          runtimeEntities={runtimeEntities}
          selectedEntityId={activeSelectedEntityId}
          onSelectEntity={setSelectedEntityId}
          meshRefMap={meshRefMap}
        />

        <OrbitControls ref={controlsRef} makeDefault enableDamping dampingFactor={0.08} />

        {selectedMesh ? (
          <TransformControls
            object={selectedMesh}
            mode={activeTransformMode}
            onMouseDown={() => {
              const controls = controlsRef.current;
              if (controls) {
                controls.enabled = false;
              }
            }}
            onMouseUp={() => {
              const controls = controlsRef.current;
              if (controls) {
                controls.enabled = true;
              }
              updateSelectedTransformFromMesh();
            }}
            onObjectChange={updateSelectedTransformFromMesh}
          />
        ) : null}
      </Canvas>

      <div className="vk-overlay">
        <Viewport3DToolbar
          transformMode={activeTransformMode}
          onTransformModeChange={setActiveTransformMode}
          miniMapEnabled={isMiniMapEnabled}
          onMiniMapEnabledChange={setMiniMapEnabled}
          selectedEntityId={activeSelectedEntityId}
        />
      </div>

      <MiniMap3D
        enabled={isMiniMapEnabled}
        entities={runtimeEntities.map((runtimeEntity) => {
          const { entity, position, rotation, scale } = runtimeEntity;
          return {
            ...entity,
            position,
            rotation,
            size: [entity.size[0] * scale[0], entity.size[1] * scale[1], entity.size[2] * scale[2]],
          };
        })}
        mode={miniMapMode}
      />
      </section>
    </Viewport3DContextMenu>
  );
}
