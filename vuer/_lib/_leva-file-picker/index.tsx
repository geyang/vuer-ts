import {normalize} from "./file-props";
import {FileComponent} from "./File";
/** info: this is a esm module. */
import * as levaPlugin from "leva/plugin";

export const pluginFile = levaPlugin.createPlugin({
    normalize,
    component: FileComponent,
});
