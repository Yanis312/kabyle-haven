
import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  error: string;
}

const ErrorState = ({ error }: ErrorStateProps) => {
  return (
    <div className="text-center py-12 bg-red-50 border border-red-100 rounded-lg">
      <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">Erreur de chargement</h3>
      <p className="text-red-600">
        Une erreur est survenue lors du chargement de vos logements: {error}
      </p>
    </div>
  );
};

export default ErrorState;
