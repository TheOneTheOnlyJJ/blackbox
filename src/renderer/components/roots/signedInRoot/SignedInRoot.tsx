import { FC, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AppRootContext, useAppRootContext } from "../appRoot/AppRootContext";
import { SignedInRootContext } from "./SignedInRootContext";
import { appLogger } from "../../../utils/loggers";

const SignedInRoot: FC = () => {
  const appRootContext: AppRootContext = useAppRootContext();
  const [forbiddenLocationName, setForbiddenLocationName] = useState<string>("this-page");

  useEffect(() => {
    try {
      setForbiddenLocationName(encodeURIComponent(forbiddenLocationName));
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      appLogger.error(`Could not set forbidden location name: ${ERROR_MESSAGE}!`);
      setForbiddenLocationName("this-page");
    }
  }, [forbiddenLocationName]);

  useEffect(() => {
    appLogger.debug("Rendering Signed In Root component.");
  }, []);

  return appRootContext.currentlySignedInUser !== null ? (
    <Outlet
      context={
        {
          ...appRootContext,
          currentlySignedInUser: appRootContext.currentlySignedInUser,
          setForbiddenLocationName: setForbiddenLocationName
        } satisfies SignedInRootContext
      }
    />
  ) : (
    <Navigate to={`/forbidden/must-be-signed-in-to-access-${forbiddenLocationName}`} />
  );
};

export default SignedInRoot;
