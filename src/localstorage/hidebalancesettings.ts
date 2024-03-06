export const setLocalHideBalances = (hideBalances: boolean | null) => {
  localStorage.setItem("hideBalances", JSON.stringify(hideBalances));
};

export const getLocalHideBalances = (): boolean => {
  const storedmaskNetworth = localStorage.getItem("hideBalances");
  return storedmaskNetworth ? JSON.parse(storedmaskNetworth) : false;
};
