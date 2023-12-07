import { PrismaClient } from '@prisma/client';
import passport from 'passport';
import passportJWT from 'passport-jwt';
const { Strategy: JwtStrategy, ExtractJwt } = passportJWT;
const prisma = new PrismaClient();

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_PRIVATE_KEY,
};

passport.use(
  new JwtStrategy(options, async (payload, done) => {
    console.log('payload:', payload);
    try {
      const user = await prisma.users.findUnique({
        where: {
          id: payload.id,
        },
      });

      if (user) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'User not found' });
      }
    } catch (error) {
      return done(error, false);
    }
  }),
);

const authenticateUser = passport.authenticate('jwt', { session: false });
export { authenticateUser };
