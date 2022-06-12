import * as bcrypt from 'bcryptjs';

export const hashCred = (credential: string) => {
  return bcrypt.hashSync(credential, 10);
};
