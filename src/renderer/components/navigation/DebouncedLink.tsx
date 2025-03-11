import { appLogger } from "@renderer/utils/loggers";
import { MouseEventHandler, useCallback, MouseEvent, forwardRef, ForwardedRef } from "react";
import { Link, LinkProps, useLocation, Location } from "react-router-dom";

const DebouncedLink = forwardRef<HTMLAnchorElement, LinkProps>(function DebouncedLink(props: LinkProps, ref: ForwardedRef<HTMLAnchorElement>) {
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
    <Link ref={ref} {...props} onClick={debounceNavigationToSameLocation}>
      {props.children}
    </Link>
  );
});

export default DebouncedLink;
