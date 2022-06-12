import * as bcrypt from 'bcryptjs';

export const Compare = async (
  pin: string,
  comparePin: string,
): Promise<boolean> => {
  return await bcrypt.compare(pin, comparePin);
};
