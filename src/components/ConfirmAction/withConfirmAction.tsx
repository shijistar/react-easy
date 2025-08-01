import type { ComponentType, PropsWithoutRef, ReactNode, RefAttributes } from 'react';
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import type { ActionCompConstraint, ConfirmActionProps, ConfirmActionRef } from '.';
import { genRenderer, withDefaultConfirmActionProps } from '.';
import { Button, type ButtonProps, Switch, type SwitchProps, Typography } from 'antd';
import type { LinkProps } from 'antd/es/typography/Link';
import { isForwardRef } from 'react-is';

/**
 * - **EN:** Generate a confirm box component with custom trigger and default props
 * - **CN:** 将一个组件包装成一个确认弹框组件，支持自定义触发器和默认属性
 *
 * @param actionComponent Custom trigger component | 自定义触发器组件
 * @param defaultProps Default properties of the confirm box | 确认弹框的默认属性
 */
export default function withConfirmAction<
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
      confirmType: 'normal',
    },
    defaultProps
  );
}

export function withConfirmActionInternal<
  P extends ActionCompConstraint,
  OuterTriggerProp extends object,
  OuterEvent extends keyof OuterTriggerProp,
  Ref extends object,
>(
  ActionComponent: ActionComponentInterface<P, Ref>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderDefaultProps: Partial<ConfirmActionProps<any, never>> & { confirmType: 'normal' | 'delete' },
  defaultProps?:
    | Partial<Omit<P, keyof ActionCompConstraint> & ConfirmActionProps<OuterTriggerProp, OuterEvent>>
    | ((
        actualProps: Omit<P, keyof ActionCompConstraint> & ConfirmActionProps<OuterTriggerProp, OuterEvent>
      ) => Partial<Omit<P, keyof ActionCompConstraint> & ConfirmActionProps<OuterTriggerProp, OuterEvent>>)
) {
  const ConfirmActionWithRef = forwardRef(genRenderer(renderDefaultProps));
  ConfirmActionWithRef.displayName = 'ForwardRef(ConfirmAction)';

  const WrappedActionComponent = forwardRef<Ref, ConfirmActionProps<OuterTriggerProp, OuterEvent>>(
    (propsWithDefaults, ref) => {
      const actionRef = useRef<ConfirmActionRef>(null);
      const [customRef, setCustomRef] = useState<Ref | null>(null);
      const saveFuncRef = useRef<(...triggerEventArgs: any[]) => unknown | Promise<unknown>>(undefined);

      // Receive the onSave callback method passed by the form component
      const setOnOk: ActionCompConstraint['setOK'] = useCallback((handler) => {
        saveFuncRef.current = handler;
      }, []);
      const triggerOnOK = useCallback(async (...args: any[]) => {
        return saveFuncRef.current?.(...args);
      }, []);

      // Merge the default ref and custom ref and output to the parent component
      useImperativeHandle(ref, () => {
        return {
          ...actionRef.current,
          ...customRef,
        } as ConfirmActionRef<Ref>;
      }, [customRef]);

      // Render the default trigger DOM element, and pass it to the custom ActionComponent
      const triggerDom = (
        <ConfirmActionWithRef
          {...(propsWithDefaults as ConfirmActionProps<object, never>)}
          onOk={triggerOnOK}
          ref={actionRef}
        />
      );

      return (
        <ActionComponent
          {...(propsWithDefaults as P)}
          ref={isForwardRef(ActionComponent) ? setCustomRef : undefined}
          setOK={setOnOk}
          triggerDom={triggerDom}
        />
      );
    }
  );
  WrappedActionComponent.displayName = 'ConfirmAction(ActionComponent)';

  const withDefaults = withDefaultConfirmActionProps(
    WrappedActionComponent,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultProps as any
  ) as unknown as ComponentType<
    Omit<ConfirmActionProps<OuterTriggerProp, OuterEvent>, 'triggerComponent'> & RefAttributes<ConfirmActionRef>
  >;
  // return withDefaults;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return addTriggers<P, OuterTriggerProp, OuterEvent, Ref>(withDefaults as any);
}

