import React, { useRef } from "react";

interface OtpInputProps {
  length: number;
  onChange: (otp: string) => void;
  value: string;
}

const OtpInput: React.FC<OtpInputProps> = ({ length, onChange, value }) => {
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value: inputValue } = e.target;
    if (isNaN(Number(inputValue)) || inputValue.length > 1) {
      return;
    }

    const newOtpArray = value.split('');
    newOtpArray[index] = inputValue;
    const newOtp = newOtpArray.join('');

    onChange(newOtp);

    if (inputValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text/plain").slice(0, length);
    if (!/^\d+$/.test(pasteData)) {
      return;
    }
    onChange(pasteData);
    inputRefs.current[length - 1]?.focus();
  };

  return (
    <div className="flex justify-between gap-2">
      {Array.from({ length }, (_, index) => (
        <input
          aria-label={`OTP input ${index + 1}`}
          key={index}
          type="text"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          ref={(el) => {
            if (el) {
              inputRefs.current[index] = el;
            }
          }}
          className="w-12 h-12 text-center text-xl font-bold border border-gray-700 rounded-md focus:outline-none focus:border-blue-500 bg-transparent text-white"
        />
      ))}
    </div>
  );
};

export default OtpInput;