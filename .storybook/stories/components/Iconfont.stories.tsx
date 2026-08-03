import { useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Space, Typography } from 'antd';
import { createIconfont } from '../../../src/components/Iconfont';
import { useStoryT } from '../../locales';

// Ant Design official iconfont demo URL, also used by the repo tests.
const SCRIPT_URL = '//at.alicdn.com/t/font_8d5l8fzk5b87iudi.js';

const ICON_TYPES = ['icon-tuichu', 'icon-facebook', 'icon-twitter'] as const;

interface IconfontStoryArgs {
  /** Icon name from the iconfont project | iconfont 项目中的图标名称 */
  type: string;
  /** Icon size in px | 图标尺寸（像素） */
  size: number;
  /** Icon color | 图标颜色 */
  color: string;
  /** Whether the icon spins continuously | 图标是否持续旋转 */
  spin: boolean;
  /** Fixed clockwise rotation angle | 顺时针固定旋转角度 */
  rotate: number;
  /** Demo-only: prefix auto-prepended to `type` | 示例专用：自动拼接到 `type` 的前缀 */
  iconPrefix: string;
}

const meta: Meta<IconfontStoryArgs> = {
  title: 'Components/Iconfont',
  parameters: {
    docs: {
      description: {
        component: `- **EN:** \`createIconfont\` is a factory that turns an iconfont script URL into a ready-to-use icon component. It wraps Ant Design's \`createFromIconfontCN\` and adds an \`iconPrefix\` option plus a \`size\` alias for \`style.fontSize\`.

**Factory API**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| \`scriptUrl\` | \`string\` | - | iconfont script URL generated from iconfont.cn |
| \`options.iconPrefix\` | \`string\` | \`''\` | Prefix automatically prepended to \`type\` unless it already starts with the prefix |

**Component props**

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| \`type\` | \`T\` | - | Icon name. Find it in iconfont and click \`Copy Code\` |
| \`size\` | \`CSSProperties['fontSize']\` | - | Alias of \`style.fontSize\` |
| \`spin\` | \`boolean\` | \`false\` | Whether the icon spins continuously |
| \`rotate\` | \`number\` | \`0\` | Fixed clockwise rotation angle |

- **CN:** \`createIconfont\` 是一个工厂函数：传入 iconfont 脚本地址，返回一个可直接使用的图标组件。它封装了 Ant Design 的 \`createFromIconfontCN\`，额外提供 \`iconPrefix\` 选项与 \`size\`（\`style.fontSize\` 的别名）属性。

**工厂 API**

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| \`scriptUrl\` | \`string\` | - | 在 iconfont.cn 上生成的脚本地址 |
| \`options.iconPrefix\` | \`string\` | \`''\` | 自动拼接到 \`type\` 的前缀，若 \`type\` 已包含该前缀则不再拼接 |

**组件 props**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| \`type\` | \`T\` | - | 图标名称。在 iconfont 中找到某个图标，点击\`复制代码\` |
| \`size\` | \`CSSProperties['fontSize']\` | - | \`style.fontSize\` 的别名 |
| \`spin\` | \`boolean\` | \`false\` | 图标是否持续旋转 |
| \`rotate\` | \`number\` | \`0\` | 图标顺时针旋转一个固定角度 |`,
      },
    },
  },
  args: {
    type: 'icon-tuichu',
    size: 32,
    color: '#1677ff',
    spin: false,
    rotate: 0,
    iconPrefix: '',
  },
  argTypes: {
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
    const IconFont = useMemo(() => createIconfont(SCRIPT_URL, { iconPrefix: args.iconPrefix }), [args.iconPrefix]);
    const renderedType = args.type.startsWith(args.iconPrefix) ? args.type : `${args.iconPrefix}-${args.type}`;

    return (
      <Space direction="vertical" size={16}>
        <IconFont
          type={args.type}
          size={args.size}
          spin={args.spin}
          rotate={args.rotate}
          style={{ color: args.color }}
        />
        <Typography.Text type="secondary">
          {t('storybook.stories.Iconfont.renderedType')}: <Typography.Text code>{renderedType}</Typography.Text>
        </Typography.Text>
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
          <Space direction="vertical" align="center" key={type} size={8}>
            <IconFont type={type} size={32} />
            <Typography.Text type="secondary">{type}</Typography.Text>
          </Space>
        ))}
      </Space>
    );
  },
};
