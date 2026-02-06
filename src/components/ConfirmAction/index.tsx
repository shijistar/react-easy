import type { ComponentType, ForwardedRef, PropsWithoutRef, ReactElement, ReactNode, RefAttributes } from 'react';
import { forwardRef, useContext, useImperativeHandle, useRef, useState } from 'react';
import type { ButtonProps, ModalFuncProps, SwitchProps } from 'antd';
import { App, Button, Modal, Switch, Typography } from 'antd';
import type { ModalFunc } from 'antd/es/modal/confirm';
import type confirm from 'antd/es/modal/confirm';
import useToken from 'antd/es/theme/useToken';
import type { LinkProps } from 'antd/es/typography/Link';
import type { TextProps } from 'antd/es/typography/Text';
import useContextValidator from '../../hooks/useContextValidator';
import useLocalizedText from '../../hooks/useLocalizedText';
import useRefFunction from '../../hooks/useRefFunction';
import ReactEasyContext from '../ConfigProvider/context';

export type ConfirmActionProps<TriggerProp extends object, Event extends keyof TriggerProp> = Omit<
  ModalFuncProps,
  'onOk'
> &
  ConfirmActionTrigger<TriggerProp, Event> & {
    /**
     * - **EN:** Whether to display in red danger mode, which will automatically affect the color of
     *   the title, icon, and confirm button. Default is `false`, for DeleteConfirmAction, the
     *   defaults is `true`.
     *
     * > You can explicitly set `titleColor`, `iconColor`, and `okButtonProps.type` to override
     *
     * - **CN:** 是否显示为红色危险模式，会自动影响标题、图标和确认按钮的颜色。默认`false`，DeleteConfirmAction组件的默认值为`true`。
     *
     * > 可以显式设置`titleColor`、`iconColor`和`okButtonProps.type`来覆盖
     */
    danger?: boolean;
    /**
     * - **EN:** The color of confirm box title, default is `warning`
     * - **CN:** 弹框标题颜色，默认`warning`
     */
    titleColor?: TextProps['type'] | 'primary';
    /**
     * - **EN:** The color of confirm box content
     * - **CN:** 弹框内容文本颜色
     */
    contentColor?: TextProps['type'] | 'primary';
    /**
     * - **EN:** The color of confirm box title icon, default is the same as `titleColor`
     * - **CN:** 弹框标题图标颜色，默认与`titleColor`相同
     */
    iconColor?: TextProps['type'] | 'primary';
    /**
     * - **EN:** Callback when click confirm button
     * - **CN:** 点击确认按钮的回调
     */
    // @ts-expect-error: because TriggerProp[Event] should be casted to function type
    onOk?: (...args: Parameters<TriggerProp[Event]>) => unknown | Promise<unknown>;
    /**
     * - **EN:** Callback after confirm event, won't trigger if failed, the argument is the return
     *   value of `onOk`
     * - **CN:** 确认事件完成后的回调，失败时不会触发，参数为`onOk`的返回值
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    afterOk?: (data?: any) => void;
  };

export interface ConfirmActionTrigger<TriggerProp extends object, Event extends keyof TriggerProp> {
  /**
   * - **EN:** Trigger component, trigger to show confirm box
   * - **CN:** 触发器组件，触发显示确认弹框
   */
  triggerComponent?: ComponentType<TriggerProp>;
  /**
   * - **EN:** Props of trigger component
   * - **CN:** 触发器组件的Props属性
   */
  triggerProps?: TriggerProp;
  /**
   * **EN:** The event name that triggers the dialog
   *
   * **CN:** 触发弹窗的事件名称
   *
   * - `Button`: 'onClick'
   * - `Switch`: 'onChange'
   * - `Link`: 'onClick'
   */
  triggerEvent?: Event;
  /**
   * - **EN:** Custom trigger content
   * - **CN:** 自定义触发器内容
   */
  children?: ReactNode;
}
// eslint-disable-next-line @typescript-eslint/ban-types
export type ConfirmActionRef<R = {}> = R &
  ReturnType<ModalFunc> & {
    /**
     * - **EN:** Show confirm box
     * - **CN:** 显示确认弹框
     */
    show: (props?: Parameters<ModalFunc>[0]) => ReturnType<ModalFunc>;
  };

