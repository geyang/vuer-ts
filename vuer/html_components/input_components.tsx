import React, {
  ChangeEvent,
  ChangeEventHandler,
  KeyboardEvent,
  KeyboardEventHandler,
  MouseEvent,
  useCallback,
  useContext,
  useMemo,
  useState
} from "react";
import { SocketContext } from "../vuer/websocket";
import { ClientEvent, VuerProps } from "../vuer/interfaces";
import { imageToBase64 } from "../vuer/util";

type VuerControlProps<T = unknown> = VuerProps<{ value: never } & T>;

export function Button({ _key: key, value, ...props }: VuerControlProps) {
  const { sendMsg } = useContext(SocketContext);
  return (
    <button onClick={() => sendMsg({ etype: 'CLICK', key } as ClientEvent)} {...props}>
      {value}
    </button>
  );
}

/** Slider Input Component
 *
 * @param _key - the key of this input component
 * @param defaultValue - the default value of this slide
 * @param children - the children of this input component
 * @param props - the rest of the props of this input component
 * @constructor
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Slider({
  _key: key, value: defaultValue, children, ...props
}: VuerControlProps) {
  const { sendMsg } = useContext(SocketContext);
  const [ value, setValue ] = useState<number>(defaultValue || 0);
  return (
    <>
      <input
        type="range"
        value={value}
        onMouseUp={({ target }: MouseEvent<HTMLInputElement>) => {
          const { value } = target as HTMLInputElement;
          sendMsg({ etype: 'SET', key, value } as ClientEvent);
        }}
        onChange={({ target }: ChangeEvent<HTMLInputElement>) => {
          setValue(Number(target.value) as number);
        }}
        {...props}
      />
      <span>{value}</span>
    </>
  );
}

export type ImgProps = VuerProps<{ alt: string }>;

export function Img({ _key: key, children, alt, ...props }: ImgProps) {
  const { sendMsg } = useContext(SocketContext);
  return (
    <img
      alt={alt || key}
      className="input-image"
      onClick={(e: MouseEvent<HTMLImageElement>) => {
        console.log('click on image');
        e.preventDefault();
        e.stopPropagation();
        const target = e.target as HTMLImageElement;
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        sendMsg({
          etype: 'CLICK',
          key,
          value: {
            x, y, w: rect.width, h: rect.height,
          },
        } as ClientEvent);
      }}
      {...props}
    />
  );
}

type InputProps = VuerProps<{
  buttonStyle;
  clearOnSubmit: boolean;
  defaultValue: string;
  defaultValues: string[];
  placeholder: string;
  style;
  textareaStyle;
  value: string;
}>;

export function Input(
  {
    _key: key,
    value: _value,
    style,
    textareaStyle = {},
    placeholder,
    defaultValue,
    // todo: allow multiple to choose from.
    // defaultValues,
    clearOnSubmit,
    children,
    // todo: allow line break with enter.
    ...props
  }: InputProps,
) {
  const [ value, setValue ] = useState(_value);
  const { sendMsg } = useContext(SocketContext);
  const onChange = useMemo<ChangeEventHandler<HTMLTextAreaElement>>(() => ({ target }) => {
    setValue(target.value);
  }, []);

  const onKeyUp = useMemo<KeyboardEventHandler<HTMLTextAreaElement>>(() => (e: KeyboardEvent) => {
    // info: choose default
    if (e.keyCode == 39 && !value) {
      // on right arrow key:
      if (!defaultValue) return;
      e.preventDefault();
      setValue(defaultValue);
    }
    // info: submit
    if (e.keyCode == 13 && !e.shiftKey) {
      // on enter:
      e.preventDefault();
      sendMsg({ etype: 'INPUT', key, value } as ClientEvent);
      if (clearOnSubmit) setValue('');
    }
  }, [ value ]);

  return (
    <form
      style={{
        flex: '0 0 auto',
        height: '200px',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
      {...props}
    >
      <textarea
        placeholder={
          placeholder
          || `"${defaultValue}" [ press ➡ for default, ⏎ to submit ]`
        }
        value={value}
        onChange={onChange}
        onKeyUp={onKeyUp}
        style={{
          flex: '1 1 auto',
          height: '100%',
          width: '100%',
          padding: '10px',
          // margin: "5px 0",
          marginTop: '5px',
          border: '1.5px solid #eee',
          borderRadius: '5px',
          ...textareaStyle,
        }}
      />
    </form>
  );
}

type ImageUploadProps = VuerProps<{ label: string }>;

export function ImageUpload({ _key: key, label }: ImageUploadProps) {
  const { sendMsg } = useContext(SocketContext);
  const [ file, setFile ] = useState<Blob | null>(null);
  const onChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e: ChangeEvent<HTMLInputElement>) => {
      setFile(e.target.files[0]);
    }, []);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (file) {
          imageToBase64(file).then((base64) => {
            // chop off the data:image/png;base64, part
            const value = base64.slice(22);
            sendMsg({ etype: 'UPLOAD', key, value } as ClientEvent);
          });
        }
      }}
    >
      <label htmlFor="file">
        {label}
        {' '}
      </label>
      <input type="file" onChange={onChange}/>
      <input type="submit" value="Submit"/>
    </form>
  );
}

export function Div({ _key: key, ...props }: VuerProps) {
  return <div key={key} {...props} />;
}

type TextProps = VuerProps<{ text: string }>;

export function Text({ _key: key, text, ...props }: TextProps) {
  return <span {...props}>{text}</span>;
}