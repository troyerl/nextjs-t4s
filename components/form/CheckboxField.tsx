interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  id: string;
}

export const CheckboxField = ({
  label: labelValue,
  checked,
  onChange,
  id,
}: CheckboxFieldProps) => {
  return (
    <button
      className="flex items-center gap-2"
      onClick={() => onChange?.(!checked)}
      id={id}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onChange?.(!checked)}
        className="accent-primary h-6 w-6"
        id={`${id}-checkbox`}
      />
      <label className="m text-lg font-semibold" htmlFor={`${id}-checkbox`}>
        {labelValue}
      </label>
    </button>
  );
};

export const FormCheckboxField = () => {
  return <div>FormCheckboxField</div>;
};
