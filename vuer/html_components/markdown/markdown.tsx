import { CSSProperties, useMemo } from 'react';
import rehypeRaw from 'rehype-raw';
import { Remark } from 'react-remark';
import { VuerProps } from '../../vuer';

type MarkdownProps = VuerProps<{
  children: string | string[];
  style?: CSSProperties;
}>;

export function Markdown({
  _key: key,
  children,
  style,
  ...props
}: MarkdownProps) {
  const { markdown } = useMemo(
    () => ({
      markdown: typeof children === 'string' ? children : children.join(' '),
      // components: {
      //   p: ({ style: _style, ..._props }: PropsWithChildren<{ style: CSSProperties }>): ReactElement => <p style={{ ...style, ..._style } as CSSProperties} {..._props} />,
      // },
    }),
    [children, style],
  );
  return (
    <Remark
      // @ts-ignore: not sure why this errors
      rehypePlugins={[rehypeRaw]}
      // rehypeReactOptions={components as RemarkRehypeOptions}
      remarkToRehypeOptions={{ allowDangerousHtml: true }}
      {...props}
    >
      {markdown}
    </Remark>
  );
}
