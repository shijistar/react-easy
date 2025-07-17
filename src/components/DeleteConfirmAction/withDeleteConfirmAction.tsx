import { CloseCircleFilled } from '@ant-design/icons';
import type { ActionCompConstraint, ConfirmActionProps } from '../ConfirmAction';
import { type ActionComponentInterface, withConfirmActionInternal } from '../ConfirmAction/withConfirmAction';

/**
 * - **EN:** Wrap a component into a delete confirmation dialog component, supporting custom triggers
 *   and default properties
 * - **CN:** 将一个组件包装成一个删除确认弹框组件，支持自定义触发器和默认属性
 *
 * @param actionComponent Custom trigger component | 自定义触发器组件
 * @param defaultProps Default properties of the deletion confirm box | 删除确认弹框的默认属性
 */
export default function withDeleteConfirmAction<
  P extends ActionCompConstraint,
  OuterTriggerProp extends object,
  OuterEvent extends keyof OuterTriggerProp,
  Ref extends object,
>(
  ActionComponent: ActionComponentInterface<P, Ref>,
  defaultProps?:
    | Partial<Omit<P, keyof ActionCompConstraint> & ConfirmActionProps<OuterTriggerProp, OuterEvent>>
    | ((
        actualProps: Omit<P, keyof ActionCompConstraint> & ConfirmActionProps<OuterTriggerProp, OuterEvent>
      ) => Partial<Omit<P, keyof ActionCompConstraint> & ConfirmActionProps<OuterTriggerProp, OuterEvent>>)
) {
  return withConfirmActionInternal(
    ActionComponent,
    {
      confirmType: 'delete',
      danger: true,
      icon: <CloseCircleFilled />,
    },
    defaultProps
  );
}
