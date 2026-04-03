import { IAddressFieldProps } from "@znode/types/address";
import { formatTestSelector } from "@znode/utils/common";

export const CheckboxField: React.FC<IAddressFieldProps> = ({ label, name, register, checked = false, disabled = false, onChange }) => (
  <div className="flex items-center pb-2">
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      className="h-4 xs:w-4 rounded-custom accent-accentColor"
      id={name}
      {...register(name)}
      data-test-selector={formatTestSelector("chk", `${name}`)}
      onChange={onChange}
    />
    <label className="pl-5 font-semibold cursor-pointer" htmlFor={name} data-test-selector={formatTestSelector("lbl", `${name}`)}>
      {label}
    </label>
  </div>
);
