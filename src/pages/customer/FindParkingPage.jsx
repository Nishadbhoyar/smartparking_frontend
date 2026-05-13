import NearbyLotsMap from "../../components/shared/NearbyLotsMap";

const FindParkingPage = () => (
  <div className="flex flex-col h-[calc(100vh-3.5rem)]">
    <div className="px-5 lg:px-8 py-5 border-b border-gray-100 bg-white flex-shrink-0">
      <h1 className="font-display text-xl font-bold text-gray-900">Find Parking Near You</h1>
      <p className="text-gray-500 text-sm mt-0.5">Showing available lots based on your location</p>
    </div>
    <div className="flex-1 overflow-hidden p-5 lg:p-8">
      <NearbyLotsMap limit={10} />
    </div>
  </div>
);

export default FindParkingPage;
