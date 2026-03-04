interface ErrorMessageProps {
  error: string;
  class?: string;
}

export default ({ error, class: className = "" }: ErrorMessageProps) => (
  <div className={`-mt-4 text-xs text-red-600 ${className}`}>{error}</div>
);
