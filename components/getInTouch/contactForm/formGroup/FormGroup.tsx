import { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";

type FormGroupProps = {
  id: string;
  label: string;
  showAsterisk?: boolean; // ← new!
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
};

export function FormGroup({
  id, label, showAsterisk = true, type = "text", value, onChange, placeholder,
}: FormGroupProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-md font-medium mb-2">
        {label} {showAsterisk && <span className="text-red-600">*</span>}
      </label>
      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}