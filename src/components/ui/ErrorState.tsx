import type { ReactNode } from "react";

import StateMessage, {
  type StateMessageProps,
} from "./StateMessage";

type ErrorStateProps = Omit<
  StateMessageProps,
  "tone" | "icon"
> & {
  icon?: ReactNode;
};

const ErrorState = ({
  icon = "!",
  ...props
}: ErrorStateProps) => {
  return (
    <StateMessage
      {...props}
      tone="danger"
      icon={icon}
      role="alert"
    />
  );
};

export default ErrorState;