/**
 * - **EN:** Generate a confirm box component
 * - **CN:** 生成一个确认弹框组件
 *
 * @param defaultProps Default props | 默认属性
 *
 * @returns Component render method | 组件render方法
 */
export const genRenderer = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultProps: Partial<ConfirmActionProps<any, never>> & { confirmType: 'normal' | 'delete' }
) => {
  const Render = <TriggerProp extends object, Event extends keyof TriggerProp>(
    props: ConfirmActionProps<TriggerProp, Event>,
    ref: ForwardedRef<ConfirmActionRef>
  ) => {
    const { confirmType, ...restDefaults } = defaultProps;

    const context = useContext(ReactEasyContext);
    const globalDefaults = confirmType === 'delete' ? context.DeletionConfirmAction : context.ConfirmAction;

    const defaultTitle = useLocalizedText(
      confirmType === 'delete'
        ? context.DeletionConfirmAction?.title || context.defaultDeletionConfirmTitle
        : context.ConfirmAction?.title || context.defaultConfirmTitle
    );
    const defaultContent = useLocalizedText(
      confirmType === 'delete'
        ? context.DeletionConfirmAction?.content || context.defaultDeletionConfirmContent
        : context.ConfirmAction?.content || context.defaultConfirmContent
    );

    const mergedProps: ConfirmActionProps<TriggerProp, Event> = {
      ...restDefaults,
      ...globalDefaults,
      ...props,
      title: props.title ?? defaultTitle ?? restDefaults.title,
      content: props.content ?? defaultContent ?? restDefaults.content,
      okButtonProps: {
        ...restDefaults.okButtonProps,
        ...globalDefaults?.okButtonProps,
        ...props.okButtonProps,
      },
      cancelButtonProps: {
        ...restDefaults.cancelButtonProps,
        ...globalDefaults?.cancelButtonProps,
        ...props.cancelButtonProps,
      },
      bodyProps: {
        ...restDefaults.bodyProps,
        ...globalDefaults?.bodyProps,
        ...props.bodyProps,
      },
      maskProps: {
        ...restDefaults.maskProps,
        ...globalDefaults?.maskProps,
        ...props.maskProps,
      },
      wrapProps: {
        ...restDefaults.wrapProps,
        ...globalDefaults?.wrapProps,
        ...props.wrapProps,
      },
      triggerProps: {
        ...restDefaults.triggerProps,
        ...globalDefaults?.triggerProps,
        ...props.triggerProps,
        style: {
          ...restDefaults.triggerProps?.style,
          ...(globalDefaults?.triggerProps &&
          'style' in globalDefaults.triggerProps &&
          typeof globalDefaults.triggerProps.style === 'object'
            ? globalDefaults.triggerProps.style
            : {}),
          ...(props.triggerProps && 'style' in props.triggerProps && typeof props.triggerProps.style === 'object'
            ? props.triggerProps.style
            : {}),
        },
      } as TriggerProp,
    };
    const {
      triggerComponent: Trigger = Button,
      triggerEvent = 'onClick' as Event,
      triggerProps,
      danger,
      title,
      content,
      titleColor,
      contentColor,
      icon,
      iconColor,
      okButtonProps,
      cancelButtonProps,
      onOk,
      afterOk,
      children,
      ...restProps
    } = mergedProps;

    useContextValidator();

    const app = App.useApp();
    // @ts-expect-error: because app may return a stub object when App is not used
    const modal = app.modal?.confirm ? app.modal : Modal;
    const { localize } = useContext(ReactEasyContext);
    const [, token] = useToken();
    const [confirmApi, setConfirmApi] = useState<ReturnType<typeof confirm>>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const triggerEventArgsRef = useRef<any[]>(undefined);

    const fallbackColor = danger ? 'danger' : undefined;
    // Text with color
    const coloredText = (text: ReactNode, color?: TextProps['type'] | 'primary') => {
      const textContent = typeof text === 'string' ? (localize?.(text) ?? text) : text;
      if (!color) {
        return textContent;
      }
      if (color === 'primary') {
        return <Typography.Text style={{ color: token.colorPrimary }}>{textContent}</Typography.Text>;
      }
      return textContent ? <Typography.Text type={color}>{textContent}</Typography.Text> : undefined;
    };

    // Show confirm box
    const showConfirm: ConfirmActionRef['show'] = useRefFunction(() => {
      const okProps: ButtonProps = {
        ...(danger ? { type: 'primary', danger: true } : {}),
        ...(okButtonProps ?? {}),
      };
      const cancelProps: ButtonProps = {
        ...(cancelButtonProps ?? {}),
      };
      const api = modal.confirm({
        title: coloredText(title, titleColor ?? fallbackColor ?? 'warning'),
        content: coloredText(content, contentColor),
        icon: coloredText(icon, iconColor ?? fallbackColor ?? 'warning'),
        autoFocusButton: null,
        closable: true,
        okButtonProps: okProps,
        cancelButtonProps: cancelProps,
        onOk: async () => {
          try {
            api.update({
              closable: false,
              okButtonProps: {
                loading: true,
                ...okProps,
              },
              cancelButtonProps: {
                disabled: true,
                ...cancelProps,
              },
            });
            const result = await onOk?.(...((triggerEventArgsRef.current ?? []) as Parameters<typeof onOk>));
            afterOk?.(result);
          } finally {
            api.update({
              closable: true,
              okButtonProps: {
                loading: false,
                ...okProps,
              },
              cancelButtonProps: {
                disabled: false,
                ...cancelProps,
              },
            });
          }
        },
        ...restProps,
      });
      setConfirmApi(api);
      return api;
    });

    // Output ref
    useImperativeHandle(ref, () => ({ show: showConfirm, ...confirmApi! }), [showConfirm, confirmApi]);

    // Render trigger component
    return (
      <Trigger
        {...triggerProps}
        // Trigger event
        {...((triggerEvent
          ? {
              [triggerEvent]: (...args: any[]) => {
                triggerEventArgsRef.current = args;
                const api = showConfirm();
                if (triggerProps && typeof triggerProps[triggerEvent] === 'function') {
                  (triggerProps[triggerEvent] as (...args: any[]) => void)(...args, { api });
                }
              },
            }
          : {}) as TriggerProp)}
      >
        {(triggerProps as { children?: ReactNode }).children ?? children}
      </Trigger>
    );
  };
  Render.displayName = 'ConfirmAction';
  return Render;
};

