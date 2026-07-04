const ActivityTable = () => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="border-b border-border text-slate-400">
          <tr>
            <th className="py-3">Materia</th>
            <th className="py-3">Fecha</th>
            <th className="py-3">Duración</th>
            <th className="py-3">Método</th>
          </tr>
        </thead>

        <tbody>
          <tr className="border-b border-border">
            <td className="py-3">--</td>
            <td className="py-3">--</td>
            <td className="py-3">--</td>
            <td className="py-3">--</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ActivityTable;