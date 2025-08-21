import clsx from "clsx";
import { Loader2 } from "lucide-react";
const Loading = ({ className }: { className?: string }) => {
  return <Loader2 className={clsx("icon mr-0 animate-spin", className)} />;
};

export default Loading;
