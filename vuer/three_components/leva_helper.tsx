/**
 write a function that takes a list of objects, and returns a list
 of objects with the following structure:

 input: [{color: "#23aaff", label: "desk", threashold: 0.5, ...rest}, ...]
 output: {
 "desk": folder({
 layer_1_visible: {label: "show", value: true},
 layer_1_color: {label: "color", value: "#23aaff"},
 layer_1_threshold: {label: "threshold", value: 0.5},
 }),
 ...
 } */
import { folder } from 'leva';

export function list2menu(nodes: Node[], expand: boolean) {
  const menu = {};
  nodes.forEach((node: Node) => {
    const {
      // @ts-ignore: not even used anymore, can just remove.
      label, color, threshold, hide,
      ...rest
    } = node;
    if (color) {
      menu[`${label}`] = folder(
        {
          [`${label}_color`]: { value: color, label: 'color' },
        },
        { collapsed: !expand, color },
      );
      menu[`${label}_show`] = { value: !hide, label: 'show' };
    } else {
      menu[`${label}_show`] = { value: !hide, label };
    }
  });
  return menu;
}

// export function value2obj(nodes, layerConfigs, kwargs) {
//   return nodes.map((node, ind) => {
//     const {label, color, threshold, ...rest} = node;
//     node.color = layerConfigs[`${node.label}_color`]
//     node.hide = (layerConfigs[`${node.label}_show`] === false)
//     return node;
//   })
// }
//
// export function CustomLeva({sendMsg, config}) {
//   // Use control objects in the form of [{key, value, label, ...rest}, ...]
//   const getCallback = useCallback((key) => (value) => sendMsg({
//     etype: "LEVA_UPDATE",
//     key,
//     value
//   }), [sendMsg, config]);
//   const localConfigs = {}
//   let notEmpty;
//   Object.entries(config).forEach(([k, v]) => {
//     localConfigs[k] = {onChange: getCallback(k), ...v}
//     notEmpty = true;
//   });
//   useControls(
//     "custom",
//     (notEmpty)
//       ? localConfigs
//       : {
//         // "README": {value: "No controls available", label: "README", editable: false}
//       },
//     [sendMsg, config]);
//   return <></>;
// }
