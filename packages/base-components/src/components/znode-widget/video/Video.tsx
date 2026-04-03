interface IVideoProps {
  videoUrl: string;
  autoPlay: boolean;
  controlEnable: boolean;
  muted: boolean;
}

export function Video(props: Readonly<IVideoProps>) {
  const { videoUrl = "", controlEnable, autoPlay, muted } = props || {};
  return (
    <div className="mt-2">
      <video src={videoUrl} width="600" className="w-full" controls={controlEnable} autoPlay={autoPlay} muted={muted}>
        <source src={videoUrl} type="video/mp4" />
        <track kind="captions" srcLang="en" label="English" />
      </video>
    </div>
  );
}
