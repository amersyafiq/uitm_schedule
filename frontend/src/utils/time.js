export const diffHours = (start, end) =>
  (parseInt(end) - parseInt(start)) + (end.includes(":30") - start.includes(":30")) * 0.5;
