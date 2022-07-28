const { myQuery } = require("./query");
const {
  getMySQLDateTime,
  weekDays,
  getHoursMinutes
} = require("../helpers/Date");

exports.getAciveRouterById = routerId =>
  myQuery("SELECT * FROM routers WHERE id = ? AND active = 1", [routerId]);

exports.getAciveRouters = () =>
  myQuery("SELECT * FROM routers WHERE active = 1", null);

const getDeviceSchedules = async type => {
  const weekDay = new Date().getDay();
  const testTime = getHoursMinutes();
  const typeTime = type === "off" ? "end_time" : "start_time";
  const typeWifiStatus = type === "off" ? 1 : 0;
  const schedules = await myQuery(
    "SELECT `rs`.`id`, `rs`.`start_time`, `rs`.`end_time`, `r`.`id` as `router_id`, `r`.`title` as `router_title`, `r`.`ip_addr`, `r`.`wifi_status`, `r`.`wifi_force_on`, `c`.`title` as `weekday_title` FROM `router_schedules` as `rs`, `routers` as `r`, `categories` as `c` WHERE `rs`.`router_id` = `r`.`id` AND `rs`.`weekday_id` = `c`.`id` AND `r`.`wifi_status` = ? AND `rs`.`" +
      typeTime +
      "` = ? ORDER BY `c`.`id`, `rs`.`" +
      typeTime +
      "`",
    [typeWifiStatus, testTime]
  );
  return schedules.filter(item => item.weekday_title === weekDays[weekDay]);
};

exports.getDeviceOnSchedules = async () => {
  return await getDeviceSchedules("on");
};

exports.getDeviceOffSchedules = async () => {
  return await getDeviceSchedules("off");
};

exports.updateRouterLastWifiActiveDate = routerId => {
  const dateTime = getMySQLDateTime();
  myQuery(
    "UPDATE routers SET wifi_status = 1, last_wifi_active = ? WHERE id = ?",
    [dateTime, routerId]
  );
};

exports.updateRouterWifiActiveStateOff = routerId => {
  myQuery("UPDATE routers SET wifi_status = 0 WHERE id = ?", [routerId]);
};

exports.updateDbDeviceWifiStatus = (routerId, status) => {
  myQuery("UPDATE routers SET wifi_status = ? WHERE id = ?", [
    status,
    routerId
  ]);
};

exports.updateDbDeviceWifiForceOnStatus = (routerId, status) => {
  myQuery("UPDATE routers SET wifi_force_on = ? WHERE id = ?", [
    status,
    routerId
  ]);
};

exports.updateDbDeviceStatus = (routerId, status) => {
  if (status) {
    const dateTime = getMySQLDateTime();
    myQuery(
      "UPDATE routers SET device_status = ?, last_device_active = ? WHERE id = ?",
      [status, dateTime, routerId]
    );
  } else {
    myQuery("UPDATE routers SET device_status = ? WHERE id = ?", [
      status,
      routerId
    ]);
  }
};
