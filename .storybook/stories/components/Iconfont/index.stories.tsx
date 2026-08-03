import { useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Space, Typography } from 'antd';
import { createIconfont } from '../../../../src/components/Iconfont';
import { useStoryT } from '../../../locales';
import apiDoc from './api-doc.md?raw';
import introduce from './introduce.md?raw';

// Ant Design official iconfont demo URL, also used by the repo tests.
const SCRIPT_URL = '//at.alicdn.com/t/font_8d5l8fzk5b87iudi.js';

const ICON_TYPES = ['icon-tuichu', 'icon-facebook', 'icon-twitter'] as const;

interface IconfontStoryArgs {
  /** URL of the iconfont script | iconfont 脚本的 URL */
  scriptUrl: string;
  /** Icon name from the iconfont project | iconfont 项目中的图标名称 */
  type: string;
  /** Icon size in px | 图标尺寸（像素） */
  size?: number;
  /** Icon color | 图标颜色 */
  color?: string;
  /** Whether the icon spins continuously | 图标是否持续旋转 */
  spin?: boolean;
  /** Fixed clockwise rotation angle | 顺时针固定旋转角度 */
  rotate?: number;
  /** Demo-only: prefix auto-prepended to `type` | 示例专用：自动拼接到 `type` 的前缀 */
  iconPrefix?: string;
}

const meta: Meta<IconfontStoryArgs> = {
  title: 'Components/Iconfont',
  parameters: {
    docs: {
      description: {
        component: introduce + apiDoc,
      },
    },
  },
  args: {
    scriptUrl: SCRIPT_URL,
    type: 'icon-tuichu',
    size: 32,
    color: '#1677ff',
    spin: false,
    rotate: 0,
    iconPrefix: '',
  },
  argTypes: {
    scriptUrl: {
      control: 'text',
      description: `- **EN:** URL of the iconfont script.
- **CN:** iconfont 脚本的 URL。`,
    },
    type: {
      control: 'select',
      options: [...ICON_TYPES],
      description: `- **EN:** Icon name provided by the loaded iconfont script.
- **CN:** 已加载的 iconfont 脚本提供的图标名称。`,
    },
    size: {
      control: { type: 'number', min: 12, max: 64, step: 4 },
      description: `- **EN:** Icon size in pixels.
- **CN:** 图标尺寸（像素）。`,
      table: { defaultValue: { summary: '32' } },
    },
    color: {
      control: 'color',
      description: `- **EN:** Icon color.
- **CN:** 图标颜色。`,
    },
    spin: {
      control: 'boolean',
      description: `- **EN:** Whether the icon spins continuously.
- **CN:** 图标是否持续旋转。`,
      table: { defaultValue: { summary: 'false' } },
    },
    rotate: {
      control: { type: 'number', min: 0, max: 360, step: 15 },
      description: `- **EN:** Fixed clockwise rotation angle.
- **CN:** 图标顺时针旋转的固定角度。`,
      table: { defaultValue: { summary: '0' } },
    },
    iconPrefix: {
      control: 'text',
      description: `- **EN:** Demo-only prefix. The factory prepends it to \`type\` unless the type already starts with it.
- **CN:** 示例专用前缀。工厂会将其拼接到 \`type\` 前，除非 \`type\` 已包含该前缀。`,
      table: { defaultValue: { summary: "''" } },
    },
  },
};

export default meta;
type Story = StoryObj<IconfontStoryArgs>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story: `- **EN:** Pick an icon and tune size, color, spin, rotation, or the demo prefix. The resolved \`type\` is shown below the icon.
- **CN:** 选择图标并调整尺寸、颜色、旋转、spin 或示例前缀。图标下方会展示最终解析出的 \`type\`。`,
      },
    },
  },
  render: function Render(args: IconfontStoryArgs) {
    const t = useStoryT();
    const IconFont = useMemo(
      () => createIconfont(args.scriptUrl, { iconPrefix: args.iconPrefix }),
      [args.scriptUrl, args.iconPrefix],
    );
    const renderedType = args.type?.startsWith(args?.iconPrefix ?? '') ? args.type : `${args.iconPrefix}-${args.type}`;

    return (
      <Space orientation="vertical" size={16}>
        {args.type && (
          <IconFont
            type={args.type}
            size={args.size}
            spin={args.spin}
            rotate={args.rotate}
            style={{ color: args.color }}
          />
        )}
        {args.type && (
          <Typography.Text type="secondary">
            {t('storybook.stories.Iconfont.renderedType')}: <Typography.Text code>{renderedType}</Typography.Text>
          </Typography.Text>
        )}
      </Space>
    );
  },
};

export const IconGallery: Story = {
  parameters: {
    docs: {
      description: {
        story: `- **EN:** All icons shipped by the official demo iconfont script.
- **CN:** 官方示例 iconfont 脚本内置的全部图标。`,
      },
    },
  },
  render: function Render() {
    const IconFont = useMemo(() => createIconfont(SCRIPT_URL), []);
    return (
      <Space size={24} wrap>
        {ICON_TYPES.map((type) => (
          <Space orientation="vertical" align="center" key={type} size={8}>
            <IconFont type={type} size={32} />
            <Typography.Text type="secondary">{type}</Typography.Text>
          </Space>
        ))}
      </Space>
    );
  },
};
