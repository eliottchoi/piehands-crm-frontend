import { useRouteError, isRouteErrorResponse } from "react-router-dom";

export const ErrorPage = () => {
  const error = useRouteError();
  console.error(error);

  let errorMessage: string;
  let errorStatus: number | undefined;

  if (isRouteErrorResponse(error)) {
    // Note: error.statusText may be undefined even if error.status is defined.
    errorMessage = error.statusText || 'An unexpected route error occurred.';
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = 'An unknown error occurred.';
  }

  return (
    <div id="error-page" className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="text-center p-8 bg-card text-card-foreground shadow-lg rounded-lg border border-border">
        <h1 className="text-4xl font-bold text-destructive mb-2">Oops!</h1>
        {errorStatus && <p className="text-xl text-muted-foreground mb-4">Error {errorStatus}</p>}
        <p className="text-foreground">Sorry, an unexpected error has occurred.</p>
        <p className="mt-2">
          <i className="text-muted-foreground">{errorMessage}</i>
        </p>
        <a href="/" className="mt-6 inline-block px-6 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
          Go back home
        </a>
      </div>
    </div>
  );
}