/**
 * - **EN:** Add default properties to the ConfirmAction component
 * - **CN:** 给ConfirmAction组件添加默认属性
 *
 * @param RenderComponent The component that renders the ConfirmAction | 实际渲染组件
 * @param defaultProps Add some default values based on the props passed to the component |
 *   在组件传入的props基础上，添加一些默认值
 */
export const withDefaultConfirmActionProps = <
  P extends ActionCompConstraint,
  TriggerProp extends object,
  Event extends keyof TriggerProp,
  Ref extends object,
>(
  RenderComponent: ComponentType<
    PropsWithoutRef<P & ConfirmActionProps<TriggerProp, Event>> & RefAttributes<ConfirmActionRef<Ref>>
  >,
  defaultProps?:
    | Partial<Omit<P, keyof ActionCompConstraint> & ConfirmActionProps<TriggerProp, Event>>
    | ((
        actualProps: Omit<P, keyof ActionCompConstraint> & ConfirmActionProps<TriggerProp, Event>
      ) => Partial<Omit<P, keyof ActionCompConstraint> & ConfirmActionProps<TriggerProp, Event>>)
) => {
  const WithDefaultProps = forwardRef(
    (
      props: PropsWithoutRef<Omit<P, keyof ActionCompConstraint> & ConfirmActionProps<TriggerProp, Event>>,
      ref: ForwardedRef<ConfirmActionRef<Ref>>
    ) => {
      const actualProps = props as Omit<P, keyof ActionCompConstraint> & ConfirmActionProps<TriggerProp, Event>;
      const useDefaultProps = typeof defaultProps === 'function' ? defaultProps : () => defaultProps;
      const defaults = useDefaultProps(actualProps);
      const mergedProps: Omit<P, keyof ActionCompConstraint> & ConfirmActionProps<TriggerProp, Event> =
        typeof defaultProps === 'function'
          ? {
              ...actualProps,
              ...defaults,
              triggerProps: {
                ...actualProps.triggerProps,
                ...defaults?.triggerProps,
              },
            }
          : {
              ...defaults,
              ...actualProps,
              triggerProps: {
                ...defaults?.triggerProps,
                ...actualProps.triggerProps,
              },
            };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return <RenderComponent ref={ref} {...(mergedProps as any)} />;
    }
  );
  WithDefaultProps.displayName = 'ForwardRef(WithDefaultProps)';
  return WithDefaultProps;
};

