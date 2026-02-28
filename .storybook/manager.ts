import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

// import './manager.css';

const isPreferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
addons.setConfig({
  theme: create({
    base: isPreferDark ? 'dark' : 'light',
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
