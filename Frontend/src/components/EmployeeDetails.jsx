import { getImageUrl } from "../utils/excel";

const DetailRow = ({ label, value }) => (
  <div className="flex items-center gap-3 text-sm">
    <span className="font-semibold text-slate-400">{label}:</span>
    <span className="bg-indigo-100 text-slate-900 px-2 py-1 rounded">{value || "-"}</span>
  </div>
);

const EmployeeDetails = ({ employee, onBack }) => {
  if (!employee) {
    return (
      <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6">
        <p className="text-slate-400 text-center">No employee data available</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Employee Details</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 items-start">
        <div className="flex flex-col items-center gap-4">
          <div className="h-48 w-48 rounded-full overflow-hidden bg-slate-800 border-2 border-slate-700">
            {employee.profileImage ? (
              <img
                src={getImageUrl(employee.profileImage)}
                alt={employee.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-4xl text-slate-300">
                {(employee.name || "NA").slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white">{employee.name}</h3>
            <p className="text-slate-400 capitalize">{employee.role}</p>
          </div>
        </div>

        <div className="space-y-3">
          <DetailRow label="Employee ID" value={employee.employeeId} />
          <DetailRow label="Email" value={employee.email} />
          <DetailRow
            label="Date of Birth"
            value={employee.dob ? new Date(employee.dob).toLocaleDateString() : "-"}
          />
          <DetailRow label="Gender" value={employee.gender} />
          <DetailRow label="Department" value={employee.department} />
          <DetailRow label="Designation" value={employee.designation} />
          <DetailRow label="Marital Status" value={employee.maritalStatus} />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onBack}
          className="rounded-lg px-6 py-2 text-sm font-semibold bg-slate-200 text-slate-800 hover:bg-slate-300"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default EmployeeDetails;
