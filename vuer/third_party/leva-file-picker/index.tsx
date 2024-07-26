import * as levaPlugin from 'leva/plugin';
import { normalize } from './file-props';
import { FileComponent } from './File';

/** info: this is a esm module. */

export const pluginFile = levaPlugin.createPlugin({
  normalize,
  component: FileComponent,
});
