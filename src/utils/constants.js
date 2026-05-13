export const ROLES = {
  CUSTOMER:          "CUSTOMER",
  VALET:             "VALET",
  SUPER_ADMIN:       "SUPER_ADMIN",
  PARKING_LOT_ADMIN: "PARKING_LOT_ADMIN",
  FLEET_ADMIN:       "FLEET_ADMIN",
  CAR_OWNER:         "CAR_OWNER",
};

export const BOOKING_STATUS  = { PENDING:"PENDING", ACTIVE:"ACTIVE", COMPLETED:"COMPLETED", CANCELLED:"CANCELLED" };
export const SLOT_STATUS     = { AVAILABLE:"AVAILABLE", OCCUPIED:"OCCUPIED", RESERVED:"RESERVED" };
export const SLOT_TYPE = { REGULAR:"REGULAR", EV:"EV_CHARGING", HEAVY:"HEAVY_VEHICLE", BIKE:"BIKE" };
export const VALET_STATUS    = { PENDING:"PENDING", ACCEPTED:"ACCEPTED", PICKED_UP:"PICKED_UP", PARKED:"PARKED", RETURN_REQ:"RETURN_REQ", COMPLETED:"COMPLETED" };
export const PARKING_LOT_STATUS = { ACTIVE:"ACTIVE", INACTIVE:"INACTIVE", FULL:"FULL" };

export const ROLE_HOME_ROUTES = {
  CUSTOMER:          "/customer/dashboard",
  VALET:             "/valet/jobs",
  SUPER_ADMIN:       "/super-admin/dashboard",
  PARKING_LOT_ADMIN: "/lot-admin/dashboard",
  FLEET_ADMIN:       "/fleet-admin/dashboard",
  CAR_OWNER:         "/car-owner/dashboard",
};
