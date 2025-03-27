import React from "react";

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (
  props
) => {
  return <input {...props} className="border rounded p-2" />;
};

export default Input;
