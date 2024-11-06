import { ErrorTransformer, RJSFValidationError } from "@rjsf/utils";

export const errorCapitalizerTransformer: ErrorTransformer = (errors: RJSFValidationError[]): RJSFValidationError[] => {
  return errors.map((error: RJSFValidationError) => {
    // Capitalize first letter
    if (error.message !== undefined) {
      error.message = error.message.charAt(0).toUpperCase() + error.message.slice(1) + ".";
    }
    error.stack = error.stack.charAt(0).toUpperCase() + error.stack.slice(1) + ".";
    return error;
  });
};
