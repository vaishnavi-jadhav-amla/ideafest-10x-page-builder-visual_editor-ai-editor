import { IAddressFieldProps } from "@znode/types/address";
import { formatTestSelector } from "@znode/utils/common";

export const RadioField: React.FC<IAddressFieldProps> = ({ label, name, value, register, defaultValue = false, disabled = false, onChange }) => (
  <label className="flex items-center pb-2 font-semibold cursor-pointer" htmlFor={`${name}-${value}`} data-test-selector={formatTestSelector("lbl", `${name}-${value}`)}>
    <div className="flex items-center">
      <input
        type="radio"
        id={`${name}-${value}`}
        value={value}
        disabled={disabled}
        defaultChecked={defaultValue}
        className="h-4 xs:w-4 rounded-custom accent-accentColor"
        {...register(name, { required: true })}
        data-test-selector={formatTestSelector("chk", `${name}-${value}`)}
        onChange={onChange}
      />
      <span className="pl-2">{label}</span>
    </div>
  </label>
);