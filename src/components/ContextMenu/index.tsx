import type { CSSProperties, ReactNode } from 'react';
import { forwardRef, useContext, useImperativeHandle, useMemo } from 'react';
import { theme as AntdTheme, ConfigProvider, Typography } from 'antd';
import classNames from 'classnames';
import type { ItemProps, MenuProps, SeparatorProps, ShowContextMenuParams, SubMenuProps } from 'react-contexify';
import { Item, Menu, RightSlot, Separator, Submenu, useContextMenu } from 'react-contexify';
import { useRefFunction } from '../../hooks';
import useStyle from './style';
import 'react-contexify/dist/ReactContexify.css';

export interface ContextMenuProps extends MenuProps {
  /**
   * - **EN:** Menu items to be displayed
   * - **CN:** 要显示的菜单项
   */
  items: (ContextMenuItem | ContextMenuSeparator | ContextMenuSubmenu)[] | undefined;
  /**
   * - **EN:** Trigger methods to show the menu, default is `['contextMenu']`
   * - **CN:** 触发显示菜单的方式，默认是 `['contextMenu']`
   */
  trigger?: ('click' | 'doubleClick' | 'hover' | 'contextMenu')[];
  triggerProps?: {
    className?: string;
    style?: CSSProperties;
  };
  prefixCls?: string;
}
// 上下文菜单组件
const ContextMenu = forwardRef<ContextMenuRef, ContextMenuProps>((props, ref) => {
  const {
    id,
    items,
    trigger = ['contextMenu'],
    triggerProps,
    prefixCls: prefixClsInProps,
    className,
    children,
    ...rest
  } = props;
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('context-menu', prefixClsInProps);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle(prefixCls);
  const { show, hideAll } = useContextMenu({ id });
  const eventNames = useMemo<Record<NonNullable<ContextMenuProps['trigger']>[number], [string, string | undefined]>>(
    () => ({
      click: ['onClick', undefined],
      doubleClick: ['onDoubleClick', undefined],
      hover: ['onPointerEnter', 'onPointerLeave'],
      contextMenu: ['onContextMenu', undefined],
    }),
    []
  );

  // Show context menu handler
  const handleShow = useRefFunction(
    (event: React.MouseEvent<HTMLElement>, options?: Pick<ShowContextMenuParams, 'position'>) => {
      show({
        id,
        event,
        props,
        position: options?.position,
      });
    }
  );
  // Hide all context menus handler
  const handleHideAll = useRefFunction(() => {
    hideAll();
  });
  const eventHandlers = useMemo(() => {
    const handlers: Record<string, (event: React.MouseEvent<HTMLElement>) => void> = {};
    if (trigger) {
      trigger.forEach((eventType) => {
        const [handlerName, leaveHandlerName] = eventNames[eventType];
        handlers[handlerName] = (event: React.MouseEvent<HTMLElement>) => {
          handleShow(event);
        };
        if (leaveHandlerName) {
          handlers[leaveHandlerName] = handleHideAll;
        }
      });
    }
    return handlers;
  }, [eventNames, trigger]);

  // Expose show and hideAll methods to the ref
  useImperativeHandle(
    ref,
    () => ({
      show: handleShow,
      hideAll: handleHideAll,
    }),
    []
  );

  return (
    <>
      {children &&
        wrapCSSVar(
          <div
            {...eventHandlers}
            className={classNames(hashId, cssVarCls, prefixCls, `${prefixCls}-trigger`, triggerProps?.className)}
            style={triggerProps?.style}
          >
            {children}
          </div>
        )}
      {wrapCSSVar(
        <Menu
          id={id}
          className={classNames(
            hashId,
            cssVarCls,
            prefixCls,
            `${prefixCls}-menu`,
            {
              [`${prefixCls}-menu-has-items`]: !!items?.length,
            },
            className
          )}
          {...rest}
        >
          {renderItems(items, { theme: props.theme, cmpPrefixCls: prefixCls })}
        </Menu>
      )}
    </>
  );
});
ContextMenu.displayName = 'ContextMenu';