const renderConfirmAction = genRenderer({
  confirmType: 'normal',
});
const forwarded = forwardRef(renderConfirmAction);
forwarded.displayName = 'ForwardRef(ConfirmAction)';

/**
 * - **EN:** Confirm box component with trigger
 * - **CN:** 带触发器的确认框组件
 */
const ConfirmAction = forwarded as unknown as ConfirmActionWithStatic;
// Type of button
// eslint-disable-next-line @typescript-eslint/ban-types
ConfirmAction.Button = withDefaultConfirmActionProps<ActionCompConstraint, ButtonProps, 'onClick', {}>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  forwarded as any,
  {
    triggerComponent: Button,
    triggerEvent: 'onClick',
    triggerProps: {},
  }
);
// Type of switch
// eslint-disable-next-line @typescript-eslint/ban-types
ConfirmAction.Switch = withDefaultConfirmActionProps<ActionCompConstraint, SwitchProps, 'onChange', {}>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  forwarded as any,
  {
    triggerComponent: Switch,
    triggerEvent: 'onChange',
    triggerProps: {},
  }
);
// Type of link
// eslint-disable-next-line @typescript-eslint/ban-types
ConfirmAction.Link = withDefaultConfirmActionProps<ActionCompConstraint, LinkProps, 'onClick', {}>(
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

export interface ActionCompConstraint extends ReturnType<ModalFunc> {
  /**
   * - **EN:** Register the confirm action save event, the passed callback function will be called
   *   when the confirm button is clicked, supports asynchronous saving
   * - **CN:** 注册确认框保存事件，传入的回调函数会在点击确认按钮时调用，支持异步保存
   *
   * @param handler Event handler | 事件处理函数
   */
  setOK: (
    handler: (
      /**
       * - **EN:** Trigger click event data, for example, for the `Switch` type trigger, you can get
       *   the value of the switch; for the `Button` type trigger, you can get the click event
       *   object of the button
       * - **CN:** 触发器点击的事件数据，例如，对于`Switch`类型的触发器，可以获取点击开关的值；对于`Button`类型的触发器，可以获取按钮的点击事件对象
       */
      ...triggerEventArgs: any[]
    ) => unknown | Promise<unknown>
  ) => void;

  /**
   * - **EN:** Default trigger DOM element used to render the trigger
   * - **CN:** 默认的触发器组件的 DOM 元素，用于渲染触发器
   */
  triggerDom: ReactNode;
}

/**
 * - **EN:** Interface of generic type component
 * - **CN:** 泛型组件的接口
 */
export type GenericConfirmActionInterface = <TriggerProp extends object, Event extends keyof TriggerProp>(
  props: PropsWithoutRef<TypedConfirmActionProps<TriggerProp, Event>> & RefAttributes<ConfirmActionRef>
) => ReactElement;

/**
 * - **EN:** Interface of specific type component
 * - **CN:** 具体类型组件的接口
 */
export type TypedConfirmActionInterface<TriggerProp extends object, Event extends keyof TriggerProp> = ComponentType<
  PropsWithoutRef<TypedConfirmActionProps<TriggerProp, Event>> & RefAttributes<ConfirmActionRef>
>;

/**
 * - **EN:** Props definition of specific type component
 * - **CN:** 具体类型组件的Props定义
 */
type TypedConfirmActionProps<TriggerProp extends object, Event extends keyof TriggerProp> = Omit<
  ConfirmActionProps<TriggerProp, Event>,
  'triggerComponent' | 'triggerEvent'
>;
export type ConfirmActionWithStatic = GenericConfirmActionInterface & {
  /**
   * - **EN:** Confirm box with button trigger
   * - **CN:** 按钮类型的确认框
   */
  Button: TypedConfirmActionInterface<ButtonProps, 'onClick'>;
  /**
   * - **EN:** Confirm box with switch trigger
   * - **CN:** 开关类型的确认框
   */
  Switch: TypedConfirmActionInterface<SwitchProps, 'onChange'>;
  /**
   * - **EN:** Confirm box with link trigger
   * - **CN:** 链接类型的确认框
   */
  Link: TypedConfirmActionInterface<LinkProps, 'onClick'>;
};

export default ConfirmAction;
