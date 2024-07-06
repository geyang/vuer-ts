import styles from './Controls.module.scss';
import { NumberInput } from './NumberInput';
import { Select, SelectProps } from './Select';

export type NumberInputSelectProps = SelectProps<number> & {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
};

export function NumberInputSelect({
  options,
  value,
  onChange,
  ...props
}: NumberInputSelectProps) {
  return (
    <div className={styles.inputSelect}>
      <NumberInput value={value} onChange={onChange} {...props} />
      <Select value={value} options={options} onChange={onChange}/>
    </div>
  );
}
