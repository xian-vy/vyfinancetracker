export const setPowerSavingMode = (powersavingmode: boolean | null) => {
  localStorage.setItem("powersavingmode", JSON.stringify(powersavingmode));
};

export const getPowerSavingMode = (): boolean => {
  const storedpowersavingmode = localStorage.getItem("powersavingmode");
  return storedpowersavingmode ? JSON.parse(storedpowersavingmode) : false;
};
