
interface ITextEditorProps {
  htmlContent: string;
}
export function TextEditor(props: Readonly<ITextEditorProps>) {
  const { htmlContent  = ""} = props || {};
  return (
    <div className="mt-2">
      <div dangerouslySetInnerHTML={{ __html: htmlContent }}></div>
    </div>
  );
}
