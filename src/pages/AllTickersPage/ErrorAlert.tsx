import { AlertCircle } from "lucide-react";

interface ErrorAlertProps {
  message: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => (
  <div
    className="bg-red-900 border border-red-800 text-white px-4 py-3 rounded relative mb-4"
    role="alert"
  >
    <div className="flex items-center">
      <AlertCircle className="h-5 w-5 mr-2" />
      <span className="block sm:inline">{message}</span>
    </div>
  </div>
);
