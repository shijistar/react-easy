import { forwardRef } from 'react';
import type { ButtonProps, SwitchProps } from 'antd';
import { Button, Switch, Typography } from 'antd';
import type { LinkProps } from 'antd/es/typography/Link';
import { CloseCircleFilled } from '@ant-design/icons';
import type { ActionCompConstraint, ConfirmActionWithStatic } from '../ConfirmAction';
import { genRenderer, withDefaultConfirmActionProps } from '../ConfirmAction';

const renderDeleteConfirmAction = genRenderer({
  confirmType: 'delete',
  danger: true,
  icon: <CloseCircleFilled />,
});
const forwarded = forwardRef(renderDeleteConfirmAction);

/**
 * - **EN:** Delete operation confirmation box
 * - **CN:** 删除操作确认框
 */
const DeleteConfirmAction = forwarded as unknown as ConfirmActionWithStatic;
/**
 * - **EN:** Deletion confirmation box with button type
 * - **CN:** 按钮类型的删除确认框
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
DeleteConfirmAction.Button = withDefaultConfirmActionProps<ActionCompConstraint, ButtonProps, 'onClick', {}>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  forwarded as any,
  {
    triggerComponent: Button,
    triggerEvent: 'onClick',
    triggerProps: {},
  }
);
/**
 * - **EN:** Deletion confirmation box with switch type
 * - **CN:** 开关类型的删除确认框
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
DeleteConfirmAction.Switch = withDefaultConfirmActionProps<ActionCompConstraint, SwitchProps, 'onChange', {}>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  forwarded as any,
  {
    triggerComponent: Switch,
    triggerEvent: 'onChange',
    triggerProps: {},
  }
);
/**
 * - **EN:** Deletion confirmation box with link type
 * - **CN:** 链接类型的删除确认框
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
DeleteConfirmAction.Link = withDefaultConfirmActionProps<ActionCompConstraint, LinkProps, 'onClick', {}>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  forwarded as any,
  {
    triggerComponent: Typography.Link,
    triggerEvent: 'onClick',
    triggerProps: {
      style: { whiteSpace: 'nowrap' },
    },
  }
);

export default DeleteConfirmAction;
