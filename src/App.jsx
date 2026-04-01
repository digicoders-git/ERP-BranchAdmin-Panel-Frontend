import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SchoolProvider } from "./context/SchoolContext";

import MainDashBord from "./Dashbord.jsx/MainDashBord";
import Home from "./Dashbord.jsx/Home";
import ManageStaff from "./Dashbord.jsx/ManageStaff";
import ManageTeacher from "./Dashbord.jsx/ManageTeacher";

import ManageFees from "./Dashbord.jsx/ManageFees";
import ManageClass from "./Dashbord.jsx/ManageClass";
import ManageSection from "./Dashbord.jsx/ManageSection";
import FeesManagement from "./Dashbord.jsx/FeesManagement";
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
import RouteMaster from "./Dashbord.jsx/RouteMaster";
import RouteStops from "./Dashbord.jsx/RouteStops";
import TransportAssignment from "./Dashbord.jsx/TransportAssignment";
import TransportAllocation from "./Dashbord.jsx/TransportAllocation";
import RouteCharges from "./Dashbord.jsx/RouteCharges";

export default function App() {
  return (
    <SchoolProvider>
      <BrowserRouter>
        <Routes>
          {/* Login Page */}
          <Route path="/" element={<Login />} />

          {/* Dashboard Layout */}
          <Route path="/dashbord" element={<MainDashBord />}>
            <Route index element={<Home />} />
            <Route path="manage-staff" element={<ManageStaff />} />
            <Route path="manage-teacher" element={<ManageTeacher />} />

            <Route path="manage-fees" element={<ManageFees />} />
            <Route path="manage-class" element={<ManageClass />} />
            <Route path="manage-section" element={<ManageSection />} />
            <Route path="fees-management" element={<ManageFees />} />
            <Route path="reports" element={<Reports />} />
            <Route path="approval" element={<Approval />} />
            <Route path="mapping-fees" element={<MappingFees />} />

            {/* Hostel Routes */}
            <Route path="hostel" element={<Hostel />}>
              <Route index element={<HostelDashboard />} />
              <Route path="create-hostel" element={<CreateHostel />} />
              <Route path="room-type-charges" element={<RoomTypeCharges />} />
              <Route path="room" element={<Room />} />
              <Route path="warden" element={<Warden />} />
              <Route path="allocation" element={<HostelAllocation />} />
              <Route path="reports" element={<HostelReports />} />
            </Route>

            {/* Transport Routes */}
            <Route path="transport" element={<TransportNew />}>
              <Route index element={<TransportNew />} />
              <Route path="vehicle" element={<VehicleMaster />} />
              <Route path="driver" element={<DriverMaster />} />
              <Route path="route" element={<RouteMaster />} />
              <Route path="route-stops" element={<RouteStops />} />
              <Route path="route-charges" element={<RouteCharges />} />
              <Route path="assignment" element={<TransportAssignment />} />
              <Route path="allocation" element={<TransportAllocation />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </SchoolProvider>
  );
}
