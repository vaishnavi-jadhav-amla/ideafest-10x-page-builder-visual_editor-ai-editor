"use client";
interface ITickerProps {
  tickerText: string;
}

function decodeHTML(textContent: string) {
  const text = document.createElement("textarea");
  text.innerHTML = textContent;
  return text.value;
}

export function Ticker(props: Readonly<ITickerProps>) {
  const { tickerText = "" } = props || {};

  if (!tickerText) {
    return null;
  }

  const decodedTickerText = decodeHTML(tickerText);

  return (
    <div className="text-center bg-tickerBgColor mb-2 text-white text-sm py-1.5 no-print" data-test-selector="divTickerText">
      {decodedTickerText}
    </div>
  );
}
