import type React from 'react';
import { useCallback, useMemo } from 'react';
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, DatePicker, Input, Radio, Select } from 'antd';
import type { SelectProps } from 'antd';
import { createUseStyles } from 'react-jss';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

type FieldType = 'string' | 'number' | 'date';

export interface LogicField {
  key: string;
  label: string;
  type: FieldType;
}

export interface LogicOperator {
  value: string;
  label: string;
}

export interface LogicCondition {
  id: string;
  fieldKey?: string;
  operator?: string;
  value?: unknown;
  relationWithPrevious?: 'AND' | 'OR';
}

export interface LogicGroup {
  id: string;
  relationWithPrevious?: 'AND' | 'OR';
  conditions: LogicCondition[];
}

export interface LogicExpressionBuilderValue {
  groups: LogicGroup[];
}

export interface LogicExpressionBuilderProps {
  value: LogicExpressionBuilderValue;
  onChange: (value: LogicExpressionBuilderValue) => void;
  fields: LogicField[];
  operatorsMap?: Partial<Record<FieldType, LogicOperator[]>>;
  disabled?: boolean;
  disableGroups?: boolean;
}

const useStyles = createUseStyles({
  builder: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  groupRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
  },
  relationSelect: {
    width: 90,
    marginTop: 4,
  },
  groupCard: {
    flex: 1,
    border: '1px solid var(--xs-border-color, #e5e7eb)',
    borderRadius: 4,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    background: '#fff',
  },
  dragHandle: {
    cursor: 'move',
    userSelect: 'none',
    color: 'var(--xs-text-secondary, #9ca3af)',
    padding: 4,
  },
  condDragHandle: {
    cursor: 'move',
    userSelect: 'none',
    color: 'var(--xs-text-secondary, #9ca3af)',
    padding: '0 4px',
  },
  groupHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conditions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  conditionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  conditionRelation: {
    width: 120,
  },
  conditionField: {
    width: 180,
  },
  conditionOperator: {
    width: 140,
  },
  conditionValue: {
    flex: 1,
  },
  groupFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  addGroupBtn: {
    alignSelf: 'flex-start',
  },
});

const defaultOperatorsMap: Record<FieldType, LogicOperator[]> = {
  string: [
    { value: 'eq', label: '等于' },
    { value: 'ne', label: '不等于' },
    { value: 'contains', label: '包含' },
    { value: 'empty', label: '为空' },
    { value: 'not_empty', label: '不为空' },
  ],
  number: [
    { value: 'eq', label: '等于' },
    { value: 'ne', label: '不等于' },
    { value: 'gt', label: '大于' },
    { value: 'gte', label: '大于等于' },
    { value: 'lt', label: '小于' },
    { value: 'lte', label: '小于等于' },
    { value: 'empty', label: '为空' },
    { value: 'not_empty', label: '不为空' },
  ],
  date: [
    { value: 'eq', label: '等于' },
    { value: 'ne', label: '不等于' },
    { value: 'gt', label: '晚于' },
    { value: 'lt', label: '早于' },
    { value: 'empty', label: '为空' },
    { value: 'not_empty', label: '不为空' },
  ],
};

const newId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const gid = (groupId: string) => `group:${groupId}`;
const cid = (groupId: string, condId: string) => `cond:${groupId}:${condId}`;
const parseGroup = (id: string) => (id.startsWith('group:') ? id.slice(6) : null);
const parseCond = (id: string) => {
  if (!id.startsWith('cond:')) return null;
  const [, g, c] = id.split(':');
  return { groupId: g, condId: c };
};

