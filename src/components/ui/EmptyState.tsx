import type { ReactNode } from "react";

import StateMessage, {
  type StateMessageProps,
} from "./StateMessage";

type EmptyStateProps = Omit<
  StateMessageProps,
  "tone" | "icon"
> & {
  icon?: ReactNode;
};

const EmptyState = ({
  icon = "○",
  ...props
}: EmptyStateProps) => {
  return (
    <StateMessage
      {...props}
      tone="neutral"
      icon={icon}
    />
  );
};

export default EmptyState;