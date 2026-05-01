import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SchoolProvider } from "./context/SchoolContext";

import MainDashBord from "./Dashbord.jsx/MainDashBord";
import Home from "./Dashbord.jsx/Home";
import ManageStaff from "./Dashbord.jsx/ManageStaff";
import ManageTeacher from "./Dashbord.jsx/ManageTeacher";
import TeacherProfile from "./Dashbord.jsx/TeacherProfile";
import ManageFees from "./Dashbord.jsx/ManageFees";
import ManageClass from "./Dashbord.jsx/ManageClass";
import ClassView from "./Dashbord.jsx/ClassView";
import ManageSection from "./Dashbord.jsx/ManageSection";
import AttendanceDashboard from "./Dashbord.jsx/AttendanceDashboard";
import TimetableBuilder from "./Dashbord.jsx/TimetableBuilder";
import Approval from "./Dashbord.jsx/Approval";
import Login from "./Login";
import Reports from "./Dashbord.jsx/Reports";
import MappingFees from "./Dashbord.jsx/MappingFees";
import Hostel from "./Dashbord.jsx/Hostel";
import HostelDashboard from "./Dashbord.jsx/HostelDashboard";
import CreateHostel from "./Dashbord.jsx/CreateHostel";
import RoomTypeCharges from "./Dashbord.jsx/RoomTypeCharges";
import Room from "./Dashbord.jsx/Room";
import Warden from "./Dashbord.jsx/Warden";
import HostelAllocation from "./Dashbord.jsx/HostelAllocation";
import HostelReports from "./Dashbord.jsx/HostelReports";
import TransportNew from "./Dashbord.jsx/TransportNew";
import VehicleMaster from "./Dashbord.jsx/VehicleMaster";
import DriverMaster from "./Dashbord.jsx/DriverMaster";
import DriverSalaryManagement from "./Dashbord.jsx/DriverSalaryManagement";
import RouteMaster from "./Dashbord.jsx/RouteMaster";
import RouteStops from "./Dashbord.jsx/RouteStops";
import TransportAssignment from "./Dashbord.jsx/TransportAssignment";
import TransportAllocation from "./Dashbord.jsx/TransportAllocation";
import RouteCharges from "./Dashbord.jsx/RouteCharges";
import SubstituteAssignment from "./Dashbord.jsx/SubstituteAssignment";

import StaffProfile from "./Dashbord.jsx/StaffProfile";
import BranchAdminProfile from "./Dashbord.jsx/BranchAdminProfile";
import SchoolSettings from "./Dashbord.jsx/SchoolSettings";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("branchToken");
  const user = JSON.parse(localStorage.getItem("branchUser") || "{}");
  if (!token || user.role !== "branchAdmin") return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <SchoolProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashbord" element={<ProtectedRoute><MainDashBord /></ProtectedRoute>}>
          <Route index element={<Home />} />
          <Route path="manage-staff" element={<ManageStaff />} />
          <Route path="staff-profile/:id" element={<StaffProfile />} />
          <Route path="manage-teacher" element={<ManageTeacher />} />
          <Route path="teacher-profile/:id" element={<TeacherProfile />} />
          <Route path="manage-fees" element={<ManageFees />} />
          <Route path="manage-class" element={<ManageClass />} />
          <Route path="class-view/:id" element={<ClassView />} />
          <Route path="manage-section" element={<ManageSection />} />
          <Route path="attendance" element={<AttendanceDashboard />} />
          <Route path="timetable" element={<TimetableBuilder />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<BranchAdminProfile />} />
          <Route path="approval" element={<Approval />} />
          <Route path="mapping-fees" element={<MappingFees />} />
          <Route path="school-settings/:section" element={<SchoolSettings />} />
          <Route path="school-settings" element={<Navigate to="branding" replace />} />
          <Route path="substitute-assignment" element={<SubstituteAssignment />} />

          <Route path="hostel" element={<Hostel />}>
            <Route index element={<HostelDashboard />} />
            <Route path="create-hostel" element={<CreateHostel />} />
            <Route path="room-type-charges" element={<RoomTypeCharges />} />
            <Route path="room" element={<Room />} />
            <Route path="warden" element={<Warden />} />
            <Route path="allocation" element={<HostelAllocation />} />
            <Route path="reports" element={<HostelReports />} />
          </Route>

          <Route path="transport" element={<TransportNew />}>
            <Route index element={<TransportNew />} />
            <Route path="vehicle" element={<VehicleMaster />} />
            <Route path="driver" element={<DriverMaster />} />
            <Route path="driver-salary" element={<DriverSalaryManagement />} />
            <Route path="route" element={<RouteMaster />} />
            <Route path="route-stops" element={<RouteStops />} />
            <Route path="route-charges" element={<RouteCharges />} />
            <Route path="assignment" element={<TransportAssignment />} />
            <Route path="allocation" element={<TransportAllocation />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </SchoolProvider>
  );
}