// Render menu items
function renderItems(
  items: (ContextMenuItem | ContextMenuSeparator | ContextMenuSubmenu)[] | undefined,
  options: Pick<ContextMenuProps, 'theme'> & { cmpPrefixCls: string }
): ReactNode[] | undefined {
  return items?.map((item, index) => {
    const isSeparator = 'type' in item && item.type === 'separator';
    const isSubmenu = 'type' in item && item.type === 'submenu';
    const menuItem = item as ContextMenuItem;

    if (isSeparator) {
      // eslint-disable-next-line react/no-array-index-key
      return <Separator key={`[separator]:${index}`} />;
    }

    if (isSubmenu) {
      const subMenu = item as ContextMenuSubmenu;
      return (
        <Submenu {...subMenu} key={subMenu.key}>
          {renderItems(item.items, options)}
        </Submenu>
      );
    }

    return (
      <Item
        {...menuItem}
        keyMatcher={
          typeof menuItem.shortcutKey === 'object'
            ? (e) => {
                const shortcutKey = menuItem.shortcutKey as Partial<KeyboardEvent>;
                if (shortcutKey.ctrlKey && !e.ctrlKey) return false;
                if (shortcutKey.altKey && !e.altKey) return false;
                if (shortcutKey.shiftKey && !e.shiftKey) return false;
                if (shortcutKey.metaKey && !e.metaKey) return false;
                if (!shortcutKey.key || shortcutKey.key !== e.key) return false;
                return true;
              }
            : menuItem.shortcutKey
        }
        key={menuItem.key}
      >
        {menuItem.children ? (
          menuItem.children
        ) : (
          <>
            {menuItem.icon}
            <span>{menuItem.label}</span>
            {typeof menuItem.shortcutKey === 'object' && (
              <RightSlot>{getShortcutText(menuItem.shortcutKey, options)}</RightSlot>
            )}
          </>
        )}
      </Item>
    );
  });
}

function getShortcutText(
  event: Partial<Pick<KeyboardEvent, 'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey' | 'key'>>,
  options: Pick<ContextMenuProps, 'theme'> & { cmpPrefixCls: string }
): ReactNode[] {
  const { theme, cmpPrefixCls } = options;
  const keys: ReactNode[] = [];
  const Keyboard = (props: { children: ReactNode }) => {
    return (
      <ConfigProvider theme={{ algorithm: theme === 'dark' ? AntdTheme.darkAlgorithm : undefined }}>
        <Typography.Text keyboard className={`${cmpPrefixCls}-shortcut-key`}>
          {props.children}
        </Typography.Text>
      </ConfigProvider>
    );
  };
  if (event.ctrlKey) keys.push(<Keyboard>^</Keyboard>);
  if (event.altKey) keys.push(<Keyboard>⌥</Keyboard>);
  if (event.shiftKey) keys.push(<Keyboard>⇧</Keyboard>);
  if (event.metaKey) keys.push(<Keyboard>⌘</Keyboard>);
  if (event.key) {
    keys.push(<Keyboard>{event.key}</Keyboard>);
  }
  return keys;
}

export interface ContextMenuRef {
  show: (event: React.MouseEvent<HTMLElement>) => void;
  hideAll: () => void;
}

export interface ContextMenuItem extends Omit<ItemProps, 'children' | 'keyMatcher'> {
  key: string;
  className?: string;
  icon?: ReactNode;
  label?: ReactNode;
  shortcutKey?:
    | Partial<Pick<KeyboardEvent, 'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey' | 'key'>>
    | ItemProps['keyMatcher'];
  children?: ReactNode;
}

export interface ContextMenuSeparator extends SeparatorProps {
  type: 'separator';
}

export interface ContextMenuSubmenu extends SubMenuProps {
  key: string;
  type: 'submenu';
  items: (ContextMenuItem | ContextMenuSeparator | ContextMenuSubmenu)[];
}

export default ContextMenu;
