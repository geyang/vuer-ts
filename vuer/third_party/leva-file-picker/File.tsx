import { useCallback } from 'react';
import * as levaPlugin from 'leva/plugin';
import * as dropzone from 'react-dropzone';
import { DropZone, FileContainer, Instructions, Remove } from './StyledFile';
import { Row } from "leva/dist/declarations/src/components/UI";

const { useDropzone } = dropzone;

/** note:
 import { styled, useInputContext, Components, createPlugin }
 from "leva/plugin/dist/leva-plugin.esm.js";
 ^^^^^^^^^^
 SyntaxError: Named export 'Components' not found. The requested module
 'leva/plugin/dist/leva-plugin.esm.js' is a CommonJS module, which may not
 support all module.exports as named exports.

 CommonJS modules can always be imported via the default export, for example using:

 import pkg from 'leva/plugin/dist/leva-plugin.esm.js';
 const { styled, useInputContext, Components, createPlugin } = pkg;
 */
const { Components, useInputContext } = levaPlugin;

export function FileComponent() {
  const { label, value, onUpdate, disabled } = useInputContext<{
    value: { name: string };
  }>();

  const onDrop = useCallback(
    (acceptedFiles: string | unknown[]) => {
      if (acceptedFiles.length) onUpdate(acceptedFiles[0]);
    },
    [onUpdate],
  );

  const clear = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onUpdate(undefined);
    },
    [onUpdate],
  );

  const { getRootProps, getInputProps, isDragAccept } = useDropzone({
    maxFiles: 1,
    onDrop,
    disabled,
  });

  const { Label, Row } = Components;
  return (
    <Row input>
      <Label>{label}</Label>
      <FileContainer fullwidth={!!value}>
        {value && <div>{value?.name}</div>}
        {value && <Remove onClick={clear} disabled={!value} />}
        {!value && (
          <DropZone {...getRootProps({ isDragAccept })}>
            <input {...getInputProps()} />
            <Instructions>
              {isDragAccept ? 'drop file' : 'click or drop'}
            </Instructions>
          </DropZone>
        )}
      </FileContainer>
    </Row>
  );
}
