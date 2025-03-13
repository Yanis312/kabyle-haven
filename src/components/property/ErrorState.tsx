
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

const ErrorState = ({ error, onRetry }: ErrorStateProps) => {
  return (
    <div className="text-center py-12 bg-red-50 border border-red-100 rounded-lg">
      <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">Erreur de chargement</h3>
      <p className="text-red-600 mb-4">
        Une erreur est survenue lors du chargement: {error}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Réessayer
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
