import { appLogger } from "@renderer/utils/loggers";
import { FC, MouseEventHandler, useCallback, MouseEvent } from "react";
import { Link, LinkProps, useLocation, Location } from "react-router-dom";

const DebouncedLink: FC<LinkProps> = (props: LinkProps) => {
  const location: Location = useLocation();
  const debounceNavigationToSameLocation = useCallback<MouseEventHandler<HTMLAnchorElement>>(
    (event: MouseEvent<HTMLAnchorElement>): void => {
      if (location.pathname === props.to) {
        event.preventDefault();
        appLogger.debug(`Prevented redundant navigation to identical location as current: "${props.to}".`);
      }
    },
    [location.pathname, props.to]
  );

  return (
    <Link {...props} onClick={debounceNavigationToSameLocation}>
      {props.children}
    </Link>
  );
};

export default DebouncedLink;
