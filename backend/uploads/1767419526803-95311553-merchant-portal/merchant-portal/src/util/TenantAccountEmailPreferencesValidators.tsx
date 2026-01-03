export const validateFromEmail = (emailValue: string): boolean => {
  // returning true if invalid
  const emailFormat = RegExp(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/); // Email format check.
  return !emailFormat.test(emailValue);
};

export const validatePort = (portNumber: number): boolean => {
  // returning true if invalid
  return Number.isNaN(portNumber) || portNumber < 1 || portNumber > 65535;
};

export const validateIsEmptyString = (password: string): boolean => {
  return password.trim().length === 0;
};
