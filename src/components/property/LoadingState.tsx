
import { Loader2 } from "lucide-react";

const LoadingState = () => {
  return (
    <div className="flex justify-center items-center py-12">
      <Loader2 className="h-12 w-12 animate-spin text-kabyle-blue" />
    </div>
  );
};

export default LoadingState;
