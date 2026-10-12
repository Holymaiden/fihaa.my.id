import clsx from 'clsx';
import { HashLoader } from 'react-spinners';

type LoadingProps = {
  isFullScreen?: boolean;
  text?: string;
};

const Loading = ({ isFullScreen = false, text }: LoadingProps) => {
  return (
    <div
      className={clsx(
        'flex flex-col space-y-5 items-center justify-center p-40',
        isFullScreen && 'h-screen',
      )}
    >
      {/* react-spinners parses this as hex, so it can't take var(). Same as --color-loader. */}
      <HashLoader color="#36d7b7" />
      {text && <p className="text-loader pt-5">{text}</p>}
    </div>
  );
};

export default Loading;
