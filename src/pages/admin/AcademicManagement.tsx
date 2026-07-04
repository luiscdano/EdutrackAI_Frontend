import AdminAcademicManagement from "../../components/admin-academic/AdminAcademicManagement";
import {
  adminAcademicAssignmentsMock,
  adminAcademicHistoryMock,
  adminAcademicResultsMock,
  adminAcademicSubjectsMock,
} from "../../data/adminAcademic.mock";

const AcademicManagement = () => {
  return (
    <AdminAcademicManagement
      subjects={adminAcademicSubjectsMock}
      assignments={adminAcademicAssignmentsMock}
      results={adminAcademicResultsMock}
      history={adminAcademicHistoryMock}
    />
  );
};

export default AcademicManagement;
