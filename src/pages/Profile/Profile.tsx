import AvatarCard from "../../components/profile/AvatarCard";
import EditableFields from "../../components/profile/EditableFields";
import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileInfo from "../../components/profile/ProfileInfo";

const Profile = () => {
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <ProfileHeader />

        <div className="grid gap-6 lg:grid-cols-3">
          <AvatarCard />

          <div className="lg:col-span-2 space-y-6">
            <ProfileInfo />
            <EditableFields />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;