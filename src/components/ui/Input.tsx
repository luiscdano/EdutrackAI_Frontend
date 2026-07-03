interface InputProps {
  label: string;
  type?: string;
  placeholder: string;
}

const Input = ({
  label,
  type = "text",
  placeholder,
}: InputProps) => {
  return (
    <div className="mb-5">
      <label className="mb-2 block text-sm text-slate-300">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-blue-500"
      />
    </div>
  );
};

export default Input;