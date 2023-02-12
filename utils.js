const pause = async (time) => {
  console.log("Sleep Begin!!!");
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

module.exports = {
  pause,
};
