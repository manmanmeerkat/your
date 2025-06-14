// components/formGroup/FormGroup.tsx
import { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";

type FormGroupProps = {
  id: string;
  label: string;
  showAsterisk?: boolean;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  // 🚀 エラー表示機能を追加
  error?: string;
  required?: boolean;
};

export function FormGroup({
  id,
  label,
  showAsterisk = true,
  type = "text",
  value,
  onChange,
  placeholder,
  error, // 🚀 新機能
  required = false, // 🚀 新機能
}: FormGroupProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-md font-medium mb-2">
        {label}{" "}
        {(showAsterisk || required) && <span className="text-red-600">*</span>}
      </label>
      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        // 🚀 エラー時のスタイル適用
        className={
          error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
        }
        required={required}
        // 🎯 メールアドレス用の追加属性
        {...(type === "email" && {
          autoComplete: "email",
          inputMode: "email",
        })}
      />
      {/* 🚀 エラーメッセージ表示 */}
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
