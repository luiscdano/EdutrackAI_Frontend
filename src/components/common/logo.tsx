interface LogoProps {
  className?: string;
}

const Logo = ({ className = "" }: LogoProps) => {
  return (
    <h1
      className={`m-0 text-5xl font-bold tracking-tight text-white ${className}`}
    >
      EduTrack <span className="text-blue-500">AI</span>
    </h1>
  );
};

export default Logo;