exports.weekDays = {
  0: "Svētdiena",
  1: "Pirmdiena",
  2: "Otrdiena",
  3: "Trešdiena",
  4: "Ceturtdiena",
  5: "Piektdiena",
  6: "Sestdiena"
};

exports.getMySQLDateTime = () => {
  return (dateTime = new Date(
    Date.now() - new Date().getTimezoneOffset() * 60000
  )
    .toJSON()
    .slice(0, 19)
    .replace("T", " "));
};

exports.getDiffDateTime = (date1, date2) => {
  const diff = date1.getTime() / 1000 - date2.getTime() / 1000;
  return Math.floor(diff);
};

exports.getHoursMinutes = () => {
  const startTimeHours = new Date().getHours();
  const startTimeMinutes =
    new Date().getMinutes() < 10
      ? "0" + new Date().getMinutes()
      : new Date().getMinutes();
  return startTimeHours + "" + startTimeMinutes + "";
};
