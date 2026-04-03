import React, { useState } from "react";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (_color: string) => void;
}

export function ColorPicker({ label, value, onChange }: Readonly<ColorPickerProps>) {
  const [color, setColor] = useState(value);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.currentTarget.value;
    setColor(newColor);
    onChange(newColor);
  };

  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-2">{label}</label>

      <div className="relative w-full">
        <input
          type="text"
          name="color"
          value={color}
          onChange={handleColorChange}
          className="w-full h-10 border border-gray-300 rounded-md pl-3 pr-12"
          placeholder="Enter color code"
        />

        <div className="absolute top-1/2 right-2 transform -translate-y-1/2 w-8 h-8 p-0 rounded-full border border-gray-300 overflow-hidden">
          <input
            type="color"
            name="color"
            value={color}
            onChange={handleColorChange}
            className="w-20 h-20 -ml-2 -mt-2 appearance-none"
           
          />
        </div>
      </div>
    </div>
  );
}