const LogicExpressionBuilder: React.FC<LogicExpressionBuilderProps> = ({
  value,
  onChange,
  fields,
  operatorsMap,
  disabled,
  disableGroups,
}) => {
  const classes = useStyles();

  const mergedOperatorsMap = useMemo(
    () => ({
      string: operatorsMap?.string || defaultOperatorsMap.string,
      number: operatorsMap?.number || defaultOperatorsMap.number,
      date: operatorsMap?.date || defaultOperatorsMap.date,
    }),
    [operatorsMap]
  );

  const fieldOptions: SelectProps['options'] = useMemo(
    () => fields.map((f) => ({ label: f.label, value: f.key })),
    [fields]
  );

  const change = useCallback((next: LogicExpressionBuilderValue) => onChange(next), [onChange]);

  const addGroup = useCallback(() => {
    if (disabled) return;
    if (disableGroups && value.groups.length > 0) return;
    const group: LogicGroup = {
      id: newId(),
      relationWithPrevious: value.groups.length === 0 ? undefined : 'AND',
      conditions: [{ id: newId() }],
    };
    change({ groups: [...value.groups, group] });
  }, [disabled, disableGroups, value.groups, change]);

  const removeGroup = useCallback(
    (groupId: string) => {
      if (disabled) return;
      change({ groups: value.groups.filter((g) => g.id !== groupId) });
    },
    [disabled, value.groups, change]
  );

  const setGroupRelation = useCallback(
    (groupId: string, rel: 'AND' | 'OR') => {
      if (disabled) return;
      change({
        groups: value.groups.map((g) => (g.id === groupId ? { ...g, relationWithPrevious: rel } : g)),
      });
    },
    [disabled, value.groups, change]
  );

  const addCondition = useCallback(
    (groupId: string) => {
      if (disabled) return;
      change({
        groups: value.groups.map((g) =>
          g.id === groupId
            ? {
                ...g,
                conditions: [
                  ...g.conditions,
                  { id: newId(), relationWithPrevious: g.conditions.length === 0 ? undefined : 'AND' },
                ],
              }
            : g
        ),
      });
    },
    [disabled, value.groups, change]
  );

  const removeCondition = useCallback(
    (groupId: string, condId: string) => {
      if (disabled) return;
      change({
        groups: value.groups.map((g) =>
          g.id === groupId ? { ...g, conditions: g.conditions.filter((c) => c.id !== condId) } : g
        ),
      });
    },
    [disabled, value.groups, change]
  );

  const setConditionField = useCallback(
    (groupId: string, condId: string, fieldKey?: string) => {
      if (disabled) return;
      change({
        groups: value.groups.map((g) =>
          g.id === groupId
            ? {
                ...g,
                conditions: g.conditions.map((c) =>
                  c.id === condId ? { ...c, fieldKey, operator: undefined, value: undefined } : c
                ),
              }
            : g
        ),
      });
    },
    [disabled, value.groups, change]
  );

  const setConditionOperator = useCallback(
    (groupId: string, condId: string, operator?: string) => {
      if (disabled) return;
      change({
        groups: value.groups.map((g) =>
          g.id === groupId
            ? { ...g, conditions: g.conditions.map((c) => (c.id === condId ? { ...c, operator } : c)) }
            : g
        ),
      });
    },
    [disabled, value.groups, change]
  );

  const setConditionRelation = useCallback(
    (groupId: string, condId: string, rel: 'AND' | 'OR') => {
      if (disabled) return;
      change({
        groups: value.groups.map((g) =>
          g.id === groupId
            ? {
                ...g,
                conditions: g.conditions.map((c, idx) =>
                  c.id === condId && idx > 0 ? { ...c, relationWithPrevious: rel } : c
                ),
              }
            : g
        ),
      });
    },
    [disabled, value.groups, change]
  );

  const setConditionValue = useCallback(
    (groupId: string, condId: string, v: unknown) => {
      if (disabled) return;
      change({
        groups: value.groups.map((g) =>
          g.id === groupId
            ? { ...g, conditions: g.conditions.map((c) => (c.id === condId ? { ...c, value: v } : c)) }
            : g
        ),
      });
    },
    [disabled, value.groups, change]
  );

  // dnd-kit sensors and reorder handler
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (disabled) return;
      const { active, over } = event;
      if (!active || !over) return;
      const aId = String(active.id);
      const oId = String(over.id);

      const aGroupRaw = parseGroup(aId);
      const oGroupRaw = parseGroup(oId);
      if (aGroupRaw && oGroupRaw) {
        const from = value.groups.findIndex((g) => g.id === aGroupRaw);
        const to = value.groups.findIndex((g) => g.id === oGroupRaw);
        if (from < 0 || to < 0 || from === to) return;
        const next = arrayMove(value.groups, from, to).map((g, idx) => ({
          ...g,
          relationWithPrevious: idx === 0 ? undefined : g.relationWithPrevious || 'AND',
        }));
        change({ groups: next });
        return;
      }

      const aCond = parseCond(aId);
      const oCond = parseCond(oId);
      if (aCond && oCond) {
        const src = value.groups.find((g) => g.id === aCond.groupId);
        const dst = value.groups.find((g) => g.id === oCond.groupId);
        if (!src || !dst) return;
        const fromIndex = src.conditions.findIndex((c) => c.id === aCond.condId);
        const toIndex = dst.conditions.findIndex((c) => c.id === oCond.condId);
        if (fromIndex < 0 || toIndex < 0) return;

        if (src.id === dst.id) {
          const newConditions = arrayMove(src.conditions, fromIndex, toIndex);
          newConditions.forEach(
            (c, idx) => (c.relationWithPrevious = idx === 0 ? undefined : c.relationWithPrevious || 'AND')
          );
          change({ groups: value.groups.map((g) => (g.id === src.id ? { ...g, conditions: newConditions } : g)) });
        } else {
          const moved = src.conditions[fromIndex];
          const srcRest = src.conditions.filter((c) => c.id !== moved.id);
          const dstNext = [...dst.conditions];
          dstNext.splice(toIndex, 0, moved);
          srcRest.forEach(
            (c, idx) => (c.relationWithPrevious = idx === 0 ? undefined : c.relationWithPrevious || 'AND')
          );
          dstNext.forEach(
            (c, idx) => (c.relationWithPrevious = idx === 0 ? undefined : c.relationWithPrevious || 'AND')
          );
          change({
            groups: value.groups.map((g) => {
              if (g.id === src.id) return { ...g, conditions: srcRest };
              if (g.id === dst.id) return { ...g, conditions: dstNext };
              return g;
            }),
          });
        }
      }
    },
    [disabled, value.groups, change]
  );

  const renderValueInput = (groupId: string, condition: LogicCondition) => {
    const field = fields.find((f) => f.key === condition.fieldKey);
    if (!field) return <Input disabled />;

    const operators = mergedOperatorsMap[field.type];
    const operator = operators.find((op) => op.value === condition.operator);
    if (operator && (operator.value === 'empty' || operator.value === 'not_empty'))
      return <Input disabled placeholder="无需填写值" />;

    if (field.type === 'number')
      return (
        <Input
          type="number"
          className={classes.conditionValue}
          disabled={disabled}
          value={condition.value}
          onChange={(e) => setConditionValue(groupId, condition.id, e.target.value)}
        />
      );
    if (field.type === 'date')
      return (
        <DatePicker
          className={classes.conditionValue}
          disabled={disabled}
          value={condition.value}
          onChange={(d) => setConditionValue(groupId, condition.id, d)}
        />
      );
    return (
      <Input
        className={classes.conditionValue}
        disabled={disabled}
        value={condition.value}
        onChange={(e) => setConditionValue(groupId, condition.id, e.target.value)}
      />
    );
  };

  // Sortable wrappers to use hooks inside components
  const SortableGroup: React.FC<{
    id: string;
    children: (p: {
      setNodeRef: unknown;
      style: React.CSSProperties;
      attributes: unknown;
      listeners: unknown;
    }) => React.ReactNode;
  }> = ({ id, children }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;
    return <>{children({ setNodeRef, style, attributes, listeners })}</>;
  };

  const SortableCond: React.FC<{
    id: string;
    children: (p: {
      setNodeRef: unknown;
      style: React.CSSProperties;
      attributes: unknown;
      listeners: unknown;
    }) => React.ReactNode;
  }> = ({ id, children }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;
    return <>{children({ setNodeRef, style, attributes, listeners })}</>;
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <div className={classes.builder}>
        <SortableContext items={value.groups.map((g) => gid(g.id))} strategy={verticalListSortingStrategy}>
          {value.groups.map((group, gi) => {
            const relationNode =
              gi === 0 ? null : (
                <Select
                  className={classes.relationSelect}
                  disabled={disabled}
                  value={group.relationWithPrevious || 'AND'}
                  onChange={(v: 'AND' | 'OR') => setGroupRelation(group.id, v)}
                  options={[
                    { label: 'AND', value: 'AND' },
                    { label: 'OR', value: 'OR' },
                  ]}
                />
              );
            return (
              <div key={group.id} className={classes.groupRow}>
                {relationNode}
                <SortableGroup id={gid(group.id)}>
                  {({ setNodeRef, style, attributes, listeners }) => (
                    <div ref={setNodeRef} style={style} className={classes.groupCard}>
                      <div className={classes.groupHeader}>
                        <div className={classes.dragHandle} {...attributes} {...listeners}>
                          ⋮⋮
                        </div>
                        <Button
                          type="text"
                          danger
                          disabled={disabled}
                          icon={<DeleteOutlined />}
                          onClick={() => removeGroup(group.id)}
                        />
                      </div>

                      <div className={classes.conditions}>
                        <SortableContext
                          items={group.conditions.map((c) => cid(group.id, c.id))}
                          strategy={verticalListSortingStrategy}
                        >
                          {group.conditions.map((cond, ci) => {
                            const field = fields.find((f) => f.key === cond.fieldKey);
                            const ops = field ? mergedOperatorsMap[field.type] : [];
                            return (
                              <SortableCond id={cid(group.id, cond.id)} key={cond.id}>
                                {({
                                  setNodeRef: setCondRef,
                                  style: condStyle,
                                  attributes: condAttr,
                                  listeners: condListeners,
                                }) => (
                                  <div ref={setCondRef} style={condStyle} className={classes.conditionRow}>
                                    <span className={classes.condDragHandle} {...condAttr} {...condListeners}>
                                      ⋮
                                    </span>
                                    {ci > 0 && (
                                      <Radio.Group
                                        className={classes.conditionRelation}
                                        disabled={disabled}
                                        optionType="button"
                                        buttonStyle="solid"
                                        options={[
                                          { label: 'AND', value: 'AND' },
                                          { label: 'OR', value: 'OR' },
                                        ]}
                                        value={cond.relationWithPrevious || 'AND'}
                                        onChange={(e) => setConditionRelation(group.id, cond.id, e.target.value)}
                                      />
                                    )}
                                    <Select
                                      className={classes.conditionField}
                                      disabled={disabled}
                                      placeholder="字段"
                                      value={cond.fieldKey}
                                      options={fieldOptions}
                                      onChange={(v) => setConditionField(group.id, cond.id, v)}
                                    />
                                    <Select
                                      className={classes.conditionOperator}
                                      disabled={disabled || !field}
                                      placeholder="操作符"
                                      value={cond.operator}
                                      options={ops}
                                      onChange={(v) => setConditionOperator(group.id, cond.id, v)}
                                    />
                                    {renderValueInput(group.id, cond)}
                                    <Button
                                      type="text"
                                      disabled={disabled}
                                      icon={<DeleteOutlined />}
                                      onClick={() => removeCondition(group.id, cond.id)}
                                    />
                                  </div>
                                )}
                              </SortableCond>
                            );
                          })}
                        </SortableContext>
                      </div>

                      <div className={classes.groupFooter}>
                        <Button
                          type="link"
                          icon={<PlusOutlined />}
                          disabled={disabled}
                          onClick={() => addCondition(group.id)}
                        >
                          添加条件
                        </Button>
                      </div>
                    </div>
                  )}
                </SortableGroup>
              </div>
            );
          })}

          {!disableGroups && (
            <Button
              className={classes.addGroupBtn}
              type="dashed"
              icon={<PlusOutlined />}
              disabled={disabled}
              onClick={addGroup}
            >
              添加分组
            </Button>
          )}
        </SortableContext>
      </div>
    </DndContext>
  );
};

export default LogicExpressionBuilder;
