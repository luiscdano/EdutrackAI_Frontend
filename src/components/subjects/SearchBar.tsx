const SearchBar = () => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <input
        type="text"
        placeholder="Buscar materia..."
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
      />
    </div>
  );
};

export default SearchBar;