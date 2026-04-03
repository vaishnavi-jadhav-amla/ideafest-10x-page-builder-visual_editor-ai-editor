import React from "react";

type Props = {
  url: string;
  target: string;
  onUrlChange: (val: string) => void;
  onTargetChange: (val: string) => void;
  onApply: () => void;
  onRemove: () => void;
};

const LinkTooltip = ({ url, target, onUrlChange, onTargetChange, onApply, onRemove }: Props) => {
  return (
    <div className="absolute top-10 left-1 bg-white border border-gray-300 p-4 z-50 w-64 shadow-lg rounded-lg text-sm" role="dialog" aria-label="Link settings">
      <div>
        <div className="mb-4">
          <label htmlFor="link-url-input" className="block mb-1 font-medium text-gray-700">
            Enter Link:
          </label>
          <input
            id="link-url-input"
            type="text"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1"
          />
        </div>
        <fieldset className="mb-4">
          <legend className="font-medium text-gray-700 mb-1">Open in:</legend>
          <div className="flex gap-4">
            <label htmlFor="target-self" className="flex items-center gap-1">
              <input id="target-self" type="radio" value="_self" checked={target === "_self"} onChange={(e) => onTargetChange(e.target.value)} className="accent-black" />
              Same Tab
            </label>

            <label htmlFor="target-blank" className="flex items-center gap-1">
              <input id="target-blank" type="radio" value="_blank" checked={target === "_blank"} onChange={(e) => onTargetChange(e.target.value)} className="accent-black" />
              New Tab
            </label>
          </div>
        </fieldset>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onApply} className="bg-greenBtnBg uppercase text-white rounded-sm px-3 py-1 hover:bg-greenBtnHoverBg font-medium text-base">
          Apply
        </button>
        <button onClick={onRemove} className="bg-greenBtnBg uppercase text-white rounded-sm px-3 py-1 hover:bg-greenBtnHoverBg text-base font-medium">
          Remove
        </button>
      </div>
    </div>
  );
};

export default LinkTooltip;