/**
 * - **EN:** Add trigger types to the ModalAction component
 * - **CN:** 给ModalAction组件添加子触发器类型
 */
function addTriggers<
  P extends ActionCompConstraint,
  OuterTriggerProp extends object,
  OuterEvent extends keyof OuterTriggerProp,
  Ref extends object,
>(comp: ComponentType<ConfirmActionProps<OuterTriggerProp, OuterEvent> & RefAttributes<ConfirmActionRef<Ref>>>) {
  const patchedComp = comp as unknown as WithGenericTriggers<P, Ref>;
  // Type of button trigger
  patchedComp.Button = withDefaultConfirmActionProps<P, ButtonProps, 'onClick', Ref>(
    // @ts-expect-error: because the type is a little bit complex, so we ignore the type error here
    comp,
    {
      triggerComponent: Button,
      triggerEvent: 'onClick',
      triggerProps: {},
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any;
  // Type of switch trigger
  patchedComp.Switch = withDefaultConfirmActionProps<P, SwitchProps, 'onChange', Ref>(
    // @ts-expect-error: because the type is a little bit complex, so we ignore the type error here
    comp,
    {
      triggerComponent: Switch,
      triggerEvent: 'onChange',
      triggerProps: {},
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any;
  // Type of link trigger
  patchedComp.Link = withDefaultConfirmActionProps<P, LinkProps, 'onClick', Ref>(
    // @ts-expect-error: because the type is a little bit complex, so we ignore the type error here
    comp,
    {
      triggerComponent: Typography.Link,
      triggerEvent: 'onClick',
      triggerProps: {
        style: { whiteSpace: 'nowrap' },
      },
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any;
  return patchedComp;
}

/**
 * - **EN:** ModalAction component type
 * - **CN:** ModalAction组件的类型
 */
export type ActionComponentInterface<P extends ActionCompConstraint, Ref extends object> = ComponentType<
  P & RefAttributes<ConfirmActionRef<Ref>>
>;

type WithGenericTriggers<P extends ActionCompConstraint, Ref extends object> = (<
  TriggerProp extends object,
  Event extends keyof TriggerProp,
>(
  props: PropsWithoutRef<Omit<P, keyof ActionCompConstraint>> &
    ConfirmActionProps<TriggerProp, Event> &
    RefAttributes<ConfirmActionRef<Ref>>
) => ReactNode) &
  TypedTriggers<P, Ref>;

/**
 * - **EN:** Built-in trigger types (specified form components)
 * - **CN:** 内置的几种触发器类型（已指定表单组件）
 */
export interface TypedTriggers<P extends ActionCompConstraint, Ref extends object> {
  /**
   * - **EN:** Dialog with button type trigger
   * - **CN:** 按钮类型的弹窗
   */
  Button: ConfirmActionWithTrigger<P, ButtonProps, 'onClick', Ref>;
  /**
   * - **EN:** Dialog with switch type trigger
   * - **CN:** 开关类型的弹窗
   */
  Switch: ConfirmActionWithTrigger<P, SwitchProps, 'onChange', Ref>;
  /**
   * - **EN:** Dialog with link type trigger
   * - **CN:** 链接类型的弹窗
   */
  Link: ConfirmActionWithTrigger<P, LinkProps, 'onClick', Ref>;
}

/**
 * - **EN:** ModalAction with specified trigger type (specified form component)
 * - **CN:** 已指定Trigger类型的ModalAction（并且已指定表单组件）
 */
type ConfirmActionWithTrigger<
  P extends ActionCompConstraint,
  TriggerProp extends object,
  Event extends keyof TriggerProp,
  Ref extends object,
  OMIT extends string = never,
> = ComponentType<
  Omit<
    PropsWithoutRef<Omit<P, keyof ActionCompConstraint>> & ConfirmActionProps<TriggerProp, Event>,
    'triggerComponent' | 'triggerEvent' | OMIT
  > &
    RefAttributes<ConfirmActionRef<Ref>>
>;
