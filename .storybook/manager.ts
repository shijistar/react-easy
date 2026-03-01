import { addons } from 'storybook/manager-api';
import { create, type ThemeVars } from 'storybook/theming';
import { getGlobalValueFromUrl } from './utils/global';

// import './manager.css';

const globalValue = getGlobalValueFromUrl('backgrounds.value');
const isPreferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
addons.setConfig({
  theme: create({
    base: (globalValue as ThemeVars['base']) ?? (isPreferDark ? 'dark' : 'light'),
    brandTitle: '@tiny-codes/react-easy',
  }),
  // navSize: 300,
  // bottomPanelHeight: 300,
  // rightPanelWidth: 300,
  // panelPosition: 'bottom',
  // enableShortcuts: true,
  // showToolbar: true,
  // selectedPanel: undefined,
  // initialActive: 'sidebar',
  // layoutCustomisations: {
  //   showSidebar(state: State, defaultValue: boolean) {
  //     return state.storyId === 'landing' ? false : defaultValue;
  //   },
  //   showToolbar(state: State, defaultValue: boolean) {
  //     return state.viewMode === 'docs' ? false : defaultValue;
  //   },
  // },
  // sidebar: {
  //   showRoots: false,
  //   collapsedRoots: ['other'],
  // },
  // toolbar: {
  //   title: { hidden: false },
  //   zoom: { hidden: false },
  //   eject: { hidden: false },
  //   copy: { hidden: false },
  //   fullscreen: { hidden: false },
  // },
});
