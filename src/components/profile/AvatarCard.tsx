import Card from "../ui/Card";

import type { AuthenticatedUser } from "../../types/auth.types";

interface Props {
  user: AuthenticatedUser;
}

const getInitials = (user: AuthenticatedUser) =>
  `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
    .trim()
    .toUpperCase() || "?";

const AvatarCard = ({ user }: Props) => (
  <Card padding="lg" className="h-fit text-center">
    <div className="flex flex-col items-center">
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={`Avatar de ${user.firstName} ${user.lastName}`}
          className="h-28 w-28 rounded-full border border-border object-cover"
        />
      ) : (
        <div
          aria-label={`Iniciales de ${user.firstName} ${user.lastName}`}
          className="flex h-28 w-28 items-center justify-center rounded-full border border-border bg-surface-muted text-3xl font-bold text-content"
        >
          {getInitials(user)}
        </div>
      )}

      <h2 className="mt-5 text-xl font-bold text-content">
        {user.firstName} {user.lastName}
      </h2>
      <p className="mt-1 text-sm text-muted">{user.email}</p>
      <span className="mt-4 rounded-full border border-primary px-3 py-1 text-sm font-semibold text-primary">
        {user.role.name}
      </span>
    </div>
  </Card>
);

export default AvatarCard;